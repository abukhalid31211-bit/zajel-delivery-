import { Search, RotateCcw } from 'lucide-react'

export default function FilterBar({
  searchPlaceholder = 'بحث...',
  selects = [],
  withDate = false,
}: {
  searchPlaceholder?: string
  selects?: { label: string; options: string[] }[]
  withDate?: boolean
}) {
  return (
    <div className="card mb-5 flex flex-wrap items-center gap-2.5 p-3.5">
      <div className="relative min-w-52 flex-1">
        <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
        <input className="field pr-9" placeholder={searchPlaceholder} />
      </div>
      {selects.map((s) => (
        <select key={s.label} className="field w-auto min-w-32 cursor-pointer text-mute" defaultValue="">
          <option value="" disabled>
            {s.label}
          </option>
          <option>الكل</option>
          {s.options.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
      ))}
      {withDate && (
        <>
          <input type="date" className="field w-auto cursor-pointer text-mute" title="من تاريخ" />
          <input type="date" className="field w-auto cursor-pointer text-mute" title="إلى تاريخ" />
        </>
      )}
      <button className="btn-primary">
        <Search className="h-4 w-4" />
        بحث
      </button>
      <button className="btn-ghost">
        <RotateCcw className="h-3.5 w-3.5" />
        مسح
      </button>
    </div>
  )
}
