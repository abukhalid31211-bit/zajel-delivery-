import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

/** حالة فارغة موحدة */
export default function EmptyState({
  icon: Icon,
  title,
  desc,
  children,
}: {
  icon: LucideIcon
  title: string
  desc?: string
  children?: ReactNode
}) {
  return (
    <div className="card flex flex-col items-center gap-3 p-8 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-dashed border-line-strong bg-gold-faint">
        <Icon className="h-6 w-6 text-gold" strokeWidth={1.5} />
      </div>
      <p className="text-sm font-extrabold">{title}</p>
      {desc && <p className="max-w-64 text-[11px] leading-relaxed text-mute">{desc}</p>}
      {children}
    </div>
  )
}
