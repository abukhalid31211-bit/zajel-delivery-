import { useState } from 'react'
import EmptyState from './EmptyState'
import { PencilRuler } from 'lucide-react'

type Pt = { x: number; y: number }

export default function MapCanvas({
  points,
  onChange,
  tools = true,
  height = 384,
  hint = 'انقر على الخريطة لتحديد نقاط حدود المنطقة. أغلق المضلع بالنقر على أول نقطة أو زر حفظ.',
}: {
  points: Pt[]
  onChange: (p: Pt[]) => void
  tools?: boolean
  height?: number
  hint?: string
}) {
  const [mode, setMode] = useState<'draw' | 'edit' | 'idle'>('draw')
  const [closed, setClosed] = useState(points.length > 2)

  const add = (e: React.MouseEvent<HTMLDivElement>) => {
    if (mode !== 'draw') return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    if (points.length >= 3) {
      const first = points[0]
      const dx = x - first.x
      const dy = y - first.y
      if (Math.hypot(dx, dy) < 4) {
        setClosed(true)
        setMode('idle')
        return
      }
    }
    onChange([...points, { x, y }])
  }

  const poly = points.map((p) => `${p.x},${p.y}`).join(' ')

  return (
    <div className="overflow-hidden rounded-xl border border-line">
      {tools && (
        <div className="flex flex-wrap items-center gap-2 border-b border-line p-3">
          <button type="button" className={`btn-ghost ${mode === 'draw' ? 'border-black' : ''}`} onClick={() => { setMode('draw'); setClosed(false) }}>
            ✏️ رسم مضلع
          </button>
          <button type="button" className="btn-ghost" onClick={() => setMode('edit')}>
            🔧 تعديل
          </button>
          <button
            type="button"
            className="btn-ghost"
            onClick={() => {
              onChange([])
              setClosed(false)
              setMode('draw')
            }}
          >
            🗑️ حذف
          </button>
        </div>
      )}
      <div
        className="relative cursor-crosshair"
        style={{
          height,
          backgroundImage: 'linear-gradient(#eee 1px, transparent 1px), linear-gradient(90deg, #eee 1px, transparent 1px)',
          backgroundSize: '32px 32px',
          backgroundColor: '#fafafa',
        }}
        onClick={add}
      >
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
          {points.length > 1 && (
            <polyline points={poly} fill="none" stroke="#000" strokeWidth="0.6" />
          )}
          {closed && points.length > 2 && (
            <polygon points={poly} fill="rgba(0,0,0,0.08)" stroke="#000" strokeWidth="0.6" />
          )}
          {points.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r="1.2" fill="#000" />
          ))}
        </svg>
        {points.length === 0 && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <EmptyState icon={PencilRuler} title="ابدأ برسم الحدود" hint={hint} />
          </div>
        )}
      </div>
    </div>
  )
}
