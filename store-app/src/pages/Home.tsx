import { useNavigate } from 'react-router-dom'
import { Bell, Plus, Inbox } from 'lucide-react'

export default function Home() {
  const navigate = useNavigate()
  return (
    <div>
      {/* header */}
      <div className="bg-black px-5 pb-20 pt-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white">
              <svg viewBox="0 0 64 64" width="22" height="22">
                <path d="M14 20h30l-22 20h24v4H14l22-20H14z" fill="#000" />
                <circle cx="50" cy="16" r="4" fill="#000" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold leading-none">زاجل محل</p>
              <p className="mt-1 flex items-center gap-1 text-[10px] text-white/50">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-white" /> الحالة: نشط
              </p>
            </div>
          </div>
          <button onClick={() => navigate('/notifications')} className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/15">
            <Bell className="h-[18px] w-[18px]" strokeWidth={1.8} />
          </button>
        </div>

        <div className="mt-6">
          <p className="text-lg font-bold leading-snug">جاهز لإرسال طلبيتك؟</p>
          <p className="mt-1 text-xs text-white/50">اطلب كابتن زاجل وتابع التوصيل لحظة بلحظة</p>
        </div>
      </div>

      {/* CTA */}
      <div className="animate-fade-up -mt-10 px-5">
        <button
          onClick={() => navigate('/create-order')}
          className="card flex w-full items-center gap-4 border-black p-5 shadow-lg transition-transform active:scale-[0.98]"
        >
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-black text-white">
            <Plus className="h-7 w-7" strokeWidth={2.2} />
          </span>
          <span className="flex-1 text-right">
            <span className="block text-base font-bold">إنشاء طلب جديد 🚚</span>
            <span className="mt-0.5 block text-xs text-mute">3 خطوات سريعة: الزبون ← الموقع ← المبلغ</span>
          </span>
        </button>
      </div>

      {/* quick stats */}
      <div className="grid grid-cols-3 gap-3 px-5 pt-5">
        {[
          ['طلبات اليوم', '0'],
          ['مكتملة', '0'],
          ['ملغاة', '0'],
        ].map(([l, v]) => (
          <div key={l} className="card p-3.5 text-center">
            <p className="text-xl font-bold">{v}</p>
            <p className="mt-1 text-[10px] font-medium text-mute">{l}</p>
          </div>
        ))}
      </div>

      {/* active orders */}
      <div className="px-5 pb-6 pt-6">
        <h2 className="mb-3 text-sm font-bold">طلباتك النشطة</h2>
        <div className="card flex flex-col items-center gap-3 p-8 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-dashed border-line bg-page">
            <Inbox className="h-6 w-6 text-faint" strokeWidth={1.5} />
          </div>
          <p className="text-sm font-bold">لا توجد طلبات نشطة 📭</p>
          <p className="max-w-60 text-[11px] leading-relaxed text-mute">
            أنشئ طلبك الأول وسيظهر هنا مع حالة الكابتن والتتبع المباشر.
          </p>
        </div>
      </div>
    </div>
  )
}
