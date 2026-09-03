import { cn } from '@/lib/utils'

interface BrandMarkProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

const sizes = {
  sm: 'h-10 w-10',
  md: 'h-12 w-12',
  lg: 'h-16 w-16',
}

export function BrandMark({ className, size = 'md' }: BrandMarkProps) {
  return (
    <img
      src="/logo-dev-generator.svg"
      alt=""
      aria-hidden
      className={cn('rounded-[1.35rem] object-cover shadow-bubble', sizes[size], className)}
    />
  )
}
