import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Store, UserPlus, FileEdit, Eye } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import FilterBar, { emptyFilters, sel, type Filters } from '../components/FilterBar'
import { SkeletonTable } from '../components/Skeleton'
import DataTable from '../components/DataTable'
import Modal from '../components/Modal'
import StatusBadge from '../components/StatusBadge'
import { useToast } from '../components/Toast'
import { useDbList, logAudit, STORE_TYPES } from '../lib/store'
import { formatDate, uid, nowIso } from '../lib/db'
import { can, inGeoScope } from '../lib/rbac'
import type { District, Governorate, OrderItem, StoreChange, StoreItem } from '../lib/types'

const tabKeys = ['list', 'pending', 'changes']

export default function Stores() {
  const [params, setParams] = useSearchParams()
  const tab = Math.max(0, tabKeys.indexOf(params.get('tab') || 'list'))
  const setTab = (i: number) => setParams(i === 0 ? {} : { tab: tabKeys[i] })
  const navigate = useNavigate()
  const stores = useDbList<StoreItem>('stores')
  const changes = useDbList<StoreChange>('storeChanges')
  const govs = useDbList<Governorate>('governorates')
  const districts = useDbList<District>('districts')
  const [reject, setReject] = useState<StoreItem | StoreChange | null>(null)
  const [reason, setReason] = useState('')
  const [add, setAdd] = useState(false)
  const [form, setForm] = useState({ name: '', type: STORE_TYPES[0], phone: '', owner: '', address: '', govId: '', districtId: '' })
  const { toast, node } = useToast()
  const [filters, setFilters] = useState<Filters>(emptyFilters())
  const [loading, setLoading] = useState(false)
  const orders = useDbList<OrderItem>('orders').items

  const list = useMemo(() => {
    let rows = stores.items.filter((s) => inGeoScope(s.govId))
    if (tab === 1) rows = rows.filter((s) => s.status === 'بانتظار الموافقة')
    if (filters.q.trim()) rows = rows.filter((s) => `${s.name} ${s.phone}`.includes(filters.q.trim()))
    const ty = sel(filters, 'النوع')
    if (ty) rows = rows.filter((s) => s.type === ty)
    const st = sel(filters, 'الحالة')
    if (st) rows = rows.filter((s) => s.status === st)
    const gname = sel(filters, 'المحافظة')
    if (gname) rows = rows.filter((s) => govs.items.find((g) => g.id === s.govId)?.name === gname)
    const dname = sel(filters, 'المنطقة')
    if (dname) rows = rows.filter((s) => districts.items.find((d) => d.id === s.districtId)?.name === dname)
    return rows
  }, [stores.items, tab, filters, govs.items, districts.items])

  return (
    <div>
      <PageHeader
        title="المحلات والمطاعم"
        subtitle="إدارة حسابات المحلات، الموافقات، ومراجعة التعديلات الحساسة"
        actions={
          <>
            <button className="btn-ghost" onClick={() => navigate('/stores/profile')}>👁️ معاينة ملف المحل</button>
            {can('المحلات', 'إضافة') && <button className="btn-primary" onClick={() => setAdd(true)}>+ تسجيل محل يدوياً</button>}
          </>
        }
      />

      <div className="mb-5 flex flex-wrap gap-2">
        {[
          { label: 'قائمة المحلات', icon: Store },
          { label: 'طلبات التسجيل الجديدة', icon: UserPlus },
          { label: 'طلبات تعديل البيانات', icon: FileEdit },
        ].map((t, i) => (
          <button
            key={t.label}
            onClick={() => setTab(i)}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-colors ${
              tab === i ? 'bg-black text-white' : 'border border-line bg-white text-mute hover:bg-page'
            }`}
          >
            <t.icon className="h-3.5 w-3.5" /> {t.label}
          </button>
        ))}
      </div>

      {tab === 0 && (
        <>
          <FilterBar
            searchPlaceholder="ابحث بالاسم أو رقم الهاتف..."
            selects={[
              { label: 'النوع', options: STORE_TYPES },
              { label: 'الحالة', options: ['نشط', 'بانتظار الموافقة', 'موقوف'] },
              { label: 'المحافظة', options: govs.items.map((g) => g.name) },
              { label: 'المنطقة', options: districts.items.map((d) => d.name) },
            ]}
            onChange={setFilters}
            onSearch={() => { setLoading(true); window.setTimeout(() => setLoading(false), 280) }}
            onReset={() => setFilters(emptyFilters())}
          />
          {loading ? <SkeletonTable cols={8} /> : <DataTable
            columns={['اسم المحل', 'النوع', 'رقم الهاتف', 'المحافظة', 'المنطقة', 'الحالة', 'طلبيات اليوم', 'الإجراءات']}
            rows={list.map((s) => ({
              key: s.id,
              onClick: () => navigate(`/stores/profile?id=${s.id}`),
              cells: [
                s.name,
                s.type,
                s.phone,
                govs.items.find((g) => g.id === s.govId)?.name || '—',
                districts.items.find((d) => d.id === s.districtId)?.name || '—',
                <StatusBadge status={s.status} />,
                String(orders.filter((o) => o.storeId === s.id && o.createdAt.slice(0, 10) === new Date().toISOString().slice(0, 10)).length),
                <span className="flex gap-1">
                  <button className="btn-ghost px-2 py-1" onClick={() => navigate(`/stores/profile?id=${s.id}`)}><Eye className="h-3.5 w-3.5" /></button>
                  {s.status === 'بانتظار الموافقة' && can('المحلات', 'موافقة') && (
                    <>
                      <button className="btn-primary px-2 py-1 text-[10px]" onClick={() => {
                        stores.setItems((p) => p.map((x) => (x.id === s.id ? { ...x, status: 'نشط' } : x)))
                        logAudit({ action: 'موافقة', entity: s.name, details: 'موافقة محل', oldValue: 'بانتظار', newValue: 'نشط' })
                        toast('تمت الموافقة على المحل')
                      }}>موافقة</button>
                      <button className="btn-ghost px-2 py-1 text-[10px]" onClick={() => setReject(s)}>رفض</button>
                    </>
                  )}
                  {s.status === 'نشط' && (
                    <button className="btn-ghost px-2 py-1 text-[10px]" onClick={() => {
                      stores.setItems((p) => p.map((x) => (x.id === s.id ? { ...x, status: 'موقوف' } : x)))
                      toast('تم إيقاف المحل')
                    }}>إيقاف</button>
                  )}
                  {s.status === 'موقوف' && (
                    <button className="btn-secondary px-2 py-1 text-[10px]" onClick={() => {
                      stores.setItems((p) => p.map((x) => (x.id === s.id ? { ...x, status: 'نشط' } : x)))
                      toast('تم تفعيل المحل')
                    }}>تفعيل</button>
                  )}
                </span>,
              ],
            }))}
            emptyIcon={Store}
            emptyTitle="لا توجد محلات مسجلة بعد"
            emptyHint="ستظهر حسابات المحلات والمطاعم هنا فور تسجيلها عبر تطبيق المحل."
          />}
        </>
      )}

      {tab === 1 && (
        <DataTable
          columns={['اسم المحل', 'نوع النشاط', 'صاحب المحل', 'رقم الهاتف', 'المحافظة', 'تاريخ التقديم', 'الإجراءات']}
          rows={list.map((s) => ({
            key: s.id,
            cells: [
              s.name,
              s.type,
              s.owner,
              s.phone,
              govs.items.find((g) => g.id === s.govId)?.name || '—',
              formatDate(s.createdAt),
              <span className="flex gap-1">
                <button className="btn-primary px-2 py-1 text-[10px]" onClick={() => {
                  stores.setItems((p) => p.map((x) => (x.id === s.id ? { ...x, status: 'نشط' } : x)))
                  toast('تمت الموافقة على المحل')
                }}>موافقة</button>
                <button className="btn-ghost px-2 py-1 text-[10px]" onClick={() => setReject(s)}>رفض</button>
              </span>,
            ],
          }))}
          emptyIcon={UserPlus}
          emptyTitle="لا توجد طلبات تسجيل جديدة"
          emptyHint="طلبات انضمام المحلات الجديدة ستظهر هنا للمراجعة والموافقة أو الرفض."
        />
      )}

      {tab === 2 && (
        <DataTable
          columns={['اسم المحل', 'الحقل المعدل', 'القيمة السابقة', 'القيمة المقترحة', 'تاريخ الطلب', 'الإجراءات']}
          rows={changes.items.map((c) => ({
            key: c.id,
            cells: [
              stores.items.find((s) => s.id === c.storeId)?.name || '—',
              c.field,
              c.oldValue,
              c.newValue,
              formatDate(c.createdAt),
              c.status === 'معلق' ? (
                <span className="flex gap-1">
                  <button className="btn-primary px-2 py-1 text-[10px]" onClick={() => {
                    changes.setItems((p) => p.map((x) => (x.id === c.id ? { ...x, status: 'مقبول' } : x)))
                    toast('تمت الموافقة وتحديث البيانات')
                  }}>موافقة وتحديث</button>
                  <button className="btn-ghost px-2 py-1 text-[10px]" onClick={() => setReject(c)}>رفض التعديل</button>
                </span>
              ) : (
                <StatusBadge status={c.status === 'مقبول' ? 'نشط' : 'مرفوض'} />
              ),
            ],
          }))}
          emptyIcon={FileEdit}
          emptyTitle="لا توجد طلبات تعديل معلقة"
          emptyHint="التعديلات الحساسة (رقم الهاتف، الموقع الجغرافي، نوع النشاط، اسم المالك) تتطلب موافقة إدارية وتظهر هنا."
        />
      )}

      {add && (
        <Modal title="تسجيل محل يدوياً" onClose={() => setAdd(false)} wide>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <input className="field" placeholder="اسم المحل" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <select className="field cursor-pointer" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              {STORE_TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
            <input className="field" placeholder="رقم الهاتف" dir="ltr" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <input className="field" placeholder="اسم صاحب المحل" value={form.owner} onChange={(e) => setForm({ ...form, owner: e.target.value })} />
            <input className="field sm:col-span-2" placeholder="العنوان التفصيلي" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            <select className="field cursor-pointer" value={form.govId} onChange={(e) => setForm({ ...form, govId: e.target.value })}>
              <option value="">المحافظة</option>
              {govs.items.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
            <select className="field cursor-pointer" value={form.districtId} onChange={(e) => setForm({ ...form, districtId: e.target.value })}>
              <option value="">المنطقة</option>
              {districts.items.filter((d) => !form.govId || d.govId === form.govId).map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              className="btn-primary flex-1"
              disabled={!form.name.trim()}
              onClick={() => {
                stores.setItems((p) => [...p, { id: uid(), ...form, status: 'بانتظار الموافقة', createdAt: nowIso() }])
                setAdd(false)
                toast('تم إنشاء طلب تسجيل المحل')
              }}
            >
              حفظ
            </button>
            <button className="btn-ghost flex-1" onClick={() => setAdd(false)}>إلغاء</button>
          </div>
        </Modal>
      )}

      {reject && (
        <Modal title={'storeId' in reject ? 'رفض التعديل' : 'رفض المحل'} onClose={() => setReject(null)}>
          <textarea className="field mt-4 min-h-20 resize-none" placeholder="سبب الرفض (مطلوب)" value={reason} onChange={(e) => setReason(e.target.value)} />
          <div className="mt-4 flex gap-2">
            <button
              className="btn-primary flex-1"
              disabled={!reason.trim()}
              onClick={() => {
                if ('storeId' in reject) {
                  changes.setItems((p) => p.map((x) => (x.id === reject.id ? { ...x, status: 'مرفوض' } : x)))
                } else {
                  stores.setItems((p) => p.map((x) => (x.id === reject.id ? { ...x, status: 'موقوف' } : x)))
                }
                setReject(null)
                setReason('')
                toast('تم الرفض وإرسال السبب')
              }}
            >
              تأكيد الرفض
            </button>
            <button className="btn-ghost flex-1" onClick={() => setReject(null)}>إلغاء</button>
          </div>
        </Modal>
      )}
      {node}
    </div>
  )
}
