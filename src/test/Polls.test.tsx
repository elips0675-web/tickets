import { render, screen, waitFor } from '@testing-library/react'
import PollsPage from '@/pages/Polls'
import { AllTheProviders } from './test-utils'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const map: Record<string, string> = {
        'polls.title': 'Опросы',
        'polls.create': 'Создать опрос',
        'polls.question': 'Вопрос',
        'polls.description': 'Описание',
        'polls.optionLabel': 'Вариант {number}',
        'polls.multipleChoice': 'Множественный выбор',
        'polls.submitBtn': 'Готово',
        'polls.totalVotes': '{{count}} голосов',
        'polls.voters': 'Вы голосовали',
        'polls.noPolls': 'Нет опросов',
        'polls.createTitle': 'Создание опроса',
        'common.delete': 'Удалить',
      }
      return map[key] || key
    },
  }),
}))

vi.mock('@/context/AuthContext', () => ({
  useAuth: () => ({
    canManage: true,
  }),
}))

describe('Polls', () => {
  it('renders polls title', () => {
    render(<PollsPage />, { wrapper: AllTheProviders })
    expect(screen.getByText('Опросы')).toBeInTheDocument()
  })

  it('shows create button for managers', () => {
    render(<PollsPage />, { wrapper: AllTheProviders })
    expect(screen.getByText('Создать опрос')).toBeInTheDocument()
  })

  it('loads and displays polls from API', async () => {
    render(<PollsPage />, { wrapper: AllTheProviders })

    await waitFor(() => {
      expect(screen.getByText('Тестовый опрос')).toBeInTheDocument()
    })
  })
})
