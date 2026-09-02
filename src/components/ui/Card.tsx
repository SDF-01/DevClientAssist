import { cn } from '@/lib/utils'

interface CardProps {
  className?: string
  children: React.ReactNode
}

export function Card({ className, children }: CardProps) {
  return (
    <div
      className={cn(
        'panel-card rounded-[var(--radius-md)] border border-border bg-surface-elevated p-6 shadow-bubble',
        className,
      )}
    >
      {children}
    </div>
  )
}

export function CardHeader({ className, children }: CardProps) {
  return <div className={cn('mb-5 space-y-2', className)}>{children}</div>
}

export function CardTitle({ className, children }: CardProps) {
  return (
    <h3 className={cn('font-display text-2xl font-medium tracking-tight text-foreground', className)}>
      {children}
    </h3>
  )
}

export function CardDescription({ className, children }: CardProps) {
  return <p className={cn('text-sm leading-relaxed text-muted-foreground', className)}>{children}</p>
}
