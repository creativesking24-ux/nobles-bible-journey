import type { ReactNode } from 'react'
import { Sparkles } from 'lucide-react'

interface EmptyStateProps {
  icon?: ReactNode
  eyebrow?: string
  title: string
  body: string
  action?: ReactNode
  className?: string
}

/** Warm, encouraging empty / first-time guidance card */
export function EmptyState({
  icon,
  eyebrow,
  title,
  body,
  action,
  className = '',
}: EmptyStateProps) {
  return (
    <div
      className={`empty-state surface relative w-full overflow-hidden rounded-[1.35rem] px-5 py-8 text-left sm:px-6 sm:py-10 ${className}`}
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-gold/[0.07] via-transparent to-transparent" />
      <div className="relative w-full">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gold/15 text-gold ring-1 ring-gold/25">
          {icon ?? <Sparkles className="h-6 w-6" />}
        </div>
        {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
        <p className="w-full font-serif text-xl font-bold leading-snug text-parchment">
          {title}
        </p>
        <p className="text-content mt-2.5 w-full text-sm text-parchment-muted">{body}</p>
        {action && (
          <div className="mt-6 flex w-full flex-col items-stretch gap-2.5">{action}</div>
        )}
      </div>
    </div>
  )
}
