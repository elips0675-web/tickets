import { Router } from 'express'
import pool from '../db.js'
import { authenticateToken, requireRole } from '../middleware.js'
import { createPollValidation, voteValidation } from '../validate.js'

const router = Router()
router.use(authenticateToken)

router.get('/', async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1)
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 50))
  const offset = (page - 1) * limit
  try {
    const [[{ total }]] = await pool.query('SELECT COUNT(*) as total FROM polls')
    const [rows] = await pool.query(`
      SELECT p.*,
        (SELECT COUNT(*) FROM poll_options WHERE poll_id = p.id) as options_count,
        (SELECT COUNT(*) FROM poll_votes WHERE poll_id = p.id) as total_votes
      FROM polls p ORDER BY p.created_at DESC LIMIT ? OFFSET ?
    `, [limit, offset])
    const pollIds = rows.map(r => r.id)
    if (pollIds.length > 0) {
      const ph = pollIds.map(() => '?').join(',')
      const [allOpts] = await pool.query(
        `SELECT o.*, (SELECT COUNT(*) FROM poll_votes WHERE option_id = o.id AND user_id = ?) > 0 as voted
         FROM poll_options o WHERE o.poll_id IN (${ph}) ORDER BY o.id`,
        [req.user.userId, ...pollIds],
      )
      const [allVotes] = await pool.query(
        `SELECT poll_id, option_id FROM poll_votes WHERE poll_id IN (${ph}) AND user_id = ?`,
        [...pollIds, req.user.userId],
      )
      const optsByPoll = {}
      for (const o of allOpts) {
        if (!optsByPoll[o.poll_id]) optsByPoll[o.poll_id] = []
        optsByPoll[o.poll_id].push(o)
      }
      const votesByPoll = {}
      for (const v of allVotes) {
        if (!votesByPoll[v.poll_id]) votesByPoll[v.poll_id] = []
        votesByPoll[v.poll_id].push(v.option_id)
      }
      for (const poll of rows) {
        poll.options = optsByPoll[poll.id] || []
        poll.myVotes = votesByPoll[poll.id] || []
        poll.multipleChoice = !!poll.multiple_choice
        poll.totalVotes = poll.total_votes
      }
    }
    res.json({ data: rows, total, page, totalPages: Math.ceil(total / limit) })
  } catch (err) {
    console.error('Polls list error:', err)
    res.status(500).json({ message: 'Failed to fetch polls' })
  }
})

router.post('/', requireRole('admin', 'senior_agent'), createPollValidation, async (req, res) => {
  const { title, description, options, multipleChoice } = req.body
  const conn = await pool.getConnection()
  try {
    await conn.beginTransaction()
    const [r] = await conn.query(
      'INSERT INTO polls (title, description, multiple_choice, created_by) VALUES (?, ?, ?, ?)',
      [title, description || '', multipleChoice ? 1 : 0, req.user.userId],
    )
    for (const opt of options) {
      await conn.query('INSERT INTO poll_options (poll_id, text) VALUES (?, ?)', [r.insertId, opt])
    }
    await conn.commit()
    const [[poll]] = await pool.query('SELECT * FROM polls WHERE id = ?', [r.insertId])
    const [opts] = await pool.query('SELECT * FROM poll_options WHERE poll_id = ?', [r.insertId])
    res.status(201).json({ ...poll, options: opts, totalVotes: 0, myVotes: [], multipleChoice: !!poll.multiple_choice })
  } catch (err) {
    await conn.rollback()
    console.error('Create poll error:', err)
    res.status(500).json({ message: 'Failed to create poll' })
  } finally {
    conn.release()
  }
})

router.post('/:id/vote', voteValidation, async (req, res) => {
  const { optionId } = req.body
  const conn = await pool.getConnection()
  try {
    await conn.beginTransaction()
    const [[poll]] = await conn.query('SELECT * FROM polls WHERE id = ?', [req.params.id])
    if (!poll) return res.status(404).json({ message: 'Not found' })

    if (poll.multiple_choice) {
      const [existing] = await conn.query(
        'SELECT id FROM poll_votes WHERE poll_id = ? AND option_id = ? AND user_id = ?',
        [req.params.id, optionId, req.user.userId],
      )
      if (existing.length) {
        await conn.query('DELETE FROM poll_votes WHERE id = ?', [existing[0].id])
      } else {
        await conn.query('INSERT INTO poll_votes (poll_id, option_id, user_id) VALUES (?, ?, ?)',
          [req.params.id, optionId, req.user.userId])
      }
    } else {
      await conn.query('DELETE FROM poll_votes WHERE poll_id = ? AND user_id = ?',
        [req.params.id, req.user.userId])
      await conn.query('INSERT INTO poll_votes (poll_id, option_id, user_id) VALUES (?, ?, ?)',
        [req.params.id, optionId, req.user.userId])
    }

    // Recalculate counts
    const [votes] = await conn.query(
      'SELECT option_id, COUNT(*) as cnt FROM poll_votes WHERE poll_id = ? GROUP BY option_id',
      [req.params.id],
    )
    await conn.query('UPDATE poll_options SET votes_count = 0 WHERE poll_id = ?', [req.params.id])
    for (const v of votes) {
      await conn.query('UPDATE poll_options SET votes_count = ? WHERE id = ?', [v.cnt, v.option_id])
    }
    await conn.commit()

    const [opts] = await pool.query(
      `SELECT o.*, (SELECT COUNT(*) FROM poll_votes WHERE option_id = o.id AND user_id = ?) > 0 as voted
       FROM poll_options o WHERE o.poll_id = ? ORDER BY o.id`,
      [req.user.userId, req.params.id],
    )
    const totalVotes = opts.reduce((s, o) => s + o.votes_count, 0)
    const [[updated]] = await pool.query('SELECT * FROM polls WHERE id = ?', [req.params.id])
    res.json({ ...updated, options: opts, totalVotes, multipleChoice: !!updated.multiple_choice })
  } catch (err) {
    await conn.rollback()
    console.error('Vote error:', err)
    res.status(500).json({ message: 'Failed to vote' })
  } finally {
    conn.release()
  }
})

export default router
