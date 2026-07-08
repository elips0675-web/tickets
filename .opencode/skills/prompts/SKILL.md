---
name: prompts
description: Use when the user references a prompt from prompts.md by number or name (e.g. "промт 10", "реализуй админ-панель", "сделай уведомления", "вебсокет"). Read prompts.md and implement the matching section fully.
---

# Prompt Executor

Прочитай `D:\Tickets\prompts.md` и найди промт, который соответствует запросу пользователя (по номеру или ключевым словам).

Реализуй его **полностью**, включая:

- **Бэкенд**: маршруты (Express), валидация (express-validator), мидлвары (auth, RBAC), миграции (knex), seed-данные
- **Фронтенд**: страницы, компоненты (shadcn/ui), хуки, типы (TypeScript strict), i18n (ru + en)
- **API**: интеграция с существующими модулями, WebSocket (Socket.io) если нужно

## Правила

1. Прочитай существующий код перед изменениями — повторяй стиль, используй те же библиотеки
2. После каждого изменения запускай `node check-console.mjs` — `errors: []` и `hasRussianText: true`
3. В конце проверь: `npm run type-check` (tsc --noEmit), `npm run build`
4. Не ломай работающее — только добавляй новое
5. Код на русском (UI), комментариев минимум
6. Типизация: строгий TS, без `any`
