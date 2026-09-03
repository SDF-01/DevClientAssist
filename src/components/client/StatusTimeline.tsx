import { StatusBadge } from '@/components/ui/Badge'
import type { RevisionStatus } from '@/types/database'
import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'

const timelineSteps: Array<{ status: RevisionStatus; label: string }> = [
  { status: 'submitted', label: 'Received' },
  { status: 'in_review', label: 'In review' },
  { status: 'approved', label: 'Approved' },
  { status: 'exported', label: 'Ready for build' },
  { status: 'in_progress', label: 'In progress' },
  { status: 'done', label: 'Done' },
]

const statusOrder: RevisionStatus[] = timelineSteps.map((s) => s.status)

interface StatusTimelineProps {
  currentStatus: RevisionStatus
  className?: string
}

export function StatusTimeline({ currentStatus, className }: StatusTimelineProps) {
  const currentIndex = statusOrder.indexOf(currentStatus)

  return (
    <div className={cn('space-y-3', className)}>
      <p className="section-label">Status</p>
      <ol className="flex flex-wrap gap-2" aria-label="Revision status timeline">
        {timelineSteps.map((step, index) => {
          const isComplete = currentIndex >= index && currentIndex !== -1
          const isCurrent = step.status === currentStatus
          return (
            <li
              key={step.status}
              className={cn(
                'flex items-center gap-2 rounded-[var(--radius-pill)] border px-3 py-1.5 text-xs font-medium tracking-wide transition-colors',
                isComplete
                  ? 'border-sage/30 bg-mist/35 text-charcoal'
                  : 'border-border bg-surface-muted/50 text-muted-foreground',
                isCurrent && 'ring-1 ring-accent-primary/30',
              )}
            >
              {isComplete ? (
                <Check className="h-3 w-3 text-moss" strokeWidth={2} />
              ) : (
                <span className="h-1.5 w-1.5 rounded-full bg-border" />
              )}
              {step.label}
            </li>
          )
        })}
        {currentStatus === 'needs_clarification' ? <StatusBadge status="needs_clarification" /> : null}
        {currentStatus === 'rejected' ? <StatusBadge status="rejected" /> : null}
      </ol>
    </div>
  )
}
