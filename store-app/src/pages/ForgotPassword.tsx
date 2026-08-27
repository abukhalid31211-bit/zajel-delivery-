import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle2, Eye, EyeOff, Loader2 } from 'lucide-react'
import { useStore } from '../lib/StoreContext'
import { isValidIraqiPhone, strengthOf } from '../lib/data'
import OTPInput from '../components/OTPInput'
import Countdown from '../components/Countdown'
import Header from '../components/Header'

const RESEND_SECONDS = 60
const MAX_ATTEMPTS = 5

export default function ForgotPassword() {
  const navigate = useNavigate()
  const { profile, updateProfile } = useStore()
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1)
  const [phone, setPhone] = useState('')
  const [attempts, setAttempts] = useState(0)
  const [shake, setShake] = useState(false)
  const [resendKey, setResendKey] = useState(0)
  const [resendable, setResendable] = useState(false)
  const [pass, setPass] = useState('')
  const [confirm, setConfirm] = useState('')
  const [show, setShow] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  /* رمز التحقق يُولَّد من النظام عند الإرسال — مع الـ Back-end يأتي عبر SMS */
  const [sentCode, setSentCode] = useState('')

  const sendCode = () => {
    if (!phone.trim()) return setError('رقم الهاتف مطلوب')
    if (!isValidIraqiPhone(phone)) return setError('رقم هاتف صحيح مطلوب')
    if (profile && profile.phone.replace(/\s/g, '') !== phone.replace(/\s/g, '')) {
      return setError('لا يوجد حساب مرتبط بهذا الرقم.')
    }
    setError('')
    setLoading(true)
    setTimeout(() => {
      setSentCode(String(Math.floor(1000 + Math.random() * 9000)))
      setAttempts(0)
      setResendable(false)
      setResendKey((k) => k + 1)
      setLoading(false)
      setStep(2)
    }, 800)
  }

  const checkCode = (value: string) => {
    if (value === sentCode) {
      setStep(3)
    } else {
      setShake(true)
      setAttempts((a) => a + 1)
      setTimeout(() => setShake(false), 500)
      if (attempts + 1 >= MAX_ATTEMPTS) {
        setError('تم تجاوز عدد المحاولات. أعد إرسال الرمز.')
        setResendable(true)
      } else {
        setError(`الرمز غير صحيح. حاول مرة أخرى. (المحاولة ${attempts + 1} من ${MAX_ATTEMPTS})`)
      }
    }
  }

  const change = () => {
    if (pass.length < 6) return setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل')
    if (pass !== confirm) return setError('كلمة المرور غير متطابقة')
    setError('')
    setLoading(true)
    setTimeout(() => {
      updateProfile({ password: pass })
      setLoading(false)
      setStep(4)
    }, 800)
  }

  const strength = strengthOf(pass)

  return (
    <div className="app-shell">
      <Header title="استعادة كلمة المرور" to="/login" />

      <div className="animate-fade-up flex-1 px-6 py-8" key={step}>
        {step === 1 && (
          <div className="space-y-4">
            <p className="text-xs leading-relaxed text-mute">أدخل رقم هاتفك المسجل وسنرسل لك رمز التحقق.</p>
            <div className="flex" dir="ltr">
              <span className="flex items-center rounded-l-2xl border border-r-0 border-line bg-gold-faint px-3 text-sm font-bold text-gold-deep">+964</span>
              <input className="field rounded-l-none" placeholder="7XX XXX XXXX" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            {error && <p className="text-[11px] font-bold text-danger">⚠ {error}</p>}
            <button className="btn-primary w-full" onClick={sendCode} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> جاري الإرسال...
                </>
              ) : (
                'إرسال رمز التحقق'
              )}
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5 text-center">
            <h2 className="text-lg font-extrabold">أدخل رمز التحقق</h2>
            <p className="text-xs text-mute">
              تم إرسال رمز مكون من 4 أرقام إلى الرقم <b dir="ltr">+964 {phone}</b>
            </p>
            <OTPInput length={4} shake={shake} onComplete={checkCode} key={`otp-${resendKey}`} />
            {error && <p className="text-[11px] font-bold text-danger">⚠ {error}</p>}
            {!resendable ? (
              <p className="text-[11px] text-faint">
                إعادة إرسال الرمز بعد <Countdown key={resendKey} seconds={RESEND_SECONDS} onDone={() => setResendable(true)} />
              </p>
            ) : (
              <button className="text-xs font-extrabold text-gold-strong underline-offset-4 hover:underline" onClick={sendCode}>
                إعادة إرسال الرمز
              </button>
            )}
            <button onClick={() => setStep(1)} className="block w-full text-xs font-bold text-mute underline-offset-4 hover:underline">
              تغيير رقم الهاتف
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-lg font-extrabold">كلمة المرور الجديدة</h2>
            <div>
              <label className="mb-1.5 block text-xs font-bold">كلمة المرور الجديدة</label>
              <div className="relative">
                <input
                  type={show ? 'text' : 'password'}
                  className="field pl-11"
                  value={pass}
                  onChange={(e) => setPass(e.target.value)}
                />
                <button type="button" onClick={() => setShow((v) => !v)} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-faint">
                  {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {strength && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-line">
                    <div
                      className={`h-full transition-all ${strength.label === 'ضعيفة' ? 'bg-danger' : strength.label === 'متوسطة' ? 'bg-gold' : 'bg-success'}`}
                      style={{ width: `${strength.pct}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-mute">{strength.label}</span>
                </div>
              )}
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold">تأكيد كلمة المرور الجديدة</label>
              <input type={show ? 'text' : 'password'} className="field" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
            </div>
            {error && <p className="text-[11px] font-bold text-danger">⚠ {error}</p>}
            <button className="btn-primary w-full" onClick={change} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> جاري الحفظ...
                </>
              ) : (
                'تغيير كلمة المرور'
              )}
            </button>
          </div>
        )}

        {step === 4 && (
          <div className="flex flex-col items-center gap-4 pt-10 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gold text-white">
              <CheckCircle2 className="h-10 w-10" strokeWidth={1.6} />
            </div>
            <h2 className="text-lg font-extrabold">تم تغيير كلمة المرور بنجاح</h2>
            <p className="text-xs text-mute">يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة.</p>
            <button className="btn-primary w-full" onClick={() => navigate('/login')}>
              تسجيل الدخول
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
