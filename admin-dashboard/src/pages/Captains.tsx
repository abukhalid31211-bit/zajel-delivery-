import { useState } from 'react'
import { Bike, UserPlus, CalendarClock, ClipboardCheck } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import FilterBar from '../components/FilterBar'
import DataTable from '../components/DataTable'

const tabs = [
  { label: 'قائمة الكباتن', icon: Bike },
  { label: 'طلبات التسجيل الجديدة', icon: UserPlus },
  { label: 'شفتات العمل', icon: CalendarClock },
  { label: 'سجل الحضور', icon: ClipboardCheck },
]

export default function Captains() {
  const [tab, setTab] = useState(0)
  return (
    <div>
      <PageHeader
        title="إدارة الكباتن"
        subtitle="الموافقات، الملفات، الشفتات وسجل الحضور لجميع كباتن التوصيل"
        actions={<button className="btn-primary">+ إضافة كابتن يدوياً</button>}
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

      {tab === 0 && (
        <>
          <FilterBar
            searchPlaceholder="ابحث بالاسم أو رقم الهاتف..."
            selects={[
              { label: 'الحالة', options: ['نشط', 'بانتظار الموافقة', 'موقوف', 'مرفوض'] },
              { label: 'المحافظة', options: [] },
              { label: 'المنطقة', options: [] },
              { label: 'الشفت', options: [] },
            ]}
          />
          <DataTable
            columns={['الصورة', 'الاسم', 'رقم الهاتف', 'المناطق', 'الشفت', 'الحالة', 'التقييم ⭐', 'الإجراءات']}
            emptyIcon={Bike}
            emptyTitle="لا يوجد كباتن مسجلون بعد"
            emptyHint="ستظهر حسابات الكباتن هنا فور تسجيلهم عبر تطبيق الكابتن."
          />
        </>
      )}

      {tab === 1 && (
        <DataTable
          columns={['الاسم الثلاثي', 'رقم الهاتف', 'المحافظة', 'نوع المركبة', 'الوثائق', 'تاريخ التقديم', 'الإجراءات']}
          emptyIcon={UserPlus}
          emptyTitle="لا توجد طلبات تسجيل جديدة"
          emptyHint="طلبات انضمام الكباتن الجدد ستظهر هنا للمراجعة والموافقة أو الرفض، بما فيها طلبات إعادة التقديم بعد الرفض."
        />
      )}

      {tab === 2 && (
        <>
          <div className="card mb-5 flex items-center justify-between gap-3 p-4">
            <p className="text-xs leading-relaxed text-mute">
              حدد أوقات العمل المتاحة للكباتن. الكابتن يختار شفتاً واحداً أسبوعياً ولا يستطيع تغييره إلا مرة واحدة خلال الأسبوع.
            </p>
            <button className="btn-primary shrink-0">+ إضافة شفت جديد</button>
          </div>
          <DataTable
            columns={['اسم الشفت', 'وقت البداية', 'وقت النهاية', 'المدة', 'عدد الكباتن', 'الحالة', 'الإجراءات']}
            emptyIcon={CalendarClock}
            emptyTitle="لا توجد شفتات معرفة بعد"
            emptyHint="أنشئ شفتات العمل (صباحي، مسائي، ليلي...) ليتمكن الكباتن من الاختيار بينها."
          />
        </>
      )}

      {tab === 3 && (
        <>
          <FilterBar searchPlaceholder="ابحث باسم الكابتن..." selects={[{ label: 'الشفت', options: [] }]} withDate />
          <DataTable
            columns={['الكابتن', 'التاريخ', 'الشفت', 'وقت الدخول', 'وقت الخروج', 'مدة العمل الفعلية']}
            emptyIcon={ClipboardCheck}
            emptyTitle="لا توجد سجلات حضور"
            emptyHint="يُسجل حضور وانصراف الكباتن تلقائياً عند اتصالهم داخل أوقات شفتاتهم."
          />
        </>
      )}
    </div>
  )
}
