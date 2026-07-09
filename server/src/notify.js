import knex from './db.js'
import { sendTicketNotification } from './email.js'
import { sendTelegramNotification } from './telegram.js'
import { createNotification } from './routes/notifications.js'

const STATUS_LABELS = { open: 'Открыт', in_progress: 'В работе', resolved: 'Решён', closed: 'Закрыт' }
const PRIORITY_LABELS = { low: 'Низкий', medium: 'Средний', high: 'Высокий', critical: 'Критичный' }

async function getTicketWithUsers(ticketId) {
  const [[ticket]] = await knex.raw(
    `SELECT t.*,
       c.id as creatorId, c.name as creatorName, c.email as creatorEmail,
       a.id as assigneeId, a.name as assigneeName, a.email as assigneeEmail
     FROM tickets t
     LEFT JOIN employees c ON t.created_by = c.id
     LEFT JOIN employees a ON t.assigned_to = a.id
     WHERE t.id = ?`,
    [ticketId],
  )
  return ticket
}

async function getTicketParticipants(ticketId, excludeUserId) {
  const [rows] = await knex.raw(
    'SELECT DISTINCT sender_id FROM ticket_messages WHERE ticket_id = ? AND sender_id != ?',
    [ticketId, excludeUserId],
  )
  return rows.map(r => r.sender_id)
}

export async function notifyTicketCreated(ticketId, actorName) {
  const t = await getTicketWithUsers(ticketId)
  if (!t) return

  const tag = `#${ticketId}: ${t.title}`
  createNotification({
    userId: t.creatorId, type: 'ticket_created',
    title: 'Тикет создан', body: t.title,
    link: `/tickets/${ticketId}`,
  })
  sendTelegramNotification(`🆕 Новый тикет ${tag}\nПриоритет: ${PRIORITY_LABELS[t.priority] || t.priority}\nКатегория: ${t.category}`)
  if (t.creatorEmail) {
    sendTicketNotification({
      to: t.creatorEmail,
      subject: `Тикет #${ticketId} создан: ${t.title}`,
      text: `Ваш тикет "${t.title}" (#${ticketId}) создан.\nСтатус: Открыт\nПриоритет: ${PRIORITY_LABELS[t.priority] || t.priority}\n\nService Desk`,
    })
  }
}

export async function notifyStatusChanged(ticketId, oldStatus, newStatus, actorName) {
  const t = await getTicketWithUsers(ticketId)
  if (!t) return

  const oldLabel = STATUS_LABELS[oldStatus] || oldStatus
  const newLabel = STATUS_LABELS[newStatus] || newStatus
  const tag = `#${ticketId}: ${t.title}`

  const targets = [t.creatorId]
  if (t.assigneeId && !targets.includes(t.assigneeId)) targets.push(t.assigneeId)
  for (const userId of targets) {
    createNotification({
      userId, type: 'ticket_status',
      title: `Статус изменён: ${newLabel}`,
      body: t.title,
      link: `/tickets/${ticketId}`,
    })
  }
  sendTelegramNotification(`📋 Статус тикета ${tag}\n${oldLabel} → ${newLabel}\nИзменил: ${actorName}`)

  const emailTargets = []
  if (t.creatorEmail && !emailTargets.includes(t.creatorId)) emailTargets.push({ email: t.creatorEmail, name: t.creatorName })
  if (t.assigneeEmail && t.assigneeId !== t.creatorId) emailTargets.push({ email: t.assigneeEmail, name: t.assigneeName })
  for (const et of emailTargets) {
    sendTicketNotification({
      to: et.email,
      subject: `Статус тикета ${tag}: ${newLabel}`,
      text: `Тикет "${t.title}" (#${ticketId})\nСтатус: ${oldLabel} → ${newLabel}\n\nService Desk`,
    })
  }
}

export async function notifyPriorityChanged(ticketId, oldPriority, newPriority, actorName) {
  const t = await getTicketWithUsers(ticketId)
  if (!t) return

  const tag = `#${ticketId}: ${t.title}`
  sendTelegramNotification(`⚡ Приоритет тикета ${tag}\n${PRIORITY_LABELS[oldPriority] || oldPriority} → ${PRIORITY_LABELS[newPriority] || newPriority}`)
}

export async function notifyTicketAssigned(ticketId, assigneeId, assignedByName) {
  const t = await getTicketWithUsers(ticketId)
  if (!t) return

  if (!assigneeId || assigneeId === t.creatorId) return

  createNotification({
    userId: assigneeId, type: 'ticket_assigned',
    title: 'Назначен тикет', body: t.title,
    link: `/tickets/${ticketId}`,
  })
  sendTelegramNotification(`👤 Тикет #${ticketId} назначен на пользователя\n"${t.title}"\nНазначил: ${assignedByName}`)

  if (t.assigneeEmail) {
    sendTicketNotification({
      to: t.assigneeEmail,
      subject: `Тикет #${ticketId} назначен на вас: ${t.title}`,
      text: `Тикет "${t.title}" (#${ticketId}) назначен на вас.\nСтатус: ${STATUS_LABELS[t.status] || t.status}\nПриоритет: ${PRIORITY_LABELS[t.priority] || t.priority}\n\nService Desk`,
    })
  }
}

export async function notifyTicketMessage(ticketId, senderId, senderName, text) {
  const t = await getTicketWithUsers(ticketId)
  if (!t) return

  const participantIds = await getTicketParticipants(ticketId, senderId)
  const targets = new Set([t.creatorId, t.assigneeId, ...participantIds].filter(Boolean))

  for (const userId of targets) {
    if (userId === senderId) continue
    createNotification({
      userId, type: 'ticket_message',
      title: senderName || 'Пользователь',
      body: text,
      link: `/tickets/${ticketId}`,
    })
  }

  sendTelegramNotification(`💬 Новое сообщение в тикете #${ticketId}: ${t.title}\n${senderName}: ${text.slice(0, 200)}`)
}
