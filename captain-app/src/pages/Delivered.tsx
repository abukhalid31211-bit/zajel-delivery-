import { useNavigate, useSearchParams } from 'react-router-dom'
import { CheckCircle2 } from 'lucide-react'
import { useCaptain } from '../state'

export default function Delivered() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const { getOrder, money, fmtDate } = useCaptain()
  const order = getOrder(params.get('order') || '')

  const duration = (() => {
    if (!order?.acceptedAt || !order.deliveredAt) return '— دقيقة'
    const ms = new Date(order.deliveredAt).getTime() - new Date(order.acceptedAt).getTime()
    const total = Math.max(0, Math.round(ms / 60000))
    return `${total} دقيقة`
  })()

  return (
    <div className="app-shell items-center justify-center px-6 text-center">
      <div className="animate-fade-up flex w-full flex-col items-center gap-5">
        <CheckCircle2 className="h-24 w-24" strokeWidth={0.9} />
        <div>
          <h1 className="text-xl font-bold">تم التسليم بنجاح! 🎉</h1>
          <p className="mt-1 text-xs text-mute">أُضيفت الرحلة إلى كشف حسابك اليومي</p>
        </div>

        <div className="card w-full divide-y divide-line text-right">
          {[
            ['رقم الطلب', order?.title || '#—'],
            ['المحل', order?.shopName || '—'],
            ['المبلغ المستلم من الزبون', money(order ? order.itemPrice + order.deliveryFee : 0)],
            ['أجرتك (صافي الربح)', money(order?.deliveryFee || 0)],
            ['مدة التوصيل الكلية', duration],
            ['التاريخ', order?.deliveredAt ? fmtDate(order.deliveredAt) : '—'],
          ].map(([k, v]) => (
            <div key={k} className="flex items-center justify-between px-4 py-3">
              <span className="text-xs text-mute">{k}</span>
              <span className="text-xs font-bold">{v}</span>
            </div>
          ))}
        </div>

        {order?.adminNote && <span className="badge bg-gold-light text-gold-dark">✓ {order.adminNote}</span>}

        <div className="w-full space-y-3">
          <button className="btn-primary w-full" onClick={() => navigate(`/rate-store?order=${order?.id || ''}`)}>
            ⭐ تقييم المحل (اختياري)
          </button>
          <button className="btn-secondary w-full" onClick={() => navigate('/home')}>العودة للرئيسية</button>
        </div>
      </div>
    </div>
  )
}
