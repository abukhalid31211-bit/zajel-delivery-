import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, TrendingUp } from 'lucide-react'
import { useCaptain } from '../state'

const periods = ['اليوم', 'الأسبوع', 'الشهر']
const days = ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة']

export default function Stats() {
  const navigate = useNavigate()
  const { state, money } = useCaptain()
  const [period, setPeriod] = useState(1)

  const total = state.orders.length
  const delivered = state.orders.filter((o) => o.stage === 'delivered')
  const canceled = state.orders.filter((o) => o.stage === 'canceled')
  const earned = delivered.reduce((a, o) => a + o.deliveryFee, 0)
  const avg = state.ratings.length ? (state.ratings.reduce((a, r) => a + r.stars, 0) / state.ratings.length).toFixed(1) : '—'

  const durations = delivered
    .filter((o) => o.acceptedAt && o.deliveredAt)
    .map((o) => (new Date(o.deliveredAt!).getTime() - new Date(o.acceptedAt!).getTime()) / 60000)
  const avgDur = durations.length ? `${Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)} دقيقة` : '— دقيقة'

  // رسم بياني بسيط يعكس أنماط التسليم الفعلية
  const today = new Date().getDay()
  const bars = days.map((_, i) => {
    const count = state.orders.filter((o) => o.deliveredAt && new Date(o.deliveredAt).getDay() === i).length
    return count
  })
  const max = Math.max(1, ...bars)

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
            <button key={p} onClick={() => setPeriod(i)} className={`flex-1 rounded-xl px-4 py-2 text-xs font-bold transition-colors ${period === i ? 'bg-gold text-white' : 'border border-line bg-white text-mute'}`}>{p}</button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[
            ['إجمالي الطلبات', String(total)],
            ['المكتملة', `${delivered.length} (${total ? Math.round((delivered.length / total) * 100) : 0}%)`],
            ['الملغاة', `${canceled.length} (${total ? Math.round((canceled.length / total) * 100) : 0}%)`],
            ['متوسط وقت التوصيل', avgDur],
            ['متوسط التقييم', `${avg} ⭐`],
            ['إجمالي ساعات العمل', '— ساعة'],
          ].map(([l, v]) => (
            <div key={l} className="card p-4">
              <p className="text-[10px] font-medium text-mute">{l}</p>
              <p className="mt-1.5 text-lg font-bold">{v}</p>
            </div>
          ))}
        </div>

        <div className="card flex items-center justify-between p-4">
          <p className="text-xs font-bold">إجمالي الأجرة (أرباحك)</p>
          <p className="text-base font-bold text-gold-dark">{money(earned)}</p>
        </div>

        <div className="card p-5">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-bold">
            <TrendingUp className="h-4 w-4" /> عدد الطلبات يومياً
          </h2>
          <div className="flex h-36 items-end justify-between gap-2 border-b border-line px-1">
            {bars.map((count, i) => (
              <div key={i} className="flex flex-1 flex-col items-center">
                <div className={`w-full max-w-8 rounded-t-md ${count > 0 ? 'bg-gold' : 'bg-page'}`} style={{ height: Math.max(4, (count / max) * 110) }} />
                {i === today && <span className="mt-1 h-1.5 w-1.5 rounded-full bg-gold" />}
              </div>
            ))}
          </div>
          <div className="mt-2 flex justify-between px-1">
            {days.map((d) => <span key={d} className="flex-1 text-center text-[8.5px] text-faint">{d}</span>)}
          </div>
          {bars.every((b) => b === 0) && <p className="mt-4 text-center text-[11px] text-faint">لا توجد بيانات عرض لهذه الفترة بعد</p>}
        </div>

        <div className="card mb-6 p-4">
          <p className="text-xs font-bold">مقارنة بالأسبوع الماضي</p>
          <p className="mt-2 text-[11px] leading-relaxed text-mute">ستظهر هنا نسب التغير في عدد الطلبات ومتوسط وقت التوصيل فور توفر بيانات كافية للمقارنة.</p>
        </div>
      </div>
    </div>
  )
}
