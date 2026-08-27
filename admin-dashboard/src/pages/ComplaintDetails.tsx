import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { MessageSquareWarning } from 'lucide-react'
import { useToast } from '../components/Toast'
import EmptyState from '../components/EmptyState'
import StatusBadge from '../components/StatusBadge'
import { useDbList, logAudit } from '../lib/store'
import { formatDate, nowIso } from '../lib/db'
import type { Complaint } from '../lib/types'

export default function ComplaintDetails() {
  const { toast, node } = useToast()
  const [params] = useSearchParams()
  const list = useDbList<Complaint>('complaints')
  const item = list.items.find((c) => c.id === params.get('id'))
  const [status, setStatus] = useState('')
  const [notes, setNotes] = useState('')

  return (
    <div>
      <div className="mb-4 flex items-center gap-2 text-[11px] text-faint">
        <Link to="/complaints" className="hover:text-black">الشكاوى</Link>
        <span>›</span>
        <span className="font-semibold text-black">شكوى #{item ? item.id.slice(-6) : '—'}</span>
      </div>
      <h1 className="mb-6 text-xl font-bold tracking-tight">تفاصيل الشكوى #{item ? item.id.slice(-6) : '—'}</h1>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="card p-5 lg:col-span-2">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-bold">
            <MessageSquareWarning className="h-4 w-4" /> معلومات الشكوى
          </h2>
          <div className="divide-y divide-line text-xs">
            {[
              ['نوع الشكوى', item?.type || '—'],
              ['مقدّم الشكوى', item?.submitter || '— (محل / كابتن)'],
              ['الطلب المرتبط', item?.orderId || '#—'],
              ['وصف المشكلة', item?.desc || '—'],
              ['التاريخ', formatDate(item?.createdAt)],
            ].map(([k, v]) => (
              <div key={k} className="flex items-center justify-between gap-4 py-3">
                <span className="shrink-0 text-mute">{k}</span>
                {k === 'الطلب المرتبط' && item?.orderId ? (
                  <Link to="/orders/details" className="font-bold underline-offset-2 hover:underline">{v}</Link>
                ) : (
                  <span className="text-left font-bold leading-relaxed">{v}</span>
                )}
              </div>
            ))}
            <div className="flex items-center justify-between py-3">
              <span className="text-mute">الحالة</span>
              <StatusBadge status={item?.status || 'مفتوحة'} />
            </div>
          </div>

          <h2 className="mb-2 mt-6 text-sm font-bold">سجل المراسلات والتحديثات (Timeline)</h2>
          {!item?.timeline?.length ? (
            <EmptyState title="لا توجد تحديثات مسجلة" hint='مثال: "تم فتح الشكوى بواسطة —" ← "تم تعيينها للأدمن — للمراجعة"...' />
          ) : (
            <div className="space-y-2">
              {item.timeline.map((t, i) => (
                <div key={i} className="rounded-xl border border-line px-3 py-2 text-xs">
                  <span className="text-faint">{formatDate(t.at)}</span> — {t.text}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card h-fit p-5">
          <h2 className="mb-4 text-sm font-bold">تحديث الحالة</h2>
          <div className="space-y-3">
            <div>
              <label className="mb-1.5 block text-xs font-semibold">تغيير الحالة إلى</label>
              <select className="field cursor-pointer" value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="" disabled>اختر الحالة</option>
                <option>قيد المراجعة</option>
                <option>محلولة</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold">ملاحظات الإدارة / الرد</label>
              <textarea className="field min-h-28 resize-none" placeholder="اكتب رد الإدارة الذي سيظهر لمقدّم الشكوى..." value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
            <button
              className="btn-primary w-full"
              disabled={!status}
              onClick={() => {
                if (item) {
                  list.setItems((p) => p.map((x) => x.id === item.id ? {
                    ...x,
                    status: status as Complaint['status'],
                    notes,
                    timeline: [...(x.timeline || []), { at: nowIso(), text: `تم التحديث إلى ${status} — ${notes}` }],
                  } : x))
                }
                logAudit({ action: 'أخرى', entity: 'شكوى', details: status, oldValue: item?.status || 'مفتوحة', newValue: status })
                toast(status === 'محلولة' ? 'تم حل الشكوى 🟢' : 'تم تحديث حالة الشكوى')
              }}
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
