import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface User {
  id: number
  name: string
  email: string
  role: "admin" | "senior_agent" | "agent"
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (token: string, user: User) => void
  logout: () => void
  isAdmin: boolean
  isSenior: boolean
  canManage: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    const t = localStorage.getItem("token")
    const u = localStorage.getItem("user")
    if (t && u) {
      setToken(t)
      setUser(JSON.parse(u))
    }
  }, [])

  const login = (t: string, u: User) => {
    localStorage.setItem("token", t)
    localStorage.setItem("user", JSON.stringify(u))
    setToken(t)
    setUser(u)
  }

  const logout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    setToken(null)
    setUser(null)
  }

  const isAdmin = user?.role === "admin"
  const isSenior = user?.role === "senior_agent"
  const canManage = isAdmin || isSenior

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAdmin, isSenior, canManage }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
