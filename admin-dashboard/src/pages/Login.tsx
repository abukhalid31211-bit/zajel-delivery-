import { useEffect, useState } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { Eye, EyeOff, Lock, Phone, Loader2, WifiOff } from 'lucide-react'
import { digitsOnly, isIraqMobile } from '../lib/validate'
import { getSession, startSession } from '../lib/session'
import { dbGet } from '../lib/db'
import type { AdminUser } from '../lib/types'
import { logSecurity } from '../lib/store'
import { t } from '../lib/i18n'
import { isSuperLogin, isSuperPhone, SUPER_NAME, SUPER_PHONE } from '../lib/auth'

const LOCK_KEY = 'zajel_login_lock'

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<{ phone?: string; password?: string }>({})
  const [banner, setBanner] = useState<{ type: 'err' | 'warn'; text: string } | null>(null)
  const [fails, setFails] = useState(0)

  useEffect(() => {
    if (getSession()) navigate('/', { replace: true })
    const lock = Number(sessionStorage.getItem(LOCK_KEY) || 0)
    if (lock && Date.now() < lock) {
      setBanner({ type: 'err', text: 'تم قفل الحساب مؤقتاً لكثرة المحاولات الخاطئة. حاول بعد 15 دقيقة.' })
    }
  }, [navigate])

  const lockedUntil = Number(sessionStorage.getItem(LOCK_KEY) || 0)
  const locked = lockedUntil && Date.now() < lockedUntil

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!navigator.onLine) {
      setBanner({ type: 'warn', text: 'لا يوجد اتصال بالإنترنت. تحقق من اتصالك' })
      return
    }
    if (locked) {
      setBanner({ type: 'err', text: 'تم قفل الحساب مؤقتاً لكثرة المحاولات الخاطئة. حاول بعد 15 دقيقة.' })
      return
    }
    const errs: typeof errors = {}
    if (!phone.trim()) errs.phone = 'هذا الحقل مطلوب'
    else if (!isIraqMobile(phone)) errs.phone = 'رقم الهاتف غير صالح'
    if (!password.trim()) errs.password = 'هذا الحقل مطلوب'
    setErrors(errs)
    if (Object.keys(errs).length) return

    setLoading(true)
    setBanner(null)
    window.setTimeout(() => {
      const d = digitsOnly(phone)
      const fail = () => {
        const next = fails + 1
        setFails(next)
        setPassword('')
        setLoading(false)
        logSecurity({ type: 'تسجيل دخول فاشل', user: d, result: 'فشل', details: `محاولة ${next}` })
        if (next >= 5) {
          sessionStorage.setItem(LOCK_KEY, String(Date.now() + 15 * 60 * 1000))
          setBanner({ type: 'err', text: 'تم قفل الحساب مؤقتًا بسبب محاولات كثيرة. حاول بعد 15 دقيقة' })
        } else {
          setBanner({ type: 'err', text: t('err_invalid_credentials') })
        }
      }

      if (isSuperLogin(d, password)) {
        startSession(SUPER_PHONE, SUPER_NAME, 'Super Admin', { super: true, perms: {}, govIds: [], districtIds: [] })
        logSecurity({ type: 'تسجيل دخول ناجح', user: SUPER_PHONE, result: 'نجاح', details: 'Super Admin' })
        const from = (location.state as { from?: string } | null)?.from || '/'
        navigate(from, { replace: true })
        return
      }
      if (isSuperPhone(d)) {
        fail()
        return
      }

      const admins = dbGet<AdminUser[]>('admins', [])
      const found = admins.find((a) => a.phone === d)
      if (!found || found.enabled === false) {
        if (found && found.enabled === false) {
          setLoading(false)
          setPassword('')
          setBanner({ type: 'err', text: 'هذا الحساب موقوف. تواصل مع مدير النظام.' })
          return
        }
        fail()
        return
      }
      if (found.password !== password) {
        fail()
        return
      }
      startSession(d, found.name, found.role, {
        super: false,
        perms: found.perms || {},
        govIds: found.govIds || [],
        districtIds: found.districtIds || [],
      })
      logSecurity({ type: 'تسجيل دخول ناجح', user: d, result: 'نجاح', details: found.role })
      const from = (location.state as { from?: string } | null)?.from || '/'
      navigate(from, { replace: true })
    }, 400)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-page p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-black shadow-lg">
            <svg viewBox="0 0 64 64" width="34" height="34">
              <path d="M14 20h30l-22 20h24v4H14l22-20H14z" fill="#fff" />
              <circle cx="50" cy="16" r="4" fill="#fff" />
            </svg>
          </div>
          <div className="text-center">
            <h1 className="text-xl font-bold">{t('admin_login_title')}</h1>
            <p className="mt-1 text-xs text-mute">{t('admin_login_subtitle')}</p>
          </div>
        </div>

        <form onSubmit={submit} className="card space-y-4 p-6 sm:p-8">
          {banner && (
            <div className={`flex items-start gap-2 rounded-xl px-3 py-2.5 text-[11px] font-semibold ${banner.type === 'warn' ? 'border border-dashed border-black bg-page' : 'bg-black text-white'}`}>
              {banner.type === 'warn' && <WifiOff className="mt-0.5 h-3.5 w-3.5 shrink-0" />}
              {banner.text}
            </div>
          )}
          <div>
            <label className="mb-1.5 block text-xs font-semibold">{t('field_phone_label')}</label>
            <div className="relative flex" dir="ltr">
              <span className="flex items-center gap-1 rounded-l-xl border border-r-0 border-line bg-page px-3 text-sm font-semibold text-mute">
                <Phone className="h-3.5 w-3.5" /> +964
              </span>
              <input
                className={`field rounded-l-none ${errors.phone ? 'border-black' : ''}`}
                placeholder="7XX XXX XXXX"
                inputMode="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            {errors.phone && <p className="mt-1 text-[11px] font-medium text-black">⚠ {errors.phone}</p>}
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold">{t('field_password_label')}</label>
            <div className="relative">
              <input
                type={show ? 'text' : 'password'}
                className={`field pl-10 ${errors.password ? 'border-black' : ''}`}
                placeholder="أدخل كلمة المرور"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShow((v) => !v)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-faint hover:text-black"
              >
                {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && <p className="mt-1 text-[11px] font-medium text-black">⚠ {errors.password}</p>}
          </div>

          <button className="btn-primary w-full py-3" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> جاري التحقق...
              </>
            ) : (
              <>
                <Lock className="h-4 w-4" /> {t('btn_admin_login')}
              </>
            )}
          </button>

          <Link to="/forgot-password" className="block text-center text-xs font-medium text-mute underline-offset-4 hover:text-black hover:underline">
            نسيت كلمة المرور؟
          </Link>
        </form>

        <p className="mt-6 text-center text-[11px] text-faint">زاجل ديلفري — Zajel Delivery © {new Date().getFullYear()}</p>
      </div>
    </div>
  )
}
