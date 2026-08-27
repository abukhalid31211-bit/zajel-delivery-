import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Package, AlertTriangle, Plus } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import FilterBar, { emptyFilters, inDateRange, sel, type Filters } from '../components/FilterBar'
import DataTable from '../components/DataTable'
import Modal from '../components/Modal'
import StatusBadge from '../components/StatusBadge'
import { SkeletonTable } from '../components/Skeleton'
import { useToast } from '../components/Toast'
import { getSettings } from '../lib/settings'
import { logAudit, ORDER_STATUSES, useDbList } from '../lib/store'
import { uid, nowIso, formatDate } from '../lib/db'
import { can, inGeoScope } from '../lib/rbac'
import { ACTIVE_STATUSES, isStuck, shouldAutoCancel, waitMinutes } from '../lib/orders'
import { overrideFor } from '../lib/pricing'
import type { Captain, District, Governorate, OrderItem, StoreItem } from '../lib/types'

const tabs = [
  { key: 'all', label: 'الكل' },
  { key: 'active', label: 'نشطة' },
  { key: 'done', label: 'مكتملة' },
  { key: 'canceled', label: 'ملغاة' },
  { key: 'stuck', label: 'عالقة ⚠️' },
]

const DRAFT = 'zajel_order_draft'

export default function Orders() {
  const [params, setParams] = useSearchParams()
  const tabKey = params.get('tab') || 'all'
  const tab = Math.max(0, tabs.findIndex((t) => t.key === tabKey))
  const navigate = useNavigate()
  const settings = getSettings()
  const { toast, node } = useToast()
  const orders = useDbList<OrderItem>('orders')
  const stores = useDbList<StoreItem>('stores').items.filter((s) => s.status === 'نشط' || s.status === 'بانتظار الموافقة')
  const captains = useDbList<Captain>('captains').items
  const govs = useDbList<Governorate>('governorates').items
  const districts = useDbList<District>('districts').items
  const [filters, setFilters] = useState<Filters>(emptyFilters())
  const [loading, setLoading] = useState(false)
  const [tick, setTick] = useState(0)
  const [create, setCreate] = useState(false)
  const [form, setForm] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem(DRAFT) || 'null') || {
        storeId: '',
        customerName: '',
        customerPhone: '',
        districtId: '',
        value: '',
        fee: '',
        notes: '',
        status: 'بانتظار كابتن',
        waitOffset: '0',
      }
    } catch {
      return { storeId: '', customerName: '', customerPhone: '', districtId: '', value: '', fee: '', notes: '', status: 'بانتظار كابتن', waitOffset: '0' }
    }
  })

  useEffect(() => {
    const id = window.setInterval(() => setTick((n) => n + 1), 1000)
    return () => window.clearInterval(id)
  }, [])

  useEffect(() => {
    const due = orders.items.filter((o) => shouldAutoCancel(o.status, o.waitingStartedAt))
    if (!due.length) return
    orders.setItems((p) =>
      p.map((o) =>
        shouldAutoCancel(o.status, o.waitingStartedAt)
          ? {
              ...o,
              status: 'ملغي',
              timeline: [...o.timeline, { at: nowIso(), text: 'إلغاء تلقائي بعد 20 دقيقة بدون كابتن' }],
            }
          : o,
      ),
    )
    toast(`أُلغي تلقائياً ${due.length} طلب عالق`)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick])

  const scoped = orders.items.filter((o) => inGeoScope(o.govId))

  const visible = useMemo(() => {
    let list = scoped
    if (tabKey === 'active') list = list.filter((o) => ACTIVE_STATUSES.includes(o.status))
    if (tabKey === 'done') list = list.filter((o) => o.status === 'مكتمل')
    if (tabKey === 'canceled') list = list.filter((o) => o.status === 'ملغي')
    if (tabKey === 'stuck') list = list.filter((o) => isStuck(o.status, o.waitingStartedAt))
    const q = filters.q.trim()
    if (q) list = list.filter((o) => `${o.number} ${o.storeName} ${o.customerName} ${o.captainName}`.includes(q))
    const st = sel(filters, 'الحالة')
    if (st) list = list.filter((o) => o.status === st)
    const dist = sel(filters, 'المنطقة')
    if (dist) list = list.filter((o) => o.districtName === dist)
    const shop = sel(filters, 'المحل')
    if (shop) list = list.filter((o) => o.storeName === shop)
    const cap = sel(filters, 'الكابتن')
    if (cap) list = list.filter((o) => o.captainName === cap)
    list = list.filter((o) => inDateRange(o.createdAt, filters))
    return list
  }, [scoped, tabKey, filters])

  const stuckCount = scoped.filter((o) => isStuck(o.status, o.waitingStartedAt)).length

  const saveDraft = (next: typeof form) => {
    setForm(next)
    sessionStorage.setItem(DRAFT, JSON.stringify(next))
  }

  const createOrder = () => {
    if (!navigator.onLine) return toast('لا يوجد اتصال بالإنترنت')
    const store = stores.find((s) => s.id === form.storeId)
    if (!store) return toast('اختر محلاً')
    if (!form.customerName.trim()) return toast('اسم الزبون مطلوب')
    const dist = districts.find((d) => d.id === form.districtId)
    const offset = Number(form.waitOffset || 0)
    const waitingStartedAt = form.status === 'بانتظار كابتن' ? new Date(Date.now() - offset * 60000).toISOString() : undefined
    const number = `Z${String(orders.items.length + 1).padStart(4, '0')}`
    const item: OrderItem = {
      id: uid(),
      number,
      storeId: store.id,
      storeName: store.name,
      customerName: form.customerName.trim(),
      customerPhone: form.customerPhone,
      govId: store.govId,
      districtId: form.districtId,
      districtName: dist?.name || '—',
      captainId: '',
      captainName: '',
      status: form.status,
      value: form.value || '0',
      fee: form.fee || '0',
      notes: form.notes,
      createdAt: nowIso(),
      waitingStartedAt,
      attempts: form.status === 'بانتظار كابتن' ? 1 : 0,
      timeline: [{ at: nowIso(), text: `إنشاء الطلب بواسطة الإدارة — ${store.name}` }],
    }
    orders.setItems((p) => [item, ...p])
    logAudit({ action: 'إضافة', entity: number, details: 'إنشاء طلب من اللوحة', oldValue: '—', newValue: form.status })
    sessionStorage.removeItem(DRAFT)
    setCreate(false)
    toast(`تم إنشاء الطلب ${number}`)
    navigate(`/orders/details?id=${item.id}`)
  }

  return (
    <div>
      <PageHeader
        title={tab === 4 ? 'الطلبيات العالقة ⚠️' : 'إدارة الطلبيات'}
        subtitle="مراقبة وإدارة جميع طلبيات التوصيل في النظام لحظة بلحظة"
        actions={
          can('الطلبيات', 'إضافة') && !settings.maintenance ? (
            <button className="btn-primary" onClick={() => setCreate(true)}>
              <Plus className="h-4 w-4" /> إنشاء طلب
            </button>
          ) : undefined
        }
      />

      <div className="mb-5 flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setParams(t.key === 'all' ? {} : { tab: t.key })}
            className={`rounded-xl px-4 py-2 text-xs font-semibold transition-colors ${
              tabKey === t.key ? 'bg-black text-white' : 'border border-line bg-white text-mute hover:bg-page'
            }`}
          >
            {t.label}
            {t.key === 'stuck' && stuckCount > 0 ? ` (${stuckCount})` : ''}
          </button>
        ))}
      </div>

      <FilterBar
        searchPlaceholder="رقم الطلب..."
        selects={[
          { label: 'الحالة', options: ORDER_STATUSES },
          { label: 'المحافظة', options: govs.map((g) => g.name) },
          { label: 'المنطقة', options: districts.map((d) => d.name) },
          { label: 'المحل', options: stores.map((s) => s.name) },
          { label: 'الكابتن', options: captains.map((c) => c.name) },
        ]}
        withDate
        onChange={setFilters}
        onSearch={() => {
          setLoading(true)
          window.setTimeout(() => setLoading(false), 280)
        }}
        onReset={() => setFilters(emptyFilters())}
      />

      {tab === 4 && (
        <div className="card mb-5 flex items-center gap-3 border-dashed p-4">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <p className="text-xs leading-relaxed text-mute">
            <span className="font-bold text-black">الطلبيات العالقة:</span> بدون كابتن منذ أكثر من {settings.stuckAlertMin} دقيقة.
            تنبيه عند {settings.stuckAlertMin} د، وإلغاء تلقائي عند الدقيقة 20.
            {stuckCount > 0 && <span className="font-bold text-black"> — يوجد {stuckCount} طلب يحتاج تدخلاً فورياً.</span>}
          </p>
        </div>
      )}

      {loading ? (
        <SkeletonTable cols={tab === 4 ? 6 : 8} />
      ) : (
        <DataTable
          columns={
            tab === 4
              ? ['رقم الطلب', 'المحل', 'المنطقة', 'مدة الانتظار', 'المحاولات', 'الإجراءات']
              : ['رقم الطلب', 'المحل', 'الزبون', 'الكابتن', 'المنطقة', 'القيمة', 'الأجرة', 'الحالة', 'الوقت', 'الإجراءات']
          }
          rows={visible.map((o) => {
            const wait = waitMinutes(o.waitingStartedAt)
            return {
              key: o.id,
              onClick: () => navigate(`/orders/details?id=${o.id}`),
              cells:
                tab === 4
                  ? [
                      o.number,
                      o.storeName,
                      o.districtName,
                      <span className={wait >= 15 ? 'font-bold' : ''}>{wait} د</span>,
                      String(o.attempts),
                      <span className="flex gap-1">
                        {can('الطلبيات', 'تعديل') && (
                          <button className="btn-secondary px-2 py-1 text-[10px]" onClick={() => navigate(`/orders/details?id=${o.id}`)}>تعيين</button>
                        )}
                      </span>,
                    ]
                  : [
                      o.number,
                      o.storeName,
                      o.customerName,
                      o.captainName || '—',
                      o.districtName,
                      `${o.value} د.ع`,
                      `${o.fee} د.ع`,
                      <StatusBadge status={o.status} />,
                      formatDate(o.createdAt),
                      <button className="btn-ghost px-2 py-1 text-[10px]" onClick={() => navigate(`/orders/details?id=${o.id}`)}>تفاصيل</button>,
                    ],
            }
          })}
          emptyIcon={Package}
          emptyTitle={tab === 4 ? 'لا توجد طلبيات عالقة حالياً' : 'لا توجد طلبيات لعرضها'}
          emptyHint="أنشئ طلباً من الزر أعلاه لتجربة التفاصيل والتعيين والتسوية. بدون بيانات وهمية جاهزة."
        />
      )}

      {create && (
        <Modal title="إنشاء طلب" onClose={() => setCreate(false)} wide>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <select
              className="field cursor-pointer"
              value={form.storeId}
              onChange={(e) => {
                const custom = overrideFor(e.target.value)
                saveDraft({ ...form, storeId: e.target.value, fee: custom ? custom.fee : form.fee })
              }}
            >
              <option value="">{stores.length ? 'اختر المحل' : 'أضف محلاً أولاً من صفحة المحلات'}</option>
              {stores.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            <select className="field cursor-pointer" value={form.districtId} onChange={(e) => saveDraft({ ...form, districtId: e.target.value })}>
              <option value="">{districts.length ? 'المنطقة' : 'أضف منطقة أولاً'}</option>
              {districts.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
            <input className="field" placeholder="اسم الزبون" value={form.customerName} onChange={(e) => saveDraft({ ...form, customerName: e.target.value })} />
            <input className="field" dir="ltr" placeholder="هاتف الزبون" value={form.customerPhone} onChange={(e) => saveDraft({ ...form, customerPhone: e.target.value })} />
            <input className="field" placeholder="قيمة الطلب (د.ع)" value={form.value} onChange={(e) => saveDraft({ ...form, value: e.target.value.replace(/[^\d]/g, '') })} />
            <input className="field" placeholder="أجرة التوصيل (د.ع)" value={form.fee} onChange={(e) => saveDraft({ ...form, fee: e.target.value.replace(/[^\d]/g, '') })} />
            <select className="field cursor-pointer" value={form.status} onChange={(e) => saveDraft({ ...form, status: e.target.value })}>
              {ORDER_STATUSES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
            <input className="field" placeholder="بدأت الانتظار منذ (دقيقة) — لاختبار العالق" value={form.waitOffset} onChange={(e) => saveDraft({ ...form, waitOffset: e.target.value.replace(/[^\d]/g, '') })} />
            <textarea className="field min-h-16 sm:col-span-2" placeholder="ملاحظات" value={form.notes} onChange={(e) => saveDraft({ ...form, notes: e.target.value })} />
          </div>
          {form.storeId && overrideFor(form.storeId) && (
            <p className="mt-2 text-[10px] font-bold">
              🏷️ أجرة التوصيل معبّأة تلقائياً من «تخصيص الأسعار» لهذا المحل ({overrideFor(form.storeId)?.fee} د.ع) — يمكن تعديلها يدوياً قبل الحفظ.
            </p>
          )}
          <p className="mt-2 text-[10px] text-faint">يُحفظ المسودة محلياً إن انتهت الجلسة. لتجربة العالق: الحالة «بانتظار كابتن» والانتظار 15 أو 20.</p>
          <div className="mt-4 flex gap-2">
            <button className="btn-primary flex-1" onClick={createOrder}>حفظ</button>
            <button className="btn-ghost flex-1" onClick={() => setCreate(false)}>إلغاء</button>
          </div>
        </Modal>
      )}
      {node}
    </div>
  )
}
