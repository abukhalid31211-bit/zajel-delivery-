import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, RotateCcw, Banknote, TriangleAlert } from 'lucide-react'
import { useToast } from '../components/Toast'

/** مسار الإرجاع للمحل واسترداد الكاش */
export default function ReturnOrder() {
  const navigate = useNavigate()
  const { toast, node } = useToast()
  const [returned, setReturned] = useState(false)

  return (
    <div className="app-shell">
      <div className="flex items-center gap-3 border-b border-line bg-white px-4 py-4">
        <button onClick={() => navigate('/home')} className="flex h-9 w-9 items-center justify-center rounded-xl border border-line">
          <ArrowRight className="h-4.5 w-4.5" />
        </button>
        <div>
          <h1 className="text-base font-bold">إرجاع الطلبية للمحل 🔄</h1>
          <p className="text-[10px] text-mute">الطلب #— بحالة: مرتجع</p>
        </div>
      </div>

      <div className="animate-fade-up flex-1 space-y-4 px-5 py-6">
        <div className="card p-5 text-center">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-page">
            <RotateCcw className="h-7 w-7" strokeWidth={1.5} />
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
          <span className="flex items-center gap-2 text-xs font-bold">
            <Banknote className="h-4 w-4" /> المبلغ الواجب استرداده
          </span>
          <span className="text-sm font-bold">— د.ع</span>
        </div>

        {returned && (
          <div className="animate-fade-up space-y-3">
            <button
              className="btn-primary w-full"
              onClick={() => {
                toast('تم تحديث كشف حسابك — حالة الطلب: تم الاسترداد ✅')
                setTimeout(() => navigate('/home'), 1400)
              }}
            >
              ✅ نعم، استلمت المبلغ واسترددت الكاش
            </button>
            <button
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-black bg-white py-3.5 text-xs font-bold"
              onClick={() => {
                toast('أُرسل تنبيه عاجل لغرفة عمليات الإدارة للتدخل 🚨')
                setTimeout(() => navigate('/home'), 1600)
              }}
            >
              <TriangleAlert className="h-4 w-4" /> ❌ لا، لم أستلم / المحل يرفض الاسترجاع
            </button>
            <p className="text-center text-[10px] leading-relaxed text-faint">
              في حال رفض المحل، يبقى الطلب بحالة "بانتظار الاسترداد ⏳" وتتدخل الإدارة فوراً.
            </p>
          </div>
        )}
      </div>

      {!returned && (
        <div className="border-t border-line bg-white px-5 py-4">
          <button className="btn-primary w-full" onClick={() => setReturned(true)}>
            📍 أعدت الطلبية للمحل
          </button>
        </div>
      )}

      {node}
    </div>
  )
}
