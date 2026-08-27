import { useState } from 'react'
import { Send, History, Eye } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import DataTable from '../components/DataTable'

export default function Notifications() {
  const [tab, setTab] = useState(0)
  return (
    <div>
      <PageHeader title="مركز الإشعارات" subtitle="إرسال الإشعارات والرسائل الترويجية للكباتن والمحلات" />

      <div className="mb-5 flex flex-wrap gap-2">
        {[
          { label: 'إرسال إشعار جديد', icon: Send },
          { label: 'سجل الإشعارات المرسلة', icon: History },
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
        <div className="card max-w-2xl space-y-4 p-6">
          <div>
            <label className="mb-1.5 block text-xs font-semibold">المرسل إليه</label>
            <select className="field cursor-pointer text-mute" defaultValue="">
              <option value="" disabled>اختر الفئة المستهدفة</option>
              <option>جميع الكباتن</option>
              <option>جميع المحلات</option>
              <option>كابتن محدد</option>
              <option>محل محدد</option>
              <option>مجموعة محددة</option>
              <option>كباتن محافظة معينة</option>
              <option>كباتن منطقة معينة</option>
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold">عنوان الإشعار</label>
            <input className="field" placeholder="اكتب عنواناً واضحاً ومختصراً..." />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold">محتوى الإشعار</label>
            <textarea className="field min-h-28 resize-y" placeholder="اكتب محتوى الإشعار..." />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold">الأولوية</label>
            <div className="flex gap-2">
              {['عادي', 'مهم', 'عاجل'].map((p, i) => (
                <button
                  key={p}
                  className={`rounded-xl px-4 py-2 text-xs font-semibold transition-colors ${
                    i === 0 ? 'bg-black text-white' : 'border border-line text-mute hover:bg-page'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <button className="btn-primary flex-1 py-3">
              <Send className="h-4 w-4" /> إرسال الإشعار
            </button>
            <button className="btn-secondary">
              <Eye className="h-4 w-4" /> معاينة
            </button>
          </div>
        </div>
      )}

      {tab === 1 && (
        <DataTable
          columns={['التاريخ', 'العنوان', 'المرسل إليه', 'عدد المستلمين', 'الأولوية', 'المرسل (الأدمن)']}
          emptyIcon={History}
          emptyTitle="لا توجد إشعارات مرسلة بعد"
          emptyHint="سيظهر هنا سجل كامل بجميع الإشعارات المرسلة مع تفاصيلها."
        />
      )}
    </div>
  )
}
