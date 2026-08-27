import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, MapPin, Phone, Store, Home, Banknote, Camera, Check, TriangleAlert, Siren, X } from 'lucide-react'
import Modal from '../components/Modal'
import { useToast } from '../components/Toast'

type Stage = 'toShop' | 'atShop' | 'toCustomer'

const steps = ['قبول', 'متوجه للمحل', 'وصل المحل', 'استلام', 'بالطريق', 'تسليم']

const cancelReasons = ['تعطل الدراجة', 'حادث', 'الزبون لا يرد', 'العنوان خاطئ', 'المحل ألغى', 'أخرى']

export default function Order() {
  const navigate = useNavigate()
  const { toast, node } = useToast()
  const [stage, setStage] = useState<Stage>('toShop')
  const [modal, setModal] = useState<'arrive' | 'pickup' | 'cancel' | null>(null)
  const [photoTaken, setPhotoTaken] = useState(false)
  const [cancelReason, setCancelReason] = useState('')

  const doneCount = stage === 'toShop' ? 2 : stage === 'atShop' ? 3 : 4
  const activeIdx = stage === 'toShop' ? 1 : stage === 'atShop' ? 2 : 4

  return (
    <div className="app-shell">
      {/* header */}
      <div className="sticky top-0 z-10 border-b border-line bg-white px-4 py-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/home')} className="flex h-9 w-9 items-center justify-center rounded-xl border border-line">
            <ArrowRight className="h-4.5 w-4.5" />
          </button>
          <div className="flex-1">
            <h1 className="text-base font-bold">طلب #—</h1>
            <p className="text-[10px] text-mute">
              {stage === 'toShop' ? 'متوجه إلى المحل/المطعم' : stage === 'atShop' ? 'وصلت لموقع المحل' : 'بالطريق إلى الزبون'}
            </p>
          </div>
          <button
            onClick={() => setModal('cancel')}
            className="flex h-9 items-center gap-1 rounded-xl border border-dashed border-black px-2.5 text-[10px] font-bold"
          >
            <X className="h-3.5 w-3.5" /> إلغاء الطلب
          </button>
        </div>

        {/* stepper */}
        <div className="mt-4 flex items-center gap-1">
          {steps.map((s, i) => (
            <div key={s} className="flex flex-1 flex-col items-center gap-1">
              <div
                className={`h-1.5 w-full rounded-full ${
                  i < doneCount ? 'bg-black' : i === activeIdx + 1 && false ? 'bg-mute' : 'bg-line'
                }`}
              />
              <span className={`text-[8.5px] font-semibold ${i < doneCount ? 'text-black' : 'text-faint'}`}>{s}</span>
            </div>
          ))}
        </div>
      </div>

      {/* map */}
      <div
        className="relative mx-5 mt-4 h-52 overflow-hidden rounded-3xl border border-line"
        style={{
          backgroundImage:
            'linear-gradient(#e6e6e6 1px, transparent 1px), linear-gradient(90deg, #e6e6e6 1px, transparent 1px)',
          backgroundSize: '28px 28px',
          backgroundColor: '#fafafa',
        }}
      >
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 text-center">
          <MapPin className="h-8 w-8 text-faint" strokeWidth={1.4} />
          <p className="text-[11px] font-semibold text-mute">الخريطة والملاحة تعمل عند ربط مزود الخرائط</p>
          <p className="text-[10px] text-faint">GPS مباشر + خط المسار المقترح</p>
        </div>
      </div>

      <div className="flex-1 space-y-4 px-5 py-4">
        {/* stage content */}
        {stage !== 'toCustomer' ? (
          <div className="card divide-y divide-line">
            <div className="flex items-center gap-3 px-4 py-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-page">
                <Store className="h-4.5 w-4.5" strokeWidth={1.7} />
              </span>
              <div className="flex-1">
                <p className="text-xs font-bold">المحل / المطعم</p>
                <p className="text-[11px] text-mute">— العنوان التفصيلي</p>
              </div>
              <button className="flex h-9 w-9 items-center justify-center rounded-xl bg-black text-white">
                <Phone className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 divide-x divide-x-reverse divide-line text-center">
              <div className="px-2 py-2.5">
                <p className="text-[10px] text-mute">المسافة التقريبية</p>
                <p className="text-xs font-bold">— كم</p>
              </div>
              <div className="px-2 py-2.5">
                <p className="text-[10px] text-mute">الوقت التقديري</p>
                <p className="text-xs font-bold">— دقيقة</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="card divide-y divide-line">
            <div className="flex items-center gap-3 px-4 py-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-page">
                <Home className="h-4.5 w-4.5" strokeWidth={1.7} />
              </span>
              <div className="flex-1">
                <p className="text-xs font-bold">الزبون</p>
                <p className="text-[11px] text-mute">— عنوان التوصيل وملاحظات الوصول</p>
              </div>
              <button className="flex h-9 w-9 items-center justify-center rounded-xl bg-black text-white">
                <Phone className="h-4 w-4" />
              </button>
            </div>
            <div className="flex items-center justify-between px-4 py-3">
              <span className="flex items-center gap-2 text-xs font-bold">
                <Banknote className="h-4 w-4" /> المبلغ المطلوب من الزبون
              </span>
              <span className="text-sm font-bold">— د.ع</span>
            </div>
          </div>
        )}

        {stage === 'atShop' && (
          <div className="card animate-fade-up space-y-3 p-4">
            <p className="text-xs font-bold">تعليمات الاستلام</p>
            <ul className="space-y-1.5 text-[11px] leading-relaxed text-mute">
              <li>• ادخل المحل واستلم الطلبية.</li>
              <li>• ادفع قيمة الطلبية للمحل نقداً (كاش): <b className="text-black">— د.ع</b></li>
            </ul>
            <button
              onClick={() => {
                setPhotoTaken(true)
                toast('تم ربط صورة الاستلام بالطلب 📷')
              }}
              className={`flex w-full items-center justify-center gap-2 rounded-2xl border py-3 text-xs font-bold transition-colors ${
                photoTaken ? 'border-black bg-black text-white' : 'border-dashed border-line'
              }`}
            >
              {photoTaken ? <Check className="h-4 w-4" /> : <Camera className="h-4 w-4" />}
              {photoTaken ? 'تم تصوير الطلبية عند الاستلام' : '📷 تصوير الطلبية عند الاستلام (اختياري)'}
            </button>
          </div>
        )}

        {/* secondary actions */}
        <div className="flex gap-2">
          {stage === 'toCustomer' && (
            <button
              onClick={() => navigate('/problem')}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-2xl border border-line bg-white py-3 text-xs font-bold"
            >
              <TriangleAlert className="h-4 w-4" /> مشكلة في التسليم
            </button>
          )}
          <button
            onClick={() => navigate('/emergency')}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-2xl border border-dashed border-black bg-white py-3 text-xs font-bold"
          >
            <Siren className="h-4 w-4" /> طوارئ
          </button>
        </div>
      </div>

      {/* primary action */}
      <div className="border-t border-line bg-white px-5 py-4">
        {stage === 'toShop' && (
          <button className="btn-primary w-full" onClick={() => setModal('arrive')}>
            📍 وصلت للمحل
          </button>
        )}
        {stage === 'atShop' && (
          <button className="btn-primary w-full" onClick={() => setModal('pickup')}>
            ✅ استلمت الطلبية ودفعت الكاش للمحل
          </button>
        )}
        {stage === 'toCustomer' && (
          <button className="btn-primary w-full" onClick={() => navigate('/pod')}>
            ✅ وصلت للزبون وسلّمت الطلبية
          </button>
        )}
      </div>

      {/* modals */}
      {modal === 'arrive' && (
        <Modal title="تأكيد الوصول للمحل" onClose={() => setModal(null)}>
          <p className="mt-2 text-xs leading-relaxed text-mute">هل وصلت لموقع المحل؟ سيتم إشعار المحل بوصولك.</p>
          <div className="mt-5 flex gap-2">
            <button
              className="btn-primary flex-1"
              onClick={() => {
                setStage('atShop')
                setModal(null)
                toast('تم إشعار المحل بوصولك ✅')
              }}
            >
              نعم، وصلت
            </button>
            <button className="btn-secondary flex-1" onClick={() => setModal(null)}>
              إلغاء
            </button>
          </div>
        </Modal>
      )}

      {modal === 'pickup' && (
        <Modal title="تأكيد الاستلام ودفع الكاش" onClose={() => setModal(null)}>
          <p className="mt-2 text-xs leading-relaxed text-mute">
            هل استلمت الطلبية ودفعت قيمتها <b className="text-black">— د.ع</b> نقداً للمحل؟ ستُسجل حركة الدفع في كشف حسابك.
          </p>
          <div className="mt-5 flex gap-2">
            <button
              className="btn-primary flex-1"
              onClick={() => {
                setStage('toCustomer')
                setModal(null)
                toast('انطلق! المحل والإدارة تم إشعارهما 🚚')
              }}
            >
              تأكيد
            </button>
            <button className="btn-secondary flex-1" onClick={() => setModal(null)}>
              إلغاء
            </button>
          </div>
        </Modal>
      )}

      {modal === 'cancel' && (
        <Modal title="إلغاء الطلب #—" onClose={() => setModal(null)}>
          <div className="mt-3 space-y-2">
            <label className="block text-xs font-semibold">سبب الإلغاء *</label>
            <select className="field cursor-pointer" value={cancelReason} onChange={(e) => setCancelReason(e.target.value)}>
              <option value="" disabled>اختر السبب</option>
              {cancelReasons.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
            <textarea className="field min-h-16 resize-none" placeholder="تفاصيل إضافية (اختياري)" />
            <p className="rounded-xl border border-dashed border-black px-3 py-2 text-[10px] font-semibold">
              ⚠️ إلغاء الطلبات المتكرر قد يؤثر على تقييمك.
            </p>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              className="btn-primary flex-1"
              disabled={!cancelReason}
              onClick={() => navigate('/home')}
            >
              تأكيد الإلغاء
            </button>
            <button className="btn-secondary flex-1" onClick={() => setModal(null)}>
              رجوع
            </button>
          </div>
        </Modal>
      )}

      {node}
    </div>
  )
}
