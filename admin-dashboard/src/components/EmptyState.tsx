import type { LucideIcon } from 'lucide-react'
import { Inbox } from 'lucide-react'

export default function EmptyState({
  icon: Icon = Inbox,
  title = 'لا توجد بيانات لعرضها حالياً',
  hint,
  action,
}: {
  icon?: LucideIcon
  title?: string
  hint?: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-dashed border-line bg-page">
        <Icon className="h-6 w-6 text-faint" strokeWidth={1.5} />
      </div>
      <p className="text-sm font-semibold text-black">{title}</p>
      {hint && <p className="max-w-sm text-xs leading-relaxed text-mute">{hint}</p>}
      {action}
    </div>
  )
}
