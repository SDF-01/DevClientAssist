import { cn } from '@/lib/utils'

interface CardProps {
  className?: string
  children: React.ReactNode
  framed?: boolean
}

export function Card({ className, children, framed = false }: CardProps) {
  return (
    <div
      className={cn(
        'panel-card ornament-card rounded-[var(--radius-lg)] p-6 sm:p-7',
        framed && 'oak-rail',
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

interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode
}

export function CardTitle({ className, children, ...props }: CardTitleProps) {
  return (
    <h3 className={cn('font-display text-2xl font-medium tracking-tight text-foreground', className)} {...props}>
      {children}
    </h3>
  )
}

export function CardDescription({ className, children }: CardProps) {
  return <p className={cn('text-sm leading-relaxed text-muted-foreground', className)}>{children}</p>
}
