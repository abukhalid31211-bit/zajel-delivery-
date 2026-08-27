import type { LucideIcon } from 'lucide-react'

export default function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  alert = false,
}: {
  icon: LucideIcon
  label: string
  value: string
  sub?: string
  alert?: boolean
}) {
  return (
    <div className="card group cursor-pointer p-5 transition-all hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-mute">{label}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight">{value}</p>
          {sub && <p className="mt-1 text-[11px] text-faint">{sub}</p>}
        </div>
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl transition-colors ${
            alert ? 'border border-dashed border-black bg-white' : 'bg-black'
          }`}
        >
          <Icon className={`h-5 w-5 ${alert ? 'text-black' : 'text-white'}`} strokeWidth={1.8} />
        </div>
      </div>
    </div>
  )
}
