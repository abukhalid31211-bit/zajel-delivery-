import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Route, Map, Pencil, Trash2 } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import DataTable from '../components/DataTable'
import Modal from '../components/Modal'
import MapCanvas from '../components/MapCanvas'
import { useToast } from '../components/Toast'
import { useDbList, logAudit } from '../lib/store'
import { uid } from '../lib/db'
import { getSettings, saveSettings } from '../lib/settings'
import OtherField, { OtherOption } from '../components/OtherOption'
import { ensureOtherDistrict, isOther } from '../lib/customOption'
import type { District, GeoPrice, Governorate, PriceRoute } from '../lib/types'

export default function Pricing() {
  const [params, setParams] = useSearchParams()
  const tab = params.get('tab') === 'geo' ? 1 : 0
  const setTab = (i: number) => setParams(i === 1 ? { tab: 'geo' } : {})
  const govs = useDbList<Governorate>('governorates')
  const districts = useDbList<District>('districts')
  const routes = useDbList<PriceRoute>('priceRoutes')
  const geoPrices = useDbList<GeoPrice>('geoPrices')
  const [govId, setGovId] = useState('')
  const [addRoute, setAddRoute] = useState(false)
  const [addGeo, setAddGeo] = useState(false)
  const [switchSys, setSwitchSys] = useState(false)
  const [fromId, setFromId] = useState('')
  const [toId, setToId] = useState('')
  const [price, setPrice] = useState('')
  const [perKm, setPerKm] = useState('')
  const [districtId, setDistrictId] = useState('')
  /* «أخرى»: أسماء المناطق الجديدة المكتوبة يدوياً */
  const [otherFrom, setOtherFrom] = useState('')
  const [otherTo, setOtherTo] = useState('')
  const [otherGeo, setOtherGeo] = useState('')
  const [editId, setEditId] = useState<string | null>(null)
  const [editPrice, setEditPrice] = useState('')
  const [err, setErr] = useState('')
  const { toast, node } = useToast()
  const settings = getSettings()
  const zoneDistricts = districts.items.filter((d) => !govId || d.govId === govId)

  const saveRoute = () => {
    if (!fromId || !toId) return setErr('اختر منطقتي الانطلاق والوصول')
    if (fromId === toId) return setErr('منطقة الانطلاق والوصول يجب أن تكونا مختلفتين')
    if (!price) return setErr('السعر مطلوب')
    let from = fromId
    let to = toId
    if (isOther(from) || isOther(to)) {
      if (!govId) return setErr('اختر المحافظة أولاً لحفظ المنطقة الجديدة فيها')
      if (isOther(from)) {
        const id = ensureOtherDistrict(districts.items, districts.setItems, otherFrom, govId)
        if (!id) return setErr('اكتب اسم منطقة الانطلاق الجديدة')
        from = id
      }
      if (isOther(to)) {
        const id = ensureOtherDistrict(districts.items, districts.setItems, otherTo, govId)
        if (!id) return setErr('اكتب اسم منطقة الوصول الجديدة')
        to = id
      }
      if (from === to) return setErr('منطقة الانطلاق والوصول يجب أن تكونا مختلفتين')
    }
    if (routes.items.some((r) => r.fromId === from && r.toId === to)) return setErr('هذا المسار موجود بالفعل. عدّل السعر بدلاً من ذلك.')
    routes.setItems((p) => [...p, { id: uid(), govId, fromId: from, toId: to, price }])
    logAudit({ action: 'تعديل سعر', entity: 'مسار', details: 'إضافة مسار سعري', oldValue: '—', newValue: price })
    setAddRoute(false)
    setPrice('')
    setFromId('')
    setToId('')
    setOtherFrom('')
    setOtherTo('')
    setErr('')
    toast('تمت إضافة المسار')
  }

  return (
    <div>
      <PageHeader
        title="أسعار التوصيل"
        subtitle="إدارة نظام تسعير زاجل ديلفري — جميع التغييرات تُسجل في سجل العمليات"
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Link to="/price-customization" className="btn-secondary text-xs">
              🏪 تخصيص أسعار المحلات
            </Link>
            <span className="badge border border-black bg-black text-white">
              النظام النشط حالياً: {settings.pricingMode === 'geo' ? 'نظام المناطق الجغرافية' : 'نظام المسارات (من ← إلى)'}
            </span>
          </div>
        }
      />

      <div className="mb-5 flex flex-wrap gap-2">
        <button
          onClick={() => setTab(0)}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-colors ${
            tab === 0 ? 'bg-black text-white' : 'border border-line bg-white text-mute hover:bg-page'
          }`}
        >
          <Route className="h-3.5 w-3.5" /> نظام من ← إلى 📍
        </button>
        <button
          onClick={() => setTab(1)}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-colors ${
            tab === 1 ? 'bg-black text-white' : 'border border-line bg-white text-mute hover:bg-page'
          }`}
        >
          <Map className="h-3.5 w-3.5" /> نظام المناطق الجغرافية 🗺️
        </button>
        <div className="flex-1" />
        <button className="btn-secondary text-xs" onClick={() => setSwitchSys(true)}>تبديل نظام التسعير النشط</button>
      </div>

      {tab === 0 && (
        <>
          <div className="card mb-5 flex flex-wrap items-center justify-between gap-3 p-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold">اختر المحافظة:</span>
              <select className="field w-auto min-w-44 cursor-pointer" value={govId} onChange={(e) => setGovId(e.target.value)}>
                <option value="">{govs.items.length ? 'كل المحافظات' : 'لا توجد محافظات معرفة'}</option>
                {govs.items.map((g) => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
            </div>
            <button className="btn-primary" onClick={() => { setAddRoute(true); setOtherFrom(''); setOtherTo(''); setErr('') }}>+ إضافة مسار سعري جديد</button>
          </div>
          <DataTable
            columns={['منطقة الانطلاق', '←', 'منطقة الوصول', 'السعر (د.ع)', 'الإجراءات']}
            rows={routes.items.filter((r) => !govId || r.govId === govId).map((r) => ({
              key: r.id,
              cells: [
                districts.items.find((d) => d.id === r.fromId)?.name || '—',
                '←',
                districts.items.find((d) => d.id === r.toId)?.name || '—',
                editId === r.id ? (
                  <span className="flex items-center gap-1">
                    <input className="field w-24 py-1" value={editPrice} onChange={(e) => setEditPrice(e.target.value.replace(/[^\d]/g, ''))} />
                    <button
                      className="btn-primary px-2 py-1 text-[10px]"
                      onClick={() => {
                        logAudit({ action: 'تعديل سعر', entity: 'مسار', details: `غيّر السعر`, oldValue: r.price, newValue: editPrice })
                        routes.setItems((p) => p.map((x) => (x.id === r.id ? { ...x, price: editPrice } : x)))
                        setEditId(null)
                        toast('تم تحديث السعر')
                      }}
                    >
                      ✅
                    </button>
                  </span>
                ) : (
                  `${r.price} د.ع`
                ),
                <span className="flex gap-1">
                  <button className="btn-ghost px-2 py-1" onClick={() => { setEditId(r.id); setEditPrice(r.price) }}><Pencil className="h-3.5 w-3.5" /></button>
                  <button className="btn-ghost px-2 py-1" onClick={() => { routes.setItems((p) => p.filter((x) => x.id !== r.id)); toast('تم حذف المسار') }}><Trash2 className="h-3.5 w-3.5" /></button>
                </span>,
              ],
            }))}
            emptyIcon={ArrowLeft}
            emptyTitle="لا توجد مسارات سعرية معرفة"
            emptyHint="أضف مسارات التسعير (من منطقة إلى منطقة) لتحسب أجرة التوصيل تلقائياً عند إنشاء الطلبيات."
          />
        </>
      )}

      {tab === 1 && (
        <>
          <div className="card mb-5 flex flex-wrap items-center justify-between gap-3 p-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold">اختر المحافظة:</span>
              <select className="field w-auto min-w-44 cursor-pointer" value={govId} onChange={(e) => setGovId(e.target.value)}>
                <option value="">{govs.items.length ? 'كل المحافظات' : 'لا توجد محافظات معرفة'}</option>
                {govs.items.map((g) => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
            </div>
            <button className="btn-primary" onClick={() => { setAddGeo(true); setOtherGeo('') }}>+ إضافة منطقة سعرية</button>
          </div>
          <MapCanvas
            governorate={govs.items.find((g) => g.id === govId)?.name ?? null}
            zones={zoneDistricts.map((d) => d.points).filter((p) => p.length > 2)}
            tools={false}
            height={280}
            hint="تظهر المضلعات المرسومة للمناطق هنا على خريطة العراق الحقيقية — اختر محافظة للانتقال إليها والتكبير على مناطقها. اربط كل منطقة بسعر من الجدول."
          />
          <div className="mt-4">
            <DataTable
              columns={['المنطقة', 'السعر الأساسي (د.ع)', 'سعر الإضافي لكل كم (د.ع)', 'الإجراءات']}
              rows={geoPrices.items.map((g) => ({
                key: g.id,
                cells: [
                  districts.items.find((d) => d.id === g.districtId)?.name || '—',
                  `${g.base} د.ع`,
                  `${g.perKm} د.ع`,
                  <button className="btn-ghost px-2 py-1" onClick={() => geoPrices.setItems((p) => p.filter((x) => x.id !== g.id))}><Trash2 className="h-3.5 w-3.5" /></button>,
                ],
              }))}
              emptyIcon={Map}
              emptyTitle="لا توجد مناطق سعرية معرفة"
              emptyHint="اربط المناطق الجغرافية المرسومة بأسعار أساسية وسعر إضافي لكل كيلومتر."
            />
          </div>
        </>
      )}

      {addRoute && (
        <Modal title="إضافة مسار سعري جديد" onClose={() => setAddRoute(false)}>
          <div className="mt-4 space-y-3">
            <div>
              <label className="mb-1.5 block text-xs font-semibold">منطقة الانطلاق (من)</label>
              <select className="field cursor-pointer" value={fromId} onChange={(e) => setFromId(e.target.value)}>
                <option value="">{zoneDistricts.length ? 'اختر' : 'لا توجد مناطق معرفة'}</option>
                {zoneDistricts.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                <OtherOption label="➕ أخرى — منطقة جديدة" />
              </select>
              {isOther(fromId) && (
                <OtherField
                  label="اسم منطقة الانطلاق"
                  placeholder="اكتب اسم المنطقة لحفظها واختيارها"
                  value={otherFrom}
                  onChange={setOtherFrom}
                  hint="تُحفظ في «المناطق والجغرافيا» ضمن المحافظة المختارة."
                />
              )}
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold">منطقة الوصول (إلى)</label>
              <select className="field cursor-pointer" value={toId} onChange={(e) => setToId(e.target.value)}>
                <option value="">{zoneDistricts.length ? 'اختر' : 'لا توجد مناطق معرفة'}</option>
                {zoneDistricts.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                <OtherOption label="➕ أخرى — منطقة جديدة" />
              </select>
              {isOther(toId) && (
                <OtherField
                  label="اسم منطقة الوصول"
                  placeholder="اكتب اسم المنطقة لحفظها واختيارها"
                  value={otherTo}
                  onChange={setOtherTo}
                  hint="تُحفظ في «المناطق والجغرافيا» ضمن المحافظة المختارة."
                />
              )}
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold">سعر التوصيل (بالدينار العراقي)</label>
              <input className="field" placeholder="0" inputMode="numeric" dir="ltr" value={price} onChange={(e) => setPrice(e.target.value.replace(/[^\d]/g, ''))} />
            </div>
            {err && <p className="text-[11px] font-medium">⚠ {err}</p>}
          </div>
          <div className="mt-4 flex gap-2">
            <button className="btn-primary flex-1" onClick={saveRoute}>حفظ</button>
            <button className="btn-ghost flex-1" onClick={() => setAddRoute(false)}>إلغاء</button>
          </div>
        </Modal>
      )}

      {addGeo && (
        <Modal title="إضافة منطقة سعرية" onClose={() => setAddGeo(false)}>
          <div className="mt-4 space-y-3">
            <div>
              <select className="field cursor-pointer" value={districtId} onChange={(e) => setDistrictId(e.target.value)}>
                <option value="">اختر المنطقة</option>
                {zoneDistricts.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                <OtherOption label="➕ أخرى — منطقة جديدة" />
              </select>
              {isOther(districtId) && (
                <OtherField
                  label="اسم المنطقة"
                  placeholder="اكتب اسم المنطقة لحفظها واختيارها"
                  value={otherGeo}
                  onChange={setOtherGeo}
                  hint="تُحفظ في «المناطق والجغرافيا» ضمن المحافظة المختارة."
                />
              )}
            </div>
            <input className="field" placeholder="السعر الأساسي" value={price} onChange={(e) => setPrice(e.target.value.replace(/[^\d]/g, ''))} />
            <input className="field" placeholder="سعر إضافي لكل كم" value={perKm} onChange={(e) => setPerKm(e.target.value.replace(/[^\d]/g, ''))} />
          </div>
          <div className="mt-4 flex gap-2">
            <button
              className="btn-primary flex-1"
              disabled={!districtId || !price}
              onClick={() => {
                let zoneId = districtId
                if (isOther(districtId)) {
                  if (!govId) return toast('اختر المحافظة أولاً لحفظ المنطقة الجديدة فيها')
                  const id = ensureOtherDistrict(districts.items, districts.setItems, otherGeo, govId)
                  if (!id) return toast('اكتب اسم المنطقة الجديدة')
                  zoneId = id
                }
                geoPrices.setItems((p) => [...p, { id: uid(), districtId: zoneId, base: price, perKm: perKm || '0' }])
                setAddGeo(false)
                setPrice('')
                setPerKm('')
                setOtherGeo('')
                toast('تمت إضافة المنطقة السعرية')
              }}
            >
              حفظ
            </button>
            <button className="btn-ghost flex-1" onClick={() => setAddGeo(false)}>إلغاء</button>
          </div>
        </Modal>
      )}

      {switchSys && (
        <Modal title="تغيير نظام التسعير النشط" onClose={() => setSwitchSys(false)}>
          <p className="mt-2 text-xs leading-relaxed text-mute">
            هل تريد تغيير نظام التسعير؟ سيتم تطبيق النظام الجديد على جميع الطلبيات الجديدة فوراً، ويُسجل التغيير في سجل العمليات.
          </p>
          <div className="mt-4 flex gap-2">
            <button
              className="btn-primary flex-1"
              onClick={() => {
                const next = settings.pricingMode === 'route' ? 'geo' : 'route'
                saveSettings({ ...settings, pricingMode: next })
                logAudit({ action: 'تغيير إعداد', entity: 'نظام التسعير', details: 'تبديل النظام النشط', oldValue: settings.pricingMode, newValue: next })
                setSwitchSys(false)
                toast('تم تبديل نظام التسعير النشط ✅')
              }}
            >
              تأكيد التبديل
            </button>
            <button className="btn-ghost flex-1" onClick={() => setSwitchSys(false)}>إلغاء</button>
          </div>
        </Modal>
      )}

      {node}
    </div>
  )
}
