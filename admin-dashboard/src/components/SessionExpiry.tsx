import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock } from 'lucide-react'
import { clearSession, getSession, isSessionExpired, startSession, touchSession } from '../lib/session'
import { dbGet } from '../lib/db'
import type { AdminUser } from '../lib/types'
import { logSecurity } from '../lib/store'
import { isSuperLogin, isSuperPhone } from '../lib/auth'

export default function SessionExpiry({ toast }: { toast: (m: string) => void }) {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const session = getSession()

  useEffect(() => {
    const tick = () => {
      if (isSessionExpired()) setOpen(true)
    }
    const t = window.setInterval(tick, 5000)
    const onAct = () => {
      if (!open) touchSession()
    }
    window.addEventListener('click', onAct)
    window.addEventListener('keydown', onAct)
    return () => {
      window.clearInterval(t)
      window.removeEventListener('click', onAct)
      window.removeEventListener('keydown', onAct)
    }
  }, [open])

  if (!open || !session) return null

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4">
      <div className="animate-fade-up w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-4 flex justify-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-dashed border-black">
            <Lock className="h-6 w-6" />
          </span>
        </div>
        <h3 className="text-center text-base font-bold">انتهت جلستك</h3>
        <p className="mt-2 text-center text-xs leading-relaxed text-mute">
          لأسباب أمنية، تم تسجيل خروجك. يرجى تسجيل الدخول مرة أخرى.
        </p>
        <div className="mt-4 space-y-3">
          <div>
            <label className="mb-1.5 block text-xs font-semibold">رقم الهاتف</label>
            <input className="field bg-page" value={`+964 ${session.phone}`} readOnly />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold">كلمة المرور</label>
            <input
              type="password"
              className="field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="أدخل كلمة المرور"
            />
            {error && <p className="mt-1 text-[11px] font-medium">⚠ {error}</p>}
          </div>
          <button
            className="btn-primary w-full py-3"
            onClick={() => {
              if (!password.trim()) return setError('كلمة المرور غير صحيحة.')
              if (isSuperPhone(session.phone)) {
                if (!isSuperLogin(session.phone, password)) {
                  setError('كلمة المرور غير صحيحة.')
                  return
                }
              } else {
                const admins = dbGet<AdminUser[]>('admins', [])
                const found = admins.find((a) => a.phone === session.phone)
                if (found && found.password && found.password !== password) {
                  setError('كلمة المرور غير صحيحة.')
                  return
                }
              }
              startSession(session.phone, session.name, session.role, {
                super: session.super,
                perms: session.perms,
                govIds: session.govIds,
                districtIds: session.districtIds,
              })
              logSecurity({ type: 'تسجيل دخول ناجح', user: session.phone, result: 'نجاح', details: 'إعادة الدخول بعد انتهاء الجلسة' })
              setOpen(false)
              setPassword('')
              setError('')
              toast('تم استعادة بياناتك. أكمل من حيث توقفت.')
            }}
          >
            تسجيل الدخول
          </button>
          <button
            className="block w-full text-center text-xs font-medium text-mute underline-offset-4 hover:text-black hover:underline"
            onClick={() => {
              clearSession()
              navigate('/login')
            }}
          >
            تسجيل الدخول بحساب آخر
          </button>
        </div>
      </div>
    </div>
  )
}
