import { useNavigate, useSearchParams } from 'react-router-dom'
import { Star, TriangleAlert, Headphones, BadgeCheck, Camera, MapPin, Phone } from 'lucide-react'
import Header from '../components/Header'
import { useStore } from '../lib/StoreContext'
import { STATUS_META, fmtTime, fmtDateTime, fmtIQD, minutesBetween } from '../lib/data'
import { MapView, type MapMarker } from '../lib/MapLib'
import { captainPosFor } from '../lib/MapLib'

export default function OrderDetails() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const id = params.get('id')
  const { orders, profile } = useStore()
  const order = orders.find((o) => o.id === id) ?? null

  if (!order) {
    return (
      <div className="app-shell">
        <Header title="تفاصيل الطلب" to="/orders" />
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-8 text-center">
          <p className="text-sm font-extrabold">الطلب غير موجود</p>
          <button className="btn-primary" onClick={() => navigate('/orders')}>سجل الطلبات</button>
        </div>
      </div>
    )
  }

  const meta = STATUS_META[order.status]
  const finished = ['delivered', 'completed', 'cancelled', 'returned'].includes(order.status)
  const duration = finished ? minutesBetween(order.createdAt, order.timeline[order.timeline.length - 1].at) : minutesBetween(order.createdAt, new Date().toISOString())

  const storePos = profile?.location ?? { lat: 33.3152, lng: 44.3661 }
  const captainPos = order.captain ? captainPosFor(storePos, order.dropoff.location, order.status) : null
  const markers: MapMarker[] = [
    { pos: storePos, kind: 'store', label: 'المحل' },
    { pos: order.dropoff.location, kind: 'dropoff', label: 'موقع التوصيل' },
  ]
  if (captainPos) markers.push({ pos: captainPos, kind: 'captain', label: 'الكابتن' })

  return (
    <div className="app-shell">
      <Header
        title={`تفاصيل الطلب ${order.id}`}
        to="/orders"
        actions={<span className={`badge ${meta.cls}`}>{meta.emoji} {meta.label}</span>}
      />

      <div className="animate-fade-up flex-1 space-y-4 px-5 py-5">
        {/* الملخص */}
        <div className="card divide-y divide-line">
          <p className="px-4 py-3 text-xs font-extrabold">الملخص</p>
          {[
            ['رقم الطلب', order.id],
            ['تاريخ الإنشاء', fmtDateTime(order.createdAt)],
            ['تاريخ التسليم', finished && order.status !== 'cancelled' && order.status !== 'returned' ? fmtDateTime(order.timeline[order.timeline.length - 1].at) : '—'],
            ['المدة الكلية', `${duration} دقيقة`],
          ].map(([k, v]) => (
            <div key={k} className="flex items-center justify-between px-4 py-2.5">
              <span className="text-[11px] text-mute">{k}</span>
              <span className="text-[11px] font-bold">{v}</span>
            </div>
          ))}
        </div>

        {/* بيانات الزبون والكابتن */}
        <div className="card divide-y divide-line">
          <p className="px-4 py-3 text-xs font-extrabold">بيانات الزبون والكابتن</p>
          {[
            ['الزبون', order.customer.name],
            ['هاتف الزبون', `+964 ${order.customer.phone}`],
            ['عنوان التوصيل', `${order.dropoff.address} — ${order.dropoff.district}`],
            ['الكابتن', order.captain?.name ?? '—'],
            ['تقييم الكابتن', order.captain ? `⭐ ${order.captain.rating}` : '—'],
          ].map(([k, v]) => (
            <div key={k} className="flex items-center justify-between gap-3 px-4 py-2.5">
              <span className="shrink-0 text-[11px] text-mute">{k}</span>
              <span className="truncate text-[11px] font-bold">{v}</span>
            </div>
          ))}
        </div>

        {/* المبالغ */}
        <div className="card divide-y divide-line">
          <p className="px-4 py-3 text-xs font-extrabold">المبالغ</p>
          {[
            ['قيمة الطلبية', fmtIQD(order.value)],
            ['أجرة التوصيل', fmtIQD(order.fee)],
            ['الإجمالي من الزبون', fmtIQD(order.total)],
            ['المبلغ الذي دفعه الكابتن للمحل', fmtIQD(order.value)],
          ].map(([k, v]) => (
            <div key={k} className="flex items-center justify-between px-4 py-2.5">
              <span className="text-[11px] text-mute">{k}</span>
              <span className="text-[11px] font-extrabold text-gold-strong">{v}</span>
            </div>
          ))}
        </div>

        {/* الخريطة */}
        <MapView center={storePos} markers={markers} height={180} fit />

        {/* إثبات التسليم */}
        <div className="card p-4">
          <p className="flex items-center gap-2 text-xs font-extrabold">
            <BadgeCheck className="h-4 w-4 text-gold" /> إثبات التسليم
          </p>
          {order.proof ? (
            <div className="mt-3 flex gap-2">
              <div className="flex-1 rounded-xl border border-line p-3 text-center">
                <p className="text-[10px] text-mute">نوع الإثبات</p>
                <p className="mt-1 text-xs font-extrabold">{order.proof.kind === 'otp' ? 'OTP ✅' : 'صورة 📷'}</p>
              </div>
              {order.proof.kind === 'photo' ? (
                <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-line-strong bg-gold-faint">
                  <img src={order.proof.note} alt="إثبات التسليم" className="max-h-20 rounded-lg" />
                </div>
              ) : (
                <div className="flex flex-1 flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-line-strong p-3">
                  <p className="text-[10px] text-faint">تم التحقق برمز OTP من الزبون</p>
                </div>
              )}
            </div>
          ) : (
            <div className="mt-3 flex items-center gap-2 rounded-xl border border-dashed border-line-strong p-3.5 text-[10px] font-bold text-faint">
              <Camera className="h-4 w-4" /> يظهر الإثبات (OTP أو صورة) عند اكتمال التسليم.
            </div>
          )}
        </div>

        {/* سجل الطلب الكامل */}
        <div className="card p-4">
          <p className="mb-3 text-xs font-extrabold">سجل الطلب الكامل (Timeline)</p>
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
                    <p className="mt-0.5 text-[10px] text-faint">{fmtDateTime(ev.at)}</p>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* تعديلات مسجلة */}
        {order.editLog.length > 0 && (
          <div className="card p-4">
            <p className="mb-2 text-xs font-extrabold">سجل التعديلات</p>
            {order.editLog.map((e) => (
              <div key={e.at} className="flex items-center justify-between py-1.5 text-[11px]">
                <span className="text-mute">الحقول المعدلة: {e.fields.join('، ')}</span>
                <span className="font-bold">{fmtTime(e.at)}</span>
              </div>
            ))}
          </div>
        )}

        {/* الإلغاء */}
        {order.cancel && (
          <div className="card border-dashed p-4">
            <p className="text-xs font-extrabold">تفاصيل الإلغاء</p>
            <div className="mt-2 space-y-1 text-[11px]">
              <p><span className="text-mute">السبب:</span> <b>{order.cancel.reason}</b></p>
              {order.cancel.detail && <p><span className="text-mute">تفاصيل:</span> {order.cancel.detail}</p>}
            </div>
          </div>
        )}
      </div>

      <div className="space-y-2.5 border-t border-line bg-white px-5 py-4">
        {['delivered', 'completed'].includes(order.status) && !order.rating && (
          <button className="btn-primary w-full" onClick={() => navigate(`/rate-captain?id=${order.id}`)}>
            <Star className="h-4 w-4" /> ⭐ تقييم كابتن زاجل
          </button>
        )}
        {order.rating && (
          <div className="flex items-center justify-between rounded-2xl bg-gold-faint px-4 py-3">
            <span className="text-xs font-bold text-gold-deep">تقييمك: {'⭐'.repeat(order.rating.stars)}</span>
            <span className="text-[11px] text-mute">{order.rating.prepared}</span>
          </div>
        )}
        <div className="grid grid-cols-2 gap-2">
          <button className="btn-secondary" onClick={() => navigate(`/complaints/new${order.id ? `?order=${order.id}` : ''}`)}>
            <TriangleAlert className="h-4 w-4" /> تقديم شكوى
          </button>
          <a href="tel:07888216090" className="btn-secondary">
            <Headphones className="h-4 w-4" /> الدعم
          </a>
        </div>
        {!finished && (
          <button className="btn-ghost w-full" onClick={() => navigate(`/track?id=${order.id}`)}>
            <MapPin className="h-4 w-4" /> المتابعة الحية للطلب
          </button>
        )}
        {order.captain && (
          <a href={`tel:${order.captain.phone}`} className="btn-ghost w-full">
            <Phone className="h-4 w-4" /> الاتصال بالكابتن {order.captain.name}
          </a>
        )}
      </div>
    </div>
  )
}
