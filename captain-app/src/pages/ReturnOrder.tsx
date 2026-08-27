import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowRight, RotateCcw, Banknote, TriangleAlert } from 'lucide-react'
import { useToast } from '../components/Toast'
import { useCaptain } from '../state'

export default function ReturnOrder() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const { getOrder, arriveReturn, confirmRefund, money } = useCaptain()
  const { toast, node } = useToast()
  const orderId = params.get('order') || ''
  const order = getOrder(orderId)
  const [returned, setReturned] = useState(order?.stage === 'awaitRefund' || order?.stage === 'refunded')
  const [submitted, setSubmitted] = useState(false)

  if (!order) {
    return (
      <div className="app-shell items-center justify-center px-8 text-center">
        <h1 className="text-lg font-bold">الطلب غير موجود</h1>
        <button className="btn-primary mt-5 w-full" onClick={() => navigate('/home')}>العودة للرئيسية</button>
      </div>
    )
  }

  const submitRefund = (received: boolean) => {
    if (submitted) return
    setSubmitted(true)
    confirmRefund(order.id, received)
    setTimeout(() => navigate('/home'), received ? 1200 : 1500)
  }

  return (
    <div className="app-shell">
      <div className="flex items-center gap-3 border-b border-line bg-white px-4 py-4">
        <button onClick={() => navigate('/home')} className="flex h-9 w-9 items-center justify-center rounded-xl border border-line">
          <ArrowRight className="h-4.5 w-4.5" />
        </button>
        <div>
          <h1 className="text-base font-bold">إرجاع الطلبية للمحل 🔄</h1>
          <p className="text-[10px] text-mute">{order.title} — بحالة: {order.stage === 'returned' ? 'مرتجع' : order.stage === 'awaitRefund' ? 'بانتظار الاسترداد' : 'تم الاسترداد'}</p>
        </div>
      </div>

      <div className="animate-fade-up flex-1 space-y-4 px-5 py-6">
        <div className="card p-5 text-center">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-gold-light">
            <RotateCcw className="h-7 w-7 text-gold-dark" strokeWidth={1.5} />
          </span>
          {!returned ? (
            <>
              <p className="mt-4 text-sm font-bold">توجه للمحل وأعد الطلبية</p>
              <p className="mx-auto mt-1.5 max-w-64 text-[11px] leading-relaxed text-mute">
                تم إشعار المحل والإدارة بتعذر التسليم. أعد الأغراض بحالتها السليمة لصاحب المحل.
              </p>
            </>
          ) : (
            <>
              <p className="mt-4 text-sm font-bold">هل استلمت المبلغ كاملاً من صاحب المحل؟</p>
              <p className="mx-auto mt-1.5 max-w-64 text-[11px] leading-relaxed text-mute">
                يلتزم المحل بإعادة المبلغ النقدي (الكاش) كاملاً لك فور استلام البضاعة المرتجعة.
              </p>
            </>
          )}
        </div>

        <div className="card flex items-center justify-between p-4">
          <span className="flex items-center gap-2 text-xs font-bold"><Banknote className="h-4 w-4" /> المبلغ الواجب استرداده</span>
          <span className="text-sm font-bold text-gold-dark">{money(order.itemPrice)}</span>
        </div>

        {order.problem && (
          <div className="rounded-2xl border border-dashed border-gold bg-white p-4 text-[11px] font-medium leading-relaxed text-mute">
            سبب المشكلة: <b className="text-gold-dark">{order.problem}</b>
          </div>
        )}

        {returned && (
          <div className="animate-fade-up space-y-3">
            <button className="btn-primary w-full" disabled={submitted} onClick={() => submitRefund(true)}>
              ✅ نعم، استلمت المبلغ واسترددت الكاش
            </button>
            <button className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-gold bg-white py-3.5 text-xs font-bold" disabled={submitted} onClick={() => submitRefund(false)}>
              <TriangleAlert className="h-4 w-4" /> ❌ لا، لم أستلم / المحل يرفض الاسترجاع
            </button>
            <p className="text-center text-[10px] leading-relaxed text-faint">في حال رفض المحل، يبقى الطلب بحالة "بانتظار الاسترداد ⏳" وتتدخل الإدارة فوراً.</p>
          </div>
        )}
      </div>

      {!returned && (
        <div className="border-t border-line bg-white px-5 py-4">
          <button className="btn-primary w-full" onClick={() => { arriveReturn(order.id); setReturned(true); toast('تم إشعار المحل باستلامك الطلبية 🔄') }}>📍 أعدت الطلبية للمحل</button>
        </div>
      )}

      {node}
    </div>
  )
}
