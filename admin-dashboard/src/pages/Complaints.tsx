import { useNavigate } from 'react-router-dom'
import { MessageSquareWarning, Eye } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import FilterBar from '../components/FilterBar'
import DataTable from '../components/DataTable'
import StatusBadge from '../components/StatusBadge'
import { useDbList } from '../lib/store'
import { formatDate } from '../lib/db'
import type { Complaint } from '../lib/types'

export default function Complaints() {
  const navigate = useNavigate()
  const list = useDbList<Complaint>('complaints')

  return (
    <div>
      <PageHeader
        title="الشكاوى والمشاكل"
        subtitle="إدارة ومتابعة شكاوى الكباتن والمحلات والنزاعات"
        actions={<button className="btn-ghost" onClick={() => navigate('/complaints/details')}>👁️ معاينة تفاصيل الشكوى</button>}
      />
      <FilterBar
        searchPlaceholder="رقم الشكوى أو رقم الطلب..."
        selects={[
          { label: 'الحالة', options: ['مفتوحة', 'قيد المراجعة', 'محلولة'] },
          { label: 'النوع', options: ['مشكلة توصيل', 'مشكلة مبلغ', 'مشكلة تسليم', 'مشكلة بين المحل والكابتن', 'مشكلة تقنية', 'أخرى'] },
        ]}
        withDate
      />
      <DataTable
        columns={['رقم الشكوى', 'النوع', 'المقدّم', 'الطلب المرتبط', 'الحالة', 'التاريخ', 'الإجراءات']}
        rows={list.items.map((c) => ({
          key: c.id,
          onClick: () => navigate(`/complaints/details?id=${c.id}`),
          cells: [
            c.id.slice(-6),
            c.type,
            c.submitter,
            c.orderId,
            <StatusBadge status={c.status} />,
            formatDate(c.createdAt),
            <button className="btn-ghost px-2 py-1" onClick={() => navigate(`/complaints/details?id=${c.id}`)}><Eye className="h-3.5 w-3.5" /></button>,
          ],
        }))}
        emptyIcon={MessageSquareWarning}
        emptyTitle="لم يتم تسجيل شكاوى جديدة"
        emptyHint="ستظهر الشكاوى المقدمة من الكباتن والمحلات هنا مع إمكانية المتابعة والرد وتحديث الحالة."
      />
    </div>
  )
}
