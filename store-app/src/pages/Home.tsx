import { useNavigate } from 'react-router-dom'
import { Bell, Plus, Inbox, Wrench, ChevronLeft } from 'lucide-react'
import { useStore } from '../lib/StoreContext'
import { STATUS_META, fmtTime } from '../lib/data'
import EmptyState from '../components/EmptyState'

export default function Home() {
  const navigate = useNavigate()
  const { profile, orders, unreadCount, activeOrder } = useStore()

  const today = new Date().toDateString()
  const todayOrders = orders.filter((o) => new Date(o.createdAt).toDateString() === today)
  const stats = {
    total: todayOrders.length,
    completed: todayOrders.filter((o) => ['completed', 'delivered'].includes(o.status)).length,
    cancelled: todayOrders.filter((o) => ['cancelled', 'returned'].includes(o.status)).length,
  }

  const activeOrders = orders.filter((o) => ['searching', 'assigned', 'heading', 'arrived', 'picked_up', 'on_way'].includes(o.status))

  return (
    <div>
      {/* header */}
      <div className="bg-gradient-to-b from-white to-gold-faint px-5 pb-20 pt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-gold to-gold-strong shadow-md shadow-gold/25">
              <svg viewBox="0 0 64 64" width="22" height="22">
                <path d="M14 20h30l-22 20h24v4H14l22-20H14z" fill="#fff" />
                <circle cx="50" cy="16" r="4" fill="#fff" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-extrabold leading-none">{profile?.name ?? 'محل زاجل'}</p>
              <p className="mt-1 flex items-center gap-1 text-[10px] text-mute">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-success" /> الحالة: نشط
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/notifications')}
            className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-gold/30 bg-white text-gold-strong"
          >
            <Bell className="h-[18px] w-[18px]" strokeWidth={1.8} />
            {unreadCount > 0 && (
              <span className="absolute -left-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-gold px-1 text-[9px] font-extrabold text-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
        </div>

        <div className="mt-6">
          <p className="text-lg font-extrabold leading-snug">جاهز لإرسال طلبيتك؟</p>
          <p className="mt-1 text-xs text-mute">اطلب كابتن زاجل وتابع التوصيل لحظة بلحظة</p>
        </div>
      </div>

      {/* CTA */}
      <div className="animate-fade-up -mt-10 px-5">
        <button
          onClick={() => navigate('/create-order')}
          className="card flex w-full items-center gap-4 border-gold/50 p-5 shadow-lg shadow-gold/10 transition-transform active:scale-[0.98]"
        >
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-gold to-gold-strong text-white shadow-md shadow-gold/30">
            <Plus className="h-7 w-7" strokeWidth={2.2} />
          </span>
          <span className="flex-1 text-right">
            <span className="block text-base font-extrabold">إنشاء طلب جديد 🚚</span>
            <span className="mt-0.5 block text-xs text-mute">3 خطوات سريعة: الزبون ← الموقع ← المبلغ</span>
          </span>
          <ChevronLeft className="h-4 w-4 text-faint" />
        </button>
      </div>

      {/* quick stats */}
      <div className="grid grid-cols-3 gap-3 px-5 pt-5">
        {[
          ['طلبات اليوم', stats.total],
          ['مكتملة', stats.completed],
          ['ملغاة', stats.cancelled],
        ].map(([l, v]) => (
          <div key={l} className="card p-3.5 text-center">
            <p className="text-xl font-extrabold text-gold-strong">{v}</p>
            <p className="mt-1 text-[10px] font-bold text-mute">{l}</p>
          </div>
        ))}
      </div>

      {/* active orders */}
      <div className="px-5 pb-6 pt-6">
        <h2 className="mb-3 text-sm font-extrabold">طلباتك النشطة</h2>
        {activeOrders.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title="لا توجد طلبات نشطة 📭"
            desc="أنشئ طلبك الأول وسيظهر هنا مع حالة الكابتن والتتبع المباشر."
          />
        ) : (
          <div className="space-y-3">
            {activeOrders.map((o) => {
              const meta = STATUS_META[o.status]
              return (
                <button key={o.id} onClick={() => navigate(`/track?id=${o.id}`)} className="card w-full p-4 text-right transition-transform active:scale-[0.99]">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-extrabold">طلب {o.id}</p>
                    <span className={`badge ${meta.cls}`}>
                      {meta.emoji} {meta.label}
                    </span>
                  </div>
                  <div className="mt-2.5 flex items-center justify-between text-[11px] text-mute">
                    <span>الزبون: <b className="text-ink">{o.customer.name}</b></span>
                    <span>{fmtTime(o.createdAt)}</span>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-[11px] text-mute">
                    <span>الكابتن: <b className="text-ink">{o.captain?.name ?? '— يبحث عن كابتن'}</b></span>
                    <span className="font-bold text-gold-strong">{o.total.toLocaleString('en')} د.ع</span>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {activeOrder && (
        <div className="fixed bottom-24 left-1/2 z-30 w-[calc(100%-40px)] max-w-[390px] -translate-x-1/2">
          <button
            onClick={() => navigate(`/track?id=${activeOrder.id}`)}
            className="animate-pulse-gold flex w-full items-center justify-between rounded-2xl border border-gold/40 bg-white px-4 py-3 shadow-lg"
          >
            <span className="text-[11px] font-extrabold">🚚 متابعة الطلب {activeOrder.id}</span>
            <span className={`badge ${STATUS_META[activeOrder.status].cls}`}>
              {STATUS_META[activeOrder.status].emoji} {STATUS_META[activeOrder.status].label}
            </span>
          </button>
        </div>
      )}

      {/* وضع الصيانة — يظهر فقط عند تفعيله من لوحة الإدارة */}
      <div className="hidden px-5 pb-6">
        <div className="card flex items-center gap-3 border-dashed p-4">
          <Wrench className="h-5 w-5 text-gold" />
          <p className="text-[11px] font-bold text-mute">النظام في وضع صيانة — لا يمكن إنشاء طلبات جديدة.</p>
        </div>
      </div>
    </div>
  )
}
