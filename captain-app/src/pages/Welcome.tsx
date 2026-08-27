import { useNavigate } from 'react-router-dom'
import { Bike, Wallet, Clock3, ShieldCheck } from 'lucide-react'

const perks = [
  { icon: Wallet, title: 'دخل يومي نقدي', desc: 'أجرة توصيل واضحة لكل طلبية تُحصّل كاش' },
  { icon: Clock3, title: 'شفتات مرنة', desc: 'اختر شفت عملك الأسبوعي بما يناسبك' },
  { icon: ShieldCheck, title: 'نظام موثوق', desc: 'تتبع دقيق وكشف حساب يومي شفاف' },
]

export default function Welcome() {
  const navigate = useNavigate()
  return (
    <div className="app-shell">
      <div className="flex flex-col items-center bg-black px-6 pb-12 pt-16 text-white">
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-white shadow-xl">
          <svg viewBox="0 0 64 64" width="42" height="42">
            <path d="M14 20h30l-22 20h24v4H14l22-20H14z" fill="#000" />
            <circle cx="50" cy="16" r="4" fill="#000" />
          </svg>
        </div>
        <h1 className="mt-5 text-2xl font-bold">أهلاً بك في كابتن زاجل!</h1>
        <p className="mt-2 max-w-64 text-center text-[13px] leading-relaxed text-white/60">
          انضم لفريق كباتن زاجل ديلفري في العراق وأنشئ مدخولك اليومي
        </p>
      </div>

      <div className="animate-fade-up -mt-6 flex-1 space-y-3 rounded-t-[28px] bg-page px-5 pt-7">
        {perks.map((p) => (
          <div key={p.title} className="card flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-black text-white">
              <p.icon className="h-5 w-5" strokeWidth={1.8} />
            </div>
            <div>
              <p className="text-sm font-bold">{p.title}</p>
              <p className="mt-0.5 text-xs text-mute">{p.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-3 bg-page px-5 pb-10 pt-6">
        <button className="btn-primary w-full" onClick={() => navigate('/register')}>
          <Bike className="h-5 w-5" /> تسجيل حساب كابتن جديد
        </button>
        <button className="btn-secondary w-full" onClick={() => navigate('/login')}>
          لديّ حساب بالفعل — تسجيل الدخول
        </button>
      </div>
    </div>
  )
}
