import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

import { Users, RefreshCw, Shield, UserCog, UserCheck, UserX } from "lucide-react"

interface User {
  id: number
  name: string
  email: string
  role: string
  department: string
  title: string
  online: boolean
  activeTickets: number
  resolvedToday: number
  isActive: boolean
  createdAt: string
}

const roleOptions = [
  { value: "admin", label: "Администратор" },
  { value: "senior_agent", label: "Старший агент" },
  { value: "agent", label: "Агент" },
]

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<number | null>(null)

  const fetchUsers = async () => {
    setLoading(true)
    const token = localStorage.getItem("token")
    try {
      const res = await fetch("/api/admin/users", { headers: { Authorization: `Bearer ${token}` } })
      if (res.ok) setUsers(await res.json())
    } catch (err) {
      console.error("Fetch users error:", err)
    }
    setLoading(false)
  }

  useEffect(() => { fetchUsers() }, [])

  const updateUser = async (id: number, data: Record<string, unknown>) => {
    setUpdating(id)
    const token = localStorage.getItem("token")
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(data),
      })
      if (res.ok) fetchUsers()
    } catch (err) {
      console.error("Update user error:", err)
    }
    setUpdating(null)
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
          <h1 className="text-2xl font-bold tracking-tight">Пользователи</h1>
          <p className="text-sm text-muted-foreground mt-1">Управление учётными записями</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchUsers} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-1.5 ${loading ? "animate-spin" : ""}`} />
          Обновить
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            Все сотрудники ({users.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {users.map(user => (
              <div key={user.id} className={`flex items-center gap-4 px-5 py-3.5 hover:bg-muted/30 transition-colors ${!user.isActive ? "opacity-50" : ""}`}>
                <Avatar className="w-9 h-9">
                  <AvatarFallback className="text-xs bg-primary/10 text-primary">
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold truncate">{user.name}</span>
                    {roleBadge(user.role)}
                    {!user.isActive && (
                      <Badge variant="outline" className="text-[10px] text-muted-foreground">Заблокирован</Badge>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{user.email} · {user.department || "—"}</p>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={user.role}
                    onChange={(e) => updateUser(user.id, { role: e.target.value })}
                    disabled={updating === user.id}
                    className="h-8 rounded-md border border-input bg-background px-2 text-xs font-medium"
                  >
                    {roleOptions.map(o => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                  <Button
                    variant={user.isActive ? "outline" : "default"}
                    size="sm"
                    className="h-8 text-xs"
                    disabled={updating === user.id}
                    onClick={() => updateUser(user.id, { isActive: !user.isActive })}
                  >
                    {user.isActive ? (
                      <><UserX className="w-3 h-3 mr-1" /> Заблокировать</>
                    ) : (
                      <><UserCheck className="w-3 h-3 mr-1" /> Активировать</>
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
