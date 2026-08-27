import { useNavigate } from 'react-router-dom'
import { MessageSquareWarning } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import FilterBar from '../components/FilterBar'
import DataTable from '../components/DataTable'

export default function Complaints() {
  const navigate = useNavigate()
  return (
    <div>
      <PageHeader title="الشكاوى والمشاكل" subtitle="إدارة ومتابعة شكاوى الكباتن والمحلات والنزاعات" actions={<button className="btn-ghost" onClick={() => navigate('/complaints/details')}>👁️ معاينة تفاصيل الشكوى</button>} />
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
        emptyIcon={MessageSquareWarning}
        emptyTitle="لم يتم تسجيل شكاوى جديدة"
        emptyHint="ستظهر الشكاوى المقدمة من الكباتن والمحلات هنا مع إمكانية المتابعة والرد وتحديث الحالة."
      />
    </div>
  )
}
