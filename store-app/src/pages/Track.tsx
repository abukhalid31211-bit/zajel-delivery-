import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { TriangleAlert, PencilLine, Headphones, Clock, Phone, Star } from 'lucide-react'
import Modal from '../components/Modal'
import { useToast } from '../components/Modal'
import Header from '../components/Header'
import Countdown from '../components/Countdown'
import { useStore } from '../lib/StoreContext'
import {
  ORDER_STAGES, STATUS_META, CANCEL_REASONS, editableFields, canEditOrder, canCancelOrder,
  isOther, fmtTime, fmtRelative, distanceKm, etaMin, minutesBetween,
} from '../lib/data'
import { MapView, captainPosFor, type MapMarker } from '../lib/MapLib'

export default function Track() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const id = params.get('id')
  const { orders, cancelOrder, editOrder, confirmReturn, profile } = useStore()
  const { toast, node } = useToast()
  const order = orders.find((o) => o.id === id) ?? null

  const [modal, setModal] = useState<'cancel' | 'edit' | 'return' | null>(null)
  const [reason, setReason] = useState('')
  /* «أخرى»: سبب الإلغاء المكتوب يدوياً */
  const [otherReason, setOtherReason] = useState('')
  const [detail, setDetail] = useState('')
  const [editForm, setEditForm] = useState<Record<string, string>>({})

  if (!order) {
    return (
      <div className="app-shell">
        <Header title="متابعة الطلب" to="/orders" />
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-8 text-center">
          <p className="text-sm font-extrabold">الطلب غير موجود</p>
          <p className="max-w-64 text-[11px] leading-relaxed text-mute">ربما تم حذفه أو انتهت صلاحيته.</p>
          <button className="btn-primary" onClick={() => navigate('/orders')}>سجل الطلبات</button>
        </div>
      </div>
    )
  }

  const meta = STATUS_META[order.status]
  const stageIndex = (() => {
    if (order.status === 'cancelled' || order.status === 'returned') return -1
    if (order.status === 'searching') return 1
    return ORDER_STAGES.findIndex((s) => s.at === order.status)
  })()

  const storePos = profile?.location ?? { lat: 33.3152, lng: 44.3661 }
  const captainPos = order.captain ? captainPosFor(storePos, order.dropoff.location, order.status) : null

  const markers: MapMarker[] = [
    { pos: storePos, kind: 'store', label: 'المحل' },
    { pos: order.dropoff.location, kind: 'dropoff', label: 'موقع التوصيل' },
  ]
  if (captainPos) markers.push({ pos: captainPos, kind: 'captain', label: order.captain?.name ?? 'الكابتن' })

  const elapsed = minutesBetween(order.createdAt, new Date().toISOString())
  const waitText = (() => {
    if (order.status !== 'searching') return null
    const created = new Date(order.createdAt).getTime()
    const t = (Date.now() - created) / 60000
    if (t < 5) return `المحاولة 1/3 — بحث في النطاق القريب`
    if (t < 10) return `المحاولة 2/3 — توسيع نطاق البحث`
    if (t < 15) return `المحاولة 3/3 — كافة الكباتن في المحافظة`
    if (t < 20) return 'تم تنبيه الإدارة — طلب عالق'
    return 'سيتم الإلغاء التلقائي خلال لحظات'
  })()

  const nextAttemptIn = (() => {
    if (order.status !== 'searching') return null
    const created = new Date(order.createdAt).getTime()
    const t = (Date.now() - created) / 60000
    if (t < 5) return Math.ceil((5 - t) * 60)
    if (t < 10) return Math.ceil((10 - t) * 60)
    if (t < 15) return Math.ceil((15 - t) * 60)
    if (t < 20) return Math.ceil((20 - t) * 60)
    return null
  })()

  const fields = editableFields(order.status)
  const canEdit = canEditOrder(order.status)

  const captainDist = captainPos
    ? order.status === 'heading'
      ? distanceKm(captainPos, storePos)
      : order.status === 'on_way' || order.status === 'delivered'
        ? distanceKm(captainPos, order.dropoff.location)
        : null
    : null

  const submitEdit = () => {
    const keys = Object.keys(editForm).filter((k) => editForm[k] !== undefined && editForm[k] !== '')
    if (keys.length === 0) {
      setModal(null)
      return
    }
    const res = editOrder(order.id, {
      name: editForm.name ?? undefined,
      phone: editForm.phone ?? undefined,
      address: editForm.address ?? undefined,
      notes: editForm.notes ?? undefined,
      value: editForm.value ? Number(editForm.value) : undefined,
    })
    setModal(null)
    if (!res.ok) {
      toast(res.error ?? 'تعذر حفظ التعديل', 'error')
      return
    }
    toast('تم حفظ التعديل وإشعار الكابتن فوراً ✅')
  }

  return (
    <div className="app-shell">
      <div className="sticky top-0 z-20 border-b border-line bg-white/95 px-4 py-3.5 backdrop-blur">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/home')} className="flex h-9 w-9 items-center justify-center rounded-xl border border-line">
            <span className="text-sm font-bold">→</span>
          </button>
          <div className="flex-1">
            <h1 className="text-base font-extrabold">متابعة الطلب {order.id}</h1>
            <p className="text-[10px] text-mute">تتحدث الشاشة تلقائياً (Real-time) بدون إعادة تحميل</p>
          </div>
          {canEdit && (
            <button
              onClick={() => {
                setEditForm({
                  name: order.customer.name,
                  phone: order.customer.phone,
                  address: order.dropoff.address,
                  notes: order.customer.notes ?? '',
                  value: String(order.value),
                })
                setModal('edit')
              }}
              className="flex h-9 items-center gap-1 rounded-xl border border-gold/40 bg-gold-faint px-2.5 text-[10px] font-bold text-gold-deep"
            >
              <PencilLine className="h-3.5 w-3.5" /> تعديل
            </button>
          )}
        </div>

        {/* progress */}
        <div className="mt-4 flex items-start gap-1">
          {ORDER_STAGES.map((s, i) => {
            const active = stageIndex >= i
            return (
              <div key={s.key} className="flex flex-1 flex-col items-center gap-1">
                <div className={`h-1.5 w-full rounded-full ${active ? 'bg-gold' : 'bg-line'}`} />
                <span className={`text-[7px] font-bold ${active ? 'text-gold-deep' : 'text-faint'}`}>{s.label}</span>
              </div>
            )
          })}
        </div>
      </div>

      <div className="animate-fade-up flex-1 space-y-4 px-5 py-4">
        {/* status */}
        <div className="card flex items-center justify-between p-4">
          <div>
            <span className={`badge ${meta.cls}`}>
              {meta.emoji} {meta.label}
            </span>
            <p className="mt-2 flex items-center gap-1 text-[11px] text-mute">
              <Clock className="h-3.5 w-3.5" /> الوقت المنقضي منذ الإنشاء: {elapsed} دقيقة · {fmtTime(order.createdAt)}
            </p>
            {waitText && <p className="mt-1 text-[11px] font-bold text-gold-strong">{waitText}</p>}
          </div>
          {order.status === 'searching' && (
            <span className="relative flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold opacity-40" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-gold" />
            </span>
          )}
        </div>

        {/* لا يوجد كباتن متاحون */}
        {order.status === 'searching' && (Number(order.attempt) > 1 || minutesBetween(order.createdAt, new Date().toISOString()) >= 4) && (
          <div className="animate-fade-up rounded-2xl border-2 border-dashed border-gold bg-white p-4">
            <p className="flex items-center gap-2 text-xs font-extrabold">
              <TriangleAlert className="h-4 w-4 text-gold" /> لم يتم العثور على كابتن
            </p>
            <p className="mt-1.5 text-[11px] leading-relaxed text-mute">
              لم يقبل أي كابتن طلبك خلال المدة المحددة. جاري توسيع نطاق البحث والمحاولة مرة أخرى...
              عند الدقيقة 15 تُنبه الإدارة، وعند الدقيقة 20 يُلغى الطلب تلقائياً إن لم يتوفر كابتن.
            </p>
            {nextAttemptIn !== null && (
              <p className="mt-2 text-[11px] font-bold text-gold-deep">
                المحاولة التالية بعد <Countdown seconds={nextAttemptIn} />
              </p>
            )}
            <div className="mt-3 flex gap-2">
              <button className="flex-1 rounded-xl bg-gold py-2.5 text-[11px] font-bold text-white">⏳ الاستمرار في الانتظار</button>
              <button className="flex-1 rounded-xl border border-gold py-2.5 text-[11px] font-bold text-gold-strong" onClick={() => setModal('cancel')}>
                ❌ إلغاء الطلب
              </button>
            </div>
          </div>
        )}

        {/* الخريطة */}
        <MapView center={storePos} markers={markers} height={210} fit interactive />

        {/* بطاقة الكابتن */}
        {order.captain ? (
          <div className="card p-4">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gold-soft text-base font-extrabold text-gold-deep">
                {order.captain.name.charAt(0)}
              </span>
              <div className="flex-1">
                <p className="text-sm font-extrabold">{order.captain.name}</p>
                <p className="mt-0.5 flex items-center gap-1 text-[11px] text-mute">
                  <Star className="h-3.5 w-3.5 fill-gold text-gold" /> {order.captain.rating} · {order.captain.vehicle} · {order.captain.plate}
                </p>
              </div>
              <a
                href={`tel:${order.captain.phone}`}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold text-white shadow shadow-gold/30"
              >
                <Phone className="h-4.5 w-4.5" />
              </a>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="rounded-xl bg-gold-faint p-3 text-center">
                <p className="text-[10px] text-mute">المسافة التقريبية</p>
                <p className="mt-0.5 text-sm font-extrabold text-gold-deep">
                  {captainDist ? `${captainDist.toFixed(1)} كم` : '—'}
                </p>
              </div>
              <div className="rounded-xl bg-gold-faint p-3 text-center">
                <p className="text-[10px] text-mute">الوقت التقديري</p>
                <p className="mt-0.5 text-sm font-extrabold text-gold-deep">
                  {captainDist ? `${etaMin(captainDist)} دقائق` : '—'}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="card p-4">
            <p className="text-xs font-extrabold">بطاقة الكابتن</p>
            <p className="mt-1.5 text-[11px] leading-relaxed text-mute">
              تظهر هنا بيانات الكابتن (الاسم، الهاتف، التقييم ⭐، المسافة والوقت التقديري) فور قبوله للطلب.
            </p>
          </div>
        )}

        {/* سجل التحديثات */}
        <div className="card p-4">
          <p className="mb-3 text-xs font-extrabold">سجل التحديثات</p>
          <div className="space-y-0">
            {order.timeline
              .slice()
              .reverse()
              .map((ev, i, arr) => (
                <div key={`${ev.at}-${i}`} className="relative flex gap-3 pb-4 last:pb-0">
                  {i !== arr.length - 1 && <span className="absolute right-[5px] top-5 bottom-0 w-px bg-line" />}
                  <span className={`relative z-10 mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${i === 0 ? 'bg-gold' : 'bg-line-strong'}`} />
                  <div>
                    <p className={`text-[11px] ${i === 0 ? 'font-extrabold' : 'font-bold text-mute'}`}>{ev.label}</p>
                    {ev.detail && <p className="mt-0.5 text-[10px] leading-relaxed text-faint">{ev.detail}</p>}
                    <p className="mt-0.5 text-[10px] text-faint">
                      {fmtTime(ev.at)} · {fmtRelative(ev.at)}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* إثبات التسليم عند التسليم */}
        {order.proof && ['delivered', 'completed'].includes(order.status) && (
          <div className="card flex items-center justify-between border-gold/40 p-4">
            <div>
              <p className="text-xs font-extrabold">إثبات التسليم</p>
              <p className="mt-1 text-[11px] text-mute">
                {order.proof.kind === 'otp' ? `رمز التحقق OTP ✅` : 'صورة 📷'}
              </p>
            </div>
            <span className="badge bg-gold text-white">تم التسليم 🟢</span>
          </div>
        )}

        {/* مرتجع */}
        {order.status === 'returned' && (
          <div className="card border-dashed p-4">
            <p className="text-xs font-extrabold">↩️ مرتجع موثق</p>
            <p className="mt-1.5 text-[11px] leading-relaxed text-mute">
              استلم المحل البضاعة بحالتها السليمة وأعاد المبلغ النقدي (الكاش) كاملاً للكابتن. تم تحديث كشف الحساب.
            </p>
          </div>
        )}

        <div className="h-1" />
      </div>

      <div className="grid grid-cols-2 gap-2 border-t border-line bg-white px-5 py-4">
        {canCancelOrder(order.status) && (
          <button className="rounded-2xl border-1.5 border-gold bg-white py-3.5 text-xs font-bold text-gold-strong" onClick={() => setModal('cancel')}>
            ❌ إلغاء الطلب
          </button>
        )}
        {['on_way', 'delivered'].includes(order.status) && (
          <button className="rounded-2xl border-1.5 border-gold bg-white py-3.5 text-xs font-bold text-gold-strong" onClick={() => setModal('return')}>
            ↩️ تسجيل مرتجع
          </button>
        )}
        <a href="tel:07888216090" className="flex items-center justify-center gap-1.5 rounded-2xl bg-gold py-3.5 text-xs font-bold text-white">
          <Headphones className="h-4 w-4" /> تواصل مع الدعم
        </a>
      </div>

      {/* إلغاء */}
      {modal === 'cancel' && (
        <Modal
          title={`إلغاء الطلب ${order.id}`}
          subtitle="اختر سبب الإلغاء — سيُرسل إشعار للكابتن والإدارة."
          onClose={() => setModal(null)}
        >
          <div className="mt-2 space-y-2">
            <label className="block text-xs font-bold">سبب الإلغاء *</label>
            <select className="field cursor-pointer" value={reason} onChange={(e) => setReason(e.target.value)}>
              <option value="" disabled>
                اختر السبب
              </option>
              {CANCEL_REASONS.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
            {isOther(reason) && (
              <>
                <input
                  className="field"
                  placeholder="اكتب سبب الإلغاء"
                  value={otherReason}
                  onChange={(e) => setOtherReason(e.target.value)}
                />
                <p className="text-[10px] leading-relaxed text-faint">يُحفظ السبب كما تكتبه في سجل الطلب وإشعار الإدارة.</p>
              </>
            )}
            <textarea className="field min-h-16 resize-none" placeholder="تفاصيل (اختياري)" value={detail} onChange={(e) => setDetail(e.target.value)} />
            <p className="rounded-xl border border-dashed border-gold bg-gold-faint px-3 py-2 text-[10px] font-bold text-gold-deep">
              ⚠️ إذا كان الكابتن قد استلم الطلب، لا يمكن الإلغاء — تواصل مع الإدارة.
            </p>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              className="btn-primary flex-1"
              disabled={!reason}
              onClick={() => {
                const resolvedReason = isOther(reason) ? otherReason.trim() : reason
                if (isOther(reason) && !resolvedReason) {
                  toast('اكتب سبب الإلغاء أولاً', 'error')
                  return
                }
                const res = cancelOrder(order.id, resolvedReason, detail)
                setModal(null)
                setOtherReason('')
                if (!res.ok) toast(res.error ?? 'تعذر الإلغاء', 'error')
                else {
                  toast('تم إلغاء الطلب وإشعار الكابتن ✅')
                  setTimeout(() => navigate('/home'), 800)
                }
              }}
            >
              تأكيد الإلغاء
            </button>
            <button className="btn-secondary flex-1" onClick={() => setModal(null)}>
              رجوع
            </button>
          </div>
        </Modal>
      )}

      {/* مرتجع */}
      {modal === 'return' && (
        <Modal
          title="تأكيد استلام المرتجع"
          subtitle="فحص الأغراض وتأكيد إعادة الكاش للكابتن."
          onClose={() => setModal(null)}
        >
          <div className="mt-2 space-y-2">
            <div className="rounded-xl border border-line bg-gold-faint p-3.5">
              {[
                ['فحص البضاعة المستلمة', 'بحالتها السليمة ✓'],
                ['إعادة المبلغ النقدي (الكاش)', 'كاملاً للكابتن فوراً'],
                ['تحديث كشف حساب الكابتن', 'تلقائي بعد التأكيد'],
              ].map(([k, v]) => (
                <div key={k} className="flex items-center justify-between py-1.5 text-[11px]">
                  <span className="text-mute">{k}</span>
                  <span className="font-bold">{v}</span>
                </div>
              ))}
            </div>
            <textarea className="field min-h-16 resize-none" placeholder="ملاحظات على المرتجع (اختياري)" value={detail} onChange={(e) => setDetail(e.target.value)} />
          </div>
          <div className="mt-4 flex gap-2">
            <button
              className="btn-primary flex-1"
              onClick={() => {
                confirmReturn(order.id, detail)
                setModal(null)
                toast('تم توثيق المرتجع وإعادة الكاش ✅')
                setTimeout(() => navigate('/orders'), 800)
              }}
            >
              تأكيد الاستلام وإعادة الكاش
            </button>
            <button className="btn-secondary flex-1" onClick={() => setModal(null)}>
              رجوع
            </button>
          </div>
        </Modal>
      )}

      {/* تعديل */}
      {modal === 'edit' && (
        <Modal
          title="تعديل الطلب ✏️"
          subtitle={`المرحلة الحالية: ${meta.label} — الحقول المحظورة في هذه المرحلة مقفلة.`}
          onClose={() => setModal(null)}
        >
          <div className="mt-3 space-y-3">
            {fields.map((f) => (
              <div key={f.key}>
                <label className="mb-1 block text-[10px] font-bold text-mute">
                  {f.label} {f.locked && <span className="text-danger">🔒 محظور في هذه المرحلة</span>}
                </label>
                <input
                  className="field disabled:bg-page disabled:text-faint"
                  dir={f.key === 'phone' || f.key === 'value' ? 'ltr' : undefined}
                  inputMode={f.key === 'phone' || f.key === 'value' ? 'numeric' : undefined}
                  disabled={f.locked}
                  placeholder={f.locked ? '—' : ''}
                  value={editForm[f.key] ?? ''}
                  onChange={(e) => setEditForm((s) => ({ ...s, [f.key]: e.target.value }))}
                />
              </div>
            ))}
          </div>
          <div className="mt-4 flex gap-2">
            <button className="btn-primary flex-1" onClick={submitEdit}>
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
