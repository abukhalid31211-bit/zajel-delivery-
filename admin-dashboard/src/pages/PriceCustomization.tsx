import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Tags, Store, Save, Pencil, Trash2, Info, Eye, AlertTriangle } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import FilterBar, { emptyFilters, sel, type Filters } from '../components/FilterBar'
import { SkeletonTable } from '../components/Skeleton'
import DataTable from '../components/DataTable'
import StatCard from '../components/StatCard'
import Modal from '../components/Modal'
import StatusBadge from '../components/StatusBadge'
import { useToast } from '../components/Toast'
import { useDbList, logAudit } from '../lib/store'
import { uid, nowIso, formatDate } from '../lib/db'
import { can, inGeoScope, inGovScope, inStoreScope } from '../lib/rbac'
import { getSession } from '../lib/session'
import { getSettings } from '../lib/settings'
import { OVERRIDES_KEY, publicPriceFor, diffLabel } from '../lib/pricing'
import type { District, GeoPrice, Governorate, PriceRoute, StoreItem, StorePriceOverride } from '../lib/types'

const PERM = 'تخصيص الأسعار'
const EMPTY_FORM = { storeId: '', fee: '', note: '' }

export default function PriceCustomization() {
  const navigate = useNavigate()
  const { toast, node } = useToast()
  const settings = getSettings()
  const stores = useDbList<StoreItem>('stores')
  const overrides = useDbList<StorePriceOverride>(OVERRIDES_KEY)
  const govs = useDbList<Governorate>('governorates').items
  const districts = useDbList<District>('districts').items
  const routes = useDbList<PriceRoute>('priceRoutes').items
  const geoPrices = useDbList<GeoPrice>('geoPrices').items

  const [form, setForm] = useState(EMPTY_FORM)
  const [err, setErr] = useState('')
  const [askFree, setAskFree] = useState(false)
  const [toDelete, setToDelete] = useState<StorePriceOverride | null>(null)
  const [filters, setFilters] = useState<Filters>(emptyFilters())
  const [loading, setLoading] = useState(false)

  const canAdd = can(PERM, 'إضافة')
  const canEdit = can(PERM, 'تعديل')
  const canDelete = can(PERM, 'حذف')
  const canWrite = canAdd || canEdit

  const storeById = (id: string) => stores.items.find((s) => s.id === id)
  const govName = (id: string) => govs.find((g) => g.id === id)?.name || '—'
  const districtName = (id: string) => districts.find((d) => d.id === id)?.name || '—'

  /** المحلات القابلة للاختيار: نشطة أو بانتظار الموافقة، وداخل النطاق الجغرافي للأدمن الفرعي */
  const pickable = useMemo(
    () =>
      stores.items
        .filter((s) => inStoreScope(s) && s.status !== 'موقوف')
        .slice()
        .sort((a, b) => a.name.localeCompare(b.name, 'ar')),
    [stores.items],
  )

  const selected = stores.items.find((s) => s.id === form.storeId)
  const publicInfo = selected ? publicPriceFor(selected, routes, geoPrices) : null
  const existing = form.storeId ? overrides.items.find((o) => o.storeId === form.storeId) ?? null : null
  const diff = form.fee && publicInfo ? diffLabel(form.fee, publicInfo.price) : null

  const pickStore = (id: string) => {
    const hit = overrides.items.find((o) => o.storeId === id)
    setForm({ storeId: id, fee: hit?.fee ?? '', note: hit?.note ?? '' })
    setErr('')
  }

  const resetForm = () => {
    setForm(EMPTY_FORM)
    setErr('')
  }

  const validate = (): string | null => {
    if (!form.storeId) return 'اختر المحل أولاً'
    if (!/^\d{1,7}$/.test(form.fee)) return 'أدخل قيمة سعر التوصيل بالأرقام فقط — من 0 إلى 9,999,999 د.ع (0 = توصيل مجاني)'
    const store = storeById(form.storeId)
    if (!store) return 'المحل المحدد لم يعد موجوداً'
    const has = overrides.items.some((o) => o.storeId === form.storeId)
    if (has && !canEdit) return 'لا تملك صلاحية تعديل التخصيصات'
    if (!has && !canAdd) return 'لا تملك صلاحية إضافة تخصيصات جديدة'
    return null
  }

  const commit = () => {
    const bad = validate()
    if (bad) return setErr(bad)
    const store = storeById(form.storeId)
    if (!store) return
    const prev = overrides.items.find((o) => o.storeId === store.id)
    const info = publicPriceFor(store, routes, geoPrices)
    const stamp = nowIso()
    const who = getSession()?.name || 'مدير النظام'
    const note = form.note.trim()
    if (prev) {
      overrides.setItems((p) =>
        p.map((x) => (x.id === prev.id ? { ...x, fee: form.fee, note, updatedAt: stamp, updatedBy: who } : x)),
      )
      logAudit({
        action: 'تخصيص سعر',
        entity: store.name,
        details: `تعديل سعر التوصيل المخصص للمحل (${districtName(store.districtId)})`,
        oldValue: `${prev.fee} د.ع`,
        newValue: `${form.fee} د.ع`,
      })
      toast('تم تحديث سعر التوصيل المخصص ✅')
    } else {
      overrides.setItems((p) => [
        ...p,
        { id: uid(), storeId: store.id, fee: form.fee, note, createdAt: stamp, updatedAt: stamp, updatedBy: who },
      ])
      logAudit({
        action: 'تخصيص سعر',
        entity: store.name,
        details: `إضافة سعر توصيل مخصص للمحل (${districtName(store.districtId)})${note ? ` — ${note}` : ''}`,
        oldValue: info.price === null ? 'غير محدد' : `${info.price} د.ع (سعر عام)`,
        newValue: `${form.fee} د.ع`,
      })
      toast('تم حفظ التخصيص وتسجيله في سجل العمليات ✅')
    }
    setAskFree(false)
    resetForm()
  }

  const save = () => {
    const bad = validate()
    if (bad) return setErr(bad)
    // توصيل مجاني (0 د.ع) قرار مالي → تأكيد صريح
    if (Number(form.fee) === 0) return setAskFree(true)
    commit()
  }

  const remove = (o: StorePriceOverride) => {
    const store = storeById(o.storeId)
    overrides.setItems((p) => p.filter((x) => x.id !== o.id))
    logAudit({
      action: 'تخصيص سعر',
      entity: store?.name || '—',
      details: 'إزالة التخصيص — المحل يعود تلقائياً لنظام التسعير العام',
      oldValue: `${o.fee} د.ع`,
      newValue: '—',
    })
    if (form.storeId === o.storeId) resetForm()
    setToDelete(null)
    toast('تمت إزالة التخصيص ورجع المحل للسعر العام')
  }

  const list = useMemo(() => {
    let rows = overrides.items.filter((o) => {
      const s = storeById(o.storeId)
      return !!s && inStoreScope(s)
    })
    const q = filters.q.trim()
    if (q) rows = rows.filter((o) => `${storeById(o.storeId)?.name} ${storeById(o.storeId)?.phone} ${storeById(o.storeId)?.owner}`.includes(q))
    const g = sel(filters, 'المحافظة')
    if (g) rows = rows.filter((o) => govName(storeById(o.storeId)?.govId || '') === g)
    const d = sel(filters, 'المنطقة')
    if (d) rows = rows.filter((o) => districtName(storeById(o.storeId)?.districtId || '') === d)
    return rows
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [overrides.items, stores.items, filters, govs, districts])

  const activeCount = overrides.items.filter((o) => storeById(o.storeId)?.status === 'نشط').length
  const freeCount = overrides.items.filter((o) => Number(o.fee) === 0).length
  const pickableWithCustom = pickable.filter((s) => overrides.items.some((o) => o.storeId === s.id)).length
  const unpriced = Math.max(0, pickable.length - pickableWithCustom)

  return (
    <div>
      <PageHeader
        title="تخصيص الأسعار"
        subtitle="سعر توصيل مخصص لكل محل على حدة — يتجاوز نظام التسعير العام ويُطبَّق على الطلبيات الجديدة فقط، وكل تغيير يُسجَّل في سجل العمليات"
        actions={
          <span className="badge border border-black bg-black text-white">
            السعر العام المطبَّق بدون تخصيص: {settings.pricingMode === 'geo' ? 'نظام المناطق الجغرافية' : 'نظام المسارات (من ← إلى)'}
          </span>
        }
      />

      <div className="mb-5 grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard icon={Tags} label="محلات لديها سعر مخصص" value={String(activeCount)} sub={`${overrides.items.length} قاعدة محفوظة كلياً`} />
        <StatCard icon={Store} label="محلات على السعر العام" value={String(unpriced)} sub="لا تخصيص لها — تُحسب أجورها من نظام الأسعار" alert />
        <StatCard icon={AlertTriangle} label="توصيل مجاني (0 د.ع)" value={String(freeCount)} sub="أجرته صفر عند الإنشاء والتسوية" alert />
        <StatCard icon={Info} label="تخصيصات غير مُطبَّقة" value={String(overrides.items.length - activeCount)} sub="محلاتها موقوفة أو بانتظار الموافقة" alert />
      </div>

      {/* ===== نموذج التخصيص: اختر المحل ← أدخل القيمة ← احفظ ===== */}
      <div className="card mb-5 p-5">
        <h2 className="border-b border-line pb-3 text-sm font-bold">إضافة / تعديل سعر توصيل لمحل محدد</h2>
        {!canWrite && (
          <p className="mt-3 rounded-xl border border-dashed border-black bg-page px-3 py-2 text-[11px] font-semibold">
            🔒 تملك صلاحية المشاهدة فقط في هذا القسم — لا يمكن الحفظ أو التعديل.
          </p>
        )}
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="md:col-span-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold">1) اختر المحل</label>
              <select className="field cursor-pointer" value={form.storeId} onChange={(e) => pickStore(e.target.value)} disabled={!canWrite}>
                <option value="">
                  {pickable.length
                    ? '— اختر المحل الذي تريد تخصيص سعره —'
                    : 'لا توجد محلات مسجلة بعد — سجّل محلاً من قسم «المحلات والمطاعم»'}
                </option>
                {pickable.map((s) => {
                  const has = overrides.items.find((o) => o.storeId === s.id)
                  return (
                    <option key={s.id} value={s.id}>
                      {s.name} · {govName(s.govId)}{has ? ` (مخصّص: ${has.fee} د.ع)` : ''}
                    </option>
                  )
                })}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold">2) سعر التوصيل (د.ع)</label>
              <input
                className="field"
                placeholder="0"
                inputMode="numeric"
                dir="ltr"
                disabled={!canWrite}
                value={form.fee}
                onChange={(e) => {
                  setForm({ ...form, fee: e.target.value.replace(/[^\d]/g, '').slice(0, 7) })
                  setErr('')
                }}
                onKeyDown={(e) => e.key === 'Enter' && save()}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-xs font-semibold text-mute">
                3) ملاحظة للتوثيق (اختياري) — تظهر في الجدول وفي سجل العمليات
              </label>
              <input
                className="field"
                placeholder="مثال: اتفاقية حصرية / عرض رمضان / سعر جملة"
                disabled={!canWrite}
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
              />
            </div>
          </div>

          <div className="flex flex-col gap-3 rounded-2xl border border-line bg-page p-4">
            <p className="text-[11px] font-bold text-mute">المعاينة قبل الحفظ</p>
            {!selected && <p className="text-[11px] leading-relaxed text-faint">اختر محلاً لعرض سعره العام ونتيجة التخصيص عليه.</p>}
            {selected && (
              <div className="space-y-2 text-[11px] leading-relaxed">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-mute">المحل</span>
                  <span className="font-bold">{selected.name}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-mute">الحالة</span>
                  <StatusBadge status={selected.status} />
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-mute">المنطقة</span>
                  <span className="font-semibold">
                    {govName(selected.govId)} / {districtName(selected.districtId)}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2 border-t border-line pt-2">
                  <span className="text-mute">السعر العام المرجعي</span>
                  <span className="font-semibold">{publicInfo?.price === null ? 'غير محدد' : `${publicInfo?.price} د.ع`}</span>
                </div>
                <p className="text-[10px] text-faint">{publicInfo?.label}</p>
                <div className="flex items-center justify-between gap-2 border-t border-line pt-2">
                  <span className="text-mute">السعر بعد التخصيص</span>
                  <span className="text-base font-extrabold">{form.fee ? `${form.fee} د.ع` : '—'}</span>
                </div>
                {diff && (
                  <p className={`text-[10px] font-bold ${diff.tone === 'up' ? 'text-black' : 'text-mute'}`}>
                    {diff.tone === 'none' ? 'ℹ ' : diff.tone === 'down' ? '▼ ' : '▲ '}
                    {diff.text}
                  </p>
                )}
                {existing && (
                  <p className="rounded-xl border border-line bg-white px-2.5 py-2 text-[10px] font-semibold">
                    ✏️ هذا المحل لديه تخصيص سابق ({existing.fee} د.ع) — الحفظ سيحدّثه بدل تكراره.
                  </p>
                )}
                {selected.status !== 'نشط' && (
                  <p className="rounded-xl border border-dashed border-black bg-white px-2.5 py-2 text-[10px] font-semibold">
                    ⚠ المحل غير نشط — التخصيص سيُحفظ لكنه لا يُطبَّق إلا بعد تفعيل المحل.
                  </p>
                )}
              </div>
            )}
            {err && <p className="text-[11px] font-bold">⚠ {err}</p>}
            <div className="mt-auto flex gap-2">
              <button className="btn-primary flex-1" onClick={save} disabled={!canWrite || !selected}>
                <Save className="h-4 w-4" /> حفظ
              </button>
              <button className="btn-ghost" onClick={resetForm} disabled={!form.storeId}>
                تفريغ
              </button>
            </div>
            <p className="text-[10px] leading-relaxed text-faint">
              يُطبَّق السعر على طلبيات هذا المحل الجديدة فقط. الطلبيات الجارية والمكتملة تحتفظ بالأجرة المُسجَّلة وقت إنشائها.
            </p>
          </div>
        </div>
      </div>

      {/* ===== قائمة التخصيصات المحفوظة ===== */}
      <FilterBar
        searchPlaceholder="ابحث باسم المحل أو رقم هاتفه أو اسم المالك..."
        selects={[
          { label: 'المحافظة', options: govs.filter((g) => inGovScope(g.id)).map((g) => g.name) },
          { label: 'المنطقة', options: districts.filter((d) => inGeoScope(d.govId, d.id)).map((d) => d.name) },
        ]}
        onChange={setFilters}
        onSearch={() => {
          setLoading(true)
          window.setTimeout(() => setLoading(false), 280)
        }}
        onReset={() => setFilters(emptyFilters())}
      />

      {loading ? (
        <SkeletonTable cols={8} />
      ) : (
        <DataTable
          columns={['المحل', 'المحافظة / المنطقة', 'السعر المرجعي للمنطقة', 'السعر المخصص', 'الفرق', 'ملاحظة', 'آخر تحديث', 'الإجراءات']}
          rows={list.map((o) => {
            const store = storeById(o.storeId)
            const info = store ? publicPriceFor(store, routes, geoPrices) : null
            const d = diffLabel(o.fee, info?.price ?? null)
            return {
              key: o.id,
              onClick: () => pickStore(o.storeId),
              cells: [
                <span key="store">
                  <span className="block font-bold">{store?.name || 'محل محذوف'}</span>
                  <span className="block text-[10px] text-faint" dir="ltr">
                    +964 {store?.phone || '—'}
                  </span>
                </span>,
                <span key="zone">
                  {store ? `${govName(store.govId)} / ${districtName(store.districtId)}` : '—'}
                  {store && store.status !== 'نشط' && (
                    <span className="mt-1 block">
                      <StatusBadge status={store.status} />
                    </span>
                  )}
                </span>,
                <span key="public" className="text-mute">{info?.price === null || !info ? 'غير محدد' : `${info.price} د.ع`}</span>,
                <span key="custom">
                  <span className="text-sm font-extrabold">{o.fee} د.ع</span>
                  {Number(o.fee) === 0 && (
                    <span className="badge mt-1 mr-2 border border-dashed border-black bg-white text-black">توصيل مجاني</span>
                  )}
                </span>,
                <span key="diff" className="text-[11px] font-semibold text-mute">{d.text}</span>,
                <span key="note" className="text-[11px] text-mute">{o.note || '—'}</span>,
                <span key="updated" className="text-[11px] text-mute">
                  {formatDate(o.updatedAt)}
                  <span className="block text-[10px] text-faint">بواسطة {o.updatedBy}</span>
                </span>,
                <span key="actions" className="flex gap-1">
                  <button className="btn-ghost px-2 py-1" title="ملف المحل" onClick={() => navigate(`/stores/profile?id=${o.storeId}`)}>
                    <Eye className="h-3.5 w-3.5" />
                  </button>
                  {canWrite && (
                    <button className="btn-ghost px-2 py-1" title="تعديل" onClick={() => pickStore(o.storeId)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                  )}
                  {canDelete && (
                    <button className="btn-ghost px-2 py-1" title="إزالة التخصيص" onClick={() => setToDelete(o)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </span>,
              ],
            }
          })}
          emptyIcon={Tags}
          emptyTitle="لا توجد أسعار مخصصة محفوظة"
          emptyHint="ابدأ باختيار محل من النموذج أعلاه وإدخال قيمة الحفظ، ليُطبَّق سعره بدل التسعير العام على طلبياته الجديدة."
        />
      )}

      <div className="card mt-5 p-4 text-[11px] leading-relaxed text-mute">
        <p className="mb-1 font-bold text-black">كيف تُحسب الأجرة؟</p>
        <p>
          1) إن كان للمحل سعر مخصص محفوظ ⇒ يُستخدم فوراً. 2) وإلا يُستخدم نظام التسعير العام النشط:{' '}
          {settings.pricingMode === 'geo' ? 'سعر المنطقة الأساسي + سعر كل كم' : 'سعر المسار (منطقة المحل ← منطقة الزبون)'}. 3) إن لم
          يتحدد أي سعر ⇒ يظهر للمحل «⚠️ لم يتم تحديد أجرة التوصيل». عند إزالة التخصيص يعود المحل تلقائياً للتسعير العام.
        </p>
      </div>

      {askFree && (
        <Modal title="تأكيد: توصيل مجاني" onClose={() => setAskFree(false)}>
          <p className="mt-2 text-xs leading-relaxed text-mute">
            سأجعل أجرة التوصيل <b className="text-black">0 د.ع</b> لكل طلبيات هذا المحل الجديدة. هذا يقلص صافي أجرة الكابتن في
            التسوية المالية إلى الصفر ما لم تُعدَّل قسمة الأجرة. هل تريد المتابعة؟
          </p>
          <div className="mt-4 flex gap-2">
            <button className="btn-primary flex-1" onClick={commit}>
              نعم، احفظ
            </button>
            <button className="btn-ghost flex-1" onClick={() => setAskFree(false)}>
              تراجع
            </button>
          </div>
        </Modal>
      )}

      {toDelete && (
        <Modal title="إزالة التخصيص" onClose={() => setToDelete(null)}>
          <p className="mt-2 text-xs leading-relaxed text-mute">
            سيتم حذف سعر <b className="text-black">{storeById(toDelete.storeId)?.name || '—'}</b> المخصص ({toDelete.fee} د.ع)
            ويعود المحل للتسعير العام على طلبياته الجديدة. الإجراء يُسجَّل في سجل العمليات.
          </p>
          <div className="mt-4 flex gap-2">
            <button className="btn-primary flex-1" onClick={() => remove(toDelete)}>
              نعم، احذف
            </button>
            <button className="btn-ghost flex-1" onClick={() => setToDelete(null)}>
              إلغاء
            </button>
          </div>
        </Modal>
      )}
      {node}
    </div>
  )
}
