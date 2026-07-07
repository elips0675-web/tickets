import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { AllTheProviders } from './test-utils'
import Employees from '@/pages/Employees'

describe('Employees Page', () => {
  it('renders title', () => {
    render(<Employees />, { wrapper: AllTheProviders })
    expect(screen.getByText('Сотрудники')).toBeInTheDocument()
  })

  it('shows search input', () => {
    render(<Employees />, { wrapper: AllTheProviders })
    expect(screen.getByPlaceholderText('Поиск по имени, отделу, email...')).toBeInTheDocument()
  })

  it('shows role filter buttons', () => {
    render(<Employees />, { wrapper: AllTheProviders })
    expect(screen.getByText('Все')).toBeInTheDocument()
    expect(screen.getByText('Агенты')).toBeInTheDocument()
    expect(screen.getByText('Ст. агенты')).toBeInTheDocument()
    expect(screen.getByText('Администраторы')).toBeInTheDocument()
  })

  it('shows view toggle buttons', () => {
    render(<Employees />, { wrapper: AllTheProviders })
    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBeGreaterThanOrEqual(6)
  })
})
