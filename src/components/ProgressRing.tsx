interface ProgressRingProps {
  percent: number
  size?: number
  stroke?: number
  label?: string
  className?: string
}

export function ProgressRing({
  percent,
  size = 112,
  stroke = 10,
  label = 'Complete',
  className = '',
}: ProgressRingProps) {
  const clamped = Math.min(100, Math.max(0, percent))
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const offset = c - (clamped / 100) * c
  const id = `ring-grad-${size}`

  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
      role="img"
      aria-label={`${clamped} percent ${label}`}
    >
      {/* Soft glow behind ring */}
      <div
        className="pointer-events-none absolute inset-2 rounded-full opacity-40 blur-md"
        style={{
          background: `conic-gradient(from -90deg, rgba(212,175,55,0.5) ${clamped}%, transparent ${clamped}%)`,
        }}
      />
      <svg width={size} height={size} className="-rotate-90 relative">
        <defs>
          <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F0D78C" />
            <stop offset="50%" stopColor="#D4AF37" />
            <stop offset="100%" stopColor="#A88B2A" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={`url(#${id})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-700 ease-out"
          style={{ filter: 'drop-shadow(0 0 6px rgba(212,175,55,0.45))' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="font-serif text-2xl font-bold tabular-nums text-parchment">
          {clamped}
          <span className="text-base text-gold">%</span>
        </span>
        <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-parchment-muted">
          {label}
        </span>
      </div>
    </div>
  )
}
