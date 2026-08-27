import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Loader2, CheckCircle2 } from 'lucide-react'
import Header from '../components/Header'
import { useStore } from '../lib/StoreContext'
import { strengthOf } from '../lib/data'

export default function ChangePassword() {
  const navigate = useNavigate()
  const { changePassword, endSession } = useStore()
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [show, setShow] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const strength = strengthOf(next)

  const submit = () => {
    if (!current) return setError('كلمة المرور الحالية مطلوبة')
    if (next.length < 6) return setError('كلمة المرور قصيرة جداً (6 أحرف على الأقل)')
    if (next !== confirm) return setError('كلمة المرور غير متطابقة')
    setError('')
    setLoading(true)
    setTimeout(() => {
      const res = changePassword(current, next)
      setLoading(false)
      if (!res.ok) {
        setError(res.error ?? 'حدث خطأ. حاول مرة أخرى.')
        return
      }
      setDone(true)
    }, 800)
  }

  if (done) {
    return (
      <div className="app-shell items-center justify-center px-8 text-center">
        <div className="animate-fade-up flex flex-col items-center gap-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gold text-white">
            <CheckCircle2 className="h-10 w-10" strokeWidth={1.6} />
          </div>
          <h1 className="text-lg font-extrabold">تم تغيير كلمة المرور بنجاح ✅</h1>
          <p className="text-xs leading-relaxed text-mute">لأسباب أمنية، يُطلب منك تسجيل الدخول مجدداً بكلمة المرور الجديدة.</p>
          <button
            className="btn-primary w-full"
            onClick={() => {
              endSession('password')
              navigate('/login')
            }}
          >
            تسجيل الدخول
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="app-shell">
      <Header title="تغيير كلمة المرور" to="/profile" />

      <div className="animate-fade-up flex-1 space-y-4 px-5 py-6">
        <div>
          <label className="mb-1.5 block text-xs font-bold">كلمة المرور الحالية</label>
          <div className="relative">
            <input type={show ? 'text' : 'password'} className="field pl-11" value={current} onChange={(e) => setCurrent(e.target.value)} />
            <button type="button" onClick={() => setShow((v) => !v)} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-faint">
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-bold">كلمة المرور الجديدة</label>
          <div className="relative">
            <input type={show ? 'text' : 'password'} className="field pl-11" value={next} onChange={(e) => setNext(e.target.value)} />
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
          <ul className="mt-2 space-y-1 text-[10px] text-mute">
            <li className={next.length >= 6 ? 'font-bold text-gold-deep' : ''}>{next.length >= 6 ? '✅' : '⬜'} 6 أحرف على الأقل</li>
            <li className={/\d/.test(next) ? 'font-bold text-gold-deep' : ''}>{/\d/.test(next) ? '✅' : '⬜'} يحتوي على رقم</li>
            <li className={/[^A-Za-z0-9\u0600-\u06FF]/.test(next) ? 'font-bold text-gold-deep' : ''}>
              {/[^A-Za-z0-9\u0600-\u06FF]/.test(next) ? '✅' : '⬜'} يحتوي على رمز خاص (اختياري)
            </li>
          </ul>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-bold">تأكيد كلمة المرور الجديدة</label>
          <input type={show ? 'text' : 'password'} className="field" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
        </div>
        {error && <p className="rounded-xl border border-danger/40 bg-danger/5 px-4 py-3 text-xs font-bold text-danger">⚠ {error}</p>}
      </div>

      <div className="border-t border-line bg-white px-5 py-4">
        <button className="btn-primary w-full" onClick={submit} disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> جاري الحفظ...
            </>
          ) : (
            'تغيير كلمة المرور'
          )}
        </button>
      </div>
    </div>
  )
}
