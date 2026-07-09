import { test, expect } from '@playwright/test'

test.describe('Admin panel', () => {
  test.beforeEach(async ({ page }) => {
    const token = await page.evaluate(async () => {
      const r = await fetch('http://localhost:4000/api/auth/dev-login', { method: 'POST' })
      const d = await r.json()
      return d.token
    })
    await page.evaluate((t) => localStorage.setItem('token', t), token)
  })

  test('renders admin dashboard', async ({ page }) => {
    await page.goto('/admin')
    await expect(page.locator('h1, h2').first()).toBeVisible()
  })

  test('renders users page', async ({ page }) => {
    await page.goto('/admin/users')
    await expect(page.locator('h1, h2').first()).toBeVisible()
  })

  test('renders push page', async ({ page }) => {
    await page.goto('/admin/push')
    await expect(page.locator('h1, h2').first()).toBeVisible()
  })

  test('renders audit page', async ({ page }) => {
    await page.goto('/admin/audit')
    await expect(page.locator('h1, h2').first()).toBeVisible()
  })

  test('renders settings page', async ({ page }) => {
    await page.goto('/admin/settings')
    await expect(page.locator('h1, h2').first()).toBeVisible()
  })
})
