import { useState } from 'react'
import { ShieldCheck } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import DataTable from '../components/DataTable'

const sections = ['الكباتن', 'المحلات', 'الطلبيات', 'الأسعار', 'المناطق', 'الشفتات', 'التقارير', 'الإشعارات', 'الشكاوى', 'الإعدادات']
const perms = ['👁️ مشاهدة', '➕ إضافة', '✏️ تعديل', '✅ موافقة', '🚫 إيقاف', '🗑️ حذف']

export default function Admins() {
  const [tab, setTab] = useState(0)
  const [showForm, setShowForm] = useState(false)
  return (
    <div>
      <PageHeader
        title="الأدمن والصلاحيات"
        subtitle="إدارة حسابات الأدمن الفرعيين ونظام الصلاحيات الدقيق (RBAC)"
        actions={tab === 0 && <button className="btn-primary" onClick={() => setShowForm((v) => !v)}>+ إضافة أدمن جديد</button>}
      />

      <div className="mb-5 flex flex-wrap gap-2">
        {[{ label: 'الأدمن الفرعيون', icon: ShieldCheck }].map((t, i) => (
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

      {showForm && (
        <div className="card mb-5 space-y-4 p-6">
          <h2 className="text-sm font-bold">إضافة أدمن جديد</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-xs font-semibold">الاسم</label>
              <input className="field" placeholder="اسم الأدمن" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold">رقم الهاتف</label>
              <input className="field" placeholder="+964 7XX XXX XXXX" dir="ltr" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold">الدور</label>
              <select className="field cursor-pointer text-mute" defaultValue="">
                <option value="" disabled>اختر الدور</option>
                <option>أدمن الكباتن</option>
                <option>أدمن المحلات</option>
                <option>أدمن محافظة</option>
                <option>أدمن منطقة</option>
                <option>أدمن التقارير</option>
                <option>مخصص</option>
              </select>
            </div>
          </div>
          <div className="overflow-x-auto rounded-xl border border-line">
            <table className="w-full min-w-max text-right text-xs">
              <thead>
                <tr className="border-b border-line bg-page/60">
                  <th className="px-4 py-2.5 font-semibold text-mute">القسم</th>
                  {perms.map((p) => (
                    <th key={p} className="px-3 py-2.5 text-center font-semibold text-mute">{p}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sections.map((s) => (
                  <tr key={s} className="border-b border-line last:border-0">
                    <td className="px-4 py-2 font-semibold">{s}</td>
                    {perms.map((p) => (
                      <td key={p} className="px-3 py-2 text-center">
                        <input type="checkbox" className="h-4 w-4 accent-black" />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex gap-2">
            <button className="btn-primary">حفظ</button>
            <button className="btn-ghost" onClick={() => setShowForm(false)}>إلغاء</button>
          </div>
        </div>
      )}

      <DataTable
        columns={['الاسم', 'رقم الهاتف', 'الدور', 'الصلاحيات', 'الحالة', 'آخر دخول', 'الإجراءات']}
        emptyIcon={ShieldCheck}
        emptyTitle="لا يوجد أدمن فرعيون"
        emptyHint="أنشئ حسابات أدمن فرعية بصلاحيات محددة بدقة على مستوى القسم والإجراء والنطاق الجغرافي."
      />
    </div>
  )
}
