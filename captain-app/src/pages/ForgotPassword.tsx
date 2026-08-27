import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, CheckCircle2, Loader2 } from 'lucide-react'

export default function ForgotPassword() {
  const navigate = useNavigate()
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1)
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState(['', '', '', ''])
  const [pass, setPass] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const sendCode = () => {
    if (!phone.trim()) return setError('رقم الهاتف مطلوب')
    setError('')
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setStep(2)
    }, 800)
  }

  const setDigit = (i: number, v: string) => {
    if (!/^\d?$/.test(v)) return
    const next = [...otp]
    next[i] = v
    setOtp(next)
    if (v && i < 3) document.getElementById(`otp-${i + 1}`)?.focus()
    if (next.every((d) => d !== '')) setTimeout(() => setStep(3), 400)
  }

  const change = () => {
    if (pass.length < 6) return setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل')
    if (pass !== confirm) return setError('كلمة المرور غير متطابقة')
    setError('')
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setStep(4)
    }, 800)
  }

  return (
    <div className="app-shell">
      <div className="flex items-center gap-3 border-b border-line bg-white px-4 py-4">
        <Link to="/login" className="flex h-9 w-9 items-center justify-center rounded-xl border border-line">
          <ArrowRight className="h-4.5 w-4.5" />
        </Link>
        <h1 className="text-base font-bold">استعادة كلمة المرور</h1>
      </div>

      <div className="animate-fade-up flex-1 px-6 py-8" key={step}>
        {step === 1 && (
          <div className="space-y-4">
            <p className="text-xs leading-relaxed text-mute">أدخل رقم هاتفك المسجل وسنرسل لك رمز التحقق.</p>
            <div className="flex" dir="ltr">
              <span className="flex items-center rounded-l-2xl border border-r-0 border-line bg-white px-3 text-sm font-semibold text-mute">+964</span>
              <input className="field rounded-l-none" placeholder="7XX XXX XXXX" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            {error && <p className="text-[11px] font-semibold">⚠ {error}</p>}
            <button className="btn-primary w-full" onClick={sendCode} disabled={loading}>
              {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> جاري الإرسال...</> : 'إرسال رمز التحقق'}
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5 text-center">
            <h2 className="text-lg font-bold">أدخل رمز التحقق</h2>
            <p className="text-xs text-mute">تم إرسال رمز مكون من 4 أرقام إلى الرقم +964 {phone}</p>
            <div className="flex justify-center gap-3" dir="ltr">
              {otp.map((d, i) => (
                <input key={i} id={`otp-${i}`} className="field h-14 w-14 text-center text-xl font-bold" maxLength={1} inputMode="numeric" value={d} onChange={(e) => setDigit(i, e.target.value)} />
              ))}
            </div>
            <p className="text-[11px] text-faint">إعادة إرسال الرمز بعد 01:59</p>
            <button onClick={() => setStep(1)} className="text-xs font-semibold text-mute underline-offset-4 hover:underline">تغيير رقم الهاتف</button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold">كلمة المرور الجديدة</h2>
            <div>
              <label className="mb-1.5 block text-xs font-semibold">كلمة المرور الجديدة</label>
              <input type="password" className="field" value={pass} onChange={(e) => setPass(e.target.value)} />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold">تأكيد كلمة المرور الجديدة</label>
              <input type="password" className="field" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
            </div>
            {error && <p className="text-[11px] font-semibold">⚠ {error}</p>}
            <button className="btn-primary w-full" onClick={change} disabled={loading}>
              {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> جاري الحفظ...</> : 'تغيير كلمة المرور'}
            </button>
          </div>
        )}

        {step === 4 && (
          <div className="flex flex-col items-center gap-4 pt-10 text-center">
            <CheckCircle2 className="h-20 w-20" strokeWidth={1} />
            <h2 className="text-lg font-bold">تم تغيير كلمة المرور بنجاح</h2>
            <p className="text-xs text-mute">يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة.</p>
            <button className="btn-primary w-full" onClick={() => navigate('/login')}>تسجيل الدخول</button>
          </div>
        )}
      </div>
    </div>
  )
}
