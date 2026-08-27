import { useState } from 'react'
import { Search, RotateCcw, Loader2 } from 'lucide-react'

export type Filters = {
  q: string
  selects: Record<string, string>
  from: string
  to: string
}

export const emptyFilters = (): Filters => ({ q: '', selects: {}, from: '', to: '' })

export default function FilterBar({
  searchPlaceholder = 'بحث...',
  selects = [],
  withDate = false,
  onSearch,
  onReset,
  onChange,
}: {
  searchPlaceholder?: string
  selects?: { label: string; options: string[] }[]
  withDate?: boolean
  onSearch?: (f: Filters) => void
  onReset?: () => void
  onChange?: (f: Filters) => void
}) {
  const [q, setQ] = useState('')
  const [sel, setSel] = useState<Record<string, string>>({})
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [tick, setTick] = useState(0)
  const [loading, setLoading] = useState(false)

  const current = (): Filters => ({ q, selects: sel, from, to })

  const emit = (next: Filters) => {
    onChange?.(next)
  }

  const search = () => {
    setLoading(true)
    window.setTimeout(() => {
      setLoading(false)
      onSearch?.(current())
    }, 280)
  }

  const reset = () => {
    setQ('')
    setSel({})
    setFrom('')
    setTo('')
    setTick((n) => n + 1)
    const empty = emptyFilters()
    onChange?.(empty)
    onReset?.()
  }

  return (
    <div key={tick} className="card mb-5 flex flex-wrap items-center gap-2.5 p-3.5">
      <div className="relative min-w-52 flex-1">
        <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
        <input
          className="field pr-9"
          placeholder={searchPlaceholder}
          value={q}
          onChange={(e) => {
            const v = e.target.value
            setQ(v)
            emit({ q: v, selects: sel, from, to })
          }}
          onKeyDown={(e) => e.key === 'Enter' && search()}
        />
      </div>
      {selects.map((s) => (
        <select
          key={s.label}
          className="field w-auto min-w-32 cursor-pointer"
          value={sel[s.label] || ''}
          onChange={(e) => {
            const next = { ...sel, [s.label]: e.target.value }
            setSel(next)
            emit({ q, selects: next, from, to })
          }}
        >
          <option value="">{s.label}</option>
          <option value="الكل">الكل</option>
          {s.options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      ))}
      {withDate && (
        <>
          <input
            type="date"
            className="field w-auto cursor-pointer text-mute"
            title="من تاريخ"
            value={from}
            onChange={(e) => {
              setFrom(e.target.value)
              emit({ q, selects: sel, from: e.target.value, to })
            }}
          />
          <input
            type="date"
            className="field w-auto cursor-pointer text-mute"
            title="إلى تاريخ"
            value={to}
            onChange={(e) => {
              setTo(e.target.value)
              emit({ q, selects: sel, from, to: e.target.value })
            }}
          />
        </>
      )}
      <button className="btn-primary" onClick={search} disabled={loading} type="button">
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
        بحث
      </button>
      <button className="btn-ghost" onClick={reset} type="button">
        <RotateCcw className="h-3.5 w-3.5" />
        مسح
      </button>
    </div>
  )
}

export function sel(f: Filters, label: string) {
  const v = f.selects[label]
  if (!v || v === 'الكل') return ''
  return v
}

export function inDateRange(iso: string, f: Filters) {
  if (!f.from && !f.to) return true
  const d = iso.slice(0, 10)
  if (f.from && d < f.from) return false
  if (f.to && d > f.to) return false
  return true
}
