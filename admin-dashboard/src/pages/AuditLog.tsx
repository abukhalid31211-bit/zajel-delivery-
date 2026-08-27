import { useState } from 'react'
import { FileClock, ShieldAlert } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import FilterBar from '../components/FilterBar'
import DataTable from '../components/DataTable'

export default function AuditLog() {
  const [tab, setTab] = useState(0)
  return (
    <div>
      <PageHeader title="سجلات النظام" subtitle="سجل العمليات الإدارية (Audit Log) وسجل الأمان" />

      <div className="mb-5 flex flex-wrap gap-2">
        {[
          { label: 'سجل العمليات (Audit Log)', icon: FileClock },
          { label: 'سجل الأمان', icon: ShieldAlert },
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
        <>
          <FilterBar
            searchPlaceholder="اسم الأدمن أو الكيان المتأثر..."
            selects={[{ label: 'نوع العملية', options: ['تعديل سعر', 'إيقاف حساب', 'موافقة', 'رفض', 'إلغاء طلب', 'تغيير إعداد', 'إعادة تعيين', 'أخرى'] }]}
            withDate
          />
          <DataTable
            columns={['التاريخ والوقت', 'الأدمن', 'العملية', 'الكيان', 'التفاصيل', 'القيمة السابقة', 'القيمة الجديدة']}
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
            emptyIcon={ShieldAlert}
            emptyTitle="لا توجد أحداث أمنية مسجلة"
            emptyHint="تُسجل هنا جميع أحداث الدخول والمحاولات الفاشلة والأنشطة المشبوهة."
          />
        </>
      )}
    </div>
  )
}
