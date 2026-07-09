import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AllTheProviders } from './test-utils'
import Wiki from '@/pages/Wiki'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => ({
      'wiki.title': 'База знаний',
      'wiki.description': 'Статьи, инструкции и документация',
      'wiki.searchPlaceholder': 'Поиск по статьям...',
      'wiki.create': 'Создать статью',
      'wiki.exportCSV': 'Экспорт CSV',
      'wiki.noArticles': 'Нет статей',
      'common.all': 'Все',
    })[key] || key,
  }),
}))

beforeEach(() => {
  localStorage.setItem('token', 'test-token')
  localStorage.setItem('user', JSON.stringify({ id: 1, name: 'Admin', email: 'admin@test.com', role: 'admin' }))
})

describe('Wiki', () => {
  it('renders title', () => {
    render(<Wiki />, { wrapper: AllTheProviders })
    expect(screen.getByText('База знаний')).toBeInTheDocument()
  })

  it('shows search input', () => {
    render(<Wiki />, { wrapper: AllTheProviders })
    expect(screen.getByPlaceholderText('Поиск по статьям...')).toBeInTheDocument()
  })

  it('shows create button for managers', () => {
    render(<Wiki />, { wrapper: AllTheProviders })
    expect(screen.getByText('Создать статью')).toBeInTheDocument()
  })

  it('loads and displays articles from API', async () => {
    render(<Wiki />, { wrapper: AllTheProviders })
    const article = await screen.findByText('Как настроить VPN')
    expect(article).toBeInTheDocument()
  })
})
