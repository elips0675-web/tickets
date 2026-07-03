import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Shield, Users, Ticket, BarChart3, Activity, UserCog, ShieldCheck, RefreshCw, Send, Bell } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { useNavigate } from "react-router-dom"
import { usePush } from "@/lib/use-push"

interface Employee {
  id: number
  name: string
  email: string
  role: string
  department: string
  online: boolean
  activeTickets: number
  resolvedToday: number
}

interface Stats {
  total: number
  open: number
  inProgress: number
  resolved: number
  critical: number
}

export default function Admin() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const { subscribed, supported, loading: pushLoading, subscribe, unsubscribe } = usePush()
  const [pushTitle, setPushTitle] = useState("")
  const [pushBody, setPushBody] = useState("")
  const [pushUrl, setPushUrl] = useState("/")
  const [sending, setSending] = useState(false)
  const [sendResult, setSendResult] = useState<{ sent: number; failed: number; total: number } | null>(null)

  const fetchData = async () => {
    setLoading(true)
    const token = localStorage.getItem("token")
    try {
      const [empRes, statsRes] = await Promise.all([
        fetch("/api/employees", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/employees/stats", { headers: { Authorization: `Bearer ${token}` } }),
      ])
      if (empRes.ok) setEmployees(await empRes.json())
      if (statsRes.ok) setStats(await statsRes.json())
    } catch (err) {
      console.error("Admin fetch error:", err)
    }
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  const handleSendPush = async () => {
    if (!pushTitle.trim()) return
    setSending(true)
    setSendResult(null)
    try {
      const token = localStorage.getItem("token")
      const res = await fetch("/api/push/send", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title: pushTitle, body: pushBody, url: pushUrl }),
      })
      if (res.ok) {
        const result = await res.json()
        setSendResult(result)
        if (result.sent > 0) {
          setPushTitle("")
          setPushBody("")
          setPushUrl("/")
        }
      }
    } catch (err) {
      console.error("Send push error:", err)
    }
    setSending(false)
  }

  if (user?.role !== "admin") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Shield className="w-16 h-16 text-muted-foreground/40" />
        <div className="text-center">
          <h2 className="text-xl font-bold">Нет доступа</h2>
          <p className="text-sm text-muted-foreground mt-1">Только администратор может просматривать эту страницу</p>
        </div>
        <Button variant="outline" onClick={() => navigate("/")}>На главную</Button>
      </div>
    )
  }

  const roleBadge = (role: string) => {
    const map: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
      admin: { label: "Админ", variant: "default" },
      senior_agent: { label: "Ст. агент", variant: "secondary" },
      agent: { label: "Агент", variant: "outline" },
    }
    const c = map[role] || { label: role, variant: "outline" as const }
    return <Badge variant={c.variant} className="text-[10px]">{c.label}</Badge>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Администрирование</h1>
          <p className="text-sm text-muted-foreground mt-1">Управление системой и пользователями</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchData} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-1.5 ${loading ? "animate-spin" : ""}`} />
          Обновить
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <div className="text-2xl font-bold">{employees.length}</div>
            <p className="text-xs text-muted-foreground font-medium mt-1">Сотрудников</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <div className="text-2xl font-bold">{employees.filter(e => e.online).length}</div>
            <p className="text-xs text-muted-foreground font-medium mt-1">Онлайн</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                <Ticket className="w-5 h-5 text-amber-600" />
              </div>
            </div>
            <div className="text-2xl font-bold">{stats?.total || 0}</div>
            <p className="text-xs text-muted-foreground font-medium mt-1">Всего тикетов</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <Activity className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            <div className="text-2xl font-bold">{stats ? stats.open + stats.inProgress : 0}</div>
            <p className="text-xs text-muted-foreground font-medium mt-1">Активных</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <UserCog className="w-4 h-4 text-primary" />
            Сотрудники
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {employees.map(emp => (
              <div key={emp.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-muted/30 transition-colors">
                <Avatar className="w-9 h-9">
                  <AvatarFallback className="text-xs bg-primary/10 text-primary">
                    {emp.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold truncate">{emp.name}</span>
                    {roleBadge(emp.role)}
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{emp.email} · {emp.department}</p>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className={emp.online ? "text-green-600 font-medium" : ""}>
                    {emp.online ? "Онлайн" : "Офлайн"}
                  </span>
                  <span>{emp.activeTickets} тикетов</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-primary" />
            Статистика по ролям
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { role: "admin", label: "Администраторы", icon: Shield },
              { role: "senior_agent", label: "Старшие агенты", icon: UserCog },
              { role: "agent", label: "Агенты", icon: Users },
            ].map(({ role, label, icon: Icon }) => {
              const count = employees.filter(e => e.role === role).length
              return (
                <div key={role} className="flex items-center gap-3 bg-muted/30 rounded-lg p-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-xl font-bold">{count}</div>
                    <p className="text-xs text-muted-foreground">{label}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Bell className="w-4 h-4 text-primary" />
            Рассылка push-уведомлений
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {supported && (
            <div className="flex items-center justify-between rounded-lg bg-muted/30 p-3">
              <div className="flex items-center gap-2 text-sm">
                <Bell className="w-4 h-4 text-muted-foreground" />
                <span>{subscribed ? "Уведомления включены" : "Уведомления выключены"}</span>
              </div>
              <Button
                variant={subscribed ? "outline" : "default"}
                size="sm"
                onClick={subscribed ? unsubscribe : subscribe}
                disabled={pushLoading}
              >
                {subscribed ? "Отключить" : "Включить"}
              </Button>
            </div>
          )}
          {!supported && (
            <p className="text-sm text-muted-foreground">Push-уведомления не поддерживаются вашим браузером</p>
          )}

          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium mb-1 block">Заголовок *</label>
              <Input
                placeholder="Например: Важное обновление"
                value={pushTitle}
                onChange={e => setPushTitle(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Текст</label>
              <Textarea
                placeholder="Текст уведомления..."
                value={pushBody}
                onChange={e => setPushBody(e.target.value)}
                rows={3}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Ссылка</label>
              <Input
                placeholder="/"
                value={pushUrl}
                onChange={e => setPushUrl(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-3 pt-1">
              <Button onClick={handleSendPush} disabled={sending || !pushTitle.trim()}>
                <Send className="w-4 h-4 mr-1.5" />
                {sending ? "Отправка..." : "Отправить"}
              </Button>
              {sendResult && (
                <span className="text-sm text-muted-foreground">
                  Отправлено: {sendResult.sent}, ошибок: {sendResult.failed}
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}