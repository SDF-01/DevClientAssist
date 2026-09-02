import { cn } from '@/lib/utils'
import type { RevisionStatus } from '@/types/database'

const statusStyles: Record<RevisionStatus, string> = {
  draft: 'bg-japa-stone/80 text-japa-charcoal',
  submitted: 'bg-japa-sage-light/50 text-japa-charcoal border border-japa-sage/20',
  in_review: 'bg-japa-clay-light/40 text-japa-charcoal border border-japa-clay/20',
  needs_clarification: 'bg-japa-sand text-japa-charcoal border border-border',
  approved: 'bg-japa-sage-light/60 text-japa-charcoal border border-japa-sage/25',
  exported: 'bg-surface-accent text-japa-charcoal',
  in_progress: 'bg-japa-sage/15 text-japa-charcoal border border-japa-sage/20',
  done: 'bg-japa-sage/25 text-japa-ink border border-japa-sage/30',
  rejected: 'bg-status-rejected/10 text-status-rejected border border-status-rejected/20',
}

const statusLabels: Record<RevisionStatus, string> = {
  draft: 'Draft',
  submitted: 'Submitted',
  in_review: 'In Review',
  needs_clarification: 'Needs Clarification',
  approved: 'Approved',
  exported: 'Exported',
  in_progress: 'In Progress',
  done: 'Done',
  rejected: 'Rejected',
}

interface BadgeProps {
  status: RevisionStatus
  className?: string
}

export function StatusBadge({ status, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-[var(--radius-sm)] px-2.5 py-1 text-[11px] font-medium uppercase tracking-wider',
        statusStyles[status],
        className,
      )}
    >
      {statusLabels[status].replace('_', ' ')}
    </span>
  )
}

interface LabelBadgeProps {
  children: React.ReactNode
  className?: string
}

export function LabelBadge({ children, className }: LabelBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-[var(--radius-sm)] border border-border bg-surface-muted px-2.5 py-1 text-[11px] font-medium tracking-wide text-muted-foreground',
        className,
      )}
    >
      {children}
    </span>
  )
}
