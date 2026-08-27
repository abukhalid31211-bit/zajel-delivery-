import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { MapPin, Store, Banknote, StickyNote, Truck } from 'lucide-react'
import Modal from '../components/Modal'
import { useCaptain } from '../state'

export default function OrderAlert() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const { getOrder, acceptOrder, rejectOrder, money } = useCaptain()
  const orderId = params.get('order') || ''
  const order = getOrder(orderId)
  const [left, setLeft] = useState(5 * 60)
  const [rejecting, setRejecting] = useState(false)

  useEffect(() => {
    const t = setInterval(() => setLeft((s) => (s > 0 ? s - 1 : 0)), 1000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    if (left === 0 && order) {
      rejectOrder(order.id, true)
      navigate('/home', { replace: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [left])

  const mm = String(Math.floor(left / 60)).padStart(2, '0')
  const ss = String(left % 60).padStart(2, '0')
  const urgency = left > 180 ? 'text-white' : left > 60 ? 'text-white/80' : 'animate-pulse text-white'

  if (!order) {
    return (
      <div className="app-shell items-center justify-center px-8 text-center">
        <h1 className="text-lg font-bold">لا يوجد طلب جديد</h1>
        <p className="mt-2 text-xs text-mute">هذه الشاشة تُفتح عند وصول طلبية جديدة عبر نظام التوزيع.</p>
        <button className="btn-primary mt-5 w-full" onClick={() => navigate('/home', { replace: true })}>العودة للرئيسية</button>
      </div>
    )
  }

  const rows = [
    { icon: Store, label: 'المحل / المطعم', value: order.shopName },
    { icon: MapPin, label: 'منطقة الاستلام', value: order.pickupArea },
    { icon: MapPin, label: 'منطقة التوصيل', value: order.dropArea },
    { icon: Banknote, label: 'مبلغ الطلبية للمحل', value: money(order.itemPrice) },
    { icon: Banknote, label: 'أجرة التوصيل لك', value: money(order.deliveryFee) },
    { icon: StickyNote, label: 'الملاحظات', value: order.note || '—' },
  ]

  return (
    <div className="app-shell !bg-gradient-to-b from-[#986f00] to-[#6b4d00] text-white">
      <div className="flex flex-col items-center px-6 pt-10 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-gold-dark">
          <Truck className="h-7 w-7" strokeWidth={1.8} />
        </span>
        <h1 className="mt-4 text-xl font-bold">🚚 طلبية جديدة من زاجل!</h1>
        <p className="mt-1 text-[11px] text-white/70">المهلة المتبقية للقبول</p>
        <p className={`mt-2 text-5xl font-bold tabular-nums tracking-wider ${urgency}`} dir="ltr">{mm}:{ss}</p>
      </div>

      <div className="mx-5 mt-6 h-32 overflow-hidden rounded-2xl border border-white/20"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,.12) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.12) 1px, transparent 1px)',
          backgroundSize: '26px 26px',
        }}
      >
        <div className="flex h-full items-center justify-center gap-3 text-[11px] font-semibold text-white/60">
          <MapPin className="h-4 w-4" /> الخريطة تُعرض بعد ربط مزود الخرائط
        </div>
      </div>

      <div className="mx-5 mt-4 flex-1 divide-y divide-white/10 rounded-2xl border border-white/20">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center gap-3 px-4 py-3">
            <r.icon className="h-4 w-4 shrink-0 text-white/60" />
            <span className="flex-1 text-xs text-white/70">{r.label}</span>
            <span className="text-xs font-bold">{r.value}</span>
          </div>
        ))}
      </div>

      <div className="flex gap-3 px-5 py-6">
        <button
          className="flex-1 rounded-2xl bg-white py-4 text-sm font-bold text-gold-dark transition-transform active:scale-[0.98]"
          onClick={() => {
            acceptOrder(order.id)
            navigate(`/order?order=${order.id}`, { replace: true })
          }}
        >
          قبول الطلبية ✅
        </button>
        <button className="flex-1 rounded-2xl border border-white/50 py-4 text-sm font-bold text-white transition-transform active:scale-[0.98]" onClick={() => setRejecting(true)}>
          رفض الطلبية ❌
        </button>
      </div>

      {rejecting && (
        <Modal title="رفض الطلبية؟" onClose={() => setRejecting(false)}>
          <p className="mt-2 text-xs leading-relaxed text-mute">
            هل تريد رفض هذا الطلب؟ سيتم إرساله لكابتن آخر، ويُسجل الرفض في ملفك.
          </p>
          <div className="mt-5 flex gap-2">
            <button className="btn-primary flex-1" onClick={() => { rejectOrder(order.id); navigate('/home', { replace: true }) }}>تأكيد الرفض</button>
            <button className="btn-secondary flex-1" onClick={() => setRejecting(false)}>إلغاء</button>
          </div>
        </Modal>
      )}
    </div>
  )
}
