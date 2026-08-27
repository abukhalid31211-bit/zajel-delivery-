import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, PackageSearch, ChevronLeft } from 'lucide-react'
import EmptyState from '../components/EmptyState'
import { useStore } from '../lib/StoreContext'
import { STATUS_META, fmtDateTime, fmtIQD } from '../lib/data'

const tabs = ['الكل', 'نشطة', 'مكتملة', 'ملغاة'] as const

export default function Orders() {
  const navigate = useNavigate()
  const { orders } = useStore()
  const [tab, setTab] = useState<(typeof tabs)[number]>('الكل')
  const [query, setQuery] = useState('')
  const [period, setPeriod] = useState<'all' | 'today' | 'week'>('all')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const now = Date.now()
    return orders
      .filter((o) => {
        if (tab === 'نشطة') return ['searching', 'assigned', 'heading', 'arrived', 'picked_up', 'on_way', 'delivered'].includes(o.status)
        if (tab === 'مكتملة') return ['completed', 'delivered'].includes(o.status)
        if (tab === 'ملغاة') return ['cancelled', 'returned'].includes(o.status)
        return true
      })
      .filter((o) => {
        if (period === 'today') return new Date(o.createdAt).toDateString() === new Date().toDateString()
        if (period === 'week') return now - new Date(o.createdAt).getTime() < 7 * 86400000
        return true
      })
      .filter((o) => {
        if (!q) return true
        return (
          o.id.toLowerCase().includes(q) ||
          o.customer.name.toLowerCase().includes(q) ||
          o.customer.phone.includes(query.trim()) ||
          (o.captain?.name.toLowerCase().includes(q) ?? false)
        )
      })
  }, [orders, tab, query, period])

  return (
    <div className="px-5 pt-6">
      <h1 className="text-lg font-extrabold">سجل الطلبات</h1>

      <div className="relative mt-4">
        <Search className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
        <input
          className="field pr-10"
          placeholder="ابحث برقم الطلب أو اسم الزبون أو الهاتف"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`shrink-0 rounded-xl px-4 py-2 text-xs font-bold transition-colors ${
              tab === t ? 'bg-gold text-white shadow shadow-gold/25' : 'border border-line bg-white text-mute'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="mt-3 flex items-center justify-between">
        <p className="text-[11px] font-bold text-faint">{filtered.length} طلب</p>
        <div className="flex gap-1.5">
          {([
            ['all', 'الكل'],
            ['today', 'اليوم'],
            ['week', '7 أيام'],
          ] as const).map(([k, l]) => (
            <button
              key={k}
              onClick={() => setPeriod(k)}
              className={`rounded-lg px-2.5 py-1.5 text-[10px] font-bold ${period === k ? 'bg-gold-faint text-gold-deep' : 'text-faint'}`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="mt-5">
          <EmptyState
            icon={PackageSearch}
            title="لا توجد طلبات مطابقة"
            desc={
              orders.length === 0
                ? 'سيظهر هنا سجل كامل بجميع طلبياتك مع الحالة والكابتن والقيمة والأجرة وتاريخ كل طلب.'
                : 'جرّب تغيير الفلاتر أو كلمة البحث.'
            }
          />
        </div>
      ) : (
        <div className="mt-4 space-y-3 pb-6">
          {filtered.map((o) => {
            const meta = STATUS_META[o.status]
            return (
              <button key={o.id} onClick={() => navigate(`/order-details?id=${o.id}`)} className="card w-full p-4 text-right transition-transform active:scale-[0.99]">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-extrabold">{o.id}</p>
                    <span className={`badge ${meta.cls}`}>{meta.emoji} {meta.label}</span>
                  </div>
                  <ChevronLeft className="h-4 w-4 text-faint" />
                </div>
                <div className="mt-2.5 grid grid-cols-2 gap-x-4 gap-y-1.5 text-[11px] text-mute">
                  <span>الزبون: <b className="text-ink">{o.customer.name}</b></span>
                  <span>الكابتن: <b className="text-ink">{o.captain?.name ?? '—'}</b></span>
                  <span>القيمة: <b className="text-ink">{fmtIQD(o.value)}</b></span>
                  <span>الأجرة: <b className="text-ink">{fmtIQD(o.fee)}</b></span>
                </div>
                <p className="mt-2 border-t border-line pt-2 text-[10px] text-faint">{fmtDateTime(o.createdAt)}</p>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
