import { cn } from '@/lib/utils'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export function Input({ label, error, className, id, ...props }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
  return (
    <div className="space-y-2">
      {label ? (
        <label htmlFor={inputId} className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </label>
      ) : null}
      <input
        id={inputId}
        className={cn(
          'w-full rounded-[var(--radius-sm)] border border-border bg-surface-elevated px-4 py-3 text-sm text-foreground transition-colors placeholder:text-muted-foreground/60 focus:border-japa-sage/40 focus:outline-none focus:ring-2 focus:ring-japa-sage/15',
          className,
        )}
        {...props}
      />
      {error ? (
        <p className="text-sm text-status-rejected" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  hint?: string
  error?: string
}

export function Textarea({ label, hint, error, className, id, ...props }: TextareaProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-3">
        {label ? (
          <label htmlFor={inputId} className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {label}
          </label>
        ) : null}
        {hint ? <span className="text-xs text-muted-foreground">{hint}</span> : null}
      </div>
      <textarea
        id={inputId}
        className={cn(
          'min-h-[180px] w-full rounded-[var(--radius-sm)] border border-border bg-surface-elevated px-4 py-3 text-sm leading-relaxed text-foreground transition-colors placeholder:text-muted-foreground/60 focus:border-japa-sage/40 focus:outline-none focus:ring-2 focus:ring-japa-sage/15',
          className,
        )}
        {...props}
      />
      {error ? (
        <p className="text-sm text-status-rejected" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  description?: string
  options: Array<{ value: string; label: string }>
}

export function Select({ label, description, options, className, id, ...props }: SelectProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
  return (
    <div className="space-y-2">
      {label ? (
        <label htmlFor={inputId} className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </label>
      ) : null}
      <select
        id={inputId}
        className={cn(
          'w-full rounded-[var(--radius-sm)] border border-border bg-surface-elevated px-4 py-3 text-sm text-foreground transition-colors focus:border-japa-sage/40 focus:outline-none focus:ring-2 focus:ring-japa-sage/15',
          className,
        )}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {description ? <p className="text-sm leading-relaxed text-muted-foreground">{description}</p> : null}
    </div>
  )
}
