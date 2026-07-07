import type { ReactNode } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AuthProvider } from '@/context/AuthContext'
import { TicketProvider } from '@/context/ticket-context'

export function AllTheProviders({ children }: { children: ReactNode }) {
  return (
    <TooltipProvider>
      <AuthProvider>
        <TicketProvider>
          <MemoryRouter>{children}</MemoryRouter>
        </TicketProvider>
      </AuthProvider>
    </TooltipProvider>
  )
}
