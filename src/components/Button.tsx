import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '../utils/cn'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  icon?: ReactNode
}

const variants: Record<ButtonVariant, string> = {
  primary:
    'bg-signal-cyan text-ink-950 hover:bg-cyan-300 focus-visible:ring-signal-cyan disabled:bg-slate-500',
  secondary:
    'border border-white/15 bg-white/[0.08] text-white hover:bg-white/[0.12] focus-visible:ring-signal-blue dark:border-white/15 dark:bg-white/[0.08]',
  ghost:
    'text-slate-700 hover:bg-slate-200 focus-visible:ring-signal-blue dark:text-slate-200 dark:hover:bg-white/[0.08]',
  danger:
    'border border-red-400/40 bg-red-500/12 text-red-700 hover:bg-red-500/18 focus-visible:ring-red-400 dark:text-red-200',
}

export function Button({
  className,
  variant = 'primary',
  icon,
  children,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950 disabled:cursor-not-allowed disabled:opacity-60',
        variants[variant],
        className,
      )}
      type={type}
      {...props}
    >
      {icon}
      <span>{children}</span>
    </button>
  )
}
