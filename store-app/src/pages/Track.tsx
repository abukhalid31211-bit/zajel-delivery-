import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, MapPin, TriangleAlert, PencilLine, Headphones, Clock } from 'lucide-react'
import Modal from '../components/Modal'
import { useToast } from '../components/Toast'

const steps = ['طلب جديد', 'انتظار كابتن', 'قبول', 'متوجه', 'وصل المحل', 'استلام', 'بالطريق', 'تسليم', 'مكتمل']
const cancelReasons = ['الزبون ألغى', 'خطأ في البيانات', 'تأخر الكابتن', 'أخرى']

/** شاشة المتابعة الحية للطلب — حالة "بانتظار كابتن" */
export default function Track() {
  const navigate = useNavigate()
  const { toast, node } = useToast()
  const [modal, setModal] = useState<'cancel' | 'edit' | null>(null)
  const [reason, setReason] = useState('')
  const [waitingLong, setWaitingLong] = useState(false)

  return (
    <div className="app-shell">
      <div className="sticky top-0 z-10 border-b border-line bg-white px-4 py-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/home')} className="flex h-9 w-9 items-center justify-center rounded-xl border border-line">
            <ArrowRight className="h-4.5 w-4.5" />
          </button>
          <div className="flex-1">
            <h1 className="text-base font-bold">متابعة الطلب #—</h1>
            <p className="text-[10px] text-mute">تتحدث الشاشة تلقائياً (Real-time) بدون إعادة تحميل</p>
          </div>
          <button
            onClick={() => setModal('edit')}
            className="flex h-9 items-center gap-1 rounded-xl border border-line px-2.5 text-[10px] font-bold"
          >
            <PencilLine className="h-3.5 w-3.5" /> تعديل
          </button>
        </div>
        {/* progress */}
        <div className="mt-4 flex items-center gap-1">
          {steps.map((s, i) => (
            <div key={s} className="flex flex-1 flex-col items-center gap-1">
              <div className={`h-1.5 w-full rounded-full ${i < 2 ? 'bg-black' : 'bg-line'}`} />
              <span className={`text-[7.5px] font-semibold ${i < 2 ? 'text-black' : 'text-faint'}`}>{s}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="animate-fade-up flex-1 space-y-4 px-5 py-4">
        {/* status */}
        <div className="card flex items-center justify-between p-4">
          <div>
            <span className="badge bg-faint text-white">🟡 جاري البحث عن كابتن زاجل قريب...</span>
            <p className="mt-2 flex items-center gap-1 text-[11px] text-mute">
              <Clock className="h-3.5 w-3.5" /> الوقت المنقضي منذ الإنشاء: —
            </p>
          </div>
          <span className="relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-black opacity-40" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-black" />
          </span>
        </div>

        {/* no captain alert */}
        {waitingLong && (
          <div className="animate-fade-up rounded-2xl border-2 border-dashed border-black bg-white p-4">
            <p className="flex items-center gap-2 text-xs font-bold">
              <TriangleAlert className="h-4 w-4" /> لم يتم العثور على كابتن
            </p>
            <p className="mt-1.5 text-[11px] leading-relaxed text-mute">
              لم يقبل أي كابتن طلبك خلال المدة المحددة. جاري توسيع نطاق البحث والمحاولة مرة أخرى...
              عند الدقيقة 15 تُنبه الإدارة، وعند الدقيقة 20 يُلغى الطلب تلقائياً إن لم يتوفر كابتن.
            </p>
            <div className="mt-3 flex gap-2">
              <button className="flex-1 rounded-xl bg-black py-2.5 text-[11px] font-bold text-white" onClick={() => setWaitingLong(false)}>
                ⏳ الاستمرار في الانتظار
              </button>
              <button className="flex-1 rounded-xl border border-black py-2.5 text-[11px] font-bold" onClick={() => setModal('cancel')}>
                ❌ إلغاء الطلب
              </button>
            </div>
          </div>
        )}

        {/* map */}
        <div
          className="relative h-48 overflow-hidden rounded-3xl border border-line"
          style={{
            backgroundImage:
              'linear-gradient(#e6e6e6 1px, transparent 1px), linear-gradient(90deg, #e6e6e6 1px, transparent 1px)',
            backgroundSize: '28px 28px',
            backgroundColor: '#fafafa',
          }}
        >
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 text-center">
            <MapPin className="h-8 w-8 text-faint" strokeWidth={1.4} />
            <p className="text-[11px] font-semibold text-mute">📍 المحل · 🏠 التوصيل · 🚚 الكابتن (بعد القبول)</p>
            <p className="text-[10px] text-faint">الخريطة الحية تعمل عند ربط مزود الخرائط</p>
          </div>
        </div>

        {/* captain card placeholder */}
        <div className="card p-4">
          <p className="text-xs font-bold">بطاقة الكابتن</p>
          <p className="mt-1.5 text-[11px] leading-relaxed text-mute">
            تظهر هنا بيانات الكابتن (الاسم، الهاتف، التقييم ⭐، المسافة والوقت التقديري) فور قبوله للطلب.
          </p>
        </div>

        {/* timeline */}
        <div className="card p-4">
          <p className="mb-3 text-xs font-bold">سجل التحديثات</p>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-black" />
              <div>
                <p className="text-[11px] font-bold">تم إنشاء الطلب</p>
                <p className="text-[10px] text-faint">—</p>
              </div>
            </div>
            <div className="flex items-start gap-3 opacity-40">
              <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full border-2 border-line" />
              <p className="text-[11px] font-semibold text-mute">بانتظار قبول كابتن...</p>
            </div>
          </div>
        </div>

        {/* demo trigger for waiting state */}
        {!waitingLong && (
          <button
            onClick={() => setWaitingLong(true)}
            className="w-full rounded-2xl border border-dashed border-line bg-white py-3 text-[11px] font-bold text-mute"
          >
            👁️ معاينة حالة "لا يوجد كباتن متاحون"
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 border-t border-line bg-white px-5 py-4">
        <button className="rounded-2xl border-2 border-black bg-white py-3.5 text-xs font-bold" onClick={() => setModal('cancel')}>
          ❌ إلغاء الطلب
        </button>
        <a href="tel:+964" className="flex items-center justify-center gap-1.5 rounded-2xl bg-black py-3.5 text-xs font-bold text-white">
          <Headphones className="h-4 w-4" /> تواصل مع الدعم
        </a>
      </div>

      {modal === 'cancel' && (
        <Modal title="إلغاء الطلب #—" onClose={() => setModal(null)}>
          <div className="mt-3 space-y-2">
            <label className="block text-xs font-semibold">سبب الإلغاء *</label>
            <select className="field cursor-pointer" value={reason} onChange={(e) => setReason(e.target.value)}>
              <option value="" disabled>اختر السبب</option>
              {cancelReasons.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
            <textarea className="field min-h-16 resize-none" placeholder="تفاصيل (اختياري)" />
            <p className="rounded-xl border border-dashed border-black px-3 py-2 text-[10px] font-semibold">
              ⚠️ إذا كان الكابتن قد استلم الطلب، لا يمكن الإلغاء — تواصل مع الإدارة.
            </p>
          </div>
          <div className="mt-4 flex gap-2">
            <button className="btn-primary flex-1" disabled={!reason} onClick={() => navigate('/home')}>
              تأكيد الإلغاء
            </button>
            <button className="btn-secondary flex-1" onClick={() => setModal(null)}>
              رجوع
            </button>
          </div>
        </Modal>
      )}

      {modal === 'edit' && (
        <Modal title="تعديل الطلب ✏️" onClose={() => setModal(null)}>
          <p className="mt-1.5 text-[11px] leading-relaxed text-mute">
            المرحلة الحالية: <b className="text-black">بانتظار كابتن</b> — يسمح بتعديل كامل الحقول.
            بعد قبول الكابتن تُقفل قيمة الطلبية، وبعد الاستلام يُمنع التعديل نهائياً.
          </p>
          <div className="mt-4 space-y-3">
            <input className="field" placeholder="اسم الزبون" />
            <input className="field" placeholder="رقم هاتف الزبون" dir="ltr" />
            <input className="field" placeholder="عنوان التوصيل" />
            <input className="field" placeholder="قيمة الطلبية (د.ع)" inputMode="numeric" dir="ltr" />
            <textarea className="field min-h-16 resize-none" placeholder="الملاحظات" />
          </div>
          <div className="mt-4 flex gap-2">
            <button
              className="btn-primary flex-1"
              onClick={() => {
                setModal(null)
                toast('تم حفظ التعديل وإشعار الكابتن فوراً ✅')
              }}
            >
              حفظ التعديل
            </button>
            <button className="btn-secondary flex-1" onClick={() => setModal(null)}>
              إلغاء
            </button>
          </div>
        </Modal>
      )}

      {node}
    </div>
  )
}
