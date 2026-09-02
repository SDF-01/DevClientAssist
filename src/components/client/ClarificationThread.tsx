import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Input'
import { addClarificationMessage } from '@/lib/data/revisions'
import type { ClarificationMessage } from '@/types/database'
import { formatDate } from '@/lib/utils'

interface ClarificationThreadProps {
  revisionId: string
  messages: ClarificationMessage[]
  authorName: string
  authorId: string | null
  isInternal: boolean
  onUpdate: () => void
}

export function ClarificationThread({
  revisionId,
  messages,
  authorName,
  authorId,
  isInternal,
  onUpdate,
}: ClarificationThreadProps) {
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const visibleMessages = messages.filter((m) => isInternal || !m.is_internal)

  async function handleSubmit() {
    if (!message.trim()) return
    setSubmitting(true)
    try {
      await addClarificationMessage(revisionId, message.trim(), authorName, authorId, isInternal)
      setMessage('')
      onUpdate()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="space-y-4">
      <p className="section-label">Conversation</p>
      <h3 className="font-display text-lg font-medium">Questions and replies</h3>
      <ul className="max-h-64 space-y-3 overflow-auto">
        {visibleMessages.length === 0 ? (
          <li className="text-sm text-muted-foreground">No messages yet. Write one if something is unclear.</li>
        ) : (
          visibleMessages.map((msg) => (
            <li
              key={msg.id}
              className="rounded-[var(--radius-sm)] border border-border bg-surface-muted/50 p-3 text-sm"
            >
              <div className="mb-1 flex items-center justify-between gap-2">
                <strong>{msg.author_name}</strong>
                <span className="text-xs text-muted-foreground">{formatDate(msg.created_at)}</span>
              </div>
              <p>{msg.message}</p>
              {msg.is_internal ? (
                <span className="mt-1 inline-block text-[10px] font-medium uppercase tracking-wider text-japa-clay">
                  Internal note
                </span>
              ) : null}
            </li>
          ))
        )}
      </ul>
      <Textarea
        label="Add a message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={3}
        placeholder={isInternal ? 'Ask for a bit more detail...' : 'Reply to the team...'}
      />
      <Button onClick={() => void handleSubmit()} disabled={submitting || !message.trim()}>
        Send
      </Button>
    </section>
  )
}
