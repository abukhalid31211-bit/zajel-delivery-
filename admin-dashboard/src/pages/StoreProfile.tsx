import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Store, Package, BarChart3, Star, FileClock, Phone, MapPin, Ban, CheckCircle2 } from 'lucide-react'
import Modal from '../components/Modal'
import { useToast } from '../components/Toast'
import DataTable from '../components/DataTable'
import EmptyState from '../components/EmptyState'
import StatusBadge from '../components/StatusBadge'
import MapCanvas from '../components/MapCanvas'
import { useDbList, logAudit } from '../lib/store'
import { formatDate } from '../lib/db'
import type { AuditEntry, District, Governorate, StoreItem } from '../lib/types'

const tabs = [
  { label: 'الطلبات', icon: Package },
  { label: 'التقارير', icon: BarChart3 },
  { label: 'التقييمات', icon: Star },
  { label: 'سجل الإجراءات', icon: FileClock },
]

export default function StoreProfile() {
  const { toast, node } = useToast()
  const [params] = useSearchParams()
  const stores = useDbList<StoreItem>('stores')
  const store = stores.items.find((s) => s.id === params.get('id'))
  const govs = useDbList<Governorate>('governorates')
  const districts = useDbList<District>('districts')
  const audit = useDbList<AuditEntry>('audit')
  const [tab, setTab] = useState(0)
  const [modal, setModal] = useState<'approve' | 'suspend' | null>(null)
  const [reason, setReason] = useState('')
  const name = store?.name || '— اسم المحل'

  return (
    <div>
      <div className="mb-4 flex items-center gap-2 text-[11px] text-faint">
        <Link to="/stores" className="hover:text-black">المحلات والمطاعم</Link>
        <span>›</span>
        <span className="font-semibold text-black">{name}</span>
      </div>

      <div className="card mb-5 p-5">
        <div className="flex flex-wrap items-center gap-5">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-black text-white">
            <Store className="h-9 w-9" strokeWidth={1.4} />
          </div>
          <div className="min-w-40 flex-1">
            <h1 className="text-lg font-bold">{name}</h1>
            <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-mute">
              <span>النوع: {store?.type || '—'}</span>
              <a className="flex items-center gap-1 hover:text-black" href={store ? `tel:+964${store.phone}` : undefined}><Phone className="h-3.5 w-3.5" /> +964 {store?.phone || '—'}</a>
              <span>المالك: {store?.owner || '—'}</span>
              <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {govs.items.find((g) => g.id === store?.govId)?.name || '—'} / {districts.items.find((d) => d.id === store?.districtId)?.name || '—'}</span>
              <span>العنوان: {store?.address || '—'}</span>
              <span>تاريخ التسجيل: {formatDate(store?.createdAt)}</span>
            </div>
            <div className="mt-2"><StatusBadge status={store?.status || 'بانتظار الموافقة'} /></div>
          </div>
          <div className="flex flex-wrap gap-2">
            {(!store || store.status === 'بانتظار الموافقة') && (
              <button className="btn-primary" onClick={() => setModal('approve')}><CheckCircle2 className="h-4 w-4" /> موافقة</button>
            )}
            {store?.status === 'نشط' && (
              <button className="btn-ghost" onClick={() => setModal('suspend')}><Ban className="h-4 w-4" /> إيقاف</button>
            )}
            {store?.status === 'موقوف' && (
              <button className="btn-primary" onClick={() => {
                stores.setItems((p) => p.map((x) => (x.id === store.id ? { ...x, status: 'نشط' } : x)))
                toast('تم تفعيل المحل')
              }}>🔄 تفعيل</button>
            )}
          </div>
        </div>
        <div className="mt-4">
          <MapCanvas points={[]} onChange={() => undefined} tools={false} height={144} hint="📍 خريطة مصغرة بموقع المحل" />
        </div>
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        {tabs.map((t, i) => (
          <button
            key={t.label}
            onClick={() => setTab(i)}
            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-[11px] font-semibold transition-colors ${
              tab === i ? 'bg-black text-white' : 'border border-line bg-white text-mute hover:bg-page'
            }`}
          >
            <t.icon className="h-3.5 w-3.5" /> {t.label}
          </button>
        ))}
      </div>

      {tab === 0 && (
        <DataTable
          columns={['رقم الطلب', 'الزبون', 'الكابتن', 'الحالة', 'القيمة', 'الأجرة', 'التاريخ']}
          emptyIcon={Package}
          emptyTitle="لا توجد طلبيات لهذا المحل"
          emptyHint="تظهر هنا جميع طلبيات المحل مع تفاصيلها الكاملة."
        />
      )}

      {tab === 1 && (
        <div>
          <div className="mb-5 grid grid-cols-2 gap-4 md:grid-cols-5">
            {['إجمالي الطلبات', 'المكتملة', 'الملغاة', 'متوسط قيمة الطلب', 'إجمالي أجور التوصيل'].map((l) => (
              <div key={l} className="card p-4">
                <p className="text-[11px] font-medium text-mute">{l}</p>
                <p className="mt-1.5 text-xl font-bold">—</p>
              </div>
            ))}
          </div>
          <div className="card p-5">
            <h2 className="mb-3 text-sm font-bold">الطلبيات خلال آخر 30 يوماً</h2>
            <div className="flex h-40 items-end gap-1 border-b border-line">
              {Array.from({ length: 30 }).map((_, i) => (
                <div key={i} className="flex-1 rounded-t-sm bg-page" style={{ height: 4 }} />
              ))}
            </div>
            <p className="mt-4 text-center text-[11px] text-faint">لا توجد بيانات بعد</p>
          </div>
        </div>
      )}

      {tab === 2 && (
        <div className="card p-5">
          <EmptyState icon={Star} title="لا توجد تقييمات" hint="التقييمات التي منحها هذا المحل للكباتن تُعرض هنا مع رقم الطلب المرتبط." />
        </div>
      )}

      {tab === 3 && (
        <DataTable
          columns={['التاريخ والوقت', 'الإجراء', 'من قام به', 'التفاصيل']}
          rows={audit.items.filter((a) => !store || a.entity === store.name).map((a) => ({
            key: a.id,
            cells: [formatDate(a.at), a.action, a.admin, a.details],
          }))}
          emptyIcon={FileClock}
          emptyTitle="لا توجد إجراءات مسجلة"
          emptyHint='مثال البنية: "تسجيل المحل — النظام التلقائي"، "موافقة — [اسم الأدمن]"...'
        />
      )}

      {modal === 'approve' && (
        <Modal title="الموافقة على المحل" onClose={() => setModal(null)}>
          <p className="mt-2 text-xs leading-relaxed text-mute">سيتم تفعيل حساب المحل ويمكنه إنشاء الطلبيات فوراً.</p>
          <div className="mt-4 flex gap-2">
            <button className="btn-primary flex-1" onClick={() => {
              if (store) stores.setItems((p) => p.map((x) => (x.id === store.id ? { ...x, status: 'نشط' } : x)))
              logAudit({ action: 'موافقة', entity: name, details: 'تفعيل محل', oldValue: 'بانتظار', newValue: 'نشط' })
              setModal(null)
              toast('تمت الموافقة على المحل ✅')
            }}>تأكيد</button>
            <button className="btn-ghost flex-1" onClick={() => setModal(null)}>إلغاء</button>
          </div>
        </Modal>
      )}

      {modal === 'suspend' && (
        <Modal title="إيقاف المحل" onClose={() => setModal(null)}>
          <textarea className="field mt-4 min-h-20 resize-none" placeholder="سبب الإيقاف (مطلوب)" value={reason} onChange={(e) => setReason(e.target.value)} />
          <div className="mt-4 flex gap-2">
            <button className="btn-primary flex-1" disabled={!reason.trim()} onClick={() => {
              if (store) stores.setItems((p) => p.map((x) => (x.id === store.id ? { ...x, status: 'موقوف' } : x)))
              logAudit({ action: 'إيقاف حساب', entity: name, details: reason, oldValue: 'نشط', newValue: 'موقوف' })
              setModal(null)
              setReason('')
              toast('تم إيقاف المحل 🚫')
            }}>إيقاف</button>
            <button className="btn-ghost flex-1" onClick={() => setModal(null)}>إلغاء</button>
          </div>
        </Modal>
      )}

      {node}
    </div>
  )
}
