import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export function PageShell({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={`page-shell safe-pt safe-x relative px-4 pb-8 pt-3 landscape:px-5 landscape:pb-5 landscape:pt-2 ${className}`}
    >
      {children}
    </div>
  )
}

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  action,
}: {
  eyebrow?: string
  title: string
  subtitle?: string
  action?: ReactNode
}) {
  return (
    <header className="mb-5 flex items-start justify-between gap-3">
      <div className="min-w-0">
        {eyebrow && <p className="eyebrow mb-1.5">{eyebrow}</p>}
        <h1 className="font-serif text-[1.65rem] font-bold leading-tight tracking-tight text-parchment">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1 text-sm leading-relaxed text-parchment-muted">{subtitle}</p>
        )}
      </div>
      {action}
    </header>
  )
}

export function BackLink({ to, label = 'Back' }: { to?: string; label?: string }) {
  if (to) {
    return (
      <Link
        to={to}
        className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-parchment-muted transition hover:text-parchment"
      >
        <ArrowLeft className="h-4 w-4" />
        {label}
      </Link>
    )
  }
  return null
}

export function Surface({
  children,
  className = '',
  gold = false,
  hero = false,
  onClick,
}: {
  children: ReactNode
  className?: string
  gold?: boolean
  hero?: boolean
  onClick?: () => void
}) {
  const base = hero ? 'surface-hero' : gold ? 'surface-gold' : 'surface'
  const Comp = onClick ? 'button' : 'div'
  return (
    <Comp
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={`${base} rounded-[1.25rem] p-4 text-left ${onClick ? 'card-press w-full' : ''} ${className}`}
    >
      {children}
    </Comp>
  )
}

export function IconButton({
  to,
  onClick,
  label,
  children,
}: {
  to?: string
  onClick?: () => void
  label: string
  children: ReactNode
}) {
  const cls =
    'flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl surface text-parchment-muted transition hover:text-gold'
  if (to) {
    return (
      <Link to={to} className={cls} aria-label={label}>
        {children}
      </Link>
    )
  }
  return (
    <button type="button" onClick={onClick} className={cls} aria-label={label}>
      {children}
    </button>
  )
}

export function StatPill({
  icon,
  label,
  value,
}: {
  icon: ReactNode
  label: string
  value: string
}) {
  return (
    <div className="flex items-center gap-2.5 rounded-xl bg-black/20 px-3 py-2 ring-1 ring-white/5">
      <span className="text-gold">{icon}</span>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-parchment-muted">
          {label}
        </p>
        <p className="truncate text-sm font-semibold text-parchment">{value}</p>
      </div>
    </div>
  )
}

export function EmptyState({
  title,
  body,
  action,
}: {
  title: string
  body: string
  action?: ReactNode
}) {
  return (
    <div className="surface rounded-2xl border-dashed px-5 py-10 text-center">
      <p className="font-serif text-lg text-parchment">{title}</p>
      <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-parchment-muted">
        {body}
      </p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
