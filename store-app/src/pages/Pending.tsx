import { useNavigate } from 'react-router-dom'
import { Hourglass, LogIn } from 'lucide-react'

export default function Pending() {
  const navigate = useNavigate()
  return (
    <div className="app-shell items-center justify-center px-8 text-center">
      <div className="animate-fade-up flex flex-col items-center gap-5">
        <div className="flex h-24 w-24 items-center justify-center rounded-[28px] border border-line bg-white shadow-sm">
          <Hourglass className="h-10 w-10" strokeWidth={1.4} />
        </div>
        <div>
          <h1 className="text-xl font-bold">تم إرسال طلبك بنجاح</h1>
          <p className="mt-2 max-w-72 text-[13px] leading-relaxed text-mute">
            محلك قيد المراجعة من قبل إدارة زاجل ديلفري. سيتم إشعارك فور الموافقة وتفعيل الحساب.
          </p>
        </div>
        <span className="badge bg-faint text-white">⏳ بانتظار الموافقة</span>
        <button className="btn-secondary mt-4 w-full" onClick={() => navigate('/login')}>
          <LogIn className="h-4 w-4" /> تسجيل الدخول
        </button>
      </div>
    </div>
  )
}
