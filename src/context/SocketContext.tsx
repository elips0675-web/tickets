import { createContext, useContext, useEffect, useState, useRef, type ReactNode } from "react"
import { io, type Socket } from "socket.io-client"
import { useAuth } from "./AuthContext"

interface SocketContextType {
  socket: Socket | null
  sendMessage: (chatId: number, text: string) => void
  deleteMessage: (chatId: number, msgId: number) => void
  joinChat: (chatId: number) => void
  leaveChat: (chatId: number) => void
  notifyAll: (data: { title: string; body: string; url?: string }) => void
}

const SocketContext = createContext<SocketContextType | null>(null)

export function SocketProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth()
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    if (!token) return
    const s = io({ auth: { token } })
    socketRef.current = s
    return () => { s.close(); socketRef.current = null }
  }, [token])

  const sendMessage = (chatId: number, text: string) => {
    socketRef.current?.emit("message:send", { chatId, text })
  }

  const deleteMessage = (chatId: number, msgId: number) => {
    socketRef.current?.emit("message:delete", { chatId, msgId })
  }

  const joinChat = (chatId: number) => {
    socketRef.current?.emit("join:chat", chatId)
  }

  const leaveChat = (chatId: number) => {
    socketRef.current?.emit("leave:chat", chatId)
  }

  const notifyAll = (data: { title: string; body: string; url?: string }) => {
    socketRef.current?.emit("notify:all", data)
  }

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, sendMessage, deleteMessage, joinChat, leaveChat, notifyAll }}>
      {children}
    </SocketContext.Provider>
  )
}

export function useSocket() {
  const ctx = useContext(SocketContext)
  if (!ctx) throw new Error("useSocket must be used within SocketProvider")
  return ctx
}
