import { Search } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import DataTable from '../components/DataTable'

export default function AdvancedSearch() {
  return (
    <div>
      <PageHeader title="البحث المتقدم" subtitle="ابحث عن طلب، كابتن، محل أو رقم هاتف عبر فلاتر دقيقة" />

      <div className="card mb-5 p-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold">رقم الطلب</label>
            <input className="field" placeholder="#" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold">اسم الكابتن</label>
            <input className="field" placeholder="الاسم" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold">رقم هاتف الكابتن</label>
            <input className="field" placeholder="+964" dir="ltr" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold">اسم المحل / المطعم</label>
            <input className="field" placeholder="الاسم" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold">رقم هاتف المحل</label>
            <input className="field" placeholder="+964" dir="ltr" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold">المنطقة</label>
            <select className="field cursor-pointer text-mute" defaultValue="">
              <option value="" disabled>لا توجد مناطق معرفة</option>
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold">حالة الطلب</label>
            <select className="field cursor-pointer text-mute" defaultValue="">
              <option value="" disabled>الكل</option>
              <option>مكتمل</option>
              <option>نشط</option>
              <option>ملغي</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold">من تاريخ</label>
              <input type="date" className="field cursor-pointer" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold">إلى تاريخ</label>
              <input type="date" className="field cursor-pointer" />
            </div>
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <button className="btn-primary">
            <Search className="h-4 w-4" /> بحث
          </button>
          <button className="btn-ghost">مسح الفلاتر</button>
        </div>
      </div>

      <DataTable
        columns={['النتيجة', 'النوع', 'الحالة', 'المنطقة', 'التاريخ', 'الإجراءات']}
        emptyIcon={Search}
        emptyTitle="لا توجد نتائج مطابقة"
        emptyHint="حدد الفلاتر واضغط بحث — تظهر النتائج مقسمة: طلبات، كباتن، محلات."
      />
    </div>
  )
}
