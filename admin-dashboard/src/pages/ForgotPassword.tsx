import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Loader2, CheckCircle2, Eye, EyeOff } from 'lucide-react'
import Logo from '../components/Logo'
import { isIraqMobile, passwordStrength } from '../lib/validate'
import { logSecurity } from '../lib/store'

export default function ForgotPassword() {
  const navigate = useNavigate()
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1)
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [otp, setOtp] = useState(['', '', '', ''])
  const [pass, setPass] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [shake, setShake] = useState(false)
  const [otpTries, setOtpTries] = useState(0)
  const [sec, setSec] = useState(120)
  const [show1, setShow1] = useState(false)
  const [show2, setShow2] = useState(false)

  const strength = passwordStrength(pass)

  useEffect(() => {
    if (step !== 2 || sec <= 0) return
    const t = window.setInterval(() => setSec((s) => s - 1), 1000)
    return () => window.clearInterval(t)
  }, [step, sec])

  const sendCode = (e: React.FormEvent) => {
    e.preventDefault()
    if (!phone.trim()) return setError('رقم الهاتف مطلوب')
    if (!isIraqMobile(phone)) return setError('رقم الهاتف غير صالح')
    setError('')
    setLoading(true)
    window.setTimeout(() => {
      setLoading(false)
      setStep(2)
      setSec(120)
      setOtp(['', '', '', ''])
      setOtpTries(0)
    }, 800)
  }

  const setDigit = (i: number, v: string) => {
    if (!/^\d?$/.test(v)) return
    const next = [...otp]
    next[i] = v
    setOtp(next)
    if (v && i < 3) document.getElementById(`otp-${i + 1}`)?.focus()
    if (next.every((d) => d !== '')) verify(next.join(''))
  }

  const verify = (code: string) => {
    if (otpTries >= 5) {
      setError('تم تجاوز عدد المحاولات. أعد إرسال الرمز.')
      return
    }
    // بدون باك-إند: أي رمز من 4 أرقام يُقبل. الرمز 0000 يُرفض لتفعيل تدفق الخطأ.
    if (code === '0000') {
      setShake(true)
      window.setTimeout(() => setShake(false), 450)
      const tries = otpTries + 1
      setOtpTries(tries)
      setOtp(['', '', '', ''])
      document.getElementById('otp-0')?.focus()
      if (tries >= 5) setError('تم تجاوز عدد المحاولات. أعد إرسال الرمز.')
      else setError('الرمز غير صحيح. حاول مرة أخرى.')
      return
    }
    setError('')
    setStep(3)
  }

  const changePass = (e: React.FormEvent) => {
    e.preventDefault()
    if (pass.length < 6) return setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل')
    if (pass !== confirm) return setError('كلمة المرور غير متطابقة')
    setError('')
    setLoading(true)
    window.setTimeout(() => {
      setLoading(false)
      setStep(4)
      logSecurity({ type: 'تغيير كلمة مرور', user: phone, result: 'نجاح', details: 'استعادة كلمة المرور' })
    }, 800)
  }

  const mm = String(Math.floor(sec / 60)).padStart(2, '0')
  const ss = String(sec % 60).padStart(2, '0')

  return (
    <div className="flex min-h-screen items-center justify-center bg-page p-4">
      <div className="w-full max-w-md">
        <div className="mb-6 flex justify-center">
          <Logo size={44} />
        </div>
        <div className="card p-6 sm:p-8">
          {step !== 4 && (
            <Link to="/login" className="mb-4 inline-flex items-center gap-1 text-xs font-medium text-mute hover:text-black">
              <ArrowRight className="h-3.5 w-3.5" /> رجوع لتسجيل الدخول
            </Link>
          )}

          {step === 1 && (
            <form onSubmit={sendCode} className="space-y-4">
              <h1 className="text-lg font-bold">استعادة كلمة المرور</h1>
              <p className="text-xs leading-relaxed text-mute">أدخل رقم هاتفك المسجل وسنرسل لك رمز التحقق.</p>
              <div className="flex" dir="ltr">
                <span className="flex items-center rounded-l-xl border border-r-0 border-line bg-page px-3 text-sm font-semibold text-mute">+964</span>
                <input className="field rounded-l-none" placeholder="7XX XXX XXXX" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              {error && <p className="text-[11px] font-medium">⚠ {error}</p>}
              <button className="btn-primary w-full py-3" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> جاري الإرسال...
                  </>
                ) : (
                  'إرسال رمز التحقق'
                )}
              </button>
            </form>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h1 className="text-lg font-bold">أدخل رمز التحقق</h1>
              <p className="text-xs leading-relaxed text-mute">تم إرسال رمز مكون من 4 أرقام إلى الرقم +964 {phone}</p>
              <div className={`flex justify-center gap-3 ${shake ? 'animate-shake' : ''}`} dir="ltr">
                {otp.map((d, i) => (
                  <input
                    key={i}
                    id={`otp-${i}`}
                    className="field h-14 w-14 text-center text-xl font-bold"
                    maxLength={1}
                    inputMode="numeric"
                    value={d}
                    onChange={(e) => setDigit(i, e.target.value)}
                    disabled={otpTries >= 5}
                  />
                ))}
              </div>
              {error && <p className="text-center text-[11px] font-medium">⚠ {error}</p>}
              <p className="text-center text-[11px] text-faint">
                {sec > 0 ? `إعادة إرسال الرمز بعد ${mm}:${ss}` : ''}
              </p>
              <button
                type="button"
                disabled={sec > 0 && otpTries < 5}
                onClick={() => {
                  setSec(120)
                  setOtpTries(0)
                  setError('')
                  setOtp(['', '', '', ''])
                }}
                className="block w-full text-center text-xs font-medium text-mute hover:text-black disabled:opacity-40"
              >
                إعادة إرسال الرمز
              </button>
              <button onClick={() => { setStep(1); setError('') }} className="block w-full text-center text-xs font-medium text-mute hover:text-black">
                تغيير رقم الهاتف
              </button>
            </div>
          )}

          {step === 3 && (
            <form onSubmit={changePass} className="space-y-4">
              <h1 className="text-lg font-bold">كلمة المرور الجديدة</h1>
              <div>
                <label className="mb-1.5 block text-xs font-semibold">كلمة المرور الجديدة</label>
                <div className="relative">
                  <input type={show1 ? 'text' : 'password'} className="field pl-10" value={pass} onChange={(e) => setPass(e.target.value)} />
                  <button type="button" className="absolute left-3 top-1/2 -translate-y-1/2 text-faint" onClick={() => setShow1((v) => !v)}>
                    {show1 ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {strength && (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-page">
                      <div
                        className="h-full bg-black transition-all"
                        style={{ width: strength === 'ضعيفة' ? '33%' : strength === 'متوسطة' ? '66%' : '100%' }}
                      />
                    </div>
                    <span className="text-[11px] font-medium text-mute">
                      {strength === 'ضعيفة' ? '🔴 ضعيفة' : strength === 'متوسطة' ? '🟡 متوسطة' : '🟢 قوية'}
                    </span>
                  </div>
                )}
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold">تأكيد كلمة المرور الجديدة</label>
                <div className="relative">
                  <input type={show2 ? 'text' : 'password'} className="field pl-10" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
                  <button type="button" className="absolute left-3 top-1/2 -translate-y-1/2 text-faint" onClick={() => setShow2((v) => !v)}>
                    {show2 ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              {error && <p className="text-[11px] font-medium">⚠ {error}</p>}
              <button className="btn-primary w-full py-3" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> جاري الحفظ...
                  </>
                ) : (
                  'تغيير كلمة المرور'
                )}
              </button>
            </form>
          )}

          {step === 4 && (
            <div className="flex flex-col items-center gap-4 py-6 text-center">
              <CheckCircle2 className="h-16 w-16" strokeWidth={1.2} />
              <h1 className="text-lg font-bold">تم تغيير كلمة المرور بنجاح</h1>
              <p className="text-xs text-mute">يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة.</p>
              <button onClick={() => navigate('/login')} className="btn-primary w-full py-3">
                تسجيل الدخول
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
