import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import DataTable from '../components/DataTable'
import { useDbList } from '../lib/store'
import { formatDate } from '../lib/db'
import { ACTIVE_STATUSES } from '../lib/orders'
import type { Captain, District, OrderItem, StoreItem } from '../lib/types'

export default function AdvancedSearch() {
  const navigate = useNavigate()
  const [q, setQ] = useState({ order: '', cap: '', capPhone: '', store: '', storePhone: '', district: '', status: '', from: '', to: '' })
  const [ran, setRan] = useState(false)
  const captains = useDbList<Captain>('captains').items
  const stores = useDbList<StoreItem>('stores').items
  const districts = useDbList<District>('districts').items
  const orders = useDbList<OrderItem>('orders').items

  const capHits = ran
    ? captains.filter((c) =>
        (!q.cap || c.name.includes(q.cap)) &&
        (!q.capPhone || c.phone.includes(q.capPhone)),
      )
    : []
  const storeHits = ran
    ? stores.filter((s) =>
        (!q.store || s.name.includes(q.store)) &&
        (!q.storePhone || s.phone.includes(q.storePhone)),
      )
    : []
  const orderHits = ran
    ? orders.filter((o) => {
        if (q.order && !o.number.includes(q.order)) return false
        if (q.district && o.districtId !== q.district) return false
        if (q.status === 'مكتمل' && o.status !== 'مكتمل') return false
        if (q.status === 'ملغي' && o.status !== 'ملغي') return false
        if (q.status === 'نشط' && !ACTIVE_STATUSES.includes(o.status)) return false
        if (q.from && o.createdAt.slice(0, 10) < q.from) return false
        if (q.to && o.createdAt.slice(0, 10) > q.to) return false
        if (q.store && !o.storeName.includes(q.store)) return false
        if (q.cap && !o.captainName.includes(q.cap)) return false
        return true
      })
    : []

  return (
    <div>
      <PageHeader title="البحث المتقدم" subtitle="ابحث عن طلب، كابتن، محل أو رقم هاتف عبر فلاتر دقيقة" />

      <div className="card mb-5 p-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold">رقم الطلب</label>
            <input className="field" placeholder="#" value={q.order} onChange={(e) => setQ({ ...q, order: e.target.value })} />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold">اسم الكابتن</label>
            <input className="field" value={q.cap} onChange={(e) => setQ({ ...q, cap: e.target.value })} />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold">رقم هاتف الكابتن</label>
            <input className="field" dir="ltr" value={q.capPhone} onChange={(e) => setQ({ ...q, capPhone: e.target.value })} />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold">اسم المحل / المطعم</label>
            <input className="field" value={q.store} onChange={(e) => setQ({ ...q, store: e.target.value })} />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold">رقم هاتف المحل</label>
            <input className="field" dir="ltr" value={q.storePhone} onChange={(e) => setQ({ ...q, storePhone: e.target.value })} />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold">المنطقة</label>
            <select className="field cursor-pointer" value={q.district} onChange={(e) => setQ({ ...q, district: e.target.value })}>
              <option value="">{districts.length ? 'الكل' : 'لا توجد مناطق معرفة'}</option>
              {districts.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold">حالة الطلب</label>
            <select className="field cursor-pointer" value={q.status} onChange={(e) => setQ({ ...q, status: e.target.value })}>
              <option value="">الكل</option>
              <option>مكتمل</option>
              <option>نشط</option>
              <option>ملغي</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold">من تاريخ</label>
              <input type="date" className="field cursor-pointer" value={q.from} onChange={(e) => setQ({ ...q, from: e.target.value })} />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold">إلى تاريخ</label>
              <input type="date" className="field cursor-pointer" value={q.to} onChange={(e) => setQ({ ...q, to: e.target.value })} />
            </div>
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <button className="btn-primary" onClick={() => setRan(true)}>
            <Search className="h-4 w-4" /> بحث
          </button>
          <button className="btn-ghost" onClick={() => { setQ({ order: '', cap: '', capPhone: '', store: '', storePhone: '', district: '', status: '', from: '', to: '' }); setRan(false) }}>مسح الفلاتر</button>
        </div>
      </div>

      <DataTable
        columns={['النتيجة', 'النوع', 'الحالة', 'المنطقة', 'التاريخ', 'الإجراءات']}
        rows={[
          ...orderHits.map((o) => ({
            key: o.id,
            onClick: () => navigate(`/orders/details?id=${o.id}`),
            cells: [o.number, 'طلب', o.status, o.districtName, formatDate(o.createdAt), 'فتح'],
          })),
          ...capHits.map((c) => ({
            key: c.id,
            onClick: () => navigate(`/captains/profile?id=${c.id}`),
            cells: [c.name, 'كابتن', c.status, '—', '—', 'فتح'],
          })),
          ...storeHits.map((s) => ({
            key: s.id,
            onClick: () => navigate(`/stores/profile?id=${s.id}`),
            cells: [s.name, 'محل', s.status, '—', '—', 'فتح'],
          })),
        ]}
        emptyIcon={Search}
        emptyTitle="لا توجد نتائج مطابقة"
        emptyHint="حدد الفلاتر واضغط بحث — تظهر النتائج مقسمة: طلبات، كباتن، محلات."
      />
    </div>
  )
}
