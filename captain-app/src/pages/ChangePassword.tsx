import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Eye, EyeOff, Loader2, CheckCircle2 } from 'lucide-react'

export default function ChangePassword() {
  const navigate = useNavigate()
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [show, setShow] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const strength = next.length === 0 ? null : next.length < 6 ? 'ضعيفة' : next.length <= 8 ? 'متوسطة' : 'قوية'

  const submit = () => {
    if (!current) return setError('كلمة المرور الحالية مطلوبة')
    if (next.length < 6) return setError('كلمة المرور قصيرة جداً (6 أحرف على الأقل)')
    if (next !== confirm) return setError('كلمة المرور غير متطابقة')
    if (next === current) return setError('كلمة المرور الجديدة يجب أن تكون مختلفة عن الحالية')
    setError('')
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setDone(true)
    }, 900)
  }

  if (done) {
    return (
      <div className="app-shell items-center justify-center px-8 text-center">
        <div className="animate-fade-up flex flex-col items-center gap-4">
          <CheckCircle2 className="h-20 w-20" strokeWidth={1} />
          <h1 className="text-lg font-bold">تم تغيير كلمة المرور بنجاح ✅</h1>
          <p className="text-xs leading-relaxed text-mute">لأسباب أمنية، يُطلب منك تسجيل الدخول مجدداً بكلمة المرور الجديدة.</p>
          <button className="btn-primary w-full" onClick={() => navigate('/login')}>تسجيل الدخول</button>
        </div>
      </div>
    )
  }

  return (
    <div className="app-shell">
      <div className="flex items-center gap-3 border-b border-line bg-white px-4 py-4">
        <button onClick={() => navigate(-1)} className="flex h-9 w-9 items-center justify-center rounded-xl border border-line">
          <ArrowRight className="h-4.5 w-4.5" />
        </button>
        <h1 className="text-base font-bold">تغيير كلمة المرور</h1>
      </div>

      <div className="animate-fade-up flex-1 space-y-4 px-5 py-6">
        <div>
          <label className="mb-1.5 block text-xs font-semibold">كلمة المرور الحالية</label>
          <div className="relative">
            <input type={show ? 'text' : 'password'} className="field pl-11" value={current} onChange={(e) => setCurrent(e.target.value)} />
            <button type="button" onClick={() => setShow((v) => !v)} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-faint">
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold">كلمة المرور الجديدة</label>
          <input type={show ? 'text' : 'password'} className="field" value={next} onChange={(e) => setNext(e.target.value)} />
          {strength && (
            <div className="mt-2 flex items-center gap-2">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-line">
                <div className="h-full bg-black transition-all" style={{ width: strength === 'ضعيفة' ? '33%' : strength === 'متوسطة' ? '66%' : '100%' }} />
              </div>
              <span className="text-[10px] font-medium text-mute">{strength}</span>
            </div>
          )}
          <ul className="mt-2 space-y-1 text-[10px] text-mute">
            <li className={next.length >= 6 ? 'font-bold text-black' : ''}>{next.length >= 6 ? '✅' : '⬜'} 6 أحرف على الأقل</li>
            <li className={/\d/.test(next) ? 'font-bold text-black' : ''}>{/\d/.test(next) ? '✅' : '⬜'} يحتوي على رقم</li>
            <li className={/[^A-Za-z0-9\u0600-\u06FF]/.test(next) ? 'font-bold text-black' : ''}>{/[^A-Za-z0-9\u0600-\u06FF]/.test(next) ? '✅' : '⬜'} يحتوي على رمز خاص (اختياري)</li>
          </ul>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold">تأكيد كلمة المرور الجديدة</label>
          <input type={show ? 'text' : 'password'} className="field" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
        </div>
        {error && <p className="rounded-xl border border-black bg-white px-4 py-3 text-xs font-semibold">⚠ {error}</p>}
      </div>

      <div className="border-t border-line bg-white px-5 py-4">
        <button className="btn-primary w-full" onClick={submit} disabled={loading}>
          {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> جاري الحفظ...</> : 'تغيير كلمة المرور'}
        </button>
      </div>
    </div>
  )
}
