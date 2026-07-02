import 'dotenv/config'
import express from 'express'
import { createServer } from 'http'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import ticketsRouter from './routes/tickets.js'
import employeesRouter from './routes/employees.js'
import calendarRouter from './routes/calendar.js'
import pollsRouter from './routes/polls.js'
import filesRouter from './routes/files.js'
import chatsRouter from './routes/chats.js'
import { setupSocket } from './socket.js'

const app = express()
const server = createServer(app)
const PORT = process.env.PORT || 4000

const limiter = rateLimit({ windowMs: 60_000, max: 200, message: { message: 'Too many requests' } })

app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }))
app.use(helmet())
app.use(express.json())
app.use('/api/', limiter)

app.use('/api/auth', authRouter)
app.use('/api/tickets', ticketsRouter)
app.use('/api/employees', employeesRouter)
app.use('/api/calendar', calendarRouter)
app.use('/api/polls', pollsRouter)
app.use('/api/files', filesRouter)
app.use('/api/chats', chatsRouter)
app.use('/api/wiki', wikiRouter)
app.use('/api/news', newsRouter)
app.use('/api/push', pushRouter)

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

setupSocket(server)

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err)
  res.status(500).json({ message: 'Internal server error' })
})

server.listen(PORT, () => {
  console.log(`Service Desk API running on port ${PORT}`)
})
