import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, TrendingUp } from 'lucide-react'

const periods = ['اليوم', 'الأسبوع', 'الشهر']
const days = ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة']

export default function Stats() {
  const navigate = useNavigate()
  const [period, setPeriod] = useState(1)
  return (
    <div className="app-shell">
      <div className="flex items-center gap-3 border-b border-line bg-white px-4 py-4">
        <button onClick={() => navigate(-1)} className="flex h-9 w-9 items-center justify-center rounded-xl border border-line">
          <ArrowRight className="h-4.5 w-4.5" />
        </button>
        <h1 className="text-base font-bold">إحصائياتي 📊</h1>
      </div>

      <div className="animate-fade-up flex-1 space-y-4 px-5 py-5">
        <div className="flex gap-2">
          {periods.map((p, i) => (
            <button
              key={p}
              onClick={() => setPeriod(i)}
              className={`flex-1 rounded-xl px-4 py-2 text-xs font-bold transition-colors ${period === i ? 'bg-black text-white' : 'border border-line bg-white text-mute'}`}
            >
              {p}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[
            ['إجمالي الطلبات', '0'],
            ['المكتملة', '0 (—%)'],
            ['الملغاة', '0 (—%)'],
            ['متوسط وقت التوصيل', '— دقيقة'],
            ['متوسط التقييم', '— ⭐'],
            ['إجمالي ساعات العمل', '0 ساعة'],
          ].map(([l, v]) => (
            <div key={l} className="card p-4">
              <p className="text-[10px] font-medium text-mute">{l}</p>
              <p className="mt-1.5 text-lg font-bold">{v}</p>
            </div>
          ))}
        </div>

        <div className="card flex items-center justify-between p-4">
          <p className="text-xs font-bold">إجمالي الأجرة (أرباحك)</p>
          <p className="text-base font-bold">0 د.ع</p>
        </div>

        <div className="card p-5">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-bold">
            <TrendingUp className="h-4 w-4" /> عدد الطلبات يومياً
          </h2>
          <div className="flex h-36 items-end justify-between gap-2 border-b border-line px-1">
            {days.map((d) => (
              <div key={d} className="flex flex-1 flex-col items-center">
                <div className="w-full max-w-8 rounded-t-md bg-page" style={{ height: 4 }} />
              </div>
            ))}
          </div>
          <div className="mt-2 flex justify-between px-1">
            {days.map((d) => (
              <span key={d} className="flex-1 text-center text-[8.5px] text-faint">{d}</span>
            ))}
          </div>
          <p className="mt-4 text-center text-[11px] text-faint">لا توجد بيانات لعرضها خلال هذه الفترة</p>
        </div>

        <div className="card mb-6 p-4">
          <p className="text-xs font-bold">مقارنة بالأسبوع الماضي</p>
          <p className="mt-2 text-[11px] leading-relaxed text-mute">
            ستظهر هنا نسب التغير في عدد الطلبات ومتوسط وقت التوصيل فور توفر بيانات كافية للمقارنة.
          </p>
        </div>
      </div>
    </div>
  )
}
