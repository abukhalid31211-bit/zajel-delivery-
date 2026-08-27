import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Header from '../components/Header'
import Stars from '../components/Stars'
import { useToast } from '../components/Modal'
import { useStore } from '../lib/StoreContext'

export default function RateCaptain() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const id = params.get('id')
  const { orders, rateOrder } = useStore()
  const { toast, node } = useToast()
  const order = orders.find((o) => o.id === id) ?? null

  const [stars, setStars] = useState(0)
  const [prepared, setPrepared] = useState<string | null>(null)
  const [comment, setComment] = useState('')

  if (!order || !order.captain) {
    return (
      <div className="app-shell">
        <Header title="تقييم الكابتن" to="/orders" />
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-8 text-center">
          <p className="text-sm font-extrabold">لا يوجد كابتن لتقييمه في هذا الطلب</p>
          <button className="btn-primary" onClick={() => navigate('/orders')}>سجل الطلبات</button>
        </div>
      </div>
    )
  }

  const submit = () => {
    if (stars === 0) {
      toast('يرجى اختيار تقييم ⭐', 'error')
      return
    }
    const res = rateOrder(order.id, stars, prepared ?? '—', comment)
    if (!res.ok) {
      toast(res.error ?? 'تعذر إرسال التقييم', 'error')
      return
    }
    toast('شكراً لتقييمك! ⭐')
    setTimeout(() => navigate(`/order-details?id=${order.id}`), 1200)
  }

  return (
    <div className="app-shell">
      <Header title="تقييم كابتن زاجل" to="/orders" subtitle={`كيف كانت تجربتك مع الكابتن ${order.captain.name} في الطلب ${order.id}؟`} />

      <div className="animate-fade-up flex-1 space-y-5 px-5 py-6">
        <div className="card p-5 text-center">
          <p className="mb-3 text-xs font-extrabold">تقييمك العام للكابتن {order.captain.name}</p>
          <Stars value={stars} onChange={setStars} />
          <p className="mt-2 text-[10px] text-faint">
            {stars === 0 ? 'اضغط على النجوم للتقييم' : stars >= 4 ? 'تجربة ممتازة! 🌟' : stars >= 2 ? 'شكراً لملاحظاتك' : 'نعتذر عن التجربة'}
          </p>
        </div>

        <div className="card p-5">
          <p className="mb-3 text-xs font-extrabold">هل كانت الطلبية جاهزة فور وصول الكابتن؟</p>
          <div className="flex gap-2">
            {['نعم ✅', 'تأخرت قليلاً ⏳', 'لا ❌'].map((o) => (
              <button
                key={o}
                onClick={() => setPrepared(o)}
                className={`flex-1 rounded-xl border px-2 py-2.5 text-[11px] font-bold transition-colors ${
                  prepared === o ? 'border-gold bg-gold-soft text-gold-deep' : 'border-line bg-white text-mute'
                }`}
              >
                {o}
              </button>
            ))}
          </div>
        </div>

        <textarea
          className="field min-h-24 resize-none"
          placeholder="تعليق (اختياري)..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
        <p className="text-center text-[10px] text-faint">لا يمكن تقييم نفس الطلب مرتين — يُحفظ التقييم في ملف الكابتن.</p>
      </div>

      <div className="space-y-2.5 border-t border-line bg-white px-5 py-4">
        <button className="btn-primary w-full" onClick={submit}>
          إرسال التقييم
        </button>
        <button className="w-full text-center text-xs font-bold text-mute" onClick={() => navigate(`/order-details?id=${order.id}`)}>
          تخطي
        </button>
      </div>

      {node}
    </div>
  )
}
