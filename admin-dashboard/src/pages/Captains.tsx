import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bike, UserPlus, CalendarClock, ClipboardCheck } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import FilterBar from '../components/FilterBar'
import DataTable from '../components/DataTable'
import Modal from '../components/Modal'
import { useToast } from '../components/Toast'

const tabs = [
  { label: 'قائمة الكباتن', icon: Bike },
  { label: 'طلبات التسجيل الجديدة', icon: UserPlus },
  { label: 'شفتات العمل', icon: CalendarClock },
  { label: 'سجل الحضور', icon: ClipboardCheck },
]

export default function Captains() {
  const [tab, setTab] = useState(0)
  const navigate = useNavigate()
  const [addShift, setAddShift] = useState(false)
  const [shiftName, setShiftName] = useState('')
  const { toast, node } = useToast()
  return (
    <div>
      <PageHeader
        title="إدارة الكباتن"
        subtitle="الموافقات، الملفات، الشفتات وسجل الحضور لجميع كباتن التوصيل"
        actions={<><button className="btn-ghost" onClick={() => navigate('/captains/profile')}>👁️ معاينة ملف الكابتن</button><button className="btn-primary">+ إضافة كابتن يدوياً</button></>}
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
            <button className="btn-primary shrink-0" onClick={() => setAddShift(true)}>+ إضافة شفت جديد</button>
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

      {addShift && (
        <Modal title="إضافة شفت جديد" onClose={() => setAddShift(false)}>
          <div className="mt-4 space-y-3">
            <div>
              <label className="mb-1.5 block text-xs font-semibold">اسم الشفت</label>
              <input className="field" placeholder="مثال: الشفت الصباحي" value={shiftName} onChange={(e) => setShiftName(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-xs font-semibold">وقت البداية</label>
                <input type="time" className="field cursor-pointer" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold">وقت النهاية</label>
                <input type="time" className="field cursor-pointer" />
              </div>
            </div>
            <label className="flex items-center gap-2 text-xs font-semibold">
              <input type="checkbox" defaultChecked className="h-4 w-4 accent-black" /> نشط
            </label>
            <p className="rounded-xl border border-dashed border-black px-3 py-2 text-[10px] font-semibold leading-relaxed">
              ⚠️ وقت النهاية يجب أن يكون بعد البداية (الشفتات الليلية الممتدة عبر منتصف الليل مدعومة). التداخل بين الشفتات مسموح تقنياً مع تحذير.
            </p>
          </div>
          <div className="mt-4 flex gap-2">
            <button className="btn-primary flex-1" disabled={!shiftName.trim()} onClick={() => { setAddShift(false); setShiftName(''); toast('تمت إضافة الشفت بنجاح ✅') }}>
              حفظ
            </button>
            <button className="btn-ghost flex-1" onClick={() => setAddShift(false)}>إلغاء</button>
          </div>
        </Modal>
      )}

      {node}
    </div>
  )
}
