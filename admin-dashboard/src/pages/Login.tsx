import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Eye, EyeOff, Lock, Phone, Loader2 } from 'lucide-react'

export default function Login() {
  const navigate = useNavigate()
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<{ phone?: string; password?: string }>({})

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const errs: typeof errors = {}
    if (!phone.trim()) errs.phone = 'هذا الحقل مطلوب'
    if (!password.trim()) errs.password = 'هذا الحقل مطلوب'
    setErrors(errs)
    if (Object.keys(errs).length) return
    setLoading(true)
    setTimeout(() => navigate('/'), 900)
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
            <h1 className="text-xl font-bold">لوحة إدارة زاجل ديلفري</h1>
            <p className="mt-1 text-xs text-mute">يوصلك بسرعة وثقة — أدخل بيانات الحساب للدخول</p>
          </div>
        </div>

        <form onSubmit={submit} className="card space-y-4 p-6 sm:p-8">
          <div>
            <label className="mb-1.5 block text-xs font-semibold">رقم الهاتف</label>
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
            <label className="mb-1.5 block text-xs font-semibold">كلمة المرور</label>
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
                <Lock className="h-4 w-4" /> تسجيل الدخول للوحة التحكم
              </>
            )}
          </button>

          <Link to="/forgot-password" className="block text-center text-xs font-medium text-mute underline-offset-4 hover:text-black hover:underline">
            نسيت كلمة المرور؟
          </Link>
        </form>

        <p className="mt-6 text-center text-[11px] text-faint">
          زاجل ديلفري — Zajel Delivery © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  )
}
