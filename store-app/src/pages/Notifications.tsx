import { useNavigate } from 'react-router-dom'
import { ArrowRight, BellOff } from 'lucide-react'

export default function Notifications() {
  const navigate = useNavigate()
  return (
    <div className="app-shell">
      <div className="flex items-center justify-between border-b border-line bg-white px-4 py-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="flex h-9 w-9 items-center justify-center rounded-xl border border-line">
            <ArrowRight className="h-4.5 w-4.5" />
          </button>
          <h1 className="text-base font-bold">الإشعارات</h1>
        </div>
        <button className="text-[11px] font-bold text-mute">تحديد الكل كمقروء</button>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-8 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-3xl border border-dashed border-line bg-white">
          <BellOff className="h-7 w-7 text-faint" strokeWidth={1.4} />
        </div>
        <p className="text-sm font-bold">لا توجد إشعارات 📭</p>
        <p className="max-w-60 text-[11px] leading-relaxed text-mute">
          ستصلك هنا إشعارات حالة طلبياتك وتنبيهات الإدارة والإعلانات.
        </p>
      </div>
    </div>
  )
}
