import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, PackageSearch, ChevronLeft } from 'lucide-react'
import { useCaptain } from '../state'

const tabs = ['الكل', 'مكتمل', 'ملغي', 'مرتجع']

export default function Orders() {
  const navigate = useNavigate()
  const { state, money, fmtTime } = useCaptain()
  const [tab, setTab] = useState(0)
  const [q, setQ] = useState('')

  const all = state.orders
  const filtered = all.filter((o) => {
    const match = !q || o.title.includes(q) || o.shopName.includes(q)
    if (!match) return false
    if (tab === 0) return true
    if (tab === 1) return o.stage === 'delivered'
    if (tab === 2) return o.stage === 'canceled'
    if (tab === 3) return o.stage === 'returned' || o.stage === 'awaitRefund' || o.stage === 'refunded'
    return true
  })

  return (
    <div className="px-5 pt-6">
      <h1 className="text-lg font-bold">سجل الطلبات</h1>

      <div className="relative mt-4">
        <Search className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
        <input className="field pr-10" placeholder="ابحث برقم الطلب أو اسم المحل" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
        {tabs.map((t, i) => (
          <button key={t} onClick={() => setTab(i)} className={`shrink-0 rounded-xl px-4 py-2 text-xs font-bold transition-colors ${tab === i ? 'bg-gold text-white' : 'border border-line bg-white text-mute'}`}>{t}</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="card mt-5 flex flex-col items-center gap-3 p-10 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-dashed border-gold bg-page">
            <PackageSearch className="h-6 w-6 text-faint" strokeWidth={1.5} />
          </div>
          <p className="text-sm font-bold">لا توجد طلبات مطابقة</p>
          <p className="max-w-60 text-[11px] leading-relaxed text-mute">سيظهر هنا سجل كامل بجميع طلبياتك المكتملة والملغاة مع تفاصيل كل رحلة.</p>
        </div>
      ) : (
        <div className="card mt-5 divide-y divide-line">
          {filtered.map((o) => (
            <button key={o.id} onClick={() => navigate(`/order?order=${o.id}`)} className="flex w-full items-center gap-3 px-4 py-3.5 text-right">
              <div className="flex-1">
                <p className="text-xs font-bold">{o.title} — {o.shopName}</p>
                <p className="mt-0.5 text-[10px] text-mute">{o.pickupArea} ← {o.dropArea} · {fmtTime(o.createdAt)}</p>
              </div>
              <div className="text-left">
                <span className={`badge ${o.stage === 'delivered' ? 'bg-gold text-white' : o.stage === 'canceled' ? 'border border-gold text-gold-dark' : 'bg-gold-light text-gold-dark'}`}>
                  {o.stage === 'delivered' ? 'مكتمل' : o.stage === 'canceled' ? 'ملغي' : 'مرتجع'}
                </span>
                <p className="mt-1 text-[10px] font-bold text-gold-dark">{o.stage === 'delivered' ? money(o.deliveryFee) : money(0)}</p>
              </div>
              <ChevronLeft className="h-4 w-4 text-faint" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
