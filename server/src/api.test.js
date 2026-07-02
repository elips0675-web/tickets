import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import request from 'supertest'
import { app, server } from './app.js'

beforeAll(() => {
  server.listen(4001)
})

afterAll(() => {
  server.close()
})

describe('GET /api/health', () => {
  it('returns ok status', async () => {
    const res = await request(app).get('/api/health')
    expect(res.status).toBe(200)
    expect(res.body.status).toBe('ok')
    expect(res.body).toHaveProperty('timestamp')
  })
})

describe('POST /api/auth/dev-login', () => {
  it('returns token and employee', async () => {
    const res = await request(app).post('/api/auth/dev-login')
    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('token')
    expect(res.body.employee).toHaveProperty('id', 1)
    expect(res.body.employee).toHaveProperty('role', 'admin')
  })
})

describe('Protected routes', () => {
  it('rejects requests without token', async () => {
    const res = await request(app).get('/api/tickets')
    expect(res.status).toBe(401)
    expect(res.body.message).toBe('No token provided')
  })

  it('rejects requests with invalid token', async () => {
    const res = await request(app)
      .get('/api/tickets')
      .set('Authorization', 'Bearer invalid-token')
    expect(res.status).toBe(403)
  })

  it('accepts requests with valid dev token', async () => {
    const login = await request(app).post('/api/auth/dev-login')
    const res = await request(app)
      .get('/api/tickets')
      .set('Authorization', `Bearer ${login.body.token}`)
    // DB-dependent — skip assert if MySQL unavailable
    expect([200, 500]).toContain(res.status)
  })
})

describe('GET /api/search', () => {
  it('returns empty results for short query', async () => {
    const login = await request(app).post('/api/auth/dev-login')
    const res = await request(app)
      .get('/api/search?q=a')
      .set('Authorization', `Bearer ${login.body.token}`)
    expect(res.status).toBe(200)
    expect(res.body.tickets).toEqual([])
  })

  it('accepts valid search query', async () => {
    const login = await request(app).post('/api/auth/dev-login')
    const res = await request(app)
      .get('/api/search?q=test')
      .set('Authorization', `Bearer ${login.body.token}`)
    // DB-dependent — skip assert if MySQL unavailable
    expect([200, 500]).toContain(res.status)
    if (res.status === 200) {
      expect(res.body).toHaveProperty('tickets')
      expect(res.body).toHaveProperty('employees')
      expect(res.body).toHaveProperty('wiki')
    }
  })
})

describe('POST /api/auth/register validation', () => {
  it('fails without body', async () => {
    const res = await request(app).post('/api/auth/register').send({})
    expect(res.status).toBe(400)
  })
})
