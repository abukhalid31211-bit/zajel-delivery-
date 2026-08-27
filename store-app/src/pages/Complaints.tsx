import { useNavigate } from 'react-router-dom'
import { ArrowRight, MessageSquareWarning, Plus } from 'lucide-react'

export default function Complaints() {
  const navigate = useNavigate()
  return (
    <div className="app-shell">
      <div className="flex items-center justify-between border-b border-line bg-white px-4 py-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="flex h-9 w-9 items-center justify-center rounded-xl border border-line">
            <ArrowRight className="h-4.5 w-4.5" />
          </button>
          <h1 className="text-base font-bold">شكاواي</h1>
        </div>
        <button
          onClick={() => navigate('/complaints/new')}
          className="flex items-center gap-1 rounded-xl bg-black px-3 py-2 text-[11px] font-bold text-white"
        >
          <Plus className="h-3.5 w-3.5" /> شكوى جديدة
        </button>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-8 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-3xl border border-dashed border-line bg-white">
          <MessageSquareWarning className="h-7 w-7 text-faint" strokeWidth={1.4} />
        </div>
        <p className="text-sm font-bold">لا توجد شكاوى مسجلة</p>
        <p className="max-w-64 text-[11px] leading-relaxed text-mute">
          ستظهر هنا شكاواك مع حالتها (🔴 مفتوحة · 🟡 قيد المراجعة · 🟢 محلولة) ورد الإدارة عليها.
        </p>
      </div>
    </div>
  )
}
