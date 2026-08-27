import { useEffect, useState } from 'react'
import { Lock } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useCaptain } from '../state'

const TIMEOUT_MS = 30 * 60 * 1000

export default function SessionExpiry() {
  const navigate = useNavigate()
  const { state, login } = useCaptain()
  const [show, setShow] = useState(false)
  const [pass, setPass] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!state.captain) return
    let timer: ReturnType<typeof setTimeout>
    const reset = () => {
      clearTimeout(timer)
      timer = setTimeout(() => setShow(true), TIMEOUT_MS)
    }
    const events: (keyof WindowEventMap)[] = ['click', 'keydown', 'scroll', 'touchstart']
    events.forEach((e) => window.addEventListener(e, reset))
    reset()
    return () => {
      clearTimeout(timer)
      events.forEach((e) => window.removeEventListener(e, reset))
    }
  }, [state.captain])

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!state.captain) return
    if (login(state.captain.phone, pass)) {
      setShow(false)
      setPass('')
      setError('')
      return
    }
    setError('كلمة المرور غير صحيحة')
  }

  if (!show) return null

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/50 px-6">
      <form onSubmit={submit} className="animate-fade-up w-full max-w-[430px] rounded-3xl bg-white p-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gold text-white">
            <Lock className="h-6 w-6" />
          </span>
          <h2 className="text-base font-bold">انتهت جلستك</h2>
          <p className="text-xs leading-relaxed text-mute">لأسباب أمنية، تم تسجيل خروجك. يرجى تسجيل الدخول مرة أخرى.</p>
          <p className="w-full rounded-xl bg-page px-3 py-2 text-xs font-bold" dir="ltr">+964 {state.captain?.phone}</p>
          <input type="password" className="field" placeholder="كلمة المرور" value={pass} onChange={(e) => setPass(e.target.value)} />
          {error && <p className="text-[11px] font-semibold text-red-600">⚠ {error}</p>}
          <button className="btn-primary w-full" type="submit">تسجيل الدخول</button>
          <button type="button" className="text-xs font-bold text-mute underline-offset-4 hover:underline" onClick={() => { setShow(false); navigate('/login') }}>تسجيل الدخول بحساب آخر</button>
        </div>
      </form>
    </div>
  )
}
