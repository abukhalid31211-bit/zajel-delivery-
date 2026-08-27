import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Hourglass, LogIn, PartyPopper } from 'lucide-react'
import { useStore } from '../lib/StoreContext'

/** شاشة انتظار الموافقة — تتفاعل مع حالة طلب التسجيل لحظياً */
export default function Pending() {
  const navigate = useNavigate()
  const { profile } = useStore()
  const [seconds, setSeconds] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setSeconds((s) => s + 1), 1000)
    return () => clearInterval(t)
  }, [])

  const approved = profile?.status === 'approved'

  return (
    <div className="app-shell items-center justify-center px-8 text-center">
      <div className="animate-fade-up flex flex-col items-center gap-5">
        {approved ? (
          <div className="flex h-24 w-24 items-center justify-center rounded-[28px] bg-gold text-white shadow-lg shadow-gold/30">
            <PartyPopper className="h-10 w-10" strokeWidth={1.4} />
          </div>
        ) : (
          <div className="animate-pulse-gold flex h-24 w-24 items-center justify-center rounded-[28px] border border-gold/40 bg-white shadow-sm">
            <Hourglass className="h-10 w-10 text-gold" strokeWidth={1.4} />
          </div>
        )}

        {approved ? (
          <>
            <h1 className="text-xl font-extrabold">تمت الموافقة على محلك 🎉</h1>
            <p className="max-w-72 text-[13px] leading-relaxed text-mute">
              تم قبول طلب تسجيل محلك من قبل إدارة زاجل ديلفري. يمكنك الآن البدء بإنشاء الطلبات وطلب الكباتن.
            </p>
            <span className="badge bg-gold text-white">🟢 الحساب مفعّل</span>
            <button className="btn-primary mt-3 w-full" onClick={() => navigate('/login')}>
              <LogIn className="h-4 w-4" /> تسجيل الدخول والبدء
            </button>
          </>
        ) : (
          <>
            <h1 className="text-xl font-extrabold">محلك قيد المراجعة</h1>
            <p className="max-w-72 text-[13px] leading-relaxed text-mute">
              تم إرسال طلب تسجيل محلك بنجاح وهو قيد المراجعة من قبل إدارة زاجل ديلفري. سيتم إشعارك فور الموافقة وتفعيل الحساب.
            </p>
            <div className="w-full rounded-2xl border border-line bg-white p-4">
              <p className="text-[11px] font-bold text-mute">مدة الانتظار حتى الآن</p>
              <p className="mt-1 text-2xl font-extrabold text-gold-strong" dir="ltr">
                {Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, '0')}
              </p>
            </div>
            <span className="badge bg-gold-soft text-gold-deep">⏳ بانتظار الموافقة</span>
            <button className="btn-secondary mt-2 w-full" onClick={() => navigate('/login')}>
              <LogIn className="h-4 w-4" /> تسجيل الدخول
            </button>
            <p className="text-[10px] leading-relaxed text-faint">
              هذه الشاشة تتحدث تلقائياً فور صدور قرار الإدارة — سترى شاشة النجاح هنا مباشرة.
            </p>
          </>
        )}
      </div>
    </div>
  )
}
