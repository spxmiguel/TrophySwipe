import type { ReactNode } from 'react'

interface StatCardProps {
  label: string
  value: string | number
  detail: string
  icon: ReactNode
}

export function StatCard({ label, value, detail, icon }: StatCardProps) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
          <p className="mt-2 text-3xl font-bold text-slate-950 dark:text-white">{value}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-2 text-signal-cyan dark:border-white/10 dark:bg-white/[0.08]">
          {icon}
        </div>
      </div>
      <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-300">{detail}</p>
    </article>
  )
}
