import type { ReactNode } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AuthProvider } from '@/context/AuthContext'
import { TicketProvider } from '@/context/ticket-context'
import { SocketContext } from '@/context/SocketContext'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})

function MockSocketProvider({ children }: { children: ReactNode }) {
  return (
    <SocketContext.Provider
      value={{
        socket: null,
        connected: false,
        sendMessage: () => {},
        deleteMessage: () => {},
        joinChat: () => {},
        leaveChat: () => {},
        notifyAll: () => {},
        sendTyping: () => {},
      }}
    >
      {children}
    </SocketContext.Provider>
  )
}

export function AllTheProviders({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <MockSocketProvider>
            <TicketProvider>
              <MemoryRouter>{children}</MemoryRouter>
            </TicketProvider>
          </MockSocketProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  )
}
