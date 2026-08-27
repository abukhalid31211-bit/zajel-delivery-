import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowRight, MapPin, Phone, Store, Home, Banknote, Camera, Check, TriangleAlert, Siren, X, MessageSquareWarning } from 'lucide-react'
import Modal from '../components/Modal'
import { useToast } from '../components/Toast'
import { useCaptain } from '../state'

const steps = ['قبول', 'متوجه للمحل', 'وصل المحل', 'استلام', 'بالطريق', 'تسليم']
const cancelReasons = ['تعطل الدراجة', 'حادث', 'الزبون لا يرد', 'العنوان خاطئ', 'المحل ألغى', 'أخرى']

export default function Order() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const { getOrder, arriveShop, pickup, toCustomer, cancelOrder, arriveReturn, money, fmtTime } = useCaptain()
  const { toast, node } = useToast()
  const orderId = params.get('order') || ''
  const order = getOrder(orderId)
  const [modal, setModal] = useState<'arrive' | 'pickup' | 'cancel' | null>(null)
  const [photoTaken, setPhotoTaken] = useState(false)
  const [pickupImage, setPickupImage] = useState<string | null>(null)
  const [cancelReason, setCancelReason] = useState('')
  const [cancelDetails, setCancelDetails] = useState('')

  const stage = order?.stage || 'toShop'
  const doneCount = stage === 'toShop' ? 2 : stage === 'atShop' ? 3 : stage === 'toCustomer' ? 4 : stage === 'delivered' || stage === 'canceled' || stage === 'returned' || stage === 'awaitRefund' || stage === 'refunded' ? 6 : 2
  const activeIdx = stage === 'toShop' ? 1 : stage === 'atShop' ? 2 : stage === 'toCustomer' ? 4 : 5

  if (!order) {
    return (
      <div className="app-shell items-center justify-center px-8 text-center">
        <h1 className="text-lg font-bold">الطلب غير موجود</h1>
        <p className="mt-2 text-xs text-mute">افتح الطلب من الرئيسية أو سجل الطلبات.</p>
        <button className="btn-primary mt-5 w-full" onClick={() => navigate('/home')}>العودة للرئيسية</button>
      </div>
    )
  }

  const isActive = ['accepted', 'toShop', 'atShop', 'toCustomer'].includes(stage)
  const finished = ['delivered', 'canceled', 'returned', 'awaitRefund', 'refunded'].includes(stage)

  const onPickupFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPickupImage(URL.createObjectURL(file))
    setPhotoTaken(true)
  }

  return (
    <div className="app-shell">
      <div className="sticky top-0 z-10 border-b border-line bg-white px-4 py-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/home')} className="flex h-9 w-9 items-center justify-center rounded-xl border border-line">
            <ArrowRight className="h-4.5 w-4.5" />
          </button>
          <div className="flex-1">
            <h1 className="text-base font-bold">{order.title}</h1>
            <p className="text-[10px] text-mute">
              {stage === 'toShop' ? 'متوجه إلى المحل/المطعم' : stage === 'atShop' ? 'وصلت لموقع المحل' : stage === 'toCustomer' ? 'بالطريق إلى الزبون' : stage === 'delivered' ? 'تم التسليم' : stage === 'canceled' ? 'ملغي' : stage === 'returned' || stage === 'awaitRefund' || stage === 'refunded' ? 'مرتجع / استرداد' : 'جديد'}
            </p>
          </div>
          <button onClick={() => navigate(`/complaints/new?order=${order.id}`)} className="flex h-9 items-center gap-1 rounded-xl border border-line px-2.5 text-[10px] font-bold text-mute">
            <MessageSquareWarning className="h-3.5 w-3.5" /> شكوى
          </button>
          {isActive && (
            <button onClick={() => setModal('cancel')} className="flex h-9 items-center gap-1 rounded-xl border border-dashed border-gold px-2.5 text-[10px] font-bold">
              <X className="h-3.5 w-3.5" /> إلغاء الطلب
            </button>
          )}
        </div>

        <div className="mt-4 flex items-center gap-1">
          {steps.map((s, i) => (
            <div key={s} className="flex flex-1 flex-col items-center gap-1">
              <div className={`h-1.5 w-full rounded-full ${i < doneCount ? 'bg-gold' : 'bg-line'}`} />
              <span className={`text-[8.5px] font-semibold ${i < doneCount || (i === activeIdx && isActive) ? 'text-gold-dark' : 'text-faint'}`}>{s}</span>
            </div>
          ))}
        </div>
      </div>

      <div
        className="relative mx-5 mt-4 h-52 overflow-hidden rounded-3xl border border-line"
        style={{
          backgroundImage: 'linear-gradient(#ead9a8 1px, transparent 1px), linear-gradient(90deg, #ead9a8 1px, transparent 1px)',
          backgroundSize: '28px 28px',
          backgroundColor: '#fffdf9',
        }}
      >
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 text-center">
          <MapPin className="h-8 w-8 text-gold-dark" strokeWidth={1.4} />
          <p className="text-[11px] font-semibold text-mute">الخريطة والملاحة تعمل عند ربط مزود الخرائط</p>
          <p className="text-[10px] text-faint">GPS مباشر + خط المسار المقترح</p>
        </div>
      </div>

      <div className="flex-1 space-y-4 px-5 py-4">
        {!finished && stage !== 'toCustomer' ? (
          <div className="card divide-y divide-line">
            <div className="flex items-center gap-3 px-4 py-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold-light">
                <Store className="h-4.5 w-4.5 text-gold-dark" strokeWidth={1.7} />
              </span>
              <div className="flex-1">
                <p className="text-xs font-bold">{order.shopName}</p>
                <p className="text-[11px] text-mute">{order.shopAddress || order.pickupArea}</p>
              </div>
              <a href={`tel:${order.shopPhone}`} className="flex h-9 w-9 items-center justify-center rounded-xl bg-gold text-white">
                <Phone className="h-4 w-4" />
              </a>
            </div>
            <div className="grid grid-cols-2 divide-x divide-x-reverse divide-line text-center">
              <div className="px-2 py-2.5"><p className="text-[10px] text-mute">المسافة التقريبية</p><p className="text-xs font-bold text-faint">تظهر بعد ربط GPS</p></div>
              <div className="px-2 py-2.5"><p className="text-[10px] text-mute">الوقت التقديري</p><p className="text-xs font-bold text-faint">تظهر بعد ربط GPS</p></div>
            </div>
            <div className="px-4 py-3 text-[11px] text-mute"><b className="text-gold-dark">ملاحظات:</b> {order.note || 'لا توجد'}</div>
          </div>
        ) : (
          <div className="card divide-y divide-line">
            <div className="flex items-center gap-3 px-4 py-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold-light">
                <Home className="h-4.5 w-4.5 text-gold-dark" strokeWidth={1.7} />
              </span>
              <div className="flex-1">
                <p className="text-xs font-bold">{order.customerName}</p>
                <p className="text-[11px] text-mute">{order.customerAddress || order.dropArea}</p>
              </div>
              <a href={`tel:${order.customerPhone}`} className="flex h-9 w-9 items-center justify-center rounded-xl bg-gold text-white">
                <Phone className="h-4 w-4" />
              </a>
            </div>
            {order.note && <div className="px-4 py-3 text-[11px] text-mute"><b className="text-gold-dark">ملاحظات:</b> {order.note}</div>}
            <div className="flex items-center justify-between px-4 py-3">
              <span className="flex items-center gap-2 text-xs font-bold"><Banknote className="h-4 w-4" /> المبلغ المطلوب من الزبون</span>
              <span className="text-sm font-bold text-gold-dark">{money(order.itemPrice + order.deliveryFee)}</span>
            </div>
          </div>
        )}

        {stage === 'atShop' && (
          <div className="card animate-fade-up space-y-3 p-4">
            <p className="text-xs font-bold">تعليمات الاستلام</p>
            <ul className="space-y-1.5 text-[11px] leading-relaxed text-mute">
              <li>• ادخل المحل واستلم الطلبية.</li>
              <li>• ادفع قيمة الطلبية للمحل نقداً (كاش): <b className="text-gold-dark">{money(order.itemPrice)}</b></li>
            </ul>
            {pickupImage ? (
              <div className="space-y-2">
                <img src={pickupImage} alt="صورة الاستلام" className="h-40 w-full rounded-xl object-cover" />
                <button onClick={() => setPickupImage(null)} className="w-full rounded-xl border border-dashed border-gold py-2.5 text-[11px] font-bold text-mute">🔄 إعادة التصوير</button>
              </div>
            ) : (
              <label className={`flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border py-3 text-xs font-bold transition-colors ${photoTaken ? 'border-gold bg-gold text-white' : 'border-dashed border-line bg-white'}`}>
                <Camera className="h-4 w-4" />
                {photoTaken ? 'تم تصوير الطلبية عند الاستلام' : '📷 تصوير الطلبية عند الاستلام (اختياري)'}
                <input type="file" accept="image/*" className="hidden" onChange={onPickupFile} />
              </label>
            )}
          </div>
        )}

        {finished && (
          <div className="card space-y-3 p-4">
            <div className="flex items-center gap-2 rounded-xl bg-page px-4 py-3 text-[11px] font-bold">
              <Check className="h-4 w-4 text-green-600" />
              {stage === 'delivered' ? `تم التسليم ${order.deliveredAt ? fmtTime(order.deliveredAt) : ''}` : stage === 'canceled' ? `أُلغي الطلب${order.cancelReason ? ' · ' + order.cancelReason : ''}` : stage === 'returned' || stage === 'awaitRefund' || stage === 'refunded' ? `مرتجع${order.problem ? ' · ' + order.problem : ''}` : ''}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-line p-3"><p className="text-[10px] text-mute">دفعت للمحل</p><p className="text-sm font-bold">{money(order.itemPrice)}</p></div>
              <div className="rounded-xl border border-line p-3"><p className="text-[10px] text-mute">أجرتك</p><p className="text-sm font-bold">{money(order.deliveryFee)}</p></div>
            </div>
            {pickupImage && <img src={pickupImage} alt="صورة الاستلام" className="h-40 w-full rounded-xl object-cover" />}
          </div>
        )}

        <div className="flex gap-2">
          {stage === 'toCustomer' && (
            <button onClick={() => navigate(`/problem?order=${order.id}`)} className="flex flex-1 items-center justify-center gap-1.5 rounded-2xl border border-line bg-white py-3 text-xs font-bold">
              <TriangleAlert className="h-4 w-4" /> مشكلة في التسليم
            </button>
          )}
          {isActive && (
            <button onClick={() => navigate('/emergency')} className="flex flex-1 items-center justify-center gap-1.5 rounded-2xl border border-dashed border-gold bg-white py-3 text-xs font-bold">
              <Siren className="h-4 w-4" /> طوارئ
            </button>
          )}
        </div>
      </div>

      <div className="border-t border-line bg-white px-5 py-4">
        {stage === 'toShop' && <button className="btn-primary w-full" onClick={() => setModal('arrive')}>📍 وصلت للمحل</button>}
        {stage === 'atShop' && <button className="btn-primary w-full" onClick={() => setModal('pickup')}>✅ استلمت الطلبية ودفعت الكاش للمحل</button>}
        {stage === 'toCustomer' && (
          <button className="btn-primary w-full" onClick={() => { toCustomer(order.id); navigate(`/pod?order=${order.id}`) }}>
            ✅ وصلت للزبون وسلّمت الطلبية
          </button>
        )}
        {stage === 'returned' && <button className="btn-primary w-full" onClick={() => { arriveReturn(order.id); toast('تم إشعار المحل بوصولك للاسترداد 🔄') }}>📍 أعدت الطلبية للمحل</button>}
        {stage === 'awaitRefund' && <button className="btn-primary w-full" onClick={() => navigate(`/return?order=${order.id}`)}>💰 تأكيد استرداد المبلغ من المحل</button>}
        {(stage === 'delivered' || stage === 'canceled' || stage === 'refunded') && (
          <button className="btn-primary w-full" onClick={() => navigate('/home')}>العودة للرئيسية</button>
        )}
      </div>

      {modal === 'arrive' && (
        <Modal title="تأكيد الوصول للمحل" onClose={() => setModal(null)}>
          <p className="mt-2 text-xs leading-relaxed text-mute">هل وصلت لموقع المحل؟ سيتم إشعار المحل بوصولك.</p>
          <div className="mt-5 flex gap-2">
            <button className="btn-primary flex-1" onClick={() => { arriveShop(order.id); setModal(null); toast('تم إشعار المحل بوصولك ✅') }}>نعم، وصلت</button>
            <button className="btn-secondary flex-1" onClick={() => setModal(null)}>إلغاء</button>
          </div>
        </Modal>
      )}

      {modal === 'pickup' && (
        <Modal title="تأكيد الاستلام ودفع الكاش" onClose={() => setModal(null)}>
          <p className="mt-2 text-xs leading-relaxed text-mute">هل استلمت الطلبية ودفعت قيمتها <b className="text-gold-dark">{money(order.itemPrice)}</b> نقداً للمحل؟ ستُسجل حركة الدفع في كشف حسابك.</p>
          <div className="mt-5 flex gap-2">
            <button className="btn-primary flex-1" onClick={() => { pickup(order.id, photoTaken); setModal(null); toast('انطلق! المحل والإدارة تم إشعارهما 🚚') }}>تأكيد</button>
            <button className="btn-secondary flex-1" onClick={() => setModal(null)}>إلغاء</button>
          </div>
        </Modal>
      )}

      {modal === 'cancel' && (
        <Modal title={`إلغاء ${order.title}`} onClose={() => setModal(null)}>
          <div className="mt-3 space-y-2">
            <label className="block text-xs font-semibold">سبب الإلغاء *</label>
            <select className="field cursor-pointer" value={cancelReason} onChange={(e) => setCancelReason(e.target.value)}>
              <option value="" disabled>اختر السبب</option>
              {cancelReasons.map((r) => <option key={r}>{r}</option>)}
            </select>
            <textarea className="field min-h-16 resize-none" value={cancelDetails} onChange={(e) => setCancelDetails(e.target.value)} />
            <p className="rounded-xl border border-dashed border-gold px-3 py-2 text-[10px] font-semibold">⚠️ إلغاء الطلبات المتكرر قد يؤثر على تقييمك.</p>
          </div>
          <div className="mt-4 flex gap-2">
            <button className="btn-primary flex-1" disabled={!cancelReason} onClick={() => { cancelOrder(order.id, cancelReason, cancelDetails); setModal(null); navigate('/home') }}>تأكيد الإلغاء</button>
            <button className="btn-secondary flex-1" onClick={() => setModal(null)}>رجوع</button>
          </div>
        </Modal>
      )}

      {node}
    </div>
  )
}
