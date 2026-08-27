import { useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import type { ReactNode } from 'react'

/** شريط علوي موحد مع سهم رجوع وعنوان وأزرار جانبية */
export default function Header({
  title,
  subtitle,
  onBack,
  to,
  actions,
  sticky = true,
}: {
  title: string
  subtitle?: string
  onBack?: () => void
  to?: string
  actions?: ReactNode
  sticky?: boolean
}) {
  const navigate = useNavigate()
  const go = () => {
    if (onBack) onBack()
    else if (to) navigate(to)
    else navigate(-1)
  }
  return (
    <div className={`${sticky ? 'sticky top-0 z-20' : ''} border-b border-line bg-white/95 px-4 py-3.5 backdrop-blur`}>
      <div className="flex items-center gap-3">
        <button onClick={go} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-line bg-white text-ink">
          <ArrowRight className="h-4.5 w-4.5" />
        </button>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-base font-extrabold">{title}</h1>
          {subtitle && <p className="mt-0.5 truncate text-[10px] text-mute">{subtitle}</p>}
        </div>
        {actions}
      </div>
    </div>
  )
}
