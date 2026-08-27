import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Package, Bike, Store, MapPin, FileDown, FileSpreadsheet } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import FilterBar from '../components/FilterBar'
import DataTable from '../components/DataTable'
import ExportDialog from '../components/ExportDialog'
import EmptyState from '../components/EmptyState'
import { useToast } from '../components/Toast'
import { STORE_TYPES } from '../lib/store'

const tabs = [
  { key: 'orders', label: 'تقرير الطلبيات', icon: Package },
  { key: 'captains', label: 'تقرير الكباتن', icon: Bike },
  { key: 'stores', label: 'تقرير المحلات', icon: Store },
  { key: 'zones', label: 'تقرير المناطق', icon: MapPin },
]

export default function Reports() {
  const [params, setParams] = useSearchParams()
  const tab = Math.max(0, tabs.findIndex((t) => t.key === (params.get('tab') || 'orders')))
  const [exportOpen, setExportOpen] = useState(false)
  const { toast, node } = useToast()

  return (
    <div>
      <PageHeader
        title="التقارير والإحصائيات"
        subtitle="تقارير تشغيلية ومحاسبية تفصيلية قابلة للتصدير"
        actions={
          <>
            <button className="btn-ghost" onClick={() => setExportOpen(true)}>
              <FileSpreadsheet className="h-4 w-4" /> تصدير Excel
            </button>
            <button className="btn-ghost" onClick={() => setExportOpen(true)}>
              <FileDown className="h-4 w-4" /> تصدير PDF
            </button>
          </>
        }
      />

      <div className="mb-5 flex flex-wrap gap-2">
        {tabs.map((t, i) => (
          <button
            key={t.key}
            onClick={() => setParams(t.key === 'orders' ? {} : { tab: t.key })}
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
          ...(tab === 2 ? [{ label: 'نوع النشاط', options: STORE_TYPES }] : []),
        ]}
        withDate
        onSearch={() => toast('لا توجد بيانات في الفترة المحددة')}
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
          <div className="mb-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
            <div className="card p-5">
              <h3 className="mb-3 text-sm font-bold">عدد الطلبات يومياً</h3>
              <div className="flex h-40 items-end gap-1 border-b border-line">
                {Array.from({ length: 14 }).map((_, i) => (
                  <div key={i} className="flex-1 rounded-t-sm bg-page" style={{ height: 4 }} />
                ))}
              </div>
              <p className="mt-3 text-center text-[11px] text-faint">لا توجد بيانات</p>
            </div>
            <div className="card flex flex-col items-center justify-center p-5">
              <h3 className="mb-3 self-start text-sm font-bold">توزيع الحالات</h3>
              <div className="h-32 w-32 rounded-full border-[16px] border-line" />
              <p className="mt-3 text-[11px] text-faint">مكتمل / ملغي / نشط</p>
            </div>
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
          columns={[
            'الكابتن',
            'الطلبيات',
            'المكتملة',
            'الملغاة',
            'متوسط المدة',
            'التقييم ⭐',
            'ساعات العمل',
            'إجمالي الأجور',
          ]}
          emptyIcon={Bike}
          emptyTitle="لا توجد بيانات أداء للكباتن"
          emptyHint="سيعرض هذا التقرير أداء كل كابتن خلال الفترة المحددة. انقر رأس العمود للترتيب."
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
        <>
          <div className="card mb-5 p-5">
            <h3 className="mb-3 text-sm font-bold">خريطة حرارية لنشاط المناطق</h3>
            <EmptyState icon={MapPin} title="لا توجد بيانات للخريطة الحرارية" hint="أحمر = نشاط عالي · أزرق = نشاط منخفض — تظهر عند توفر الطلبيات." />
          </div>
          <DataTable
            columns={['المنطقة', 'المحافظة', 'الطلبيات', 'الكباتن النشطون', 'متوسط مدة التوصيل', 'إجمالي القيمة']}
            emptyIcon={MapPin}
            emptyTitle="لا توجد بيانات نشاط للمناطق"
            emptyHint="سيعرض هذا التقرير نشاط المناطق مع خريطة حرارية عند توفر البيانات."
          />
        </>
      )}

      {exportOpen && (
        <ExportDialog
          summary="الفترة: — | المحافظة: الكل | الحالة: الكل"
          onClose={() => setExportOpen(false)}
          onDone={(m) => toast(m)}
        />
      )}
      {node}
    </div>
  )
}
