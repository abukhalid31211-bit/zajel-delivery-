import { useNavigate } from 'react-router-dom'
import { Ban, XCircle, RefreshCcw, Wrench, Phone, ClipboardList, LogOut } from 'lucide-react'
import { useStore } from '../lib/StoreContext'

/** محل موقوف — مشاهدة فقط */
export function Suspended() {
  const navigate = useNavigate()
  const { profile, logout } = useStore()
  return (
    <div className="app-shell items-center justify-center px-8 text-center">
      <div className="animate-fade-up flex flex-col items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gold">
          <svg viewBox="0 0 64 64" width="30" height="30">
            <path d="M14 20h30l-22 20h24v4H14l22-20H14z" fill="#fff" />
            <circle cx="50" cy="16" r="4" fill="#fff" />
          </svg>
        </div>
        <span className="flex h-20 w-20 items-center justify-center rounded-3xl border-2 border-dashed border-gold">
          <Ban className="h-9 w-9 text-gold" strokeWidth={1.5} />
        </span>
        <h1 className="text-xl font-extrabold">محلك موقوف حالياً 🚫</h1>
        <p className="max-w-72 text-[13px] leading-relaxed text-mute">
          تم إيقاف حساب محلك من قبل الإدارة. لا يمكنك إنشاء طلبات جديدة حتى يتم إعادة التفعيل.
        </p>
        {profile?.rejectionReason && (
          <div className="w-full rounded-2xl border border-line bg-white p-4 text-right">
            <p className="text-[11px] font-extrabold">سبب الإيقاف:</p>
            <p className="mt-1 text-[11px] leading-relaxed text-mute">{profile.rejectionReason}</p>
          </div>
        )}
        <a href="tel:07888216090" className="btn-primary w-full">
          <Phone className="h-4 w-4" /> 📞 تواصل مع الإدارة
        </a>
        <button className="btn-secondary w-full" onClick={() => navigate('/orders')}>
          <ClipboardList className="h-4 w-4" /> 📋 عرض سجل الطلبات (مشاهدة فقط)
        </button>
        <button
          className="flex items-center gap-1.5 text-xs font-bold text-mute underline-offset-4 hover:underline"
          onClick={() => {
            logout()
            navigate('/login')
          }}
        >
          <LogOut className="h-3.5 w-3.5" /> تسجيل الخروج
        </button>
      </div>
    </div>
  )
}

/** رفض طلب التسجيل */
export function Rejected() {
  const navigate = useNavigate()
  const { profile } = useStore()
  return (
    <div className="app-shell items-center justify-center px-8 text-center">
      <div className="animate-fade-up flex flex-col items-center gap-4">
        <XCircle className="h-20 w-20 text-gold" strokeWidth={1} />
        <h1 className="text-xl font-extrabold">تم رفض طلب التسجيل</h1>
        {profile?.rejectionReason && (
          <div className="w-full rounded-2xl border border-line bg-white p-4 text-right">
            <p className="text-[11px] font-extrabold">سبب الرفض:</p>
            <p className="mt-1 text-[11px] leading-relaxed text-mute">{profile.rejectionReason}</p>
          </div>
        )}
        <p className="max-w-72 text-[11px] leading-relaxed text-faint">
          يمكنك تعديل البيانات وإعادة التقديم — البيانات السابقة معبأة تلقائياً، والطلب الجديد منفصل تماماً عن الطلب المرفوض.
        </p>
        <button className="btn-primary w-full" onClick={() => navigate('/register')}>
          تقديم طلب جديد
        </button>
        <a href="tel:07888216090" className="btn-secondary w-full">
          <Phone className="h-4 w-4" /> تواصل مع الدعم
        </a>
      </div>
    </div>
  )
}

/** تحديث إجباري */
export function UpdateRequired() {
  return (
    <div className="app-shell items-center justify-center px-8 text-center">
      <div className="animate-fade-up flex flex-col items-center gap-4">
        <span className="flex h-20 w-20 items-center justify-center rounded-3xl border border-gold/40 bg-white">
          <RefreshCcw className="h-9 w-9 text-gold" strokeWidth={1.5} />
        </span>
        <h1 className="text-xl font-extrabold">تحديث مطلوب 🔄</h1>
        <p className="max-w-72 text-[13px] leading-relaxed text-mute">
          إصدار تطبيقك الحالي قديم ولا يدعم الاستمرار. يرجى التحديث للمتابعة.
        </p>
        <p className="text-[11px] text-faint" dir="ltr">
          الإصدار المطلوب: — · إصدارك الحالي: 1.0.0
        </p>
        <button className="btn-primary w-full">تحديث الآن</button>
      </div>
    </div>
  )
}

/** وضع الصيانة */
export function Maintenance() {
  return (
    <div className="app-shell items-center justify-center px-8 text-center">
      <div className="animate-fade-up flex flex-col items-center gap-4">
        <span className="flex h-20 w-20 items-center justify-center rounded-3xl border border-gold/40 bg-white">
          <Wrench className="h-9 w-9 text-gold" strokeWidth={1.5} />
        </span>
        <h1 className="text-xl font-extrabold">النظام في وضع الصيانة 🔧</h1>
        <p className="max-w-72 text-[13px] leading-relaxed text-mute">
          نعتذر عن الإزعاج. النظام في وضع صيانة مؤقت ولا يمكن إنشاء طلبات جديدة. سنعود قريباً.
        </p>
        <a href="tel:07888216090" className="btn-secondary w-full">
          <Phone className="h-4 w-4" /> تواصل مع الدعم
        </a>
      </div>
    </div>
  )
}
