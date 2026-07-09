import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AllTheProviders } from './test-utils'
import NotificationsPage from '@/pages/NotificationsPage'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => ({
      'notifications.title': 'Уведомления',
      'notifications.unread': 'непрочитанных',
      'notifications.markAllRead': 'Отметить всё',
      'notifications.clearAll': 'Очистить всё',
      'notifications.searchPlaceholder': 'Поиск уведомлений...',
      'notifications.all': 'Все',
      'notifications.unreadOnly': 'Только непрочитанные',
      'notifications.noData': 'Нет уведомлений',
      'common.all': 'Все',
    })[key] || key,
  }),
}))

beforeEach(() => {
  localStorage.setItem('token', 'test-token')
  localStorage.setItem('user', JSON.stringify({ id: 1, name: 'Admin', email: 'admin@test.com', role: 'admin' }))
})

describe('NotificationsPage', () => {
  it('renders title', () => {
    render(<NotificationsPage />, { wrapper: AllTheProviders })
    expect(screen.getByText('Уведомления')).toBeInTheDocument()
  })

  it('shows mark all read button', () => {
    render(<NotificationsPage />, { wrapper: AllTheProviders })
    expect(screen.getByText('Отметить всё')).toBeInTheDocument()
  })

  it('shows clear all button', () => {
    render(<NotificationsPage />, { wrapper: AllTheProviders })
    expect(screen.getByText('Очистить всё')).toBeInTheDocument()
  })

  it('loads and displays notifications from API', async () => {
    render(<NotificationsPage />, { wrapper: AllTheProviders })
    const notif = await screen.findByText('Тикет создан')
    expect(notif).toBeInTheDocument()
  })
})
