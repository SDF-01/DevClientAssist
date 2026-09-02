import { cn } from '@/lib/utils'

interface CardProps {
  className?: string
  children: React.ReactNode
  framed?: boolean
}

export function Card({ className, children, framed = true }: CardProps) {
  return (
    <div
      className={cn(
        'panel-card ornament-card rounded-[2px] p-6 sm:p-8',
        framed && 'pt-10',
        className,
      )}
    >
      {framed ? (
        <>
          <span className="corner tl" aria-hidden />
          <span className="corner tr" aria-hidden />
          <span className="corner bl" aria-hidden />
          <span className="corner br" aria-hidden />
        </>
      ) : null}
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
