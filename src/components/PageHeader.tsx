interface PageHeaderProps {
  eyebrow?: string
  title: string
  description: string
}

export function PageHeader({ eyebrow, title, description }: PageHeaderProps) {
  return (
    <header className="mb-8">
      {eyebrow ? (
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-signal-cyan">
          {eyebrow}
        </p>
      ) : null}
      <h1 className="max-w-4xl text-3xl font-bold tracking-normal text-slate-950 dark:text-white md:text-5xl">
        {title}
      </h1>
      <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600 dark:text-slate-300">
        {description}
      </p>
    </header>
  )
}
