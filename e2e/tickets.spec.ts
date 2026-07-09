import { test, expect } from '@playwright/test'

test.describe('Tickets', () => {
  test.beforeEach(async ({ page }) => {
    const token = await page.evaluate(async () => {
      const r = await fetch('http://localhost:4000/api/auth/dev-login', { method: 'POST' })
      const d = await r.json()
      return d.token
    })
    await page.evaluate((t) => localStorage.setItem('token', t), token)
  })

  test('renders tickets list', async ({ page }) => {
    await page.goto('/tickets')
    await expect(page.locator('h1, h2').first()).toBeVisible()
    await expect(page.locator('input[placeholder*="Поиск" i]')).toBeVisible()
  })

  test('navigates to new ticket page', async ({ page }) => {
    await page.goto('/tickets')
    await page.locator('a[href="/new-ticket"], button:has-text("Создать")').first().click()
    await expect(page).toHaveURL(/\/new-ticket/)
  })

  test('new ticket form renders', async ({ page }) => {
    await page.goto('/new-ticket')
    await expect(page.locator('input[name="title"], input[placeholder*="Заголовок" i]')).toBeVisible()
    await expect(page.locator('textarea')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })

  test('ticket detail shows messages', async ({ page }) => {
    await page.goto('/tickets')
    await page.locator('a[href*="/tickets/"]').first().click()
    await expect(page).toHaveURL(/\/tickets\/\d+/)
  })
})
