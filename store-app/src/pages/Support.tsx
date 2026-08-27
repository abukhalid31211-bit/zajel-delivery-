import { useNavigate } from 'react-router-dom'
import { Phone, MessageCircle, MessageSquareWarning, HelpCircle, ChevronLeft } from 'lucide-react'
import Header from '../components/Header'

export default function Support() {
  const navigate = useNavigate()
  return (
    <div className="app-shell">
      <Header title="المساعدة والدعم" to="/profile" />

      <div className="animate-fade-up flex-1 space-y-5 px-5 py-6">
        <div className="grid grid-cols-2 gap-3">
          <a href="tel:07888216090" className="card flex flex-col items-center gap-2 p-5 text-center transition-transform active:scale-[0.98]">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gold text-white shadow shadow-gold/25">
              <Phone className="h-5 w-5" strokeWidth={1.8} />
            </span>
            <p className="text-xs font-extrabold">اتصال هاتفي</p>
            <p className="text-[10px] text-mute">7 888 216 090 / 7 770 969 045</p>
          </a>
          <a href="https://wa.me/9647888216090" target="_blank" rel="noreferrer" className="card flex flex-col items-center gap-2 p-5 text-center transition-transform active:scale-[0.98]">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gold text-white shadow shadow-gold/25">
              <MessageCircle className="h-5 w-5" strokeWidth={1.8} />
            </span>
            <p className="text-xs font-extrabold">واتساب</p>
            <p className="text-[10px] text-mute">7 888 216 090 / 7 770 969 045</p>
          </a>
        </div>

        <div className="card divide-y divide-line overflow-hidden">
          <button onClick={() => navigate('/complaints/new')} className="flex w-full items-center gap-3.5 px-4 py-3.5 text-right active:bg-gold-faint">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gold-soft text-gold-strong">
              <MessageSquareWarning className="h-4.5 w-4.5" strokeWidth={1.7} />
            </span>
            <span className="flex-1 text-[13px] font-bold">تقديم شكوى جديدة</span>
            <ChevronLeft className="h-4 w-4 text-faint" />
          </button>
          <button onClick={() => navigate('/complaints')} className="flex w-full items-center gap-3.5 px-4 py-3.5 text-right active:bg-gold-faint">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gold-soft text-gold-strong">
              <MessageSquareWarning className="h-4.5 w-4.5" strokeWidth={1.7} />
            </span>
            <span className="flex-1 text-[13px] font-bold">شكاواي ومتابعتها</span>
            <ChevronLeft className="h-4 w-4 text-faint" />
          </button>
        </div>

        <div>
          <p className="mb-2 px-1 text-[11px] font-extrabold text-faint">الأسئلة الشائعة</p>
          <div className="card flex flex-col items-center gap-2 p-8 text-center">
            <HelpCircle className="h-8 w-8 text-gold" strokeWidth={1.3} />
            <p className="text-xs font-extrabold">لا توجد أسئلة منشورة بعد</p>
            <p className="text-[10px] leading-relaxed text-mute">تُدار الأسئلة الشائعة من لوحة الإدارة (CMS) وتظهر هنا فور نشرها.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
