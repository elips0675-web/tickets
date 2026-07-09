import { test, expect } from '@playwright/test'

test.describe('Chats', () => {
  test.beforeEach(async ({ page }) => {
    const token = await page.evaluate(async () => {
      const r = await fetch('http://localhost:4000/api/auth/dev-login', { method: 'POST' })
      const d = await r.json()
      return d.token
    })
    await page.evaluate((t) => localStorage.setItem('token', t), token)
  })

  test('renders chats list', async ({ page }) => {
    await page.goto('/chats')
    await expect(page.locator('h1, h2').first()).toBeVisible()
  })

  test('search input is visible', async ({ page }) => {
    await page.goto('/chats')
    await expect(page.locator('input[placeholder*="Поиск" i]')).toBeVisible()
  })

  test('navigates to chat detail', async ({ page }) => {
    await page.goto('/chats')
    const chatLink = page.locator('a[href*="/chats/"]').first()
    if (await chatLink.isVisible()) {
      await chatLink.click()
      await expect(page).toHaveURL(/\/chats\/\d+/)
    }
  })
})
