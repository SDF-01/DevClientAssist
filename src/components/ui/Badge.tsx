import { cn } from '@/lib/utils'
import type { RevisionStatus } from '@/types/database'

const statusStyles: Record<RevisionStatus, string> = {
  draft: 'bg-greige text-charcoal',
  submitted: 'bg-mist/50 text-moss border border-sage/25',
  in_review: 'bg-bamboo/20 text-charcoal border border-bamboo/30',
  needs_clarification: 'bg-sand text-charcoal border border-border',
  approved: 'bg-sage/25 text-moss border border-moss/25',
  exported: 'bg-blush/40 text-charcoal',
  in_progress: 'bg-mist/30 text-moss border border-sage/20',
  done: 'bg-moss/15 text-moss border border-moss/30',
  rejected: 'bg-status-rejected/10 text-status-rejected border border-status-rejected/20',
}

const statusLabels: Record<RevisionStatus, string> = {
  draft: 'Draft',
  submitted: 'Received',
  in_review: 'In review',
  needs_clarification: 'Needs a reply',
  approved: 'Approved',
  exported: 'Ready for build',
  in_progress: 'In progress',
  done: 'Done',
  rejected: 'Declined',
}

interface BadgeProps {
  status: RevisionStatus
  className?: string
}

export function StatusBadge({ status, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-[var(--radius-sm)] px-2.5 py-1 text-xs font-medium tracking-wide',
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
