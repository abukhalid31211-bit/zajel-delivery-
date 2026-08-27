import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { FileClock, ShieldAlert } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import FilterBar from '../components/FilterBar'
import DataTable from '../components/DataTable'
import Modal from '../components/Modal'
import StatusBadge from '../components/StatusBadge'
import ExportDialog from '../components/ExportDialog'
import { useToast } from '../components/Toast'
import { useDbList } from '../lib/store'
import { formatDate } from '../lib/db'
import type { AuditEntry, SecurityEntry } from '../lib/types'

export default function AuditLog() {
  const [params, setParams] = useSearchParams()
  const tab = params.get('tab') === 'security' ? 1 : 0
  const audit = useDbList<AuditEntry>('audit')
  const security = useDbList<SecurityEntry>('security')
  const [detail, setDetail] = useState<AuditEntry | SecurityEntry | null>(null)
  const [exp, setExp] = useState(false)
  const { toast, node } = useToast()

  return (
    <div>
      <PageHeader
        title="سجلات النظام"
        subtitle="سجل العمليات الإدارية (Audit Log) وسجل الأمان"
        actions={<button className="btn-ghost" onClick={() => setExp(true)}>تصدير</button>}
      />

      <div className="mb-5 flex flex-wrap gap-2">
        {[
          { label: 'سجل العمليات (Audit Log)', icon: FileClock },
          { label: 'سجل الأمان', icon: ShieldAlert },
        ].map((t, i) => (
          <button
            key={t.label}
            onClick={() => setParams(i === 1 ? { tab: 'security' } : {})}
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
            searchPlaceholder="اسم الأدمن أو الكيان المتأثر..."
            selects={[{ label: 'نوع العملية', options: ['تعديل سعر', 'إيقاف حساب', 'موافقة', 'رفض', 'إلغاء طلب', 'تغيير إعداد', 'إعادة تعيين', 'أخرى'] }]}
            withDate
          />
          <DataTable
            columns={['التاريخ والوقت', 'الأدمن', 'العملية', 'الكيان', 'التفاصيل', 'القيمة السابقة', 'القيمة الجديدة']}
            rows={audit.items.map((a) => ({
              key: a.id,
              onClick: () => setDetail(a),
              cells: [formatDate(a.at), a.admin, a.action, a.entity, a.details, a.oldValue, a.newValue],
            }))}
            emptyIcon={FileClock}
            emptyTitle="لا توجد عمليات مسجلة"
            emptyHint="كل إجراء إداري (تعديل سعر، موافقة، إيقاف...) يُسجل هنا تلقائياً مع القيم السابقة والجديدة."
          />
        </>
      )}

      {tab === 1 && (
        <>
          <FilterBar
            searchPlaceholder="اسم المستخدم..."
            selects={[{ label: 'نوع الحدث', options: ['تسجيل دخول ناجح', 'تسجيل دخول فاشل', 'تغيير كلمة مرور', 'تعديل صلاحيات', 'محاولة مشبوهة'] }]}
            withDate
          />
          <DataTable
            columns={['التاريخ', 'نوع الحدث', 'المستخدم', 'عنوان IP', 'الجهاز', 'النتيجة', 'التفاصيل']}
            rows={security.items.map((s) => ({
              key: s.id,
              onClick: () => setDetail(s),
              cells: [formatDate(s.at), s.type, s.user, s.ip, s.device, <StatusBadge status={s.result} />, s.details],
            }))}
            emptyIcon={ShieldAlert}
            emptyTitle="لا توجد أحداث أمنية مسجلة"
            emptyHint="تُسجل هنا جميع أحداث الدخول والمحاولات الفاشلة والأنشطة المشبوهة."
          />
        </>
      )}

      {detail && (
        <Modal title="تفاصيل العملية" onClose={() => setDetail(null)} wide>
          <pre className="mt-3 overflow-x-auto rounded-xl bg-page p-4 text-[11px] leading-relaxed">{JSON.stringify(detail, null, 2)}</pre>
        </Modal>
      )}
      {exp && <ExportDialog summary="سجل النظام" onClose={() => setExp(false)} onDone={(m) => toast(m)} />}
      {node}
    </div>
  )
}
