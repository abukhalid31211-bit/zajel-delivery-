import EmptyState from './EmptyState'
import type { LucideIcon } from 'lucide-react'

export default function DataTable({
  columns,
  emptyTitle,
  emptyHint,
  emptyIcon,
}: {
  columns: string[]
  emptyTitle?: string
  emptyHint?: string
  emptyIcon?: LucideIcon
}) {
  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-max text-right text-sm">
          <thead>
            <tr className="border-b border-line bg-page/60">
              {columns.map((c) => (
                <th key={c} className="whitespace-nowrap px-4 py-3 text-xs font-semibold text-mute">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
        </table>
      </div>
      <EmptyState icon={emptyIcon} title={emptyTitle} hint={emptyHint} />
    </div>
  )
}
