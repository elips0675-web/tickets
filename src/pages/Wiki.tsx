import { useState, useMemo } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, BookOpen, Plus, Clock, User, Tag, Layers } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import type { WikiArticle } from "@/types"

const DEMO_ARTICLES: WikiArticle[] = [
  { id: 1, title: "Как создать заявку", content: "Для создания заявки перейдите в раздел «Тикеты» и нажмите «Новый тикет». Заполните форму и отправьте. Статус заявки можно отслеживать в списке.", category: "Руководство", tags: ["тикеты", "создание"], authorId: 1, authorName: "Алексей Петров", createdAt: "2026-06-15T10:00:00", updatedAt: "2026-06-20T14:00:00" },
  { id: 2, title: "Правила работы с инцидентами", content: "Критические инциденты должны быть назначены в течение 15 минут. Время реакции — не более 1 часа. Все шаги фиксировать в комментариях.", category: "Правила", tags: ["инциденты", "SLA"], authorId: 1, authorName: "Алексей Петров", createdAt: "2026-06-10T09:00:00", updatedAt: "2026-06-18T11:00:00" },
  { id: 3, title: "Настройка email-уведомлений", content: "Перейдите в Профиль → Настройки. Включите нужные типы уведомлений. Доступны: новый тикет, ответ, смена статуса.", category: "Инструкции", tags: ["email", "уведомления"], authorId: 2, authorName: "Мария Иванова", createdAt: "2026-06-12T12:00:00", updatedAt: "2026-06-12T12:00:00" },
  { id: 4, title: "Часто задаваемые вопросы", content: "Вопрос: Как сменить пароль? Ответ: Обратитесь к администратору. Вопрос: Где найти статистику? Ответ: На дашборде.", category: "FAQ", tags: ["вопросы", "ответы"], authorId: 3, authorName: "Дмитрий Сидоров", createdAt: "2026-06-05T08:00:00", updatedAt: "2026-06-14T16:00:00" },
  { id: 5, title: "Интеграция с Telegram", content: "Для подключения Telegram-бота обратитесь к IT-отделу. После настройки вы сможете получать уведомления и отвечать на тикеты через Telegram.", category: "Интеграции", tags: ["telegram", "бот"], authorId: 1, authorName: "Алексей Петров", createdAt: "2026-06-01T15:00:00", updatedAt: "2026-06-22T09:00:00" },
]

const CATEGORIES = ["Все", "Руководство", "Правила", "Инструкции", "FAQ", "Интеграции"]

export default function WikiPage() {
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("Все")
  const [article, setArticle] = useState<WikiArticle | null>(null)
  const [open, setOpen] = useState(false)
  const [newTitle, setNewTitle] = useState("")
  const [newContent, setNewContent] = useState("")
  const [newCategory, setNewCategory] = useState("Руководство")
  const [newTags, setNewTags] = useState("")

  const filtered = useMemo(() => {
    let items = DEMO_ARTICLES
    if (category !== "Все") items = items.filter(a => a.category === category)
    if (search.trim()) {
      const q = search.toLowerCase()
      items = items.filter(a => a.title.toLowerCase().includes(q) || a.content.toLowerCase().includes(q) || a.tags.some(t => t.includes(q)))
    }
    return items
  }, [search, category])

  const handleCreate = () => {
    if (!newTitle.trim() || !newContent.trim()) return
    const article: WikiArticle = {
      id: DEMO_ARTICLES.length + 1,
      title: newTitle,
      content: newContent,
      category: newCategory,
      tags: newTags.split(",").map(t => t.trim()).filter(Boolean),
      authorId: 1,
      authorName: "Алексей Петров",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    DEMO_ARTICLES.unshift(article)
    setOpen(false)
    setNewTitle("")
    setNewContent("")
    setNewCategory("Руководство")
    setNewTags("")
    setArticle(article)
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-primary" />
            База знаний
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Статьи, инструкции и документация</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="w-4 h-4" />Статья</Button>
          </DialogTrigger>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>Новая статья</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <Input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Заголовок статьи" />
              <Textarea value={newContent} onChange={e => setNewContent(e.target.value)} placeholder="Содержание (Markdown)" rows={8} />
              <div className="flex gap-3">
                <Select value={newCategory} onValueChange={setNewCategory}>
                  <SelectTrigger className="w-1/2"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.filter(c => c !== "Все").map(c => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input value={newTags} onChange={e => setNewTags(e.target.value)} placeholder="Теги через запятую" className="w-1/2" />
              </div>
              <Button onClick={handleCreate} className="w-full">Создать</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Поиск в базе знаний..." className="pl-9" />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {article ? (
        <div className="rounded-xl border bg-card p-6 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold">{article.title}</h2>
              <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><User className="w-3 h-3" />{article.authorName}</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(article.updatedAt).toLocaleDateString()}</span>
                <Badge variant="outline" className="text-[10px]">{article.category}</Badge>
              </div>
              <div className="flex gap-1 mt-2">
                {article.tags.map(t => <Badge key={t} className="text-[9px] bg-primary/10 text-primary border-0">{t}</Badge>)}
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setArticle(null)}>Назад</Button>
          </div>
          <Separator />
          <div className="text-sm leading-relaxed whitespace-pre-wrap">{article.content}</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filtered.length === 0 && (
            <div className="col-span-full text-center py-16 text-muted-foreground">
              <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-bold text-sm">Статьи не найдены</p>
            </div>
          )}
          {filtered.map(a => (
            <div key={a.id} onClick={() => setArticle(a)} className="rounded-xl border bg-card p-4 hover:bg-muted/50 cursor-pointer transition-all space-y-2">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-bold text-sm leading-snug">{a.title}</h3>
                <Layers className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2">{a.content}</p>
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-[9px]">{a.category}</Badge>
                <div className="flex gap-1">
                  {a.tags.slice(0, 2).map(t => <Badge key={t} className="text-[9px] bg-primary/10 text-primary border-0">{t}</Badge>)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}