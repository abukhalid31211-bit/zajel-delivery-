import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Loader2, Phone } from 'lucide-react'
import { useStore } from '../lib/StoreContext'
import { isValidIraqiPhone } from '../lib/data'

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useStore()
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<{ phone?: string; password?: string; form?: string }>({})

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const errs: typeof errors = {}
    if (!phone.trim()) errs.phone = 'رقم الهاتف مطلوب'
    else if (!isValidIraqiPhone(phone)) errs.phone = 'رقم هاتف صحيح مطلوب'
    if (!password.trim()) errs.password = 'كلمة المرور مطلوبة'
    setErrors(errs)
    if (Object.keys(errs).length) return

    setLoading(true)
    setTimeout(() => {
      const res = login(phone, password)
      setLoading(false)
      if (!res.ok) {
        setErrors({ form: res.error })
        return
      }
      const from = (location.state as { from?: string } | null)?.from
      navigate(from && from.startsWith('/') && from !== '/login' ? from : '/home', { replace: true })
    }, 800)
  }

  return (
    <div className="app-shell justify-center px-6">
      <div className="animate-fade-up">
        <div className="mb-10 flex flex-col items-center gap-4">
          <div className="animate-logo-pulse flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-gold to-gold-strong shadow-lg shadow-gold/25">
            <svg viewBox="0 0 64 64" width="34" height="34">
              <path d="M14 20h30l-22 20h24v4H14l22-20H14z" fill="#fff" />
              <circle cx="50" cy="16" r="4" fill="#fff" />
            </svg>
          </div>
          <div className="text-center">
            <h1 className="text-xl font-extrabold">تسجيل الدخول لحسابك</h1>
            <p className="mt-1 text-xs text-mute">زاجل محل — اطلب كابتن توصيل بكل سهولة</p>
          </div>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-bold">رقم الهاتف</label>
            <div className="flex" dir="ltr">
              <span className="flex items-center gap-1 rounded-l-2xl border border-r-0 border-line bg-gold-faint px-3 text-sm font-bold text-gold-deep">
                <Phone className="h-3.5 w-3.5" /> +964
              </span>
              <input
                className="field rounded-l-none"
                placeholder="7XX XXX XXXX"
                inputMode="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            {errors.phone && <p className="mt-1 text-[11px] font-bold text-danger">⚠ {errors.phone}</p>}
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold">كلمة المرور</label>
            <div className="relative">
              <input
                type={show ? 'text' : 'password'}
                className="field pl-11"
                placeholder="أدخل كلمة المرور"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShow((v) => !v)}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-faint"
              >
                {show ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
              </button>
            </div>
            {errors.password && <p className="mt-1 text-[11px] font-bold text-danger">⚠ {errors.password}</p>}
          </div>

          {errors.form && (
            <p className="rounded-xl border border-danger/40 bg-danger/5 px-4 py-3 text-xs font-bold text-danger">⚠ {errors.form}</p>
          )}

          <button className="btn-primary w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> جاري التحقق...
              </>
            ) : (
              'تسجيل الدخول'
            )}
          </button>

          <Link to="/forgot-password" className="block text-center text-xs font-bold text-gold-strong underline-offset-4 hover:underline">
            نسيت كلمة المرور؟
          </Link>

          <p className="pt-4 text-center text-xs text-mute">
            ليس لديك حساب؟{' '}
            <Link to="/register" className="font-extrabold text-gold-strong underline-offset-4 hover:underline">
              سجّل محلك الآن
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
