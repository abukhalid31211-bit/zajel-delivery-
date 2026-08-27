import { useNavigate } from 'react-router-dom'
import { ArrowRight, BellOff, Bell, Truck, AlertTriangle, CheckCircle2, MessageSquareWarning } from 'lucide-react'
import { useCaptain } from '../state'

export default function Notifications() {
  const navigate = useNavigate()
  const { state, markAllRead, markRead } = useCaptain()
  const items = state.notifications
  const unread = items.filter((n) => !n.read).length

  const open = (id: string, target?: string) => {
    markRead(id)
    if (target?.startsWith('o')) navigate(`/order?order=${target}`)
    else if (target?.startsWith('c')) navigate(`/complaints/${target}`)
  }

  return (
    <div className="app-shell">
      <div className="flex items-center justify-between border-b border-line bg-white px-4 py-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="flex h-9 w-9 items-center justify-center rounded-xl border border-line">
            <ArrowRight className="h-4.5 w-4.5" />
          </button>
          <h1 className="text-base font-bold">الإشعارات {unread ? <span className="badge bg-gold text-white">{unread}</span> : null}</h1>
        </div>
        <button onClick={markAllRead} className="text-[11px] font-bold text-gold-dark">تحديد الكل كمقروء</button>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-8 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl border border-dashed border-gold bg-white">
            <BellOff className="h-7 w-7 text-faint" strokeWidth={1.4} />
          </div>
          <p className="text-sm font-bold">لا توجد إشعارات 📭</p>
          <p className="max-w-60 text-[11px] leading-relaxed text-mute">ستصلك هنا إشعارات الطلبيات الجديدة وتنبيهات الإدارة والإعلانات.</p>
        </div>
      ) : (
        <div className="flex-1 divide-y divide-line">
          {items.map((n) => (
            <button key={n.id} onClick={() => open(n.id, n.target)} className={`flex w-full items-start gap-3 px-4 py-3.5 text-right ${n.read ? '' : 'bg-gold-light/40'}`}>
              <span className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${n.type === 'sms' ? 'bg-gold text-white' : n.type === 'alert' ? 'bg-gold-light text-gold-dark' : n.type === 'success' ? 'bg-gold text-white' : 'bg-page text-faint'}`}>
                {n.type === 'sms' || n.type === 'info' ? <Bell className="h-4.5 w-4.5" /> : n.type === 'alert' ? <AlertTriangle className="h-4.5 w-4.5" /> : n.type === 'success' ? <CheckCircle2 className="h-4.5 w-4.5" /> : n.type === 'order' ? <Truck className="h-4.5 w-4.5" /> : <MessageSquareWarning className="h-4.5 w-4.5" />}
              </span>
              <span className="flex-1">
                <span className={`block text-xs ${n.read ? 'font-semibold text-mute' : 'font-bold'}`}>{n.title}</span>
                <span className="mt-0.5 block text-[11px] leading-relaxed text-mute">{n.body}</span>
              </span>
              {!n.read && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-gold" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
