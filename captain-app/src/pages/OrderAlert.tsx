import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, Store, Banknote, StickyNote, Truck } from 'lucide-react'
import Modal from '../components/Modal'

/** شاشة الطلب الجديد المنبثقة — عداد 5 دقائق مع قبول/رفض */
export default function OrderAlert() {
  const navigate = useNavigate()
  const [left, setLeft] = useState(5 * 60)
  const [rejecting, setRejecting] = useState(false)

  useEffect(() => {
    const t = setInterval(() => setLeft((s) => (s > 0 ? s - 1 : 0)), 1000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    if (left === 0) navigate('/home', { replace: true })
  }, [left, navigate])

  const mm = String(Math.floor(left / 60)).padStart(2, '0')
  const ss = String(left % 60).padStart(2, '0')
  const urgency = left > 180 ? 'text-white' : left > 60 ? 'text-white/80' : 'animate-pulse text-white'

  const rows = [
    { icon: Store, label: 'المحل / المطعم', value: '—' },
    { icon: MapPin, label: 'منطقة الاستلام', value: '—' },
    { icon: MapPin, label: 'منطقة التوصيل', value: '—' },
    { icon: Banknote, label: 'مبلغ الطلبية للمحل', value: '— د.ع' },
    { icon: Banknote, label: 'أجرة التوصيل لك', value: '— د.ع' },
    { icon: StickyNote, label: 'الملاحظات', value: '—' },
  ]

  return (
    <div className="app-shell !bg-black text-white">
      <div className="flex flex-col items-center px-6 pt-10 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-black">
          <Truck className="h-7 w-7" strokeWidth={1.8} />
        </span>
        <h1 className="mt-4 text-xl font-bold">🚚 طلبية جديدة من زاجل!</h1>
        <p className="mt-1 text-[11px] text-white/50">المهلة المتبقية للقبول</p>
        <p className={`mt-2 text-5xl font-bold tabular-nums tracking-wider ${urgency}`} dir="ltr">
          {mm}:{ss}
        </p>
      </div>

      {/* mini map */}
      <div className="mx-5 mt-6 h-32 overflow-hidden rounded-2xl border border-white/15"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,.07) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.07) 1px, transparent 1px)',
          backgroundSize: '26px 26px',
        }}
      >
        <div className="flex h-full items-center justify-center gap-3 text-[11px] font-semibold text-white/40">
          <MapPin className="h-4 w-4" /> مسار الرحلة يظهر هنا عند ربط الخرائط
        </div>
      </div>

      <div className="mx-5 mt-4 flex-1 divide-y divide-white/10 rounded-2xl border border-white/15">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center gap-3 px-4 py-3">
            <r.icon className="h-4 w-4 shrink-0 text-white/40" />
            <span className="flex-1 text-xs text-white/60">{r.label}</span>
            <span className="text-xs font-bold">{r.value}</span>
          </div>
        ))}
      </div>

      <div className="flex gap-3 px-5 py-6">
        <button
          className="flex-1 rounded-2xl bg-white py-4 text-sm font-bold text-black transition-transform active:scale-[0.98]"
          onClick={() => navigate('/order', { replace: true })}
        >
          قبول الطلبية ✅
        </button>
        <button
          className="flex-1 rounded-2xl border border-white/40 py-4 text-sm font-bold text-white transition-transform active:scale-[0.98]"
          onClick={() => setRejecting(true)}
        >
          رفض الطلبية ❌
        </button>
      </div>

      {rejecting && (
        <Modal title="رفض الطلبية؟" onClose={() => setRejecting(false)}>
          <p className="mt-2 text-xs leading-relaxed text-mute">
            هل تريد رفض هذا الطلب؟ سيتم إرساله لكابتن آخر، ويُسجل الرفض في ملفك.
          </p>
          <div className="mt-5 flex gap-2">
            <button className="btn-primary flex-1" onClick={() => navigate('/home', { replace: true })}>
              تأكيد الرفض
            </button>
            <button className="btn-secondary flex-1" onClick={() => setRejecting(false)}>
              إلغاء
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}
