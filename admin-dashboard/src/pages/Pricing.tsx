import { useState } from 'react'
import { ArrowLeft, Route, Map } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import DataTable from '../components/DataTable'
import Modal from '../components/Modal'
import { useToast } from '../components/Toast'

export default function Pricing() {
  const [tab, setTab] = useState(0)
  const [addRoute, setAddRoute] = useState(false)
  const [switchSys, setSwitchSys] = useState(false)
  const [price, setPrice] = useState('')
  const { toast, node } = useToast()
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
        <button className="btn-secondary text-xs" onClick={() => setSwitchSys(true)}>تبديل نظام التسعير النشط</button>
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
            <button className="btn-primary" onClick={() => setAddRoute(true)}>+ إضافة مسار سعري جديد</button>
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

      {addRoute && (
        <Modal title="إضافة مسار سعري جديد" onClose={() => setAddRoute(false)}>
          <div className="mt-4 space-y-3">
            <div>
              <label className="mb-1.5 block text-xs font-semibold">منطقة الانطلاق (من)</label>
              <select className="field cursor-pointer text-mute" defaultValue="">
                <option value="" disabled>لا توجد مناطق معرفة</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold">منطقة الوصول (إلى)</label>
              <select className="field cursor-pointer text-mute" defaultValue="">
                <option value="" disabled>لا توجد مناطق معرفة</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold">سعر التوصيل (بالدينار العراقي)</label>
              <input className="field" placeholder="0" inputMode="numeric" dir="ltr" value={price} onChange={(e) => setPrice(e.target.value.replace(/[^\d]/g, ''))} />
            </div>
            <p className="rounded-xl border border-dashed border-black px-3 py-2 text-[10px] font-semibold">
              ⚠️ منطقة الانطلاق والوصول يجب أن تكونا مختلفتين، ولا يمكن تكرار مسار موجود.
            </p>
          </div>
          <div className="mt-4 flex gap-2">
            <button className="btn-primary flex-1" disabled={!price} onClick={() => { setAddRoute(false); setPrice(''); toast('تمت إضافة المسار السعري ✅ وسُجل في Audit Log') }}>
              حفظ
            </button>
            <button className="btn-ghost flex-1" onClick={() => setAddRoute(false)}>إلغاء</button>
          </div>
        </Modal>
      )}

      {switchSys && (
        <Modal title="تغيير نظام التسعير النشط" onClose={() => setSwitchSys(false)}>
          <p className="mt-2 text-xs leading-relaxed text-mute">
            هل تريد تغيير نظام التسعير؟ سيتم تطبيق النظام الجديد على جميع الطلبيات الجديدة فوراً، ويُسجل التغيير في سجل العمليات.
          </p>
          <div className="mt-4 flex gap-2">
            <button className="btn-primary flex-1" onClick={() => { setSwitchSys(false); toast('تم تبديل نظام التسعير النشط ✅') }}>
              تأكيد التبديل
            </button>
            <button className="btn-ghost flex-1" onClick={() => setSwitchSys(false)}>إلغاء</button>
          </div>
        </Modal>
      )}

      {node}
    </div>
  )
}
