import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AllTheProviders } from './test-utils'
import News from '@/pages/News'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => ({
      'news.title': 'Новости',
      'news.searchPlaceholder': 'Поиск новостей...',
      'news.important': 'Важные',
      'news.create': 'Создать новость',
      'news.exportCSV': 'Экспорт CSV',
      'news.showMore': 'Показать ещё',
      'news.empty': 'Новостей пока нет',
    })[key] || key,
  }),
}))

beforeEach(() => {
  localStorage.setItem('token', 'test-token')
  localStorage.setItem('user', JSON.stringify({ id: 1, name: 'Admin', email: 'admin@test.com', role: 'admin' }))
})

describe('News', () => {
  it('renders title', () => {
    render(<News />, { wrapper: AllTheProviders })
    expect(screen.getByText('Новости')).toBeInTheDocument()
  })

  it('shows important filter button', () => {
    render(<News />, { wrapper: AllTheProviders })
    expect(screen.getByText('Важные')).toBeInTheDocument()
  })

  it('shows create button for managers', () => {
    render(<News />, { wrapper: AllTheProviders })
    expect(screen.getByText('Создать новость')).toBeInTheDocument()
  })

  it('loads and displays news from API', async () => {
    render(<News />, { wrapper: AllTheProviders })
    const news = await screen.findByText('Обновление системы')
    expect(news).toBeInTheDocument()
  })
})
