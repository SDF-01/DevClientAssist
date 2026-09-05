import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'

interface StepperProps {
  steps: string[]
  currentStep: number
  className?: string
}

export function Stepper({ steps, currentStep, className }: StepperProps) {
  return (
    <ol className={cn('flex flex-wrap items-center gap-1.5', className)} aria-label="Progress">
      {steps.map((step, index) => {
        const isComplete = index < currentStep
        const isCurrent = index === currentStep
        const isLast = index === steps.length - 1

        return (
          <li key={step} className="flex items-center">
            <div
              className={cn(
                'flex items-center gap-1.5 rounded-[var(--radius-sm)] px-2 py-1.5 text-xs sm:gap-2 sm:px-3 sm:py-2 sm:text-sm transition-colors duration-200',
                isCurrent && 'bg-accent-primary text-japa-warm-white',
                isComplete && !isCurrent && 'text-moss',
                !isCurrent && !isComplete && 'text-muted-foreground',
              )}
              aria-current={isCurrent ? 'step' : undefined}
            >
              <span
                className={cn(
                  'flex h-6 w-6 items-center justify-center rounded-[var(--radius-sm)] text-xs font-medium',
                  isCurrent && 'bg-japa-warm-white/15 text-japa-warm-white',
                  isComplete && !isCurrent && 'bg-mist/40 text-moss',
                  !isCurrent && !isComplete && 'bg-surface-muted text-muted-foreground',
                )}
              >
                {isComplete && !isCurrent ? <Check className="h-3.5 w-3.5" strokeWidth={2} /> : index + 1}
              </span>
              <span className="font-medium">{step}</span>
            </div>
            {!isLast ? (
              <span
                className={cn('mx-1 hidden h-px w-6 sm:block', isComplete ? 'bg-bamboo/50' : 'bg-border')}
                aria-hidden
              />
            ) : null}
          </li>
        )
      })}
    </ol>
  )
}
