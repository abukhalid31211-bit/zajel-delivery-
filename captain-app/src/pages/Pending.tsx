import { useNavigate } from 'react-router-dom'
import { Hourglass, LogIn } from 'lucide-react'
import { useToast } from '../components/Toast'
import { useCaptain } from '../state'

export default function Pending() {
  const navigate = useNavigate()
  const { setStatus } = useCaptain()
  const { toast, node } = useToast()

  return (
    <div className="app-shell items-center justify-center px-8 text-center">
      <div className="animate-fade-up flex w-full flex-col items-center gap-5">
        <div className="flex h-24 w-24 items-center justify-center rounded-[28px] border border-gold bg-white shadow-sm">
          <Hourglass className="h-10 w-10 text-gold-dark" strokeWidth={1.4} />
        </div>
        <div>
          <h1 className="text-xl font-bold">تم إرسال طلبك بنجاح</h1>
          <p className="mt-2 max-w-72 text-[13px] leading-relaxed text-mute">
            فريق زاجل ديلفري يراجع وثائقك حالياً. سيصلك إشعار فور تفعيل الحساب.
          </p>
        </div>
        <span className="badge bg-gold-light text-gold-dark">⏳ بانتظار الموافقة</span>
        <button className="btn-secondary w-full" onClick={() => navigate('/login')}>
          <LogIn className="h-4 w-4" /> تسجيل الدخول
        </button>

        <div className="card w-full p-4">
          <p className="mb-2 text-[11px] font-bold text-faint">وضع العرض المحلي — محاكاة قرار الإدارة</p>
          <div className="grid grid-cols-3 gap-2">
            <button className="rounded-xl border border-gold bg-white py-2 text-[10px] font-bold text-gold-dark" onClick={() => { setStatus('active'); toast('تمت الموافقة على حسابك ✅'); navigate('/home', { replace: true }) }}>✅ موافقة</button>
            <button className="rounded-xl border border-red-200 bg-white py-2 text-[10px] font-bold text-red-600" onClick={() => { setStatus('suspended'); toast('تم إيقاف الحساب 🚫'); navigate('/suspended', { replace: true }) }}>إيقاف</button>
            <button className="rounded-xl border border-red-200 bg-white py-2 text-[10px] font-bold text-red-600" onClick={() => { setStatus('rejected'); toast('تم رفض الطلب'); navigate('/rejected', { replace: true }) }}>رفض</button>
          </div>
        </div>
      </div>
      {node}
    </div>
  )
}
