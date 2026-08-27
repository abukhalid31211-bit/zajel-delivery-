import { useNavigate } from 'react-router-dom'
import { MessageSquareWarning, Plus, ChevronLeft } from 'lucide-react'
import EmptyState from '../components/EmptyState'
import { useStore } from '../lib/StoreContext'
import { COMPLAINT_STATUS_META, fmtDateTime } from '../lib/data'

/** شكاواي — قائمة الشكاوى مع حالتها */
export default function Complaints() {
  const navigate = useNavigate()
  const { complaints } = useStore()

  return (
    <div className="app-shell">
      <div className="flex items-center justify-between border-b border-line bg-white px-4 py-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="flex h-9 w-9 items-center justify-center rounded-xl border border-line">
            <span className="text-sm font-bold">→</span>
          </button>
          <h1 className="text-base font-extrabold">شكاواي</h1>
        </div>
        <button
          onClick={() => navigate('/complaints/new')}
          className="flex items-center gap-1 rounded-xl bg-gold px-3 py-2 text-[11px] font-bold text-white shadow shadow-gold/25"
        >
          <Plus className="h-3.5 w-3.5" /> شكوى جديدة
        </button>
      </div>

      <div className="animate-fade-up flex-1 px-5 py-5">
        {complaints.length === 0 ? (
          <EmptyState
            icon={MessageSquareWarning}
            title="لا توجد شكاوى مسجلة"
            desc="ستظهر هنا شكاواك مع حالتها (🔴 مفتوحة · 🟡 قيد المراجعة · 🟢 محلولة) ورد الإدارة عليها."
          />
        ) : (
          <div className="space-y-3 pb-6">
            {complaints.map((c) => {
              const meta = COMPLAINT_STATUS_META[c.status]
              return (
                <button
                  key={c.id}
                  onClick={() => navigate(`/complaint-details?id=${c.id}`)}
                  className="card w-full p-4 text-right transition-transform active:scale-[0.99]"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-extrabold">{c.id}</p>
                    <span className={`badge ${meta.cls}`}>{meta.emoji} {meta.label}</span>
                  </div>
                  <p className="mt-1.5 truncate text-[11px] font-bold text-mute">{c.type}</p>
                  <p className="mt-1 truncate text-[11px] text-faint">{c.desc}</p>
                  <div className="mt-2 flex items-center justify-between border-t border-line pt-2 text-[10px] text-faint">
                    <span>{fmtDateTime(c.createdAt)}</span>
                    <span className="flex items-center gap-1 text-gold-strong">
                      التفاصيل <ChevronLeft className="h-3 w-3" />
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
