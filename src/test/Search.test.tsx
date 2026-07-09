import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AllTheProviders } from './test-utils'
import Search from '@/pages/Search'

beforeEach(() => {
  localStorage.setItem('token', 'test-token')
  localStorage.setItem('user', JSON.stringify({ id: 1, name: 'Admin', email: 'admin@test.com', role: 'admin' }))
})

describe('Search', () => {
  it('renders title', () => {
    render(<Search />, { wrapper: AllTheProviders })
    expect(screen.getByText('Глобальный поиск')).toBeInTheDocument()
  })

  it('shows search input', () => {
    render(<Search />, { wrapper: AllTheProviders })
    expect(screen.getByPlaceholderText('Введите запрос (минимум 2 символа)...')).toBeInTheDocument()
  })
})
