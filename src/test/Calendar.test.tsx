import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AllTheProviders } from './test-utils'
import Calendar from '@/pages/Calendar'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => ({
      'calendar.title': 'Календарь',
      'calendar.subtitle': 'Планирование событий и встреч',
      'calendar.upcoming': 'Ближайшие',
      'calendar.exportCSV': 'Экспорт CSV',
      'calendar.clickDay': 'Нажмите на день, чтобы увидеть события',
      'calendar.noEvents': 'Нет событий',
      'calendar.eventBtn': 'Добавить событие',
      'common.delete': 'Удалить',
    })[key] || key,
  }),
}))

beforeEach(() => {
  localStorage.setItem('token', 'test-token')
  localStorage.setItem('user', JSON.stringify({ id: 1, name: 'Admin', email: 'admin@test.com', role: 'admin' }))
})

describe('Calendar', () => {
  it('renders title', () => {
    render(<Calendar />, { wrapper: AllTheProviders })
    expect(screen.getByText('Календарь')).toBeInTheDocument()
  })

  it('shows month navigation', () => {
    render(<Calendar />, { wrapper: AllTheProviders })
    expect(screen.getByLabelText('Предыдущий месяц')).toBeInTheDocument()
    expect(screen.getByLabelText('Следующий месяц')).toBeInTheDocument()
  })

  it('shows day headers', () => {
    render(<Calendar />, { wrapper: AllTheProviders })
    expect(screen.getByText('Пн')).toBeInTheDocument()
    expect(screen.getByText('Пт')).toBeInTheDocument()
    expect(screen.getByText('Вс')).toBeInTheDocument()
  })

  it('shows upcoming section', () => {
    render(<Calendar />, { wrapper: AllTheProviders })
    expect(screen.getByText('Ближайшие')).toBeInTheDocument()
  })
})
