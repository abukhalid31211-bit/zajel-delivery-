import { useState } from 'react'
import { ArrowLeft, Route, Map } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import DataTable from '../components/DataTable'

export default function Pricing() {
  const [tab, setTab] = useState(0)
  return (
    <div>
      <PageHeader
        title="أسعار التوصيل"
        subtitle="إدارة نظام تسعير زاجل ديلفري — جميع التغييرات تُسجل في سجل العمليات"
        actions={
          <span className="badge border border-black bg-black text-white">
            النظام النشط حالياً: نظام المسارات (من ← إلى)
          </span>
        }
      />

      <div className="mb-5 flex flex-wrap gap-2">
        <button
          onClick={() => setTab(0)}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-colors ${
            tab === 0 ? 'bg-black text-white' : 'border border-line bg-white text-mute hover:bg-page'
          }`}
        >
          <Route className="h-3.5 w-3.5" /> نظام من ← إلى 📍
        </button>
        <button
          onClick={() => setTab(1)}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-colors ${
            tab === 1 ? 'bg-black text-white' : 'border border-line bg-white text-mute hover:bg-page'
          }`}
        >
          <Map className="h-3.5 w-3.5" /> نظام المناطق الجغرافية 🗺️
        </button>
        <div className="flex-1" />
        <button className="btn-secondary text-xs">تبديل نظام التسعير النشط</button>
      </div>

      {tab === 0 && (
        <>
          <div className="card mb-5 flex flex-wrap items-center justify-between gap-3 p-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold">اختر المحافظة:</span>
              <select className="field w-auto min-w-44 cursor-pointer text-mute" defaultValue="">
                <option value="" disabled>لا توجد محافظات معرفة</option>
              </select>
            </div>
            <button className="btn-primary">+ إضافة مسار سعري جديد</button>
          </div>
          <DataTable
            columns={['منطقة الانطلاق', '←', 'منطقة الوصول', 'السعر (د.ع)', 'الإجراءات']}
            emptyIcon={ArrowLeft}
            emptyTitle="لا توجد مسارات سعرية معرفة"
            emptyHint="أضف مسارات التسعير (من منطقة إلى منطقة) لتحسب أجرة التوصيل تلقائياً عند إنشاء الطلبيات."
          />
        </>
      )}

      {tab === 1 && (
        <>
          <div className="card mb-5 flex flex-wrap items-center justify-between gap-3 p-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold">اختر المحافظة:</span>
              <select className="field w-auto min-w-44 cursor-pointer text-mute" defaultValue="">
                <option value="" disabled>لا توجد محافظات معرفة</option>
              </select>
            </div>
            <button className="btn-primary">+ إضافة منطقة سعرية</button>
          </div>
          <DataTable
            columns={['المنطقة', 'السعر الأساسي (د.ع)', 'سعر الإضافي لكل كم (د.ع)', 'الإجراءات']}
            emptyIcon={Map}
            emptyTitle="لا توجد مناطق سعرية معرفة"
            emptyHint="اربط المناطق الجغرافية المرسومة بأسعار أساسية وسعر إضافي لكل كيلومتر."
          />
        </>
      )}
    </div>
  )
}
