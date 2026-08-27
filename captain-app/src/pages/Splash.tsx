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
    <div className="app-shell items-center justify-between !bg-black text-white">
      {/* decorative grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
          backgroundSize: '44px 44px',
        }}
      />

      <div className="z-10 pt-20 text-center">
        <p className="text-[11px] font-medium tracking-[0.35em] text-white/40">ZAJEL DELIVERY</p>
      </div>

      <div className="z-10 flex flex-col items-center gap-8">
        {/* logo with orbit ring */}
        <div className="relative flex h-40 w-40 items-center justify-center">
          <div className="animate-splash-ring absolute inset-0 rounded-full border border-white/15 border-t-white/70" />
          <div className="absolute inset-3 rounded-full border border-white/10" />
          <div className="animate-logo-pulse flex h-24 w-24 items-center justify-center rounded-[28px] bg-white">
            <svg viewBox="0 0 64 64" width="52" height="52">
              <path d="M14 20h30l-22 20h24v4H14l22-20H14z" fill="#000" />
              <circle cx="50" cy="16" r="4" fill="#000" />
            </svg>
          </div>
        </div>

        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">زاجل كابتن</h1>
          <p className="mt-2 text-sm font-medium text-white/50">يوصلك بسرعة وثقة</p>
        </div>

        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="animate-float-dot h-1.5 w-1.5 rounded-full bg-white"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
      </div>

      <div className="z-10 w-full px-10 pb-14">
        <div className="mb-3 flex items-center justify-between text-[11px] font-medium text-white/40">
          <span>جاري تجهيز التطبيق...</span>
          <span dir="ltr">{seconds}s</span>
        </div>
        <div className="h-1 w-full overflow-hidden rounded-full bg-white/10">
          <div className="animate-progress-10s h-full rounded-full bg-white" />
        </div>
        <p className="mt-6 text-center text-[10px] text-white/30">Zajel Delivery — Iraq © {new Date().getFullYear()}</p>
      </div>
    </div>
  )
}
