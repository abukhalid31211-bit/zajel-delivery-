import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ShieldCheck, Pencil, Ban, Trash2 } from 'lucide-react'
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
import type { AdminUser, District, Governorate } from '../lib/types'

const roles = ['أدمن الكباتن', 'أدمن المحلات', 'أدمن محافظة', 'أدمن منطقة', 'أدمن التقارير', 'مخصص']

export default function Admins() {
  const [params, setParams] = useSearchParams()
  const tab = params.get('tab') === 'perms' ? 1 : 0
  const admins = useDbList<AdminUser>('admins')
  const govs = useDbList<Governorate>('governorates').items
  const districtsList = useDbList<District>('districts')
  const districts = districtsList.items
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<AdminUser | null>(null)
  const [form, setForm] = useState({ name: '', phone: '', password: '', role: '' })
  const [perms, setPerms] = useState<Record<string, string[]>>({})
  const [govIds, setGovIds] = useState<string[]>([])
  /* «أخرى»: اسم منطقة جديدة يكتبها المدير بدل اختيارها من القائمة */
  const [pickOtherDistrict, setPickOtherDistrict] = useState(false)
  const [otherDistrictName, setOtherDistrictName] = useState('')
  const [err, setErr] = useState('')
  const { toast, node } = useToast()

  const togglePerm = (sec: string, act: string) => {
    setPerms((p) => {
      const cur = p[sec] || []
      return { ...p, [sec]: cur.includes(act) ? cur.filter((x) => x !== act) : [...cur, act] }
    })
  }

  const save = () => {
    if (!form.name.trim()) return setErr('الاسم مطلوب')
    if (!isIraqMobile(form.phone)) return setErr('رقم الهاتف غير صالح')
    if (!form.password && !editing) return setErr('كلمة المرور مطلوبة')
    if (!form.role) return setErr('اختر الدور')
    if (pickOtherDistrict) {
      const nm = otherName(otherDistrictName)
      if (!nm) return setErr('اكتب اسم المنطقة الجديدة')
      ensureOtherDistrict(districts, districtsList.setItems, nm, govIds.length === 1 ? govIds[0] : '')
    }
    if (editing) {
      admins.setItems((p) => p.map((x) => x.id === editing.id ? { ...x, ...form, phone: digitsOnly(form.phone), password: form.password || x.password, perms, govIds, districtIds: [] } : x))
      logAudit({ action: 'تعديل', entity: form.name, details: 'تعديل أدمن', oldValue: editing.role, newValue: form.role })
      logSecurity({ type: 'تعديل صلاحيات', user: form.phone, result: 'نجاح', details: form.role })
      toast('تم تحديث حساب الأدمن')
    } else {
      admins.setItems((p) => [...p, {
        id: uid(),
        name: form.name.trim(),
        phone: digitsOnly(form.phone),
        password: form.password,
        role: form.role,
        enabled: true,
        govIds,
        districtIds: [],
        perms,
      }])
      logAudit({ action: 'إضافة', entity: form.name, details: 'إنشاء أدمن فرعي', oldValue: '—', newValue: form.role })
      toast('تم إنشاء حساب الأدمن')
    }
    setOpen(false)
    setEditing(null)
  }

  return (
    <div>
      <PageHeader
        title="الأدمن والصلاحيات"
        subtitle="إدارة حسابات الأدمن الفرعيين ونظام الصلاحيات الدقيق (RBAC)"
        actions={tab === 0 && <button className="btn-primary" onClick={() => { setEditing(null); setForm({ name: '', phone: '', password: '', role: '' }); setPerms({}); setGovIds([]); setPickOtherDistrict(false); setOtherDistrictName(''); setErr(''); setOpen(true) }}>+ إضافة أدمن جديد</button>}
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

      {tab === 1 && (
        <div className="card mb-5 p-5 text-xs leading-relaxed text-mute">
          <p className="font-bold text-black">قواعد RBAC</p>
          <ul className="mt-2 list-disc pr-5 space-y-1">
            <li>الأقسام بدون صلاحية لا تظهر في القائمة الجانبية.</li>
            <li>الوصول عبر رابط مباشر لصفحة ممنوعة يعرض شاشة «غير مصرح لك».</li>
            <li>صلاحية المشاهدة فقط تخفي أزرار الموافقة والإيقاف والحذف.</li>
            <li>الفلتر الجغرافي يقيّد البيانات والتقارير على المحافظات/المناطق المسموحة.</li>
          </ul>
          <a className="mt-3 inline-block font-semibold text-black underline" href="/unauthorized">معاينة شاشة غير مصرح لك</a>
        </div>
      )}

      <DataTable
        columns={['الاسم', 'رقم الهاتف', 'الدور', 'الصلاحيات', 'الحالة', 'آخر دخول', 'الإجراءات']}
        rows={admins.items.map((a) => ({
          key: a.id,
          cells: [
            a.name,
            a.phone,
            a.role,
            Object.values(a.perms || {}).flat().length + ' إجراء',
            <StatusBadge status={a.enabled ? 'نشط' : 'موقوف'} />,
            a.lastLogin ? formatDate(a.lastLogin) : '—',
            <span className="flex gap-1">
              <button className="btn-ghost px-2 py-1" onClick={() => {
                setEditing(a)
                setForm({ name: a.name, phone: a.phone, password: '', role: a.role })
                setPerms(a.perms || {})
                setGovIds(a.govIds || [])
                setOpen(true)
              }}><Pencil className="h-3.5 w-3.5" /></button>
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
        }))}
        emptyIcon={ShieldCheck}
        emptyTitle="لا يوجد أدمن فرعيون"
        emptyHint="أنشئ حسابات أدمن فرعية بصلاحيات محددة بدقة على مستوى القسم والإجراء والنطاق الجغرافي."
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
              <input className="field" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold">الدور</label>
              <select className="field cursor-pointer" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                <option value="">اختر الدور</option>
                {roles.map((r) => <option key={r}>{r}</option>)}
              </select>
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
          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold">المحافظات المسموحة (فارغ = الكل)</label>
              <select className="field min-h-24 cursor-pointer" multiple value={govIds} onChange={(e) => setGovIds(Array.from(e.target.selectedOptions).map((o) => o.value))}>
                {govs.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold">المناطق المسموحة</label>
              <select
                className="field min-h-24 cursor-pointer"
                multiple
                onChange={(e) => setPickOtherDistrict(Array.from(e.target.selectedOptions).some((o) => o.value === OTHER))}
              >
                {districts.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                <OtherOption label="➕ أخرى — منطقة جديدة" />
              </select>
              {pickOtherDistrict && (
                <OtherField
                  label="اسم المنطقة"
                  placeholder="اكتب اسم المنطقة ثم احفظ لتُضاف للقائمة"
                  value={otherDistrictName}
                  onChange={setOtherDistrictName}
                  hint="تُضاف إلى «المناطق والجغرافيا» وتظهر في كل قوائم المناطق."
                />
              )}
            </div>
          </div>
          {err && <p className="mt-2 text-[11px] font-medium">⚠ {err}</p>}
          <div className="mt-4 flex gap-2">
            <button className="btn-primary" onClick={save}>حفظ</button>
            <button className="btn-ghost" onClick={() => setOpen(false)}>إلغاء</button>
          </div>
        </Modal>
      )}
      {node}
    </div>
  )
}
