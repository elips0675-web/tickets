import { Router } from 'express'
import pool from '../db.js'
import { authenticateToken } from '../middleware.js'

const router = Router()
router.use(authenticateToken)

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, title, content, category, tags, author_id, author_name, created_at, updated_at FROM wiki_articles ORDER BY updated_at DESC',
    )
    res.json(rows)
  } catch (err) {
    console.error('Wiki list error:', err)
    res.status(500).json({ message: 'Failed to fetch articles' })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const [[article]] = await pool.query('SELECT * FROM wiki_articles WHERE id = ?', [req.params.id])
    if (!article) return res.status(404).json({ message: 'Article not found' })
    res.json(article)
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch article' })
  }
})

router.post('/', async (req, res) => {
  const { title, content, category, tags } = req.body
  if (!title?.trim() || !content?.trim()) return res.status(400).json({ message: 'Title and content required' })
  try {
    const [result] = await pool.query(
      'INSERT INTO wiki_articles (title, content, category, tags, author_id, author_name) VALUES (?, ?, ?, ?, ?, ?)',
      [title, content, category || 'Другое', JSON.stringify(tags || []), req.user.userId, req.user.name || 'User'],
    )
    const [[article]] = await pool.query('SELECT * FROM wiki_articles WHERE id = ?', [result.insertId])
    res.status(201).json(article)
  } catch (err) {
    console.error('Create article error:', err)
    res.status(500).json({ message: 'Failed to create article' })
  }
})

export default router
