import { cn } from '@/lib/utils'

interface AirmenVoiceMarkProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

const sizes = {
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-14 w-14',
}

export function AirmenVoiceMark({ className, size = 'md' }: AirmenVoiceMarkProps) {
  return (
    <img
      src="/logo-airmen-voice.svg"
      alt=""
      aria-hidden
      className={cn('rounded-[var(--radius-sm)] object-cover shadow-wood', sizes[size], className)}
    />
  )
}
