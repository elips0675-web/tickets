import { Router } from 'express'
import pool from '../db.js'
import { authenticateToken } from '../middleware.js'

const router = Router()
router.use(authenticateToken)

router.get('/subscription', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT subscription_json FROM push_subscriptions WHERE user_id = ?', [req.user.userId])
    res.json(rows.map(r => JSON.parse(r.subscription_json)))
  } catch (err) {
    console.error('Get subscriptions error:', err)
    res.status(500).json({ message: 'Failed to get subscriptions' })
  }
})

router.post('/subscribe', async (req, res) => {
  const { subscription_json } = req.body
  if (!subscription_json) return res.status(400).json({ message: 'Subscription object required' })
  try {
    await pool.query(
      'INSERT INTO push_subscriptions (user_id, subscription_json) VALUES (?, ?) ON DUPLICATE KEY UPDATE subscription_json = VALUES(subscription_json)',
      [req.user.userId, JSON.stringify(subscription_json)],
    )
    res.status(201).json({ ok: true })
  } catch (err) {
    console.error('Subscribe error:', err)
    res.status(500).json({ message: 'Failed to subscribe' })
  }
})

router.delete('/unsubscribe', async (req, res) => {
  try {
    await pool.query('DELETE FROM push_subscriptions WHERE user_id = ?', [req.user.userId])
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ message: 'Failed to unsubscribe' })
  }
})

export default router
