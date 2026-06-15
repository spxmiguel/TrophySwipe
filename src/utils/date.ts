export function nowIso() {
  return new Date().toISOString()
}

export function formatDateTime(value?: string) {
  if (!value) return 'Nunca'

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value))
}
