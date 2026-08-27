import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Map, MapPin, PencilRuler, Eye, Pencil, Trash2 } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import DataTable from '../components/DataTable'
import Modal from '../components/Modal'
import Toggle from '../components/Toggle'
import StatusBadge from '../components/StatusBadge'
import MapCanvas from '../components/MapCanvas'
import { useToast } from '../components/Toast'
import { useDbList, logAudit } from '../lib/store'
import { uid } from '../lib/db'
import type { District, Governorate } from '../lib/types'

const tabKeys = ['gov', 'districts', 'geo']

export default function Zones() {
  const [params, setParams] = useSearchParams()
  const tab = Math.max(0, tabKeys.indexOf(params.get('tab') || 'gov'))
  const setTab = (i: number) => setParams({ tab: tabKeys[i] })
  const govs = useDbList<Governorate>('governorates')
  const districts = useDbList<District>('districts')
  const [addGov, setAddGov] = useState(false)
  const [addDistrict, setAddDistrict] = useState(false)
  const [name, setName] = useState('')
  const [confirm, setConfirm] = useState<Governorate | District | null>(null)
  const [editing, setEditing] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [govFilter, setGovFilter] = useState('')
  const [geoId, setGeoId] = useState('')
  const [err, setErr] = useState('')
  const { toast, node } = useToast()

  const filteredDistricts = useMemo(
    () => districts.items.filter((d) => !govFilter || d.govId === govFilter),
    [districts.items, govFilter],
  )
  const geoDistrict = districts.items.find((d) => d.id === geoId)

  const saveGov = () => {
    if (!name.trim()) return setErr('اسم المحافظة مطلوب')
    if (govs.items.some((g) => g.name === name.trim())) return setErr('هذه المحافظة موجودة بالفعل')
    govs.setItems((p) => [...p, { id: uid(), name: name.trim(), enabled: true }])
    logAudit({ action: 'إضافة', entity: 'محافظة', details: name.trim(), oldValue: '—', newValue: name.trim() })
    setAddGov(false)
    setName('')
    setErr('')
    toast('تم تحديث حالة المحافظة بنجاح')
  }

  const saveDistrict = () => {
    if (!name.trim()) return setErr('اسم المنطقة مطلوب')
    if (!govFilter && !govs.items[0]) return setErr('أضف محافظة أولاً')
    const gid = govFilter || govs.items[0]?.id
    if (districts.items.some((d) => d.govId === gid && d.name === name.trim())) return setErr('هذه المنطقة موجودة بالفعل')
    districts.setItems((p) => [...p, { id: uid(), govId: gid, name: name.trim(), enabled: true, points: [] }])
    logAudit({ action: 'إضافة', entity: 'منطقة', details: name.trim(), oldValue: '—', newValue: name.trim() })
    setAddDistrict(false)
    setName('')
    setErr('')
    toast('تمت إضافة المنطقة بنجاح')
  }

  return (
    <div>
      <PageHeader
        title={tab === 1 && govFilter ? `إدارة المناطق — ${govs.items.find((g) => g.id === govFilter)?.name || ''}` : 'المناطق والجغرافيا'}
        subtitle="إدارة المحافظات العراقية والمناطق التابعة لها ورسم الحدود الجغرافية"
        actions={
          tab === 0 ? (
            <button className="btn-primary" onClick={() => { setAddGov(true); setName(''); setErr('') }}>+ إضافة محافظة</button>
          ) : tab === 1 ? (
            <button className="btn-primary" onClick={() => { setAddDistrict(true); setName(''); setErr('') }}>+ إضافة منطقة جديدة</button>
          ) : undefined
        }
      />

      {tab === 1 && (
        <p className="mb-4 text-[11px] text-faint">المحافظات &gt; {govs.items.find((g) => g.id === govFilter)?.name || 'الكل'} &gt; المناطق</p>
      )}

      <div className="mb-5 flex flex-wrap gap-2">
        {[
          { label: 'المحافظات', icon: Map },
          { label: 'المناطق', icon: MapPin },
          { label: 'رسم الحدود (Geofencing)', icon: PencilRuler },
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
        <DataTable
          columns={['اسم المحافظة', 'عدد المناطق', 'الحالة', 'الإجراءات']}
          rows={govs.items.map((g) => ({
            key: g.id,
            cells: [
              editing === g.id ? (
                <span className="flex items-center gap-1">
                  <input className="field w-36 py-1" value={editName} onChange={(e) => setEditName(e.target.value)} />
                  <button className="btn-primary px-2 py-1 text-[10px]" onClick={() => { govs.setItems((p) => p.map((x) => (x.id === g.id ? { ...x, name: editName } : x))); setEditing(null); toast('تم تعديل الاسم') }}>✅</button>
                  <button className="btn-ghost px-2 py-1 text-[10px]" onClick={() => setEditing(null)}>✕</button>
                </span>
              ) : (
                g.name
              ),
              String(districts.items.filter((d) => d.govId === g.id).length),
              <StatusBadge status={g.enabled ? 'مفعّلة' : 'متوقفة'} />,
              <span className="flex items-center gap-1">
                <Toggle
                  on={g.enabled}
                  onChange={() => setConfirm(g)}
                />
                <button className="btn-ghost px-2 py-1" title="عرض المناطق" onClick={() => { setGovFilter(g.id); setTab(1) }}>
                  <Eye className="h-3.5 w-3.5" />
                </button>
                <button className="btn-ghost px-2 py-1" onClick={() => { setEditing(g.id); setEditName(g.name) }}>
                  <Pencil className="h-3.5 w-3.5" />
                </button>
              </span>,
            ],
          }))}
          emptyIcon={Map}
          emptyTitle="لم يتم تفعيل أي محافظة بعد"
          emptyHint="أضف المحافظات العراقية وفعّلها لبدء استقبال الطلبيات فيها. إيقاف المحافظة يوقف جميع المناطق والطلبيات المرتبطة بها فوراً."
        />
      )}

      {tab === 1 && (
        <>
          <div className="card mb-5 flex flex-wrap items-center gap-3 p-4">
            <span className="text-xs font-semibold">اختر المحافظة:</span>
            <select className="field w-auto min-w-44 cursor-pointer" value={govFilter} onChange={(e) => setGovFilter(e.target.value)}>
              <option value="">كل المحافظات</option>
              {govs.items.map((g) => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </div>
          <DataTable
            columns={['اسم المنطقة', 'المحافظة', 'الحالة', 'عدد الطلبيات اليوم', 'الإجراءات']}
            rows={filteredDistricts.map((d) => ({
              key: d.id,
              cells: [
                d.name,
                govs.items.find((g) => g.id === d.govId)?.name || '—',
                <StatusBadge status={d.enabled ? 'مفعّلة' : 'متوقفة'} />,
                '0',
                <span className="flex items-center gap-1">
                  <Toggle on={d.enabled} onChange={() => districts.setItems((p) => p.map((x) => (x.id === d.id ? { ...x, enabled: !x.enabled } : x)))} />
                  <button className="btn-ghost px-2 py-1" onClick={() => { setGeoId(d.id); setTab(2) }} title="رسم الحدود">🗺️</button>
                  <button className="btn-ghost px-2 py-1" onClick={() => setConfirm(d)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </span>,
              ],
            }))}
            emptyIcon={MapPin}
            emptyTitle="لا توجد مناطق معرفة"
            emptyHint="أضف المناطق داخل المحافظات لتحديد نطاقات التوصيل والتسعير."
          />
        </>
      )}

      {tab === 2 && (
        <div className="space-y-4">
          <div className="card flex flex-wrap items-center gap-3 p-4">
            <span className="text-xs font-semibold">المنطقة:</span>
            <select className="field w-auto min-w-44 cursor-pointer" value={geoId} onChange={(e) => setGeoId(e.target.value)}>
              <option value="">اختر منطقة</option>
              {districts.items.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
            <button
              className="btn-primary"
              disabled={!geoDistrict}
              onClick={() => {
                toast('تم حفظ حدود المنطقة بنجاح')
                logAudit({ action: 'تعديل', entity: 'حدود جغرافية', details: geoDistrict?.name || '', oldValue: '—', newValue: `${geoDistrict?.points.length || 0} نقطة` })
              }}
            >
              💾 حفظ الحدود
            </button>
          </div>
          <MapCanvas
            points={geoDistrict?.points || []}
            zones={districts.items.filter((d) => d.id !== geoId).map((d) => d.points).filter((p) => p.length > 2)}
            onChange={(pts) => {
              if (!geoDistrict) return
              districts.setItems((p) => p.map((x) => (x.id === geoDistrict.id ? { ...x, points: pts } : x)))
            }}
          />
        </div>
      )}

      {addGov && (
        <Modal title="إضافة محافظة" onClose={() => setAddGov(false)}>
          <div className="mt-4 space-y-3">
            <div>
              <label className="mb-1.5 block text-xs font-semibold">اسم المحافظة</label>
              <input className="field" placeholder="مثال: بغداد" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            {err && <p className="text-[11px] font-medium">⚠ {err}</p>}
          </div>
          <div className="mt-4 flex gap-2">
            <button className="btn-primary flex-1" onClick={saveGov}>حفظ</button>
            <button className="btn-ghost flex-1" onClick={() => setAddGov(false)}>إلغاء</button>
          </div>
        </Modal>
      )}

      {addDistrict && (
        <Modal title="إضافة منطقة جديدة" onClose={() => setAddDistrict(false)}>
          <div className="mt-4 space-y-3">
            <div>
              <label className="mb-1.5 block text-xs font-semibold">اسم المنطقة</label>
              <input className="field" placeholder="اسم المنطقة الإدارية" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold">المحافظة</label>
              <select className="field cursor-pointer" value={govFilter} onChange={(e) => setGovFilter(e.target.value)}>
                <option value="">{govs.items.length ? 'اختر المحافظة' : 'لا توجد محافظات معرفة — أضف محافظة أولاً'}</option>
                {govs.items.map((g) => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
            </div>
            {err && <p className="text-[11px] font-medium">⚠ {err}</p>}
          </div>
          <div className="mt-4 flex gap-2">
            <button className="btn-primary flex-1" onClick={saveDistrict}>حفظ</button>
            <button className="btn-ghost flex-1" onClick={() => setAddDistrict(false)}>إلغاء</button>
          </div>
        </Modal>
      )}

      {confirm && 'enabled' in confirm && 'name' in confirm && !('govId' in confirm) && (
        <Modal title="تأكيد تغيير الحالة" onClose={() => setConfirm(null)}>
          <p className="mt-2 text-xs leading-relaxed text-mute">
            {confirm.enabled
              ? `هل تريد إيقاف محافظة ${confirm.name}؟ سيتم إيقاف جميع المناطق والطلبات المرتبطة بها.`
              : `هل تريد تفعيل محافظة ${confirm.name}؟`}
          </p>
          <div className="mt-4 flex gap-2">
            <button
              className="btn-primary flex-1"
              onClick={() => {
                govs.setItems((p) => p.map((x) => (x.id === confirm.id ? { ...x, enabled: !x.enabled } : x)))
                logAudit({ action: 'تغيير إعداد', entity: confirm.name, details: 'تغيير حالة المحافظة', oldValue: confirm.enabled ? 'مفعّلة' : 'متوقفة', newValue: confirm.enabled ? 'متوقفة' : 'مفعّلة' })
                setConfirm(null)
                toast('تم تحديث حالة المحافظة بنجاح')
              }}
            >
              تأكيد
            </button>
            <button className="btn-ghost flex-1" onClick={() => setConfirm(null)}>إلغاء</button>
          </div>
        </Modal>
      )}

      {confirm && 'govId' in confirm && (
        <Modal title="تأكيد الحذف" onClose={() => setConfirm(null)}>
          <p className="mt-2 text-xs text-mute">هل تريد حذف منطقة {confirm.name}؟ لا يمكن التراجع عن هذا الإجراء.</p>
          <div className="mt-4 flex gap-2">
            <button
              className="btn-primary flex-1"
              onClick={() => {
                districts.setItems((p) => p.filter((x) => x.id !== confirm.id))
                setConfirm(null)
                toast('تم حذف المنطقة')
              }}
            >
              حذف
            </button>
            <button className="btn-ghost flex-1" onClick={() => setConfirm(null)}>إلغاء</button>
          </div>
        </Modal>
      )}

      {node}
    </div>
  )
}
