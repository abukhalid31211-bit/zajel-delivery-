const PREFIX = 'zajel_'

export function uid() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

export function nowIso() {
  return new Date().toISOString()
}

export function formatDate(iso?: string) {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleString('ar-IQ', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return iso
  }
}

export function dbGet<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(PREFIX + key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function dbSet<T>(key: string, value: T) {
  localStorage.setItem(PREFIX + key, JSON.stringify(value))
}

export function dbRemove(key: string) {
  localStorage.removeItem(PREFIX + key)
}
