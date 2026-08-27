import { useNavigate } from 'react-router-dom'
import { Ban, XCircle, RefreshCcw, Wrench, Phone, ArrowRight } from 'lucide-react'
import { useToast } from '../components/Toast'
import { useCaptain } from '../state'

export function Suspended() {
  const navigate = useNavigate()
  const { state, setStatus, logout } = useCaptain()
  const { toast, node } = useToast()
  const captain = state.captain

  return (
    <div className="app-shell items-center justify-center px-8 text-center">
      <div className="animate-fade-up flex w-full flex-col items-center gap-4">
        <span className="flex h-20 w-20 items-center justify-center rounded-3xl border-2 border-dashed border-gold">
          <Ban className="h-9 w-9 text-gold-dark" strokeWidth={1.5} />
        </span>
        <h1 className="text-xl font-bold">حسابك موقوف 🚫</h1>
        <p className="max-w-72 text-[13px] leading-relaxed text-mute">تم إيقاف حسابك من قبل إدارة زاجل ديلفري.</p>
        <div className="w-full rounded-2xl border border-line bg-white p-4 text-right">
          <p className="text-[11px] font-bold">سبب الإيقاف:</p>
          <p className="mt-1 text-[11px] leading-relaxed text-mute">{captain?.statusReason || '— لم يُحدد سبب بعد'}</p>
        </div>
        <p className="text-[11px] text-faint">إذا كنت تعتقد أن هذا خطأ، تواصل مع الإدارة.</p>
        <a href="tel:+964" className="btn-primary w-full"><Phone className="h-4 w-4" /> 📞 تواصل مع الإدارة</a>
        <button className="text-xs font-bold text-mute underline-offset-4 hover:underline" onClick={() => { logout(); navigate('/login') }}>تسجيل الخروج</button>
        <button className="btn-secondary w-full" onClick={() => { setStatus('active'); toast('تمت إعادة تفعيل حسابك. مرحباً بعودتك! ✅'); navigate('/home', { replace: true }) }}>
          🟢 محاكاة إعادة التفعيل (وضع العرض)
        </button>
      </div>
      {node}
    </div>
  )
}

export function Rejected() {
  const navigate = useNavigate()
  const { state } = useCaptain()
  const captain = state.captain

  return (
    <div className="app-shell items-center justify-center px-8 text-center">
      <div className="animate-fade-up flex w-full flex-col items-center gap-4">
        <XCircle className="h-20 w-20" strokeWidth={1} />
        <h1 className="text-xl font-bold">تم رفض طلب التسجيل</h1>
        <div className="w-full rounded-2xl border border-line bg-white p-4 text-right">
          <p className="text-[11px] font-bold">سبب الرفض:</p>
          <p className="mt-1 text-[11px] leading-relaxed text-mute">{captain?.statusReason || '— يظهر السبب الذي أدخلته الإدارة هنا.'}</p>
        </div>
        <p className="max-w-72 text-[11px] leading-relaxed text-faint">يمكنك تعديل بياناتك وإعادة التقديم — الطلب الجديد منفصل تماماً عن الطلب المرفوض.</p>
        <button className="btn-primary w-full" onClick={() => navigate('/register')}>تقديم طلب جديد</button>
        <a href="tel:+964" className="btn-secondary w-full"><Phone className="h-4 w-4" /> تواصل مع الدعم</a>
        <button onClick={() => navigate('/')} className="flex items-center gap-1 text-xs font-bold text-mute underline-offset-4 hover:underline"><ArrowRight className="h-3.5 w-3.5" /> العودة</button>
      </div>
    </div>
  )
}

export function UpdateRequired() {
  const navigate = useNavigate()
  return (
    <div className="app-shell items-center justify-center px-8 text-center">
      <div className="animate-fade-up flex w-full flex-col items-center gap-4">
        <span className="flex h-20 w-20 items-center justify-center rounded-3xl border border-gold bg-white">
          <RefreshCcw className="h-9 w-9 text-gold-dark" strokeWidth={1.5} />
        </span>
        <h1 className="text-xl font-bold">تحديث مطلوب 🔄</h1>
        <p className="max-w-72 text-[13px] leading-relaxed text-mute">إصدار تطبيقك الحالي قديم ولا يدعم الاستمرار. يرجى التحديث للمتابعة.</p>
        <p className="text-[11px] text-faint" dir="ltr">الإصدار المطلوب: 1.0.0 · إصدارك الحالي: 1.0.0</p>
        <button className="btn-primary w-full">تحديث الآن</button>
        <p className="text-[10px] text-faint">يفتح متجر Google Play أو App Store حسب جهازك</p>
        <button onClick={() => navigate('/home', { replace: true })} className="text-xs font-bold text-mute underline-offset-4 hover:underline">تجاوز للعرض المحلي</button>
      </div>
    </div>
  )
}

export function Maintenance() {
  const navigate = useNavigate()
  return (
    <div className="app-shell items-center justify-center px-8 text-center">
      <div className="animate-fade-up flex w-full flex-col items-center gap-4">
        <span className="flex h-20 w-20 items-center justify-center rounded-3xl border border-gold bg-white">
          <Wrench className="h-9 w-9 text-gold-dark" strokeWidth={1.5} />
        </span>
        <h1 className="text-xl font-bold">النظام في وضع الصيانة 🔧</h1>
        <p className="max-w-72 text-[13px] leading-relaxed text-mute">نعتذر عن الإزعاج. النظام في وضع صيانة مؤقت. سنعود قريباً.</p>
        <p className="text-[10px] text-faint">رسالة الصيانة تُدار من لوحة الإدارة (CMS)</p>
        <button className="btn-primary w-full" onClick={() => navigate('/home', { replace: true })}>محاولة لاحقاً</button>
      </div>
    </div>
  )
}
