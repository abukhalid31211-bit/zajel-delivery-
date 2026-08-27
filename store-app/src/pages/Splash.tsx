import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Splash() {
  const navigate = useNavigate()
  const [seconds, setSeconds] = useState(10)

  useEffect(() => {
    const tick = setInterval(() => setSeconds((s) => (s > 1 ? s - 1 : 0)), 1000)
    const done = setTimeout(() => navigate('/welcome', { replace: true }), 10000)
    return () => {
      clearInterval(tick)
      clearTimeout(done)
    }
  }, [navigate])

  return (
    <div className="app-shell items-center justify-between bg-gradient-to-b from-white via-gold-faint to-gold-soft">
      <div className="z-10 pt-20 text-center">
        <p className="text-[11px] font-bold tracking-[0.35em] text-gold-strong">ZAJEL DELIVERY</p>
      </div>

      <div className="z-10 flex flex-col items-center gap-8">
        <div className="relative flex h-40 w-40 items-center justify-center">
          <div className="animate-splash-ring absolute inset-0 rounded-full border border-gold/30 border-t-gold" />
          <div className="absolute inset-3 rounded-full border border-gold/15" />
          <div className="animate-logo-pulse flex h-24 w-24 items-center justify-center rounded-[28px] bg-gradient-to-br from-gold to-gold-strong shadow-xl shadow-gold/30">
            <svg viewBox="0 0 64 64" width="52" height="52">
              <path d="M14 20h30l-22 20h24v4H14l22-20H14z" fill="#fff" />
              <circle cx="50" cy="16" r="4" fill="#fff" />
            </svg>
          </div>
        </div>

        <div className="text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-ink">زاجل محل</h1>
          <p className="mt-2 text-sm font-semibold text-mute">اطلب كابتن توصيل بكل سهولة</p>
        </div>

        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="animate-float-dot h-1.5 w-1.5 rounded-full bg-gold"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
      </div>

      <div className="z-10 w-full px-10 pb-14">
        <div className="mb-3 flex items-center justify-between text-[11px] font-bold text-mute">
          <span>جاري تجهيز التطبيق...</span>
          <span dir="ltr">{seconds}s</span>
        </div>
        <div className="h-1 w-full overflow-hidden rounded-full bg-gold/15">
          <div className="animate-progress-10s h-full rounded-full bg-gold" />
        </div>
        <p className="mt-6 text-center text-[10px] text-faint">Zajel Delivery — Iraq © {new Date().getFullYear()}</p>
      </div>
    </div>
  )
}
