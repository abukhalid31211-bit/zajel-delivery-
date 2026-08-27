import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Store, UserPlus, FileEdit } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import FilterBar from '../components/FilterBar'
import DataTable from '../components/DataTable'

const tabs = [
  { label: 'قائمة المحلات', icon: Store },
  { label: 'طلبات التسجيل الجديدة', icon: UserPlus },
  { label: 'طلبات تعديل البيانات', icon: FileEdit },
]

export default function Stores() {
  const [tab, setTab] = useState(0)
  const navigate = useNavigate()
  return (
    <div>
      <PageHeader title="المحلات والمطاعم" subtitle="إدارة حسابات المحلات، الموافقات، ومراجعة التعديلات الحساسة" actions={<button className="btn-ghost" onClick={() => navigate('/stores/profile')}>👁️ معاينة ملف المحل</button>} />

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
              { label: 'النوع', options: ['مطعم', 'محل', 'صيدلية', 'سوبرماركت'] },
              { label: 'الحالة', options: ['نشط', 'بانتظار الموافقة', 'موقوف'] },
              { label: 'المحافظة', options: [] },
              { label: 'المنطقة', options: [] },
            ]}
          />
          <DataTable
            columns={['اسم المحل', 'النوع', 'رقم الهاتف', 'المحافظة', 'المنطقة', 'الحالة', 'طلبيات اليوم', 'الإجراءات']}
            emptyIcon={Store}
            emptyTitle="لا توجد محلات مسجلة بعد"
            emptyHint="ستظهر حسابات المحلات والمطاعم هنا فور تسجيلها عبر تطبيق المحل."
          />
        </>
      )}

      {tab === 1 && (
        <DataTable
          columns={['اسم المحل', 'نوع النشاط', 'صاحب المحل', 'رقم الهاتف', 'المحافظة', 'تاريخ التقديم', 'الإجراءات']}
          emptyIcon={UserPlus}
          emptyTitle="لا توجد طلبات تسجيل جديدة"
          emptyHint="طلبات انضمام المحلات الجديدة ستظهر هنا للمراجعة والموافقة أو الرفض."
        />
      )}

      {tab === 2 && (
        <DataTable
          columns={['اسم المحل', 'الحقل المعدل', 'القيمة السابقة', 'القيمة المقترحة', 'تاريخ الطلب', 'الإجراءات']}
          emptyIcon={FileEdit}
          emptyTitle="لا توجد طلبات تعديل معلقة"
          emptyHint="التعديلات الحساسة (رقم الهاتف، الموقع الجغرافي، نوع النشاط، اسم المالك) تتطلب موافقة إدارية وتظهر هنا."
        />
      )}
    </div>
  )
}
