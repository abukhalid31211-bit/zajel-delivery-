import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Package,
  Bike,
  Store,
  MapPin,
  FileDown,
  FileSpreadsheet,
  Smartphone,
  SlidersHorizontal,
  Layers3,
} from 'lucide-react'
import PageHeader from '../components/PageHeader'
import FilterBar, { emptyFilters, inDateRange, sel, type Filters } from '../components/FilterBar'
import DataTable from '../components/DataTable'
import ExportDialog from '../components/ExportDialog'
import StatusBadge from '../components/StatusBadge'
import { useToast } from '../components/Toast'
import { STORE_TYPES, useDbList } from '../lib/store'
import { getSettings } from '../lib/settings'
import { inCaptainScope, inGeoScope, inGovScope, inOrderScope, inStoreScope } from '../lib/rbac'
import type { Captain, District, Governorate, OrderItem, Shift, StoreChange, StoreItem } from '../lib/types'

const tabs = [
  { key: 'orders', label: 'تقرير الطلبيات', icon: Package },
  { key: 'captains', label: 'تقرير الكباتن', icon: Bike },
  { key: 'stores', label: 'تقرير المحلات', icon: Store },
  { key: 'zones', label: 'تقرير المناطق', icon: MapPin },
  { key: 'captain-app', label: 'تطبيق الكابتن', icon: Smartphone },
  { key: 'store-app', label: 'تطبيق المحل', icon: Store },
  { key: 'custom', label: 'تقرير مخصص', icon: SlidersHorizontal },
]

const dimensions = ['المحافظة', 'المنطقة', 'المحل/المطعم', 'الكابتن', 'حالة الطلب', 'اليوم', 'نوع النشاط'] as const
const metricDefs = [
  { key: 'orders', label: 'الطلبيات' },
  { key: 'completed', label: 'المكتملة' },
  { key: 'canceled', label: 'الملغاة' },
  { key: 'active', label: 'النشطة' },
  { key: 'stores', label: 'المحلات' },
  { key: 'captains', label: 'الكباتن' },
  { key: 'value', label: 'قيمة الطلبات' },
  { key: 'fees', label: 'أجور التوصيل' },
  { key: 'avg', label: 'متوسط الطلب' },
] as const

type Dimension = (typeof dimensions)[number]
type MetricKey = (typeof metricDefs)[number]['key']

type Summary = {
  total: number
  completed: number
  canceled: number
  active: number
  value: number
  fees: number
  avgValue: number
}

const fmt = (n: number) => Math.round(n).toLocaleString('ar-IQ')
const money = (v?: string) => Number(String(v || '0').replace(/[^\d.]/g, '')) || 0
const isDone = (o: OrderItem) => o.status === 'مكتمل' || o.status === 'تم التسليم'
const isCanceled = (o: OrderItem) => o.status === 'ملغي'
const isActive = (o: OrderItem) => !isDone(o) && !isCanceled(o)

function summarize(list: OrderItem[]): Summary {
  const value = list.reduce((n, o) => n + money(o.value), 0)
  const fees = list.reduce((n, o) => n + money(o.fee), 0)
  return {
    total: list.length,
    completed: list.filter(isDone).length,
    canceled: list.filter(isCanceled).length,
    active: list.filter(isActive).length,
    value,
    fees,
    avgValue: Math.round(value / (list.length || 1)),
  }
}

function pct(part: number, total: number) {
  if (!total) return '0%'
  return `${Math.round((part / total) * 100)}%`
}

