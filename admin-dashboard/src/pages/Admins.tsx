import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ShieldCheck, Pencil, Ban, Trash2, MapPin, Store, Bike, CheckCircle2 } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import DataTable from '../components/DataTable'
import Modal from '../components/Modal'
import StatusBadge from '../components/StatusBadge'
import { useToast } from '../components/Toast'
import { useDbList, logAudit, logSecurity, PERM_SECTIONS, PERM_ACTIONS } from '../lib/store'
import { uid, formatDate } from '../lib/db'
import { isIraqMobile, digitsOnly } from '../lib/validate'
import OtherField, { OtherOption } from '../components/OtherOption'
import { OTHER, ensureOtherDistrict, otherName } from '../lib/customOption'
import type { AdminUser, Captain, District, Governorate, StoreItem } from '../lib/types'

const roles = ['أدمن الكباتن', 'أدمن المحلات', 'أدمن محافظة', 'أدمن منطقة', 'ليدر محافظة', 'ليدر منطقة', 'أدمن التقارير', 'مخصص']

const roleTemplates: Record<string, Record<string, string[]>> = {
  'أدمن الكباتن': {
    الكباتن: ['مشاهدة', 'إضافة', 'تعديل', 'موافقة', 'إيقاف'],
    الشفتات: ['مشاهدة', 'إضافة', 'تعديل'],
    الطلبيات: ['مشاهدة'],
    التقارير: ['مشاهدة'],
  },
  'أدمن المحلات': {
    المحلات: ['مشاهدة', 'إضافة', 'تعديل', 'موافقة', 'إيقاف'],
    الطلبيات: ['مشاهدة', 'إضافة', 'تعديل'],
    التقارير: ['مشاهدة'],
  },
  'أدمن محافظة': {
    الكباتن: ['مشاهدة', 'إضافة', 'تعديل', 'موافقة', 'إيقاف'],
    المحلات: ['مشاهدة', 'إضافة', 'تعديل', 'موافقة', 'إيقاف'],
    الطلبيات: ['مشاهدة', 'إضافة', 'تعديل'],
    المناطق: ['مشاهدة', 'تعديل'],
    التقارير: ['مشاهدة'],
    الشكاوى: ['مشاهدة', 'تعديل'],
  },
  'أدمن منطقة': {
    الكباتن: ['مشاهدة', 'إضافة', 'تعديل', 'موافقة', 'إيقاف'],
    المحلات: ['مشاهدة', 'إضافة', 'تعديل', 'موافقة', 'إيقاف'],
    الطلبيات: ['مشاهدة', 'إضافة', 'تعديل'],
    التقارير: ['مشاهدة'],
    الشكاوى: ['مشاهدة', 'تعديل'],
  },
  'ليدر محافظة': {
    الكباتن: ['مشاهدة', 'إضافة', 'تعديل', 'موافقة', 'إيقاف'],
    المحلات: ['مشاهدة', 'إضافة', 'تعديل', 'موافقة', 'إيقاف'],
    الطلبيات: ['مشاهدة', 'إضافة', 'تعديل'],
    المناطق: ['مشاهدة'],
    التقارير: ['مشاهدة'],
    الإشعارات: ['مشاهدة', 'إضافة'],
    الشكاوى: ['مشاهدة', 'تعديل'],
  },
  'ليدر منطقة': {
    الكباتن: ['مشاهدة', 'إضافة', 'تعديل', 'موافقة', 'إيقاف'],
    المحلات: ['مشاهدة', 'إضافة', 'تعديل', 'موافقة', 'إيقاف'],
    الطلبيات: ['مشاهدة', 'إضافة', 'تعديل'],
    التقارير: ['مشاهدة'],
    الإشعارات: ['مشاهدة', 'إضافة'],
    الشكاوى: ['مشاهدة', 'تعديل'],
  },
  'أدمن التقارير': {
    التقارير: ['مشاهدة'],
    الطلبيات: ['مشاهدة'],
    الكباتن: ['مشاهدة'],
    المحلات: ['مشاهدة'],
    المناطق: ['مشاهدة'],
  },
}

function pickSelected(options: HTMLCollectionOf<HTMLOptionElement>) {
  return Array.from(options).map((o) => o.value)
}

function actionCount(perms: Record<string, string[]>) {
  return Object.values(perms || {}).reduce((sum, list) => sum + list.length, 0)
}

