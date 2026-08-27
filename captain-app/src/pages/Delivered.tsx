import { useNavigate } from 'react-router-dom'
import { CheckCircle2 } from 'lucide-react'

export default function Delivered() {
  const navigate = useNavigate()
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
            ['رقم الطلب', '#—'],
            ['المبلغ المستلم من الزبون', '— د.ع'],
            ['أجرتك (صافي الربح)', '— د.ع'],
            ['مدة التوصيل الكلية', '— دقيقة'],
          ].map(([k, v]) => (
            <div key={k} className="flex items-center justify-between px-4 py-3">
              <span className="text-xs text-mute">{k}</span>
              <span className="text-xs font-bold">{v}</span>
            </div>
          ))}
        </div>

        <div className="w-full space-y-3">
          <button className="btn-primary w-full" onClick={() => navigate('/rate-store')}>
            ⭐ تقييم المحل (اختياري)
          </button>
          <button className="btn-secondary w-full" onClick={() => navigate('/home')}>
            العودة للرئيسية
          </button>
        </div>
      </div>
    </div>
  )
}
