import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, Inbox, Power, CalendarClock, CheckCircle2 } from 'lucide-react'

export default function Home() {
  const navigate = useNavigate()
  const [online, setOnline] = useState(false)
  const [confirmOff, setConfirmOff] = useState(false)

  const toggle = () => {
    if (online) setConfirmOff(true)
    else setOnline(true)
  }

  return (
    <div>
      {/* header */}
      <div className="bg-black px-5 pb-16 pt-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white">
              <svg viewBox="0 0 64 64" width="22" height="22">
                <path d="M14 20h30l-22 20h24v4H14l22-20H14z" fill="#000" />
                <circle cx="50" cy="16" r="4" fill="#000" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold leading-none">زاجل كابتن</p>
              <p className="mt-1 text-[10px] text-white/50">يوصلك بسرعة وثقة</p>
            </div>
          </div>
          <button onClick={() => navigate('/notifications')} className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/15">
            <Bell className="h-[18px] w-[18px]" strokeWidth={1.8} />
          </button>
        </div>

        {/* online toggle */}
        <button
          onClick={toggle}
          className={`mt-6 flex w-full items-center justify-between rounded-2xl border p-4 transition-colors ${
            online ? 'border-white bg-white text-black' : 'border-white/20 bg-white/5 text-white'
          }`}
        >
          <div className="flex items-center gap-3">
            <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${online ? 'bg-black text-white' : 'bg-white/10'}`}>
              <Power className="h-5 w-5" strokeWidth={2} />
            </span>
            <span className="text-right">
              <span className="block text-sm font-bold">{online ? 'أنت متصل الآن 🟢' : 'أنت غير متصل 🔴'}</span>
              <span className={`mt-0.5 block text-[11px] ${online ? 'text-mute' : 'text-white/50'}`}>
                {online ? 'تستقبل طلبيات زاجل ضمن شفتك' : 'اضغط للاتصال وبدء استقبال الطلبيات'}
              </span>
            </span>
          </div>
          <span className={`relative h-7 w-12 rounded-full transition-colors ${online ? 'bg-black' : 'bg-white/20'}`}>
            <span className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-all ${online ? 'right-1' : 'right-6'}`} />
          </span>
        </button>
      </div>

      {/* shift card */}
      <div className="animate-fade-up -mt-8 px-5">
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-page">
                <CalendarClock className="h-5 w-5" strokeWidth={1.7} />
              </span>
              <div>
                <p className="text-xs font-bold">شفت العمل الأسبوعي</p>
                <p className="mt-0.5 text-[11px] text-mute">لم يتم اختيار شفت بعد</p>
              </div>
            </div>
            <button onClick={() => navigate('/shift')} className="rounded-xl bg-black px-3.5 py-2 text-[11px] font-bold text-white">
              اختيار الشفت
            </button>
          </div>
          <div className="mt-3 flex items-center gap-2 rounded-xl bg-page px-3.5 py-2.5">
            <CheckCircle2 className="h-4 w-4 text-faint" />
            <p className="text-[11px] font-medium text-mute">حالة الحضور: لم تسجل الحضور بعد</p>
          </div>
        </div>
      </div>

      {/* active orders */}
      <div className="px-5 pt-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-bold">طلباتك النشطة (0 / 3)</h2>
        </div>
        <div className="card flex flex-col items-center gap-3 p-8 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-dashed border-line bg-page">
            <Inbox className="h-6 w-6 text-faint" strokeWidth={1.5} />
          </div>
          <p className="text-sm font-bold">لا توجد طلبات نشطة حالياً 📭</p>
          <p className="max-w-60 text-[11px] leading-relaxed text-mute">
            اتصل وكن داخل وقت شفتك وستصلك الطلبيات الجديدة هنا فوراً مع تنبيه صوتي.
          </p>
        </div>
      </div>

      {/* recent */}
      <div className="px-5 pb-6 pt-6">
        <h2 className="mb-3 text-sm font-bold">آخر الطلبات المكتملة</h2>
        <div className="card flex flex-col items-center gap-2 p-6 text-center">
          <p className="text-xs font-semibold text-mute">لا توجد طلبات مكتملة بعد</p>
          <p className="text-[11px] text-faint">ستظهر آخر 5 طلبات مكتملة هنا</p>
        </div>
      </div>

      {/* confirm offline modal */}
      {confirmOff && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center">
          <div className="animate-fade-up mx-auto w-full max-w-[430px] rounded-t-3xl bg-white p-6 sm:mx-6 sm:rounded-3xl">
            <h3 className="text-base font-bold">قطع الاتصال؟</h3>
            <p className="mt-2 text-xs leading-relaxed text-mute">هل تريد قطع الاتصال؟ لن تستلم طلبيات جديدة حتى تعود متصلاً.</p>
            <div className="mt-5 flex gap-2">
              <button
                className="btn-primary flex-1"
                onClick={() => {
                  setOnline(false)
                  setConfirmOff(false)
                }}
              >
                تأكيد
              </button>
              <button className="btn-secondary flex-1" onClick={() => setConfirmOff(false)}>
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