export default function Admins() {
  const [params, setParams] = useSearchParams()
  const tab = params.get('tab') === 'perms' ? 1 : 0
  const admins = useDbList<AdminUser>('admins')
  const govs = useDbList<Governorate>('governorates').items
  const districtsList = useDbList<District>('districts')
  const districts = districtsList.items
  const stores = useDbList<StoreItem>('stores').items
  const captains = useDbList<Captain>('captains').items
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<AdminUser | null>(null)
  const [form, setForm] = useState({ name: '', phone: '', password: '', role: '' })
  const [perms, setPerms] = useState<Record<string, string[]>>({})
  const [govIds, setGovIds] = useState<string[]>([])
  const [districtIds, setDistrictIds] = useState<string[]>([])
  const [storeIds, setStoreIds] = useState<string[]>([])
  const [captainIds, setCaptainIds] = useState<string[]>([])
  /* «أخرى»: اسم منطقة جديدة يكتبها المدير بدل اختيارها من القائمة */
  const [pickOtherDistrict, setPickOtherDistrict] = useState(false)
  const [otherDistrictName, setOtherDistrictName] = useState('')
  const [err, setErr] = useState('')
  const { toast, node } = useToast()

  const govName = (id: string) => govs.find((g) => g.id === id)?.name || '—'
  const districtName = (id: string) => districts.find((d) => d.id === id)?.name || '—'

  const selectableDistricts = useMemo(
    () => districts.filter((d) => govIds.length === 0 || govIds.includes(d.govId)),
    [districts, govIds],
  )

  const selectableStores = useMemo(
    () => stores.filter((s) =>
      (govIds.length === 0 || govIds.includes(s.govId)) &&
      (districtIds.length === 0 || districtIds.includes(s.districtId)),
    ),
    [stores, govIds, districtIds],
  )

  const selectableCaptains = useMemo(
    () => captains.filter((c) =>
      (govIds.length === 0 || govIds.includes(c.govId)) &&
      (districtIds.length === 0 || c.districtIds.length === 0 || c.districtIds.some((id) => districtIds.includes(id))),
    ),
    [captains, govIds, districtIds],
  )

  const selectedScope = useMemo(() => {
    const govText = govIds.length ? govIds.map(govName).join('، ') : 'كل المحافظات'
    const districtText = districtIds.length ? districtIds.map(districtName).join('، ') : 'كل المناطق ضمن النطاق'
    const storeText = storeIds.length ? `${storeIds.length} محل/مطعم محدد` : 'كل المحلات ضمن النطاق'
    const captainText = captainIds.length ? `${captainIds.length} كابتن محدد` : 'كل الكباتن ضمن النطاق'
    return { govText, districtText, storeText, captainText }
  }, [govIds, districtIds, storeIds, captainIds])

  const togglePerm = (sec: string, act: string) => {
    setPerms((p) => {
      const cur = p[sec] || []
      return { ...p, [sec]: cur.includes(act) ? cur.filter((x) => x !== act) : [...cur, act] }
    })
  }

  const resetForm = () => {
    setEditing(null)
    setForm({ name: '', phone: '', password: '', role: '' })
    setPerms({})
    setGovIds([])
    setDistrictIds([])
    setStoreIds([])
    setCaptainIds([])
    setPickOtherDistrict(false)
    setOtherDistrictName('')
    setErr('')
  }

  const openEdit = (a: AdminUser) => {
    setEditing(a)
    setForm({ name: a.name, phone: a.phone, password: '', role: a.role })
    setPerms(a.perms || {})
    setGovIds(a.govIds || [])
    setDistrictIds(a.districtIds || [])
    setStoreIds(a.storeIds || [])
    setCaptainIds(a.captainIds || [])
    setPickOtherDistrict(false)
    setOtherDistrictName('')
    setErr('')
    setOpen(true)
  }

  const save = () => {
    if (!form.name.trim()) return setErr('الاسم مطلوب')
    if (!isIraqMobile(form.phone)) return setErr('رقم الهاتف غير صالح')
    if (!form.password && !editing) return setErr('كلمة المرور مطلوبة')
    if (!form.role) return setErr('اختر الدور')
    let nextDistrictIds = districtIds
    if (pickOtherDistrict) {
      const nm = otherName(otherDistrictName)
      if (!nm) return setErr('اكتب اسم المنطقة الجديدة')
      if (govIds.length !== 1) return setErr('لإضافة منطقة جديدة من هنا اختر محافظة واحدة فقط')
      const id = ensureOtherDistrict(districts, districtsList.setItems, nm, govIds[0])
      if (id && !nextDistrictIds.includes(id)) nextDistrictIds = [...nextDistrictIds, id]
    }
    const inferredGovIds = Array.from(new Set([
      ...nextDistrictIds.map((id) => districts.find((d) => d.id === id)?.govId || ''),
      ...storeIds.map((id) => stores.find((s) => s.id === id)?.govId || ''),
      ...captainIds.map((id) => captains.find((c) => c.id === id)?.govId || ''),
    ].filter(Boolean)))
    const effectiveGovIds = govIds.length ? govIds : inferredGovIds
    const payload = {
      ...form,
      phone: digitsOnly(form.phone),
      password: form.password,
      perms,
      govIds: effectiveGovIds,
      districtIds: nextDistrictIds,
      storeIds,
      captainIds,
    }
    if (editing) {
      admins.setItems((p) => p.map((x) => x.id === editing.id ? { ...x, ...payload, password: form.password || x.password } : x))
      logAudit({ action: 'تعديل', entity: form.name, details: 'تعديل أدمن ونطاقه التشغيلي', oldValue: editing.role, newValue: form.role })
      logSecurity({ type: 'تعديل صلاحيات', user: form.phone, result: 'نجاح', details: `${form.role} — ${nextDistrictIds.length} مناطق، ${storeIds.length} محلات، ${captainIds.length} كباتن` })
      toast('تم تحديث حساب الأدمن ونطاقه')
    } else {
      admins.setItems((p) => [...p, {
        id: uid(),
        name: form.name.trim(),
        phone: digitsOnly(form.phone),
        password: form.password,
        role: form.role,
        enabled: true,
        govIds,
        districtIds: nextDistrictIds,
        storeIds,
        captainIds,
        perms,
      }])
      logAudit({ action: 'إضافة', entity: form.name, details: 'إنشاء أدمن فرعي بنطاق تفصيلي', oldValue: '—', newValue: form.role })
      toast('تم إنشاء حساب الأدمن')
    }
    setOpen(false)
    resetForm()
  }

  return (
    <div>
      <PageHeader
        title="الأدمن والصلاحيات"
        subtitle="تعيين ليدر لكل محافظة أو منطقة مع صلاحيات ونطاق محلات وكباتن محدد بدون التأثير على الميزات الحالية"
        actions={tab === 0 && <button className="btn-primary" onClick={() => { resetForm(); setOpen(true) }}>+ إضافة أدمن جديد</button>}
      />

      <div className="mb-5 flex flex-wrap gap-2">
        {['الأدمن الفرعيون', 'الصلاحيات'].map((t, i) => (
          <button
            key={t}
            onClick={() => setParams(i === 1 ? { tab: 'perms' } : {})}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold ${tab === i ? 'bg-black text-white' : 'border border-line bg-white text-mute hover:bg-page'}`}
          >
            <ShieldCheck className="h-3.5 w-3.5" /> {t}
          </button>
        ))}
      </div>

      {tab === 0 && (
        <div className="mb-5 grid grid-cols-1 gap-4 lg:grid-cols-3">
          {[
            { icon: MapPin, title: 'ليدر محافظة', text: 'اختر محافظة أو أكثر ليشاهد ويدير الكباتن، المحلات والطلبات داخلها فقط.' },
            { icon: CheckCircle2, title: 'ليدر منطقة', text: 'اختر مناطق محددة ليوافق على طلبات كباتن ومحلات هذه المناطق فقط.' },
            { icon: Store, title: 'تخصيص دقيق', text: 'يمكن تضييق النطاق إلى مطاعم/محلات محددة أو كباتن محددين فوق النطاق الجغرافي.' },
          ].map((card) => (
            <div key={card.title} className="card p-4">
              <card.icon className="mb-3 h-5 w-5" />
              <p className="text-sm font-bold">{card.title}</p>
              <p className="mt-1.5 text-xs leading-relaxed text-mute">{card.text}</p>
            </div>
          ))}
        </div>
      )}

      {tab === 1 && (
        <div className="card mb-5 p-5 text-xs leading-relaxed text-mute">
          <p className="font-bold text-black">قواعد RBAC والنطاق التشغيلي</p>
          <ul className="mt-2 list-disc pr-5 space-y-1">
            <li>الأقسام بدون صلاحية لا تظهر في القائمة الجانبية.</li>
            <li>الوصول عبر رابط مباشر لصفحة ممنوعة يعرض شاشة «غير مصرح لك».</li>
            <li>صلاحية المشاهدة فقط تخفي أزرار الموافقة والإيقاف والحذف.</li>
            <li>الفلتر الجغرافي يقيّد البيانات والتقارير على المحافظات/المناطق المسموحة.</li>
            <li>يمكن تقييد الأدمن أكثر بمحلات/مطاعم محددة أو كباتن محددين، وعندها لا تظهر له بيانات غيرهم.</li>
            <li>ليدر المنطقة يستطيع الموافقة على طلبات الكباتن والمطاعم الواقعة داخل منطقته إذا مُنح صلاحية «موافقة».</li>
          </ul>
          <a className="mt-3 inline-block font-semibold text-black underline" href="/unauthorized">معاينة شاشة غير مصرح لك</a>
        </div>
      )}

      <DataTable
        columns={['الاسم', 'رقم الهاتف', 'الدور', 'الصلاحيات', 'النطاق التشغيلي', 'الحالة', 'آخر دخول', 'الإجراءات']}
        rows={admins.items.map((a) => {
          const scopeParts = [
            a.govIds?.length ? `${a.govIds.map(govName).join('، ')}` : 'كل المحافظات',
            a.districtIds?.length ? `${a.districtIds.length} مناطق` : 'كل المناطق',
            a.storeIds?.length ? `${a.storeIds.length} محلات` : '',
            a.captainIds?.length ? `${a.captainIds.length} كباتن` : '',
          ].filter(Boolean)
          return {
            key: a.id,
            cells: [
              a.name,
              a.phone,
              a.role,
              actionCount(a.perms || {}) + ' إجراء',
              <span className="text-[11px] leading-relaxed text-mute">{scopeParts.join(' · ')}</span>,
              <StatusBadge status={a.enabled ? 'نشط' : 'موقوف'} />,
              a.lastLogin ? formatDate(a.lastLogin) : '—',
              <span className="flex gap-1">
                <button className="btn-ghost px-2 py-1" onClick={() => openEdit(a)}><Pencil className="h-3.5 w-3.5" /></button>
                <button className="btn-ghost px-2 py-1" onClick={() => {
                  admins.setItems((p) => p.map((x) => x.id === a.id ? { ...x, enabled: !x.enabled } : x))
                  toast(a.enabled ? 'تم إيقاف الأدمن' : 'تم تفعيل الأدمن')
                }}><Ban className="h-3.5 w-3.5" /></button>
                <button className="btn-ghost px-2 py-1" onClick={() => {
                  admins.setItems((p) => p.filter((x) => x.id !== a.id))
                  toast('تم حذف الأدمن')
                }}><Trash2 className="h-3.5 w-3.5" /></button>
              </span>,
            ],
          }
        })}
        emptyIcon={ShieldCheck}
        emptyTitle="لا يوجد أدمن فرعيون"
        emptyHint="أنشئ حسابات أدمن فرعية بصلاحيات محددة بدقة على مستوى القسم والإجراء والنطاق الجغرافي والمحلات والكباتن."
      />

      {open && (
        <Modal title={editing ? 'تعديل أدمن' : 'إضافة أدمن جديد'} onClose={() => setOpen(false)} extraWide>
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold">الاسم</label>
              <input className="field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold">رقم الهاتف</label>
              <input className="field" dir="ltr" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold">كلمة المرور</label>
              <input className="field" type="password" placeholder={editing ? 'اتركها فارغة للإبقاء عليها' : ''} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold">الدور</label>
              <select
                className="field cursor-pointer"
                value={form.role}
                onChange={(e) => {
                  const role = e.target.value
                  setForm({ ...form, role })
                  if (roleTemplates[role]) setPerms(roleTemplates[role])
                }}
              >
                <option value="">اختر الدور</option>
                {roles.map((r) => <option key={r}>{r}</option>)}
              </select>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 text-xs md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-xl border border-line bg-page/50 p-3">
              <p className="font-bold">المحافظات</p>
              <p className="mt-1 text-mute">{selectedScope.govText}</p>
            </div>
            <div className="rounded-xl border border-line bg-page/50 p-3">
              <p className="font-bold">المناطق</p>
              <p className="mt-1 text-mute">{selectedScope.districtText}</p>
            </div>
            <div className="rounded-xl border border-line bg-page/50 p-3">
              <p className="font-bold">المحلات والمطاعم</p>
              <p className="mt-1 text-mute">{selectedScope.storeText}</p>
            </div>
            <div className="rounded-xl border border-line bg-page/50 p-3">
              <p className="font-bold">الكباتن</p>
              <p className="mt-1 text-mute">{selectedScope.captainText}</p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold">المحافظات المسموحة (فارغ = الكل)</label>
              <select
                className="field min-h-28 cursor-pointer"
                multiple
                value={govIds}
                onChange={(e) => {
                  const ids = pickSelected(e.target.selectedOptions)
                  setGovIds(ids)
                  setDistrictIds((prev) => prev.filter((id) => {
                    const d = districts.find((x) => x.id === id)
                    return !d || ids.length === 0 || ids.includes(d.govId)
                  }))
                  setStoreIds([])
                  setCaptainIds([])
                }}
              >
                {govs.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
              <p className="mt-1 text-[10px] text-faint">لليدر المحافظة اختر محافظة واحدة أو أكثر.</p>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold">المناطق المسموحة (فارغ = كل مناطق المحافظات)</label>
              <select
                className="field min-h-28 cursor-pointer"
                multiple
                value={districtIds}
                onChange={(e) => {
                  const values = pickSelected(e.target.selectedOptions)
                  setPickOtherDistrict(values.includes(OTHER))
                  setDistrictIds(values.filter((v) => v !== OTHER))
                  setStoreIds([])
                  setCaptainIds([])
                }}
              >
                {selectableDistricts.map((d) => <option key={d.id} value={d.id}>{d.name} — {govName(d.govId)}</option>)}
                <OtherOption label="➕ أخرى — منطقة جديدة" />
              </select>
              {pickOtherDistrict && (
                <OtherField
                  label="اسم المنطقة"
                  placeholder="اكتب اسم المنطقة ثم احفظ لتُضاف للقائمة"
                  value={otherDistrictName}
                  onChange={setOtherDistrictName}
                  hint="تُضاف إلى «المناطق والجغرافيا» وتُربط بهذا الأدمن تلقائياً."
                />
              )}
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold">محلات/مطاعم محددة (اختياري)</label>
              <select className="field min-h-28 cursor-pointer" multiple value={storeIds} onChange={(e) => setStoreIds(pickSelected(e.target.selectedOptions))}>
                {selectableStores.map((s) => <option key={s.id} value={s.id}>{s.name} — {districtName(s.districtId)}</option>)}
              </select>
              <p className="mt-1 text-[10px] text-faint">إذا اخترت محلات هنا سيشاهد الأدمن هذه المحلات وطلباتها فقط.</p>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold">كباتن محددون (اختياري)</label>
              <select className="field min-h-28 cursor-pointer" multiple value={captainIds} onChange={(e) => setCaptainIds(pickSelected(e.target.selectedOptions))}>
                {selectableCaptains.map((c) => <option key={c.id} value={c.id}>{c.name} — {govName(c.govId)}</option>)}
              </select>
              <p className="mt-1 text-[10px] text-faint">إذا اخترت كباتن هنا سيشاهد الأدمن هؤلاء الكباتن وطلباتهم فقط.</p>
            </div>
          </div>

          <div className="mt-4 overflow-x-auto rounded-xl border border-line">
            <table className="w-full min-w-max text-right text-xs">
              <thead>
                <tr className="border-b border-line bg-page/60">
                  <th className="px-4 py-2.5 font-semibold text-mute">القسم</th>
                  {PERM_ACTIONS.map((p) => (
                    <th key={p} className="px-3 py-2.5 text-center font-semibold text-mute">{p}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PERM_SECTIONS.map((s) => (
                  <tr key={s} className="border-b border-line last:border-0">
                    <td className="px-4 py-2 font-semibold">{s}</td>
                    {PERM_ACTIONS.map((p) => (
                      <td key={p} className="px-3 py-2 text-center">
                        <input type="checkbox" className="h-4 w-4 accent-black" checked={(perms[s] || []).includes(p)} onChange={() => togglePerm(s, p)} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {err && <p className="mt-2 text-[11px] font-medium">⚠ {err}</p>}
          <div className="mt-4 flex gap-2">
            <button className="btn-primary" onClick={save}>حفظ</button>
            <button className="btn-ghost" onClick={() => setOpen(false)}>إلغاء</button>
          </div>
        </Modal>
      )}
      {node}
      <span className="hidden"><Bike className="h-0 w-0" /></span>
    </div>
  )
}