export default function Reports() {
  const [params, setParams] = useSearchParams()
  const tab = Math.max(0, tabs.findIndex((t) => t.key === (params.get('tab') || 'orders')))
  const tabKey = tabs[tab].key
  const [exportOpen, setExportOpen] = useState(false)
  const [filters, setFilters] = useState<Filters>(emptyFilters())
  const [customDimension, setCustomDimension] = useState<Dimension>('المنطقة')
  const [customMetrics, setCustomMetrics] = useState<MetricKey[]>(['orders', 'completed', 'canceled', 'stores', 'captains', 'fees'])
  const { toast, node } = useToast()
  const settings = getSettings()

  const govs = useDbList<Governorate>('governorates').items
  const districtsAll = useDbList<District>('districts').items
  const storesAll = useDbList<StoreItem>('stores').items
  const captainsAll = useDbList<Captain>('captains').items
  const ordersAll = useDbList<OrderItem>('orders').items
  const shifts = useDbList<Shift>('shifts').items
  const changes = useDbList<StoreChange>('storeChanges').items

  const scopedGovs = govs.filter((g) => inGovScope(g.id))
  const districts = districtsAll.filter((d) => inGeoScope(d.govId, d.id))
  const stores = storesAll.filter((s) => inStoreScope(s))
  const captains = captainsAll.filter((c) => inCaptainScope(c))
  const orders = ordersAll.filter((o) => inOrderScope(o))

  const govName = (id?: string) => govs.find((g) => g.id === id)?.name || '—'
  const districtName = (id?: string) => districtsAll.find((d) => d.id === id)?.name || '—'
  const storeById = (id?: string) => storesAll.find((s) => s.id === id)
  const shiftName = (id?: string) => shifts.find((s) => s.id === id)?.name || '—'

  const selectedGov = sel(filters, 'المحافظة')
  const selectedDistrict = sel(filters, 'المنطقة')
  const selectedGovId = selectedGov ? govs.find((g) => g.name === selectedGov)?.id : ''
  const selectedDistrictId = selectedDistrict ? districtsAll.find((d) => d.name === selectedDistrict)?.id : ''
  const orderStatus = sel(filters, 'حالة الطلب')
  const captainStatus = sel(filters, 'حالة الكابتن')
  const storeStatus = sel(filters, 'حالة المحل')
  const storeType = sel(filters, 'نوع النشاط')
  const selectedShift = sel(filters, 'الشفت')

  const matchesCurrentGeo = (govId?: string, districtId?: string, districtIds?: string[]) => {
    if (selectedGovId && govId !== selectedGovId) return false
    if (selectedDistrictId) {
      if (districtId) return districtId === selectedDistrictId
      if (districtIds?.length) return districtIds.includes(selectedDistrictId)
      return false
    }
    return true
  }

  const filteredOrders = useMemo(() => {
    const q = filters.q.trim()
    let list = orders
    if (selectedGovId) list = list.filter((o) => o.govId === selectedGovId)
    if (selectedDistrictId) list = list.filter((o) => o.districtId === selectedDistrictId)
    if (orderStatus) list = list.filter((o) => o.status === orderStatus)
    const storeName = sel(filters, 'المحل')
    if (storeName) list = list.filter((o) => o.storeName === storeName)
    const captainName = sel(filters, 'الكابتن')
    if (captainName) list = list.filter((o) => o.captainName === captainName)
    if (storeType) list = list.filter((o) => storeById(o.storeId)?.type === storeType)
    if (q) list = list.filter((o) => `${o.number} ${o.storeName} ${o.customerName} ${o.captainName} ${o.districtName}`.includes(q))
    return list.filter((o) => inDateRange(o.createdAt, filters))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orders, filters, selectedGovId, selectedDistrictId, orderStatus, storeType])

  const summary = summarize(filteredOrders)

  const dailyRows = useMemo(() => {
    const grouped = filteredOrders.reduce<Record<string, OrderItem[]>>((acc, o) => {
      const day = o.createdAt.slice(0, 10)
      acc[day] = acc[day] || []
      acc[day].push(o)
      return acc
    }, {})
    return Object.entries(grouped)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([day, list]) => ({ day, ...summarize(list), stores: new Set(list.map((o) => o.storeId)).size, captains: new Set(list.map((o) => o.captainId).filter(Boolean)).size }))
  }, [filteredOrders])

  const statusRows = Object.entries(filteredOrders.reduce<Record<string, number>>((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1
    return acc
  }, {})).sort((a, b) => b[1] - a[1])

  const captainRows = useMemo(() => {
    const q = filters.q.trim()
    return captains
      .filter((c) => matchesCurrentGeo(c.govId, undefined, c.districtIds))
      .filter((c) => !captainStatus || c.status === captainStatus)
      .filter((c) => !selectedShift || shiftName(c.shiftId) === selectedShift)
      .filter((c) => !q || `${c.name} ${c.phone} ${c.vehicle}`.includes(q))
      .map((c) => {
        const mine = filteredOrders.filter((o) => o.captainId === c.id)
        return { captain: c, orders: mine, stats: summarize(mine) }
      })
      .sort((a, b) => b.stats.total - a.stats.total || a.captain.name.localeCompare(b.captain.name, 'ar'))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [captains, filteredOrders, filters.q, captainStatus, selectedGovId, selectedDistrictId, selectedShift])

  const storeRows = useMemo(() => {
    const q = filters.q.trim()
    return stores
      .filter((s) => matchesCurrentGeo(s.govId, s.districtId))
      .filter((s) => !storeStatus || s.status === storeStatus)
      .filter((s) => !storeType || s.type === storeType)
      .filter((s) => !q || `${s.name} ${s.phone} ${s.owner} ${s.type}`.includes(q))
      .map((s) => {
        const mine = filteredOrders.filter((o) => o.storeId === s.id)
        const last = mine.slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0]
        return { store: s, orders: mine, stats: summarize(mine), last }
      })
      .sort((a, b) => b.stats.total - a.stats.total || a.store.name.localeCompare(b.store.name, 'ar'))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stores, filteredOrders, filters.q, storeStatus, storeType, selectedGovId, selectedDistrictId])

  const zoneRows = useMemo(() => {
    const q = filters.q.trim()
    return districts
      .filter((d) => matchesCurrentGeo(d.govId, d.id))
      .filter((d) => !q || `${d.name} ${govName(d.govId)}`.includes(q))
      .map((d) => {
        const mine = filteredOrders.filter((o) => o.districtId === d.id || (!o.districtId && o.districtName === d.name))
        const zoneStores = stores.filter((s) => s.districtId === d.id)
        const zoneCaptains = captains.filter((c) => c.districtIds.includes(d.id))
        return { district: d, orders: mine, stats: summarize(mine), stores: zoneStores.length, captains: zoneCaptains.length }
      })
      .sort((a, b) => b.stats.total - a.stats.total || a.district.name.localeCompare(b.district.name, 'ar'))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [districts, filteredOrders, stores, captains, filters.q, selectedGovId, selectedDistrictId])

  const captainApp = {
    total: captains.length,
    active: captains.filter((c) => c.status === 'نشط').length,
    pending: captains.filter((c) => c.status === 'بانتظار الموافقة').length,
    rejected: captains.filter((c) => c.status === 'مرفوض').length,
    stopped: captains.filter((c) => c.status === 'موقوف').length,
    withoutZones: captains.filter((c) => c.districtIds.length === 0).length,
  }

  const storeApp = {
    total: stores.length,
    active: stores.filter((s) => s.status === 'نشط').length,
    pending: stores.filter((s) => s.status === 'بانتظار الموافقة').length,
    stopped: stores.filter((s) => s.status === 'موقوف').length,
    pendingChanges: changes.filter((c) => c.status === 'معلق' && inStoreScope(storeById(c.storeId))).length,
    restaurants: stores.filter((s) => s.type === 'مطعم').length,
  }

  const filterSelects = [
    { label: 'المحافظة', options: scopedGovs.map((g) => g.name) },
    { label: 'المنطقة', options: districts.map((d) => d.name) },
    ...(['orders', 'custom'].includes(tabKey) ? [{ label: 'حالة الطلب', options: ['طلب جديد', 'بانتظار كابتن', 'تم قبول الكابتن', 'متوجه للمحل', 'وصل للمحل', 'استلم الطلب', 'بالطريق للزبون', 'تم التسليم', 'مكتمل', 'ملغي'] }] : []),
    ...(['orders', 'custom'].includes(tabKey) ? [{ label: 'المحل', options: stores.map((s) => s.name) }] : []),
    ...(['orders', 'custom'].includes(tabKey) ? [{ label: 'الكابتن', options: captains.map((c) => c.name) }] : []),
    ...(['captains', 'captain-app'].includes(tabKey) ? [{ label: 'حالة الكابتن', options: ['نشط', 'بانتظار الموافقة', 'موقوف', 'مرفوض'] }, { label: 'الشفت', options: shifts.map((s) => s.name) }] : []),
    ...(['stores', 'store-app'].includes(tabKey) ? [{ label: 'نوع النشاط', options: STORE_TYPES }, { label: 'حالة المحل', options: ['نشط', 'بانتظار الموافقة', 'موقوف'] }] : []),
    ...(tabKey === 'zones' ? [{ label: 'نوع النشاط', options: STORE_TYPES }] : []),
  ]

  const toggleMetric = (key: MetricKey) => {
    setCustomMetrics((prev) => {
      if (prev.includes(key)) return prev.length === 1 ? prev : prev.filter((m) => m !== key)
      return [...prev, key]
    })
  }

  const customRows = useMemo(() => {
    type Group = { key: string; label: string; orders: OrderItem[] }
    const groups: Record<string, Group> = {}
    const ensure = (key: string, label: string) => {
      groups[key] = groups[key] || { key, label, orders: [] }
      return groups[key]
    }

    if (customDimension === 'المحافظة') scopedGovs.forEach((g) => ensure(g.id, g.name))
    if (customDimension === 'المنطقة') zoneRows.forEach((z) => ensure(z.district.id, `${z.district.name} — ${govName(z.district.govId)}`))
    if (customDimension === 'المحل/المطعم') storeRows.forEach((s) => ensure(s.store.id, `${s.store.name} — ${s.store.type}`))
    if (customDimension === 'الكابتن') captainRows.forEach((c) => ensure(c.captain.id, c.captain.name))
    if (customDimension === 'نوع النشاط') STORE_TYPES.forEach((t) => ensure(t, t))

    filteredOrders.forEach((o) => {
      const store = storeById(o.storeId)
      const pair: { key: string; label: string } = (() => {
        if (customDimension === 'المحافظة') return { key: o.govId || '—', label: govName(o.govId) }
        if (customDimension === 'المنطقة') return { key: o.districtId || o.districtName || '—', label: o.districtName || districtName(o.districtId) }
        if (customDimension === 'المحل/المطعم') return { key: o.storeId || '—', label: o.storeName || '—' }
        if (customDimension === 'الكابتن') return { key: o.captainId || 'بدون كابتن', label: o.captainName || 'بدون كابتن' }
        if (customDimension === 'حالة الطلب') return { key: o.status, label: o.status }
        if (customDimension === 'اليوم') return { key: o.createdAt.slice(0, 10), label: o.createdAt.slice(0, 10) }
        return { key: store?.type || 'غير محدد', label: store?.type || 'غير محدد' }
      })()
      ensure(pair.key, pair.label).orders.push(o)
    })

    const groupStores = (g: Group) => {
      if (customDimension === 'المحافظة') return stores.filter((s) => s.govId === g.key)
      if (customDimension === 'المنطقة') return stores.filter((s) => s.districtId === g.key)
      if (customDimension === 'المحل/المطعم') return stores.filter((s) => s.id === g.key)
      if (customDimension === 'نوع النشاط') return stores.filter((s) => s.type === g.key)
      const ids = new Set(g.orders.map((o) => o.storeId).filter(Boolean))
      return stores.filter((s) => ids.has(s.id))
    }
    const groupCaptains = (g: Group) => {
      if (customDimension === 'المحافظة') return captains.filter((c) => c.govId === g.key)
      if (customDimension === 'المنطقة') return captains.filter((c) => c.districtIds.includes(g.key))
      if (customDimension === 'الكابتن') return captains.filter((c) => c.id === g.key)
      const ids = new Set(g.orders.map((o) => o.captainId).filter(Boolean))
      return captains.filter((c) => ids.has(c.id))
    }
    const renderMetric = (metric: MetricKey, g: Group) => {
      const s = summarize(g.orders)
      if (metric === 'orders') return fmt(s.total)
      if (metric === 'completed') return fmt(s.completed)
      if (metric === 'canceled') return fmt(s.canceled)
      if (metric === 'active') return fmt(s.active)
      if (metric === 'stores') return fmt(groupStores(g).length)
      if (metric === 'captains') return fmt(groupCaptains(g).length)
      if (metric === 'value') return `${fmt(s.value)} د.ع`
      if (metric === 'fees') return `${fmt(s.fees)} د.ع`
      return `${fmt(s.avgValue)} د.ع`
    }

    return Object.values(groups)
      .sort((a, b) => b.orders.length - a.orders.length || a.label.localeCompare(b.label, 'ar'))
      .map((g) => ({ key: g.key, cells: [g.label, ...customMetrics.map((m) => renderMetric(m, g))] }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customDimension, customMetrics, filteredOrders, zoneRows, storeRows, captainRows, stores, captains])

  const maxDay = Math.max(1, ...dailyRows.map((d) => d.total))
  const heatMax = Math.max(1, ...zoneRows.map((z) => z.stats.total))
  const summaryText = `التقرير: ${tabs[tab].label} | الطلبات: ${summary.total} | الأجور: ${fmt(summary.fees)} د.ع | النطاق: ${selectedGov || 'كل المحافظات'} / ${selectedDistrict || 'كل المناطق'}`

  return (
    <div>
      <PageHeader
        title="التقارير والإحصائيات المتقدمة"
        subtitle="تقارير تفصيلية للنظام بالكامل، لكل محافظة ومنطقة ومطعم/محل وكابتن، مع تقارير خاصة بتطبيق الكابتن وتطبيق المحل وتقرير مخصص"
        actions={
          <>
            <button className="btn-ghost" onClick={() => setExportOpen(true)}>
              <FileSpreadsheet className="h-4 w-4" /> تصدير Excel
            </button>
            <button className="btn-ghost" onClick={() => setExportOpen(true)}>
              <FileDown className="h-4 w-4" /> تصدير PDF
            </button>
          </>
        }
      />

      <div className="mb-5 flex flex-wrap gap-2">
        {tabs.map((t, i) => (
          <button
            key={t.key}
            onClick={() => setParams(t.key === 'orders' ? {} : { tab: t.key })}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-colors ${
              tab === i ? 'bg-black text-white' : 'border border-line bg-white text-mute hover:bg-page'
            }`}
          >
            <t.icon className="h-3.5 w-3.5" /> {t.label}
          </button>
        ))}
      </div>

      <FilterBar
        searchPlaceholder="بحث في التقرير الحالي..."
        selects={filterSelects}
        withDate
        onChange={setFilters}
        onReset={() => setFilters(emptyFilters())}
        onSearch={(f) => toast(`تم تحديث التقرير — ${f.from || 'بداية البيانات'} إلى ${f.to || 'اليوم'}`)}
      />

      <div className="mb-5 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        {[
          ['إجمالي الطلبيات', fmt(summary.total)],
          ['المكتملة', `${fmt(summary.completed)} (${pct(summary.completed, summary.total)})`],
          ['الملغاة', `${fmt(summary.canceled)} (${pct(summary.canceled, summary.total)})`],
          ['النشطة', fmt(summary.active)],
          ['متوسط قيمة الطلب', `${fmt(summary.avgValue)} د.ع`],
          ['إجمالي أجور التوصيل', `${fmt(summary.fees)} د.ع`],
        ].map(([l, v]) => (
          <div key={l} className="card p-4">
            <p className="text-[11px] font-medium text-mute">{l}</p>
            <p className="mt-1.5 text-xl font-bold">{v}</p>
          </div>
        ))}
      </div>

      {tabKey === 'orders' && (
        <>
          <div className="mb-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
            <div className="card p-5">
              <h3 className="mb-3 text-sm font-bold">عدد الطلبات يومياً</h3>
              <div className="flex h-44 items-end gap-1 border-b border-line">
                {(dailyRows.length ? dailyRows.slice(-14) : Array.from({ length: 14 }, (_, i) => ({ day: String(i + 1), total: 0 }))).map((d) => (
                  <div key={d.day} className="flex flex-1 flex-col items-center gap-1">
                    <div className="w-full rounded-t-sm bg-black/25" style={{ height: d.total ? Math.max(8, (d.total / maxDay) * 160) : 4 }} />
                    <span className="text-[9px] text-faint">{d.day.slice(5) || d.day}</span>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-center text-[11px] text-faint">يعرض آخر 14 يوم ضمن الفلاتر الحالية.</p>
            </div>
            <div className="card p-5">
              <h3 className="mb-3 text-sm font-bold">توزيع حالات الطلبات</h3>
              {statusRows.length === 0 ? (
                <p className="py-12 text-center text-[11px] text-faint">لا توجد بيانات حالات ضمن الفلاتر.</p>
              ) : (
                <div className="space-y-2 text-xs">
                  {statusRows.map(([status, count]) => (
                    <div key={status}>
                      <div className="mb-1 flex justify-between">
                        <span className="font-bold">{status}</span>
                        <span className="text-mute">{fmt(count)} · {pct(count, summary.total)}</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-page"><div className="h-full rounded-full bg-black" style={{ width: pct(count, summary.total) }} /></div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <DataTable
            columns={['التاريخ', 'عدد الطلبيات', 'المكتملة', 'الملغاة', 'المحلات النشطة', 'الكباتن العاملون', 'إجمالي القيمة', 'إجمالي الأجور']}
            rows={dailyRows.map((d) => ({
              key: d.day,
              cells: [d.day, fmt(d.total), fmt(d.completed), fmt(d.canceled), fmt(d.stores), fmt(d.captains), `${fmt(d.value)} د.ع`, `${fmt(d.fees)} د.ع`],
            }))}
            emptyTitle="لا توجد بيانات في الفترة المحددة"
            emptyHint="حدد فترة زمنية وفلاتر ثم اضغط بحث لعرض التقرير التفصيلي."
          />
        </>
      )}

      {tabKey === 'captains' && (
        <DataTable
          columns={['الكابتن', 'المحافظة', 'المناطق', 'الشفت', 'الحالة', 'الطلبيات المأخوذة', 'المكتملة', 'الملغاة', 'النشطة', 'إجمالي الأجور', 'التقييم ⭐']}
          rows={captainRows.map(({ captain, stats }) => ({
            key: captain.id,
            cells: [
              captain.name,
              govName(captain.govId),
              captain.districtIds.map(districtName).join('، ') || 'غير محدد',
              shiftName(captain.shiftId),
              <StatusBadge status={captain.status} />,
              fmt(stats.total),
              fmt(stats.completed),
              fmt(stats.canceled),
              fmt(stats.active),
              `${fmt(stats.fees)} د.ع`,
              captain.rating || '—',
            ],
          }))}
          emptyIcon={Bike}
          emptyTitle="لا توجد بيانات أداء للكباتن"
          emptyHint="يعرض هذا التقرير كل كابتن وكم طلب أخذ، المكتمل والملغي والنشط، ضمن نطاق الأدمن الحالي."
        />
      )}

      {tabKey === 'stores' && (
        <DataTable
          columns={['المحل / المطعم', 'النوع', 'المحافظة', 'المنطقة', 'الحالة', 'الطلبيات', 'المكتملة', 'الملغاة', 'متوسط القيمة', 'إجمالي الأجور', 'آخر طلب']}
          rows={storeRows.map(({ store, stats, last }) => ({
            key: store.id,
            cells: [
              store.name,
              store.type,
              govName(store.govId),
              districtName(store.districtId),
              <StatusBadge status={store.status} />,
              fmt(stats.total),
              fmt(stats.completed),
              fmt(stats.canceled),
              `${fmt(stats.avgValue)} د.ع`,
              `${fmt(stats.fees)} د.ع`,
              last?.createdAt.slice(0, 10) || '—',
            ],
          }))}
          emptyIcon={Store}
          emptyTitle="لا توجد بيانات أداء للمحلات"
          emptyHint="يعرض التقرير نشاط كل مطعم أو محل وعدد الطلبات الخارجة منه بالتفصيل."
        />
      )}

      {tabKey === 'zones' && (
        <>
          <div className="card mb-5 p-5">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-bold"><Layers3 className="h-4 w-4" /> خريطة حرارية لنشاط المناطق</h3>
            {zoneRows.length === 0 ? (
              <p className="py-8 text-center text-[11px] text-faint">لا توجد مناطق ضمن النطاق الحالي.</p>
            ) : (
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
                {zoneRows.slice(0, 12).map((z) => (
                  <div key={z.district.id} className="rounded-xl border border-line bg-page/60 p-3">
                    <div className="mb-2 flex items-center justify-between gap-2 text-xs">
                      <span className="font-bold">{z.district.name}</span>
                      <span className="text-mute">{fmt(z.stats.total)} طلب</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-white"><div className="h-full rounded-full bg-black" style={{ width: `${Math.max(6, (z.stats.total / heatMax) * 100)}%` }} /></div>
                    <p className="mt-2 text-[10px] text-faint">{govName(z.district.govId)} · {z.stores} محلات · {z.captains} كباتن</p>
                  </div>
                ))}
              </div>
            )}
          </div>
          <DataTable
            columns={['المنطقة', 'المحافظة', 'الطلبيات', 'المكتملة', 'الملغاة', 'المحلات/المطاعم', 'الكباتن', 'طلب/كابتن', 'إجمالي القيمة', 'إجمالي الأجور']}
            rows={zoneRows.map((z) => ({
              key: z.district.id,
              cells: [
                z.district.name,
                govName(z.district.govId),
                fmt(z.stats.total),
                fmt(z.stats.completed),
                fmt(z.stats.canceled),
                fmt(z.stores),
                fmt(z.captains),
                z.captains ? (z.stats.total / z.captains).toFixed(1) : '—',
                `${fmt(z.stats.value)} د.ع`,
                `${fmt(z.stats.fees)} د.ع`,
              ],
            }))}
            emptyIcon={MapPin}
            emptyTitle="لا توجد بيانات نشاط للمناطق"
            emptyHint="سيعرض هذا التقرير لكل منطقة كم خرج منها طلبات وكم كابتن ومحل داخلها."
          />
        </>
      )}

      {tabKey === 'captain-app' && (
        <>
          <div className="mb-5 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
            {[
              ['إجمالي حسابات الكباتن', fmt(captainApp.total)],
              ['نشطون', fmt(captainApp.active)],
              ['بانتظار الموافقة', fmt(captainApp.pending)],
              ['مرفوضون/إعادة تقديم', fmt(captainApp.rejected)],
              ['موقوفون', fmt(captainApp.stopped)],
              ['بدون مناطق عمل', fmt(captainApp.withoutZones)],
            ].map(([l, v]) => (
              <div key={l} className="card p-4">
                <p className="text-[11px] font-medium text-mute">{l}</p>
                <p className="mt-1.5 text-xl font-bold">{v}</p>
              </div>
            ))}
          </div>
          <div className="card mb-5 p-4 text-xs leading-relaxed text-mute">
            <p className="font-bold text-black">إعدادات تطبيق الكابتن</p>
            <p className="mt-1">أقل إصدار مسموح: <b>{settings.captainMinVersion}</b> · التحديث الإجباري: <b>{settings.captainForceUpdate ? 'مفعل' : 'غير مفعل'}</b> · رسالة التحديث: {settings.captainUpdateMsg}</p>
          </div>
          <DataTable
            columns={['الكابتن', 'حالة الحساب', 'المحافظة / المناطق', 'الشفت', 'طلبات التطبيق', 'مكتملة', 'نشطة', 'آخر طلب', 'ملاحظات']}
            rows={captainRows.map(({ captain, stats, orders }) => ({
              key: captain.id,
              cells: [
                captain.name,
                <StatusBadge status={captain.status} />,
                `${govName(captain.govId)} / ${captain.districtIds.map(districtName).join('، ') || 'غير محدد'}`,
                shiftName(captain.shiftId),
                fmt(stats.total),
                fmt(stats.completed),
                fmt(stats.active),
                orders.slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0]?.createdAt.slice(0, 10) || '—',
                captain.reapply ? `إعادة تقديم — ${captain.rejectReason || 'رفض سابق'}` : captain.districtIds.length ? '—' : 'يحتاج تحديد مناطق',
              ],
            }))}
            emptyIcon={Smartphone}
            emptyTitle="لا توجد بيانات لتطبيق الكابتن"
            emptyHint="يعرض حالة الحساب، الشفت، مناطق العمل، وعدد الطلبات المنفذة من تطبيق الكابتن."
          />
        </>
      )}

      {tabKey === 'store-app' && (
        <>
          <div className="mb-5 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
            {[
              ['إجمالي حسابات المحلات', fmt(storeApp.total)],
              ['نشطة', fmt(storeApp.active)],
              ['بانتظار الموافقة', fmt(storeApp.pending)],
              ['موقوفة', fmt(storeApp.stopped)],
              ['مطاعم', fmt(storeApp.restaurants)],
              ['تعديلات معلقة', fmt(storeApp.pendingChanges)],
            ].map(([l, v]) => (
              <div key={l} className="card p-4">
                <p className="text-[11px] font-medium text-mute">{l}</p>
                <p className="mt-1.5 text-xl font-bold">{v}</p>
              </div>
            ))}
          </div>
          <div className="card mb-5 p-4 text-xs leading-relaxed text-mute">
            <p className="font-bold text-black">إعدادات تطبيق المحل</p>
            <p className="mt-1">أقل إصدار مسموح: <b>{settings.storeMinVersion}</b> · التحديث الإجباري: <b>{settings.storeForceUpdate ? 'مفعل' : 'غير مفعل'}</b> · حد الطلبات اليومي: <b>{settings.storeDailyLimit || 'غير محدود'}</b> · اختيار الكابتن من المحل: <b>{settings.storePickCaptain ? 'مسموح' : 'غير مسموح'}</b></p>
          </div>
          <DataTable
            columns={['المحل / المطعم', 'حالة الحساب', 'النوع', 'المنطقة', 'طلبات التطبيق', 'مكتملة', 'نشطة', 'تعديلات معلقة', 'آخر طلب']}
            rows={storeRows.map(({ store, stats, last }) => ({
              key: store.id,
              cells: [
                store.name,
                <StatusBadge status={store.status} />,
                store.type,
                `${govName(store.govId)} / ${districtName(store.districtId)}`,
                fmt(stats.total),
                fmt(stats.completed),
                fmt(stats.active),
                fmt(changes.filter((c) => c.storeId === store.id && c.status === 'معلق').length),
                last?.createdAt.slice(0, 10) || '—',
              ],
            }))}
            emptyIcon={Store}
            emptyTitle="لا توجد بيانات لتطبيق المحل"
            emptyHint="يعرض حالة حساب كل محل/مطعم، طلبات التطبيق، والتعديلات الحساسة المعلقة."
          />
        </>
      )}

      {tabKey === 'custom' && (
        <>
          <div className="card mb-5 p-5">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              <div>
                <label className="mb-1.5 block text-xs font-semibold">البُعد الأساسي للتقرير</label>
                <select className="field cursor-pointer" value={customDimension} onChange={(e) => setCustomDimension(e.target.value as Dimension)}>
                  {dimensions.map((d) => <option key={d}>{d}</option>)}
                </select>
                <p className="mt-1 text-[10px] text-faint">مثال: اختر المنطقة لمعرفة كم طلب خرج من كل منطقة، أو الكابتن لمعرفة كم طلب أخذ كل كابتن.</p>
              </div>
              <div className="lg:col-span-2">
                <label className="mb-1.5 block text-xs font-semibold">المؤشرات المعروضة</label>
                <div className="flex flex-wrap gap-2">
                  {metricDefs.map((m) => (
                    <button
                      key={m.key}
                      type="button"
                      onClick={() => toggleMetric(m.key)}
                      className={`rounded-xl px-3 py-2 text-[11px] font-semibold ${customMetrics.includes(m.key) ? 'bg-black text-white' : 'border border-line bg-white text-mute'}`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <DataTable
            columns={[customDimension, ...customMetrics.map((m) => metricDefs.find((x) => x.key === m)?.label || m)]}
            rows={customRows}
            emptyIcon={SlidersHorizontal}
            emptyTitle="لا توجد نتائج للتقرير المخصص"
            emptyHint="غيّر البُعد أو المؤشرات أو الفلاتر لإظهار تقرير مخصص حسب احتياجك."
          />
        </>
      )}

      {exportOpen && (
        <ExportDialog
          summary={summaryText}
          onClose={() => setExportOpen(false)}
          onDone={(m) => toast(m)}
        />
      )}
      {node}
    </div>
  )
}
