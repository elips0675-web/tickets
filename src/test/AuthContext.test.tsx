import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAuth, AuthProvider } from '@/context/AuthContext'
import type { ReactNode } from 'react'

function wrapper({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>
}

beforeEach(() => {
  localStorage.clear()
})

describe('AuthContext', () => {
  it('starts with null user and token', () => {
    const { result } = renderHook(() => useAuth(), { wrapper })
    expect(result.current.user).toBeNull()
    expect(result.current.token).toBeNull()
    expect(result.current.isAdmin).toBe(false)
    expect(result.current.canManage).toBe(false)
  })

  it('login sets user and token', () => {
    const { result } = renderHook(() => useAuth(), { wrapper })
    act(() => {
      result.current.login('test-token', {
        id: 1,
        name: 'Test',
        email: 'test@test.com',
        role: 'admin',
      })
    })
    expect(result.current.token).toBe('test-token')
    expect(result.current.user).toBeTruthy()
    expect(result.current.user?.name).toBe('Test')
    expect(result.current.isAdmin).toBe(true)
    expect(result.current.canManage).toBe(true)
  })

  it('persists to localStorage on login', () => {
    const { result } = renderHook(() => useAuth(), { wrapper })
    act(() => {
      result.current.login('persist-token', {
        id: 2,
        name: 'Persist',
        email: 'p@test.com',
        role: 'agent',
      })
    })
    expect(localStorage.getItem('token')).toBe('persist-token')
    expect(localStorage.getItem('user')).toBeTruthy()
  })

  it('logout clears user and token', () => {
    const { result } = renderHook(() => useAuth(), { wrapper })
    act(() => {
      result.current.login('t', { id: 1, name: 'T', email: 't@t.com', role: 'admin' })
    })
    expect(result.current.user).toBeTruthy()
    act(() => {
      result.current.logout()
    })
    expect(result.current.user).toBeNull()
    expect(result.current.token).toBeNull()
    expect(localStorage.getItem('token')).toBeNull()
  })

  it('reads token from localStorage on mount', () => {
    localStorage.setItem('token', 'stored-token')
    localStorage.setItem('user', JSON.stringify({
      id: 3, name: 'Stored', email: 's@t.com', role: 'senior_agent',
    }))
    const { result } = renderHook(() => useAuth(), { wrapper })
    expect(result.current.token).toBe('stored-token')
    expect(result.current.user?.role).toBe('senior_agent')
    expect(result.current.isAdmin).toBe(false)
    expect(result.current.canManage).toBe(true)
  })

  it('role detection: agent is not admin and cannot manage', () => {
    const { result } = renderHook(() => useAuth(), { wrapper })
    act(() => {
      result.current.login('t', { id: 4, name: 'A', email: 'a@t.com', role: 'agent' })
    })
    expect(result.current.isAdmin).toBe(false)
    expect(result.current.isSenior).toBe(false)
    expect(result.current.canManage).toBe(false)
  })
})
