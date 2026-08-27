import { useNavigate } from 'react-router-dom'
import { BellOff, Truck, TriangleAlert, CheckCircle2, Megaphone, MessageSquareWarning, ChevronLeft } from 'lucide-react'
import EmptyState from '../components/EmptyState'
import Header from '../components/Header'
import { useStore } from '../lib/StoreContext'
import { fmtRelative, type NotificationKind, type NotificationTarget } from '../lib/data'

const icons: Record<NotificationKind, typeof Truck> = {
  order: Truck,
  warning: TriangleAlert,
  success: CheckCircle2,
  announce: Megaphone,
  complaint: MessageSquareWarning,
}

export default function Notifications() {
  const navigate = useNavigate()
  const { notifications, markAllRead, markRead } = useStore()

  const open = (n: { target: NotificationTarget; id: string; read: boolean }) => {
    markRead(n.id)
    const t = n.target
    if (t.type === 'order') navigate(`/track?id=${t.orderId}`)
    else if (t.type === 'complaint') navigate(`/complaint-details?id=${t.complaintId}`)
    else if (t.type === 'orders') navigate('/orders')
    else if (t.type === 'profile') navigate('/profile')
    else if (t.type === 'register') navigate('/register')
  }

  return (
    <div className="app-shell">
      <Header
        title="الإشعارات"
        to="/home"
        actions={
          notifications.some((n) => !n.read) ? (
            <button onClick={markAllRead} className="rounded-xl border border-gold/40 bg-gold-faint px-3 py-2 text-[10px] font-bold text-gold-deep">
              تحديد الكل كمقروء
            </button>
          ) : undefined
        }
      />

      <div className="animate-fade-up flex-1 px-4 py-4">
        {notifications.length === 0 ? (
          <EmptyState
            icon={BellOff}
            title="لا توجد إشعارات 📭"
            desc="ستصلك هنا إشعارات حالة طلبياتك وتنبيهات الإدارة والإعلانات."
          />
        ) : (
          <div className="space-y-2.5 pb-6">
            {notifications.map((n) => {
              const Icon = icons[n.kind]
              return (
                <button
                  key={n.id}
                  onClick={() => open(n)}
                  className={`card w-full p-3.5 text-right transition-all active:scale-[0.99] ${!n.read ? 'border-gold/50 bg-gold-faint' : ''}`}
                >
                  <div className="flex items-start gap-3">
                    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${!n.read ? 'bg-gold text-white' : 'bg-gold-soft text-gold-strong'}`}>
                      <Icon className="h-4.5 w-4.5" strokeWidth={1.8} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className={`block text-[12px] leading-snug ${n.read ? 'font-bold text-mute' : 'font-extrabold text-ink'}`}>{n.title}</span>
                      <span className="mt-0.5 block truncate text-[11px] text-mute">{n.body}</span>
                      <span className="mt-1 flex items-center justify-between text-[10px] text-faint">
                        {fmtRelative(n.createdAt)}
                        {!n.read && <span className="h-2 w-2 rounded-full bg-gold" />}
                      </span>
                    </span>
                    <ChevronLeft className="h-4 w-4 shrink-0 self-center text-faint" />
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
