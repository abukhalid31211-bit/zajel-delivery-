import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Star } from 'lucide-react'
import { useToast } from '../components/Toast'

export default function RateStore() {
  const navigate = useNavigate()
  const { toast, node } = useToast()
  const [stars, setStars] = useState(0)
  const [ready, setReady] = useState<string | null>(null)
  const [treat, setTreat] = useState<string | null>(null)
  const [comment, setComment] = useState('')

  return (
    <div className="app-shell">
      <div className="flex items-center gap-3 border-b border-line bg-white px-4 py-4">
        <button onClick={() => navigate('/home')} className="flex h-9 w-9 items-center justify-center rounded-xl border border-line">
          <ArrowRight className="h-4.5 w-4.5" />
        </button>
        <div>
          <h1 className="text-base font-bold">تقييم المحل</h1>
          <p className="text-[10px] text-mute">كيف كانت تجربتك مع المحل في الطلب #—؟</p>
        </div>
      </div>

      <div className="animate-fade-up flex-1 space-y-5 px-5 py-6">
        <div className="card p-5">
          <p className="mb-3 text-xs font-bold">هل كانت الطلبية جاهزة عند وصولك؟</p>
          <div className="flex gap-2">
            {['نعم ✅', 'تأخرت قليلاً ⏳', 'لا ❌'].map((o) => (
              <button
                key={o}
                onClick={() => setReady(o)}
                className={`flex-1 rounded-xl border px-2 py-2.5 text-[11px] font-bold transition-colors ${ready === o ? 'border-black bg-black text-white' : 'border-line bg-white text-mute'}`}
              >
                {o}
              </button>
            ))}
          </div>
        </div>

        <div className="card p-5">
          <p className="mb-3 text-xs font-bold">هل كان التعامل جيداً؟</p>
          <div className="flex gap-2">
            {['نعم ✅', 'لا ❌'].map((o) => (
              <button
                key={o}
                onClick={() => setTreat(o)}
                className={`flex-1 rounded-xl border px-2 py-2.5 text-[11px] font-bold transition-colors ${treat === o ? 'border-black bg-black text-white' : 'border-line bg-white text-mute'}`}
              >
                {o}
              </button>
            ))}
          </div>
        </div>

        <div className="card p-5 text-center">
          <p className="mb-3 text-xs font-bold">تقييمك العام</p>
          <div className="flex justify-center gap-2" dir="ltr">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} onClick={() => setStars(n)}>
                <Star className={`h-9 w-9 transition-all ${n <= stars ? 'fill-black text-black' : 'text-line'}`} strokeWidth={1.5} />
              </button>
            ))}
          </div>
        </div>

        <textarea className="field min-h-20 resize-none" placeholder="تعليق (اختياري)..." value={comment} onChange={(e) => setComment(e.target.value)} />
      </div>

      <div className="space-y-2.5 border-t border-line bg-white px-5 py-4">
        <button
          className="btn-primary w-full"
          disabled={stars === 0}
          onClick={() => {
            toast('شكراً لتقييمك! ⭐')
            setTimeout(() => navigate('/home'), 1200)
          }}
        >
          إرسال التقييم
        </button>
        <button className="w-full text-center text-xs font-bold text-mute" onClick={() => navigate('/home')}>
          تخطي
        </button>
      </div>

      {node}
    </div>
  )
}
