import { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/context/AuthContext"

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (localStorage.getItem("token")) navigate("/", { replace: true })
  }, [navigate])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (!email.trim() || !password) {
      setError("Введите email и пароль")
      return
    }
    setLoading(true)
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.message || "Ошибка входа")
        return
      }
      login(data.token, data.employee)
      navigate("/", { replace: true })
    } catch {
      setError("Ошибка соединения с сервером")
    } finally {
      setLoading(false)
    }
  }

  const devLogin = async () => {
    try {
      const res = await fetch("/api/auth/dev-login", { method: "POST" })
      if (res.ok) {
        const data = await res.json()
        login(data.token, data.employee)
        navigate("/", { replace: true })
        return
      }
    } catch {
      // backend недоступен — демо-режим
    }
    const demoUser = { id: 1, name: "Администратор", email: "admin@company.ru", role: "admin" as const }
    login("demo-token", demoUser)
    navigate("/", { replace: true })
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 rounded-xl bg-primary flex items-center justify-center mb-3">
            <span className="text-white font-bold text-lg">SD</span>
          </div>
          <CardTitle>Service Desk</CardTitle>
          <CardDescription>Войдите в систему</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm font-medium">{error}</div>
            )}
            <div className="space-y-1.5">
              <label className="text-sm font-bold">Email</label>
              <Input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="ivan@company.ru"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-bold">Пароль</label>
              <Input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Введите пароль"
                required
              />
            </div>
            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-xs text-primary hover:underline">
                Забыли пароль?
              </Link>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Вход..." : "Войти"}
            </Button>
          </form>

          <div className="mt-4 pt-4 border-t">
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider text-center mb-2">
              Быстрый вход (без пароля)
            </p>
            <Button variant="outline" size="sm" className="w-full" onClick={devLogin}>
              Войти как Администратор
            </Button>
          </div>

          <div className="text-center text-sm text-muted-foreground mt-4">
            Нет аккаунта?{" "}
            <Link to="/register" className="text-primary font-bold hover:underline">Регистрация</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
