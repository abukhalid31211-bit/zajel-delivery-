import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Package, AlertTriangle } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import FilterBar from '../components/FilterBar'
import DataTable from '../components/DataTable'

const tabs = ['الكل', 'نشطة', 'مكتملة', 'ملغاة', 'عالقة ⚠️']

export default function Orders() {
  const [tab, setTab] = useState(0)
  const navigate = useNavigate()
  return (
    <div>
      <PageHeader
        title="إدارة الطلبيات"
        subtitle="مراقبة وإدارة جميع طلبيات التوصيل في النظام لحظة بلحظة"
        actions={
          <button className="btn-ghost" onClick={() => navigate('/orders/details')}>
            👁️ معاينة صفحة تفاصيل الطلب
          </button>
        }
      />

      <div className="mb-5 flex flex-wrap gap-2">
        {tabs.map((t, i) => (
          <button
            key={t}
            onClick={() => setTab(i)}
            className={`rounded-xl px-4 py-2 text-xs font-semibold transition-colors ${
              tab === i ? 'bg-black text-white' : 'border border-line bg-white text-mute hover:bg-page'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <FilterBar
        searchPlaceholder="رقم الطلب..."
        selects={[
          { label: 'الحالة', options: ['طلب جديد', 'بانتظار كابتن', 'تم قبول الكابتن', 'متوجه للمحل', 'وصل للمحل', 'استلم الطلب', 'بالطريق للزبون', 'تم التسليم', 'مكتمل', 'ملغي'] },
          { label: 'المحافظة', options: [] },
          { label: 'المنطقة', options: [] },
          { label: 'المحل', options: [] },
          { label: 'الكابتن', options: [] },
        ]}
        withDate
      />

      {tab === 4 && (
        <div className="card mb-5 flex items-center gap-3 border-dashed p-4">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <p className="text-xs leading-relaxed text-mute">
            <span className="font-bold text-black">الطلبيات العالقة:</span> الطلبيات التي لم يتم تعيين كابتن لها بعد 3 محاولات بحث (15 دقيقة).
            يتم إلغاؤها تلقائياً عند الدقيقة 20 إذا لم يتدخل أحد.
          </p>
        </div>
      )}

      <DataTable
        columns={['رقم الطلب', 'المحل', 'الزبون', 'الكابتن', 'المنطقة', 'القيمة', 'الأجرة', 'الحالة', 'الوقت', 'الإجراءات']}
        emptyIcon={Package}
        emptyTitle={tab === 4 ? 'لا توجد طلبيات عالقة حالياً' : 'لا توجد طلبيات لعرضها'}
        emptyHint="ستظهر الطلبيات هنا فور إنشائها من تطبيقات المحلات والمطاعم."
      />
    </div>
  )
}
