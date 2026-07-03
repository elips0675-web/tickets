import 'dotenv/config'
import express from 'express'
import { createServer } from 'http'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import os from 'os'
import ticketsRouter from './routes/tickets.js'
import employeesRouter from './routes/employees.js'
import calendarRouter from './routes/calendar.js'
import pollsRouter from './routes/polls.js'
import filesRouter from './routes/files.js'
import chatsRouter from './routes/chats.js'
import wikiRouter from './routes/wiki.js'
import newsRouter from './routes/news.js'
import searchRouter from './routes/search.js'
import pushRouter from './routes/push.js'
import authRouter from './routes/auth.js'
import adminRouter from './routes/admin.js'
import knex from 'knex'
import knexConfig from '../knexfile.js'

const app = express()
const server = createServer(app)
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
app.use('/api/search', searchRouter)
app.use('/api/admin', adminRouter)

app.get('/', (req, res) => {
  res.json({ app: 'Service Desk API', version: '1.0.0' })
})

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.get('/api/system-info', (req, res) => {
  res.json({
    computerName: os.hostname(),
    userAccount: `${process.env.USERDOMAIN || os.hostname()}\\${process.env.USERNAME || ''}`,
    userName: process.env.USERNAME || '',
    domain: process.env.USERDOMAIN || '',
  })
})

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err)
  res.status(500).json({ message: 'Internal server error' })
})

export { app, server }
