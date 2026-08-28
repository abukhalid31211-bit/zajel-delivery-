import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Bike, UserPlus, CalendarClock, ClipboardCheck, Eye, Ban } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import FilterBar, { emptyFilters, sel, type Filters } from '../components/FilterBar'
import { SkeletonTable } from '../components/Skeleton'
import DataTable from '../components/DataTable'
import Modal from '../components/Modal'
import Drawer from '../components/Drawer'
import StatusBadge from '../components/StatusBadge'
import EmptyState from '../components/EmptyState'
import Toggle from '../components/Toggle'
import { useToast } from '../components/Toast'
import { useDbList, logAudit, VEHICLES } from '../lib/store'
import { getSettings, saveSettings } from '../lib/settings'
import OtherField, { OtherOption } from '../components/OtherOption'
import { ensureOtherShift, isOther, otherName } from '../lib/customOption'
import { uid, nowIso, formatDate } from '../lib/db'
import { isIraqMobile, digitsOnly } from '../lib/validate'
import { can, inCaptainScope, inGeoScope, inGovScope } from '../lib/rbac'
import type { Captain, District, Governorate, Shift } from '../lib/types'

const tabKeys = ['list', 'pending', 'shifts', 'attendance']

export default function Captains() {
  const [params, setParams] = useSearchParams()
  const tab = Math.max(0, tabKeys.indexOf(params.get('tab') || 'list'))
  const setTab = (i: number) => setParams(i === 0 ? {} : { tab: tabKeys[i] })
  const navigate = useNavigate()
  const captains = useDbList<Captain>('captains')
  const shifts = useDbList<Shift>('shifts')
  const govs = useDbList<Governorate>('governorates')
  const districts = useDbList<District>('districts')
  const [addShift, setAddShift] = useState(false)
  const [addCap, setAddCap] = useState(false)
  const [shiftName, setShiftName] = useState('')
  const [start, setStart] = useState('08:00')
  const [end, setEnd] = useState('16:00')
  const [overlap, setOverlap] = useState(false)
  const [week, setWeek] = useState('الحالي')
  const [drawer, setDrawer] = useState<Shift | null>(null)
  const [form, setForm] = useState({ name: '', phone: '', email: '', govId: '', districtIds: [] as string[], vehicle: VEHICLES[0], shiftId: '' })
  /* «أخرى»: مركبة باسم حرّ، وشفت جديد يُضاف لقائمة الشفتات */
  const [otherVehicle, setOtherVehicle] = useState('')
  const [otherShiftName, setOtherShiftName] = useState('')
  const [otherShiftStart, setOtherShiftStart] = useState('08:00')
  const [otherShiftEnd, setOtherShiftEnd] = useState('16:00')
  const [err, setErr] = useState('')
  const [reject, setReject] = useState<Captain | null>(null)
  const [reason, setReason] = useState('')
  const { toast, node } = useToast()
  const [filters, setFilters] = useState<Filters>(emptyFilters())
  const [loading, setLoading] = useState(false)
  const scopedGovs = govs.items.filter((g) => inGovScope(g.id))
  const scopedDistricts = districts.items.filter((d) => inGeoScope(d.govId, d.id))

  const list = useMemo(() => {
    let rows = captains.items.filter((c) => inCaptainScope(c))
    if (tab === 1) rows = rows.filter((c) => c.status === 'بانتظار الموافقة')
    if (filters.q.trim()) rows = rows.filter((c) => `${c.name} ${c.phone}`.includes(filters.q.trim()))
    const st = sel(filters, 'الحالة')
    if (st) rows = rows.filter((c) => c.status === st)
    const gname = sel(filters, 'المحافظة')
    if (gname) {
      const gid = govs.items.find((g) => g.name === gname)?.id
      rows = rows.filter((c) => c.govId === gid)
    }
    const dname = sel(filters, 'المنطقة')
    if (dname) {
      const did = districts.items.find((d) => d.name === dname)?.id
      rows = rows.filter((c) => c.districtIds.includes(did || ''))
    }
    const sh = sel(filters, 'الشفت')
    if (sh) {
      const sid = shifts.items.find((s) => s.name === sh)?.id
      rows = rows.filter((c) => c.shiftId === sid)
    }
    return rows
  }, [captains.items, tab, filters, govs.items, districts.items, shifts.items])

  const duration = (() => {
    if (!start || !end) return '—'
    const [sh, sm] = start.split(':').map(Number)
    const [eh, em] = end.split(':').map(Number)
    let mins = eh * 60 + em - (sh * 60 + sm)
    if (mins <= 0) mins += 24 * 60
    return `${Math.floor(mins / 60)}س ${mins % 60}د`
  })()

  return (
    <div>
      <PageHeader
        title="إدارة الكباتن"
        subtitle="الموافقات، الملفات، الشفتات وسجل الحضور لجميع كباتن التوصيل"
        actions={
          <>
            <button className="btn-ghost" onClick={() => navigate('/captains/profile')}>👁️ معاينة ملف الكابتن</button>
            {can('الكباتن', 'إضافة') && (
              <button className="btn-primary" onClick={() => { setAddCap(true); setErr(''); setOtherVehicle(''); setOtherShiftName(''); setForm({ name: '', phone: '', email: '', govId: '', districtIds: [], vehicle: VEHICLES[0], shiftId: '' }) }}>+ إضافة كابتن يدوياً</button>
            )}
          </>
        }
      />

      <div className="mb-5 flex flex-wrap gap-2">
        {[
          { label: 'قائمة الكباتن', icon: Bike },
          { label: 'طلبات التسجيل الجديدة', icon: UserPlus },
          { label: 'شفتات العمل', icon: CalendarClock },
          { label: 'سجل الحضور', icon: ClipboardCheck },
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
              { label: 'الحالة', options: ['نشط', 'بانتظار الموافقة', 'موقوف', 'مرفوض'] },
              { label: 'المحافظة', options: scopedGovs.map((g) => g.name) },
              { label: 'المنطقة', options: scopedDistricts.map((d) => d.name) },
              { label: 'الشفت', options: shifts.items.map((s) => s.name) },
            ]}
            onChange={setFilters}
            onSearch={() => { setLoading(true); window.setTimeout(() => setLoading(false), 280) }}
            onReset={() => setFilters(emptyFilters())}
          />
          {loading ? <SkeletonTable cols={8} /> : <DataTable
            columns={['الصورة', 'الاسم', 'رقم الهاتف', 'المناطق', 'الشفت', 'الحالة', 'التقييم ⭐', 'الإجراءات']}
            rows={list.map((c) => ({
              key: c.id,
              onClick: () => navigate(`/captains/profile?id=${c.id}`),
              cells: [
                '👤',
                <span>
                  {c.name} {c.reapply && <span className="badge mr-1 border border-line bg-page text-mute">إعادة تقديم بعد رفض سابق</span>}
                </span>,
                c.phone,
                String(c.districtIds.length),
                shifts.items.find((s) => s.id === c.shiftId)?.name || '—',
                <StatusBadge status={c.status} />,
                c.rating || '—',
                <span className="flex gap-1">
                  <button className="btn-ghost px-2 py-1" onClick={() => navigate(`/captains/profile?id=${c.id}`)}><Eye className="h-3.5 w-3.5" /></button>
                  {c.status === 'بانتظار الموافقة' && can('الكباتن', 'موافقة') && (
                    <>
                      <button className="btn-primary px-2 py-1 text-[10px]" onClick={() => {
                        captains.setItems((p) => p.map((x) => (x.id === c.id ? { ...x, status: 'نشط' } : x)))
                        logAudit({ action: 'موافقة', entity: c.name, details: 'موافقة كابتن', oldValue: 'بانتظار الموافقة', newValue: 'نشط' })
                        toast('تمت الموافقة على الكابتن')
                      }}>موافقة</button>
                      <button className="btn-ghost px-2 py-1 text-[10px]" onClick={() => setReject(c)}>رفض</button>
                    </>
                  )}
                  {c.status === 'نشط' && (
                    <button className="btn-ghost px-2 py-1" onClick={() => navigate(`/captains/profile?id=${c.id}`)}><Ban className="h-3.5 w-3.5" /></button>
                  )}
                  {c.status === 'موقوف' && (
                    <button className="btn-secondary px-2 py-1 text-[10px]" onClick={() => {
                      captains.setItems((p) => p.map((x) => (x.id === c.id ? { ...x, status: 'نشط' } : x)))
                      toast('تم إعادة تفعيل الكابتن')
                    }}>تفعيل</button>
                  )}
                </span>,
              ],
            }))}
            emptyIcon={Bike}
            emptyTitle="لا يوجد كباتن مسجلون بعد"
            emptyHint="ستظهر حسابات الكباتن هنا فور تسجيلهم عبر تطبيق الكابتن."
          />}
        </>
      )}

      {tab === 1 && (
        <DataTable
          columns={['الاسم الثلاثي', 'رقم الهاتف', 'المحافظة', 'نوع المركبة', 'الوثائق', 'تاريخ التقديم', 'الإجراءات']}
          rows={list.map((c) => ({
            key: c.id,
            cells: [
              <span>
                {c.name}
                {c.reapply && <span className="mt-1 block text-[10px] text-mute">إعادة تقديم — رفض سابق: {c.rejectReason || '—'}</span>}
              </span>,
              c.phone,
              govs.items.find((g) => g.id === c.govId)?.name || '—',
              c.vehicle,
              'بانتظار الرفع',
              formatDate(c.createdAt),
              can('الكباتن', 'موافقة') ? (
                <span className="flex gap-1">
                  <button className="btn-primary px-2 py-1 text-[10px]" onClick={() => {
                    captains.setItems((p) => p.map((x) => (x.id === c.id ? { ...x, status: 'نشط' } : x)))
                    toast('تمت الموافقة على الكابتن')
                  }}>موافقة</button>
                  <button className="btn-ghost px-2 py-1 text-[10px]" onClick={() => setReject(c)}>رفض</button>
                </span>
              ) : 'مشاهدة فقط',
            ],
          }))}
          emptyIcon={UserPlus}
          emptyTitle="لا توجد طلبات تسجيل جديدة"
          emptyHint="طلبات انضمام الكباتن الجدد ستظهر هنا للمراجعة والموافقة أو الرفض، بما فيها طلبات إعادة التقديم بعد الرفض."
        />
      )}

      {tab === 2 && (
        <>
          <div className="card mb-5 flex flex-wrap items-center justify-between gap-3 p-4">
            <p className="text-xs leading-relaxed text-mute">
              حدد أوقات العمل المتاحة للكباتن. الكابتن يختار شفتاً واحداً أسبوعياً ولا يستطيع تغييره إلا مرة واحدة خلال الأسبوع.
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <select className="field w-auto cursor-pointer text-xs" value={week} onChange={(e) => setWeek(e.target.value)}>
                <option>الحالي</option>
                <option>القادم</option>
                <option>تاريخ مخصص</option>
              </select>
              {can('الشفتات', 'إضافة') && <button className="btn-primary shrink-0" onClick={() => setAddShift(true)}>+ إضافة شفت جديد</button>}
            </div>
          </div>
          <DataTable
            columns={['اسم الشفت', 'وقت البداية', 'وقت النهاية', 'المدة', 'عدد الكباتن', 'الحالة', 'الإجراءات']}
            rows={shifts.items.map((s) => ({
              key: s.id,
              cells: [
                s.name,
                s.start,
                s.end,
                '—',
                String(captains.items.filter((c) => c.shiftId === s.id).length),
                <StatusBadge status={s.enabled ? 'نشط' : 'موقوف'} />,
                <span className="flex gap-1">
                  <Toggle on={s.enabled} onChange={(v) => shifts.setItems((p) => p.map((x) => (x.id === s.id ? { ...x, enabled: v } : x)))} />
                  <button className="btn-ghost px-2 py-1" onClick={() => setDrawer(s)}><Eye className="h-3.5 w-3.5" /></button>
                  <button className="btn-ghost px-2 py-1" onClick={() => shifts.setItems((p) => p.filter((x) => x.id !== s.id))}>🗑️</button>
                </span>,
              ],
            }))}
            emptyIcon={CalendarClock}
            emptyTitle="لا توجد شفتات معرفة بعد"
            emptyHint="أنشئ شفتات العمل (صباحي، مسائي، ليلي...) ليتمكن الكباتن من الاختيار بينها."
          />
        </>
      )}

      {tab === 3 && (
        <>
          <FilterBar searchPlaceholder="ابحث باسم الكابتن..." selects={[{ label: 'الشفت', options: shifts.items.map((s) => s.name) }]} withDate />
          <DataTable
            columns={['الكابتن', 'التاريخ', 'الشفت', 'وقت الدخول', 'وقت الخروج', 'مدة العمل الفعلية']}
            emptyIcon={ClipboardCheck}
            emptyTitle="لا توجد سجلات حضور"
            emptyHint="يُسجل حضور وانصراف الكباتن تلقائياً عند اتصالهم داخل أوقات شفتاتهم."
          />
        </>
      )}

      {addShift && (
        <Modal title="إضافة شفت جديد" onClose={() => setAddShift(false)}>
          <div className="mt-4 space-y-3">
            <div>
              <label className="mb-1.5 block text-xs font-semibold">اسم الشفت</label>
              <input className="field" placeholder="مثال: الشفت الصباحي" value={shiftName} onChange={(e) => setShiftName(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-xs font-semibold">وقت البداية</label>
                <input type="time" className="field cursor-pointer" value={start} onChange={(e) => setStart(e.target.value)} />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold">وقت النهاية</label>
                <input type="time" className="field cursor-pointer" value={end} onChange={(e) => setEnd(e.target.value)} />
              </div>
            </div>
            <p className="text-[11px] text-mute">المدة المحتسبة: {duration} {start >= end ? '(شفت ليلي عبر منتصف الليل)' : ''}</p>
            {overlap && (
              <p className="rounded-xl border border-dashed border-black px-3 py-2 text-[10px] font-semibold">هذا الشفت يتداخل مع شفت موجود. التداخل مسموح تقنياً.</p>
            )}
          </div>
          <div className="mt-4 flex gap-2">
            <button
              className="btn-primary flex-1"
              disabled={!shiftName.trim()}
              onClick={() => {
                const overlaps = shifts.items.some((s) => s.start < end && s.end > start)
                if (overlaps && !overlap) {
                  setOverlap(true)
                  return
                }
                shifts.setItems((p) => [...p, { id: uid(), name: shiftName.trim(), start, end, enabled: true }])
                setAddShift(false)
                setShiftName('')
                setOverlap(false)
                toast('تمت إضافة الشفت بنجاح')
              }}
            >
              حفظ
            </button>
            <button className="btn-ghost flex-1" onClick={() => setAddShift(false)}>إلغاء</button>
          </div>
        </Modal>
      )}

      {addCap && (
        <Modal title="إضافة كابتن يدوياً" onClose={() => setAddCap(false)} wide>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold">الاسم الثلاثي</label>
              <input className="field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold">رقم الهاتف</label>
              <input className="field" dir="ltr" placeholder="7XXXXXXXXX" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold">Gmail</label>
              <input className="field" dir="ltr" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold">المحافظة (ثابتة)</label>
              <select className="field cursor-pointer" value={form.govId} onChange={(e) => setForm({ ...form, govId: e.target.value, districtIds: [] })}>
                <option value="">اختر</option>
                {scopedGovs.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold">مناطق عمل الكابتن</label>
              <select
                className="field min-h-24 cursor-pointer"
                multiple
                value={form.districtIds}
                onChange={(e) => setForm({ ...form, districtIds: Array.from(e.target.selectedOptions).map((o) => o.value) })}
              >
                {scopedDistricts.filter((d) => !form.govId || d.govId === form.govId).map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
              <p className="mt-1 text-[10px] text-faint">اختر منطقة أو أكثر حتى يظهر الكابتن لليدر المنطقة وتقاريرها.</p>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold">نوع المركبة</label>
              <select className="field cursor-pointer" value={form.vehicle} onChange={(e) => setForm({ ...form, vehicle: e.target.value })}>
                {VEHICLES.map((v) => <option key={v}>{v}</option>)}
                <OtherOption label="➕ أخرى — نوع مركبة آخر" />
              </select>
              {isOther(form.vehicle) && (
                <OtherField
                  label="اسم نوع المركبة"
                  placeholder="مثال: توكتوك 🛺"
                  value={otherVehicle}
                  onChange={setOtherVehicle}
                  hint="يُحفظ مع حساب الكابتن ويُضاف إلى «أنواع المركبات» في الإعدادات."
                />
              )}
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold">الشفت</label>
              <select className="field cursor-pointer" value={form.shiftId} onChange={(e) => setForm({ ...form, shiftId: e.target.value })}>
                <option value="">بدون</option>
                {shifts.items.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                <OtherOption label="➕ أخرى — شفت جديد" />
              </select>
              {isOther(form.shiftId) && (
                <div className="mt-2 rounded-xl border border-dashed border-black bg-page/70 p-3">
                  <label className="mb-1.5 block text-[11px] font-semibold">اسم الشفت الجديد</label>
                  <input className="field" placeholder="مثال: شفت المساء" value={otherShiftName} onChange={(e) => setOtherShiftName(e.target.value)} />
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <div>
                      <label className="mb-1 block text-[10px] font-semibold text-mute">وقت البداية</label>
                      <input type="time" className="field cursor-pointer" value={otherShiftStart} onChange={(e) => setOtherShiftStart(e.target.value)} />
                    </div>
                    <div>
                      <label className="mb-1 block text-[10px] font-semibold text-mute">وقت النهاية</label>
                      <input type="time" className="field cursor-pointer" value={otherShiftEnd} onChange={(e) => setOtherShiftEnd(e.target.value)} />
                    </div>
                  </div>
                  <p className="mt-1.5 text-[10px] leading-relaxed text-faint">يُضاف الشفت إلى «شفتات العمل» ويُسنّد للكابتن مباشرة.</p>
                </div>
              )}
            </div>
          </div>
          {err && <p className="mt-2 text-[11px] font-medium">⚠ {err}</p>}
          <div className="mt-4 flex gap-2">
            <button
              className="btn-primary flex-1"
              onClick={() => {
                if (!form.name.trim()) return setErr('الاسم مطلوب')
                if (!isIraqMobile(form.phone)) return setErr('رقم الهاتف غير صالح')
                if (!form.govId) return setErr('اختر محافظة الكابتن')
                let vehicle = form.vehicle
                if (isOther(vehicle)) {
                  const v = otherName(otherVehicle)
                  if (!v) return setErr('اكتب اسم نوع المركبة')
                  vehicle = v
                  const st = getSettings()
                  if (!st.vehicleTypes.includes(v)) {
                    saveSettings({ ...st, vehicleTypes: [...st.vehicleTypes, v] })
                    logAudit({ action: 'تغيير إعداد', entity: 'أنواع المركبات', details: `${v} — عبر خيار «أخرى»`, oldValue: '—', newValue: v })
                  }
                }
                let shiftId = form.shiftId
                if (isOther(shiftId)) {
                  const id = ensureOtherShift(shifts.items, shifts.setItems, otherShiftName, otherShiftStart, otherShiftEnd)
                  if (!id) return setErr('اكتب اسم الشفت الجديد')
                  shiftId = id
                }
                captains.setItems((p) => [
                  ...p,
                  {
                    id: uid(),
                    name: form.name.trim(),
                    phone: digitsOnly(form.phone),
                    email: form.email,
                    govId: form.govId,
                    districtIds: form.districtIds,
                    shiftId,
                    vehicle,
                    status: 'بانتظار الموافقة',
                    rating: '—',
                    createdAt: nowIso(),
                  },
                ])
                logAudit({ action: 'إضافة', entity: form.name, details: 'إضافة كابتن يدوياً', oldValue: '—', newValue: 'بانتظار الموافقة' })
                setAddCap(false)
                setForm({ name: '', phone: '', email: '', govId: '', districtIds: [], vehicle: VEHICLES[0], shiftId: '' })
                setOtherVehicle('')
                setOtherShiftName('')
                toast('تم إنشاء حساب الكابتن بانتظار الموافقة')
              }}
            >
              حفظ
            </button>
            <button className="btn-ghost flex-1" onClick={() => setAddCap(false)}>إلغاء</button>
          </div>
        </Modal>
      )}

      {reject && (
        <Modal title="رفض طلب الكابتن" onClose={() => setReject(null)}>
          <textarea className="field mt-4 min-h-24 resize-none" placeholder="سبب الرفض (مطلوب)" value={reason} onChange={(e) => setReason(e.target.value)} />
          <div className="mt-4 flex gap-2">
            <button
              className="btn-primary flex-1"
              disabled={!reason.trim()}
              onClick={() => {
                captains.setItems((p) => p.map((x) => (x.id === reject.id ? { ...x, status: 'مرفوض', rejectReason: reason } : x)))
                logAudit({ action: 'رفض', entity: reject.name, details: reason, oldValue: 'بانتظار الموافقة', newValue: 'مرفوض' })
                setReject(null)
                setReason('')
                toast('تم رفض الكابتن')
              }}
            >
              تأكيد الرفض
            </button>
            <button className="btn-ghost flex-1" onClick={() => setReject(null)}>إلغاء</button>
          </div>
        </Modal>
      )}

      {drawer && (
        <Drawer title={`كباتن شفت ${drawer.name}`} onClose={() => setDrawer(null)}>
          {captains.items.filter((c) => c.shiftId === drawer.id).length === 0 ? (
            <EmptyState title="لا يوجد كباتن مرتبطون بهذا الشفت" />
          ) : (
            <div className="space-y-2">
              {captains.items.filter((c) => c.shiftId === drawer.id).map((c) => (
                <button key={c.id} className="flex w-full items-center justify-between rounded-xl border border-line px-3 py-2 text-right text-xs hover:bg-page" onClick={() => { setDrawer(null); navigate(`/captains/profile?id=${c.id}`) }}>
                  <span>
                    <span className="block font-bold">{c.name}</span>
                    <span className="text-mute">{c.phone}</span>
                  </span>
                  <StatusBadge status={c.status} />
                </button>
              ))}
            </div>
          )}
        </Drawer>
      )}

      {node}
    </div>
  )
}
