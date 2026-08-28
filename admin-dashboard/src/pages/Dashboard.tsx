import { Package, Truck, CircleDot, AlertTriangle, TrendingUp } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import StatCard from '../components/StatCard'
import EmptyState from '../components/EmptyState'
import PageHeader from '../components/PageHeader'
import StatusBadge from '../components/StatusBadge'
import { useDbList } from '../lib/store'
import { formatDate } from '../lib/db'
import { inCaptainScope, inOrderScope, inStoreScope } from '../lib/rbac'
import { ACTIVE_STATUSES, isStuck } from '../lib/orders'
import { useT } from '../lib/i18n'
import type { Captain, OrderItem, StoreItem } from '../lib/types'

const days = ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة']

export default function Dashboard() {
  const navigate = useNavigate()
  const t = useT()
  const [range, setRange] = useState(0)
  const captains = useDbList<Captain>('captains').items.filter((c) => inCaptainScope(c))
  const stores = useDbList<StoreItem>('stores').items.filter((s) => inStoreScope(s))
  const orders = useDbList<OrderItem>('orders').items.filter((o) => inOrderScope(o))
  const today = new Date().toISOString().slice(0, 10)
  const todayOrders = orders.filter((o) => o.createdAt.slice(0, 10) === today)
  const active = orders.filter((o) => ACTIVE_STATUSES.includes(o.status))
  const online = captains.filter((c) => c.status === 'نشط').length
  const unassigned = orders.filter((o) => isStuck(o.status, o.waitingStartedAt) || (o.status === 'بانتظار كابتن' && !o.captainId))

  return (
    <div>
      <PageHeader title="نظرة عامة" subtitle="ملخص العمليات التشغيلية المباشرة لنظام زاجل ديلفري" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Package} label={t('stat_today_orders')} value={String(todayOrders.length)} sub="إجمالي الطلبيات المسجلة اليوم" onClick={() => navigate('/orders')} />
        <StatCard icon={Truck} label={t('stat_active_orders')} value={String(active.length)} sub="طلبيات جارية قيد التنفيذ" onClick={() => navigate('/orders?tab=active')} />
        <StatCard icon={CircleDot} label={t('stat_online_captains')} value={`${online} / ${captains.length}`} sub="من إجمالي الكباتن" onClick={() => navigate('/captains')} />
        <StatCard icon={AlertTriangle} label={t('stat_unassigned_orders')} value={String(unassigned.length)} sub="بحاجة لتدخل فوري" alert onClick={() => navigate('/orders?tab=stuck')} />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-3">
        <div className="card p-5 xl:col-span-2">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 text-sm font-bold">
              <TrendingUp className="h-4 w-4" /> مخطط الطلبيات الأسبوعي
            </h2>
            <div className="flex overflow-hidden rounded-xl border border-line text-[11px] font-semibold">
              {['أسبوع', 'شهر', 'سنة'].map((label, i) => (
                <button key={label} type="button" onClick={() => setRange(i)} className={`px-3.5 py-1.5 ${i === range ? 'bg-black text-white' : 'text-mute hover:bg-page'}`}>
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex h-56 items-end justify-between gap-2 border-b border-line px-2">
            {(range === 0 ? days : range === 1 ? Array.from({ length: 12 }, (_, i) => String(i + 1)) : ['2023', '2024', '2025', '2026']).map((d) => {
              const h = Math.min(200, todayOrders.length * 24 + (orders.length ? 8 : 4))
              return (
                <div key={d} className="flex flex-1 flex-col items-center gap-2">
                  <div className="w-full max-w-10 rounded-t-md bg-black/20" style={{ height: orders.length ? h : 4 }} />
                </div>
              )
            })}
          </div>
          <p className="mt-4 text-center text-[11px] text-faint">{orders.length ? `${orders.length} طلب مسجّل محلياً` : 'لا توجد بيانات لعرضها خلال هذه الفترة'}</p>
        </div>
        <div className="card p-5">
          <h2 className="mb-4 text-sm font-bold">أكثر المناطق نشاطاً</h2>
          {orders.length === 0 ? (
            <EmptyState title="لا توجد بيانات" hint="ستظهر أكثر 5 مناطق نشاطاً هنا فور تسجيل الطلبيات." />
          ) : (
            <div className="space-y-2 text-xs">
              {Object.entries(
                orders.reduce<Record<string, number>>((acc, o) => {
                  acc[o.districtName || '—'] = (acc[o.districtName || '—'] || 0) + 1
                  return acc
                }, {}),
              )
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([name, n]) => (
                  <div key={name} className="flex justify-between border-b border-line py-2">
                    <span className="font-bold">{name}</span>
                    <span>{n}</span>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-2">
        <div className="card p-5">
          <h2 className="mb-4 text-sm font-bold">أكثر المطاعم نشاطاً</h2>
          {stores.filter((s) => s.type === 'مطعم').length === 0 ? (
            <EmptyState title="لا توجد بيانات" hint="ستظهر أعلى 5 مطاعم مع متوسط تقييمها." />
          ) : (
            stores.filter((s) => s.type === 'مطعم').slice(0, 5).map((s) => (
              <button key={s.id} type="button" className="mb-2 flex w-full justify-between rounded-xl border border-line px-3 py-2 text-xs" onClick={() => navigate(`/stores/profile?id=${s.id}`)}>
                <span className="font-bold">{s.name}</span>
                <span>{orders.filter((o) => o.storeId === s.id).length} طلب</span>
              </button>
            ))
          )}
        </div>
        <div className="card p-5">
          <h2 className="mb-4 text-sm font-bold">أكثر المحلات نشاطاً</h2>
          {stores.filter((s) => s.type !== 'مطعم').length === 0 ? (
            <EmptyState title="لا توجد بيانات" hint="ستظهر أعلى 5 محلات." />
          ) : (
            stores.filter((s) => s.type !== 'مطعم').slice(0, 5).map((s) => (
              <button key={s.id} type="button" className="mb-2 flex w-full justify-between rounded-xl border border-line px-3 py-2 text-xs" onClick={() => navigate(`/stores/profile?id=${s.id}`)}>
                <span className="font-bold">{s.name}</span>
                <span>{orders.filter((o) => o.storeId === s.id).length} طلب</span>
              </button>
            ))
          )}
        </div>
      </div>

      <div className="card mt-5 overflow-hidden">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="text-sm font-bold">أحدث الطلبيات</h2>
          <button type="button" className="text-[11px] font-semibold text-mute hover:text-black" onClick={() => navigate('/orders')}>عرض الكل</button>
        </div>
        {orders.slice(0, 10).length === 0 ? (
          <EmptyState title="لا توجد طلبيات بعد" hint="أنشئ طلباً من إدارة الطلبيات لظهوره هنا." />
        ) : (
          <table className="w-full min-w-max text-right text-sm">
            <thead>
              <tr className="border-b border-line bg-page/60 text-[11px] text-mute">
                {['رقم الطلب', 'المحل', 'الكابتن', 'الحالة', 'الوقت'].map((c) => (
                  <th key={c} className="px-4 py-3 font-semibold">{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 10).map((o) => (
                <tr key={o.id} className="cursor-pointer border-b border-line hover:bg-page" onClick={() => navigate(`/orders/details?id=${o.id}`)}>
                  <td className="px-4 py-3 text-xs font-bold">{o.number}</td>
                  <td className="px-4 py-3 text-xs">{o.storeName}</td>
                  <td className="px-4 py-3 text-xs">{o.captainName || '—'}</td>
                  <td className="px-4 py-3"><StatusBadge status={o.status} /></td>
                  <td className="px-4 py-3 text-xs">{formatDate(o.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
