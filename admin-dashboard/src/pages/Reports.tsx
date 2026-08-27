import { useState } from 'react'
import { Package, Bike, Store, MapPin, FileDown, FileSpreadsheet } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import FilterBar from '../components/FilterBar'
import DataTable from '../components/DataTable'

const tabs = [
  { label: 'تقرير الطلبيات', icon: Package },
  { label: 'تقرير الكباتن', icon: Bike },
  { label: 'تقرير المحلات', icon: Store },
  { label: 'تقرير المناطق', icon: MapPin },
]

export default function Reports() {
  const [tab, setTab] = useState(0)
  return (
    <div>
      <PageHeader
        title="التقارير والإحصائيات"
        subtitle="تقارير تشغيلية ومحاسبية تفصيلية قابلة للتصدير"
        actions={
          <>
            <button className="btn-ghost">
              <FileSpreadsheet className="h-4 w-4" /> تصدير Excel
            </button>
            <button className="btn-ghost">
              <FileDown className="h-4 w-4" /> تصدير PDF
            </button>
          </>
        }
      />

      <div className="mb-5 flex flex-wrap gap-2">
        {tabs.map((t, i) => (
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

      <FilterBar
        searchPlaceholder="بحث..."
        selects={[
          { label: 'المحافظة', options: [] },
          { label: 'المنطقة', options: [] },
          ...(tab === 0 ? [{ label: 'الحالة', options: ['مكتمل', 'ملغي', 'نشط'] }] : []),
          ...(tab === 1 ? [{ label: 'الشفت', options: [] }] : []),
          ...(tab === 2 ? [{ label: 'نوع النشاط', options: ['مطعم', 'محل', 'صيدلية', 'سوبرماركت'] }] : []),
        ]}
        withDate
      />

      {tab === 0 && (
        <>
          <div className="mb-5 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
            {['إجمالي الطلبيات', 'المكتملة', 'الملغاة', 'متوسط مدة التوصيل', 'متوسط قيمة الطلب', 'إجمالي أجور التوصيل'].map((l) => (
              <div key={l} className="card p-4">
                <p className="text-[11px] font-medium text-mute">{l}</p>
                <p className="mt-1.5 text-xl font-bold">—</p>
              </div>
            ))}
          </div>
          <DataTable
            columns={['التاريخ', 'عدد الطلبيات', 'المكتملة', 'الملغاة', 'متوسط المدة', 'إجمالي القيمة', 'إجمالي الأجور']}
            emptyTitle="لا توجد بيانات في الفترة المحددة"
            emptyHint="حدد فترة زمنية وفلاتر ثم اضغط بحث لعرض التقرير التفصيلي."
          />
        </>
      )}

      {tab === 1 && (
        <DataTable
          columns={['الكابتن', 'الطلبيات', 'المكتملة', 'الملغاة', 'متوسط المدة', 'التقييم ⭐', 'ساعات العمل', 'إجمالي الأجور']}
          emptyIcon={Bike}
          emptyTitle="لا توجد بيانات أداء للكباتن"
          emptyHint="سيعرض هذا التقرير أداء كل كابتن خلال الفترة المحددة."
        />
      )}

      {tab === 2 && (
        <DataTable
          columns={['المحل', 'النوع', 'الطلبيات', 'المكتملة', 'الملغاة', 'متوسط القيمة', 'إجمالي الأجور']}
          emptyIcon={Store}
          emptyTitle="لا توجد بيانات أداء للمحلات"
          emptyHint="سيعرض هذا التقرير نشاط كل محل ومطعم خلال الفترة المحددة."
        />
      )}

      {tab === 3 && (
        <DataTable
          columns={['المنطقة', 'المحافظة', 'الطلبيات', 'الكباتن النشطون', 'متوسط مدة التوصيل', 'إجمالي القيمة']}
          emptyIcon={MapPin}
          emptyTitle="لا توجد بيانات نشاط للمناطق"
          emptyHint="سيعرض هذا التقرير نشاط المناطق مع خريطة حرارية عند توفر البيانات."
        />
      )}
    </div>
  )
}
