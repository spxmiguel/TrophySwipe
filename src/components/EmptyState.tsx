import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Button } from './Button'

interface EmptyStateProps {
  title: string
  description: string
  actionLabel?: string
  actionTo?: string
  children?: ReactNode
}

export function EmptyState({
  title,
  description,
  actionLabel,
  actionTo,
  children,
}: EmptyStateProps) {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 bg-white/70 p-6 text-left shadow-sm dark:border-white/12 dark:bg-white/[0.04]">
      <h3 className="text-lg font-semibold text-slate-950 dark:text-white">{title}</h3>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
        {description}
      </p>
      {children ? <div className="mt-4">{children}</div> : null}
      {actionLabel && actionTo ? (
        <Link to={actionTo} className="mt-5 inline-flex">
          <Button variant="secondary" icon={<ArrowRight className="size-4" />}>
            {actionLabel}
          </Button>
        </Link>
      ) : null}
    </div>
  )
}
