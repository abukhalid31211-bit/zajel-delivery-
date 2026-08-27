import EmptyState from './EmptyState'
import type { LucideIcon } from 'lucide-react'

export type TableRow = {
  key: string
  cells: React.ReactNode[]
  onClick?: () => void
}

export default function DataTable({
  columns,
  rows,
  emptyTitle,
  emptyHint,
  emptyIcon,
  emptyAction,
}: {
  columns: string[]
  rows?: TableRow[]
  emptyTitle?: string
  emptyHint?: string
  emptyIcon?: LucideIcon
  emptyAction?: React.ReactNode
}) {
  const hasRows = !!rows && rows.length > 0
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
          {hasRows && (
            <tbody>
              {rows!.map((r) => (
                <tr
                  key={r.key}
                  onClick={r.onClick}
                  className={`border-b border-line last:border-0 ${r.onClick ? 'cursor-pointer hover:bg-page' : ''}`}
                >
                  {r.cells.map((cell, i) => (
                    <td key={i} className="whitespace-nowrap px-4 py-3 text-xs" onClick={i === columns.length - 1 ? (e) => e.stopPropagation() : undefined}>
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          )}
        </table>
      </div>
      {!hasRows && <EmptyState icon={emptyIcon} title={emptyTitle} hint={emptyHint} action={emptyAction} />}
    </div>
  )
}
