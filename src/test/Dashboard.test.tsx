import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AllTheProviders } from './test-utils'
import Dashboard from '@/pages/Dashboard'

describe('Dashboard', () => {
  it('renders title', () => {
    render(<Dashboard />, { wrapper: AllTheProviders })
    expect(screen.getByText('Дашборд')).toBeInTheDocument()
  })

  it('shows stat cards', () => {
    render(<Dashboard />, { wrapper: AllTheProviders })
    expect(screen.getByText('Всего тикетов')).toBeInTheDocument()
    expect(screen.getByText('Активные')).toBeInTheDocument()
    expect(screen.getByText('Критических')).toBeInTheDocument()
    expect(screen.getByText('Решённых')).toBeInTheDocument()
  })

  it('shows employee section heading', () => {
    render(<Dashboard />, { wrapper: AllTheProviders })
    expect(screen.getByText('Сотрудники')).toBeInTheDocument()
  })

  it('has a link to all employees', () => {
    render(<Dashboard />, { wrapper: AllTheProviders })
    expect(screen.getByText('Все сотрудники')).toBeInTheDocument()
  })
})
