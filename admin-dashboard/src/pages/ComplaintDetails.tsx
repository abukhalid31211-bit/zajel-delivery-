import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MessageSquareWarning } from 'lucide-react'
import { useToast } from '../components/Toast'
import EmptyState from '../components/EmptyState'

export default function ComplaintDetails() {
  const { toast, node } = useToast()
  const [status, setStatus] = useState('')

  return (
    <div>
      <div className="mb-4 flex items-center gap-2 text-[11px] text-faint">
        <Link to="/complaints" className="hover:text-black">الشكاوى</Link>
        <span>›</span>
        <span className="font-semibold text-black">شكوى #—</span>
      </div>
      <h1 className="mb-6 text-xl font-bold tracking-tight">تفاصيل الشكوى #—</h1>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="card p-5 lg:col-span-2">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-bold">
            <MessageSquareWarning className="h-4 w-4" /> معلومات الشكوى
          </h2>
          <div className="divide-y divide-line text-xs">
            {[
              ['نوع الشكوى', '—'],
              ['مقدّم الشكوى', '— (محل / كابتن)'],
              ['الطلب المرتبط', '#— (قابل للنقر → تفاصيل الطلب)'],
              ['وصف المشكلة', '—'],
              ['التاريخ', '—'],
              ['الحالة', '🔴 مفتوحة'],
            ].map(([k, v]) => (
              <div key={k} className="flex items-center justify-between gap-4 py-3">
                <span className="shrink-0 text-mute">{k}</span>
                <span className="text-left font-bold leading-relaxed">{v}</span>
              </div>
            ))}
          </div>

          <h2 className="mb-2 mt-6 text-sm font-bold">سجل المراسلات والتحديثات (Timeline)</h2>
          <EmptyState
            title="لا توجد تحديثات مسجلة"
            hint='مثال: "تم فتح الشكوى بواسطة —" ← "تم تعيينها للأدمن — للمراجعة" ← "تم التواصل والتحقيق"...'
          />
        </div>

        <div className="card h-fit p-5">
          <h2 className="mb-4 text-sm font-bold">تحديث الحالة</h2>
          <div className="space-y-3">
            <div>
              <label className="mb-1.5 block text-xs font-semibold">تغيير الحالة إلى</label>
              <select className="field cursor-pointer" value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="" disabled>اختر الحالة</option>
                <option>قيد المراجعة 🟡</option>
                <option>محلولة 🟢</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold">ملاحظات الإدارة / الرد</label>
              <textarea className="field min-h-28 resize-none" placeholder="اكتب رد الإدارة الذي سيظهر لمقدّم الشكوى..." />
            </div>
            <button
              className="btn-primary w-full"
              disabled={!status}
              onClick={() => toast(status.includes('محلولة') ? 'تم حل الشكوى 🟢' : 'تم تحديث حالة الشكوى')}
            >
              تحديث
            </button>
          </div>
        </div>
      </div>

      {node}
    </div>
  )
}
