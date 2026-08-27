import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, Inbox, Power, CalendarClock, CheckCircle2, Clock3, Package } from 'lucide-react'
import { useCaptain } from '../state'
import { useToast } from '../components/Toast'

const shiftWindows = [
  { id: 'morning', start: 8, end: 16 },
  { id: 'evening', start: 16, end: 24 },
  { id: 'night', start: 0, end: 8 },
]

export default function Home() {
  const navigate = useNavigate()
  const { state, setOnline, checkIn, checkOut, createDemoOrder, money, fmtTime } = useCaptain()
  const { toast, node } = useToast()
  const [confirmOff, setConfirmOff] = useState(false)
  const [showDemo, setShowDemo] = useState(false)
  const [form, setForm] = useState({
    shopName: '', shopPhone: '', shopAddress: '', pickupArea: '', dropArea: '',
    itemPrice: '', deliveryFee: '', note: '', customerName: '', customerPhone: '', customerAddress: '',
  })

  const captain = state.captain
  const online = Boolean(captain?.online)
  const currentShift = shiftWindows.find(
    (s) => {
      const h = new Date().getHours()
      return s.start === 0 ? h >= 0 && h < s.end : h >= s.start && h < s.end
    },
  )
  const withinShift = Boolean(captain?.shiftId && captain.shiftId === currentShift?.id)
  const shiftName = captain?.shiftId === 'morning' ? 'الصباحي' : captain?.shiftId === 'evening' ? 'المسائي' : captain?.shiftId === 'night' ? 'الليلي' : 'لم يُحدد'

  const activeOrders = state.orders.filter((o) => ['accepted', 'toShop', 'atShop', 'toCustomer', 'returned', 'awaitRefund'].includes(o.stage))
  const delivered = state.orders.filter((o) => o.stage === 'delivered').slice(0, 5)
  const unreadCount = state.notifications.filter((n) => !n.read).length

  const toggle = () => {
    if (online) {
      setConfirmOff(true)
      return
    }
    if (!captain) return toast('سجّل الدخول أولاً لتفعيل الاتصال')
    if (!withinShift) return toast('أنت خارج وقت شفتك. لا يمكنك الاتصال الآن.')
    setOnline(true)
    toast('أنت متصل الآن وتستقبل الطلبات 🟢')
  }

  const submitDemo = () => {
    if (!form.shopName.trim() || !form.pickupArea.trim() || !form.dropArea.trim() || !form.itemPrice || !form.deliveryFee) {
      toast('أكمل الحقول المطلوبة لإنشاء طلب المعاينة')
      return
    }
    const id = createDemoOrder({
      shopName: form.shopName.trim(),
      shopPhone: form.shopPhone.trim(),
      shopAddress: form.shopAddress.trim(),
      pickupArea: form.pickupArea.trim(),
      dropArea: form.dropArea.trim(),
      itemPrice: Number(form.itemPrice) || 0,
      deliveryFee: Number(form.deliveryFee) || 0,
      note: form.note.trim(),
      customerName: form.customerName.trim(),
      customerPhone: form.customerPhone.trim(),
      customerAddress: form.customerAddress.trim(),
    })
    setShowDemo(false)
    navigate(`/order-alert?order=${id}`)
  }

  return (
    <div>
      <div className="bg-gradient-to-b from-[#d4af37] to-[#986f00] px-5 pb-16 pt-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white">
              <svg viewBox="0 0 64 64" width="22" height="22">
                <path d="M14 20h30l-22 20h24v4H14l22-20H14z" fill="#b8860b" />
                <circle cx="50" cy="16" r="4" fill="#b8860b" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold leading-none">زاجل كابتن</p>
              <p className="mt-1 text-[10px] text-white/70">يوصلك بسرعة وثقة</p>
            </div>
          </div>
          <button onClick={() => navigate('/notifications')} className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/25">
            <Bell className="h-[18px] w-[18px]" strokeWidth={1.8} />
            {unreadCount > 0 && <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-white text-[10px] font-bold text-gold-dark">{unreadCount}</span>}
          </button>
        </div>

        <button
          onClick={toggle}
          className={`mt-6 flex w-full items-center justify-between rounded-2xl border p-4 transition-colors ${online ? 'border-white bg-white text-ink' : 'border-white/25 bg-white/10 text-white'}`}
        >
          <div className="flex items-center gap-3">
            <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${online ? 'bg-gold text-white' : 'bg-white/15'}`}>
              <Power className="h-5 w-5" strokeWidth={2} />
            </span>
            <span className="text-right">
              <span className="block text-sm font-bold">{online ? 'أنت متصل الآن 🟢' : 'أنت غير متصل 🔴'}</span>
              <span className={`mt-0.5 block text-[11px] ${online ? 'text-mute' : 'text-white/70'}`}>
                {online ? 'تستقبل طلبيات زاجل ضمن شفتك' : 'اضغط للاتصال وبدء استقبال الطلبيات'}
              </span>
            </span>
          </div>
          <span className={`relative h-7 w-12 rounded-full transition-colors ${online ? 'bg-gold' : 'bg-white/25'}`}>
            <span className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-all ${online ? 'right-1' : 'right-6'}`} />
          </span>
        </button>
      </div>

      <div className="animate-fade-up -mt-8 px-5">
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gold-light">
                <CalendarClock className="h-5 w-5 text-gold-dark" strokeWidth={1.7} />
              </span>
              <div>
                <p className="text-xs font-bold">شفتك الحالي: {shiftName}</p>
                <p className="mt-0.5 text-[11px] text-mute">
                  {captain?.checkIn ? `حضور مسجّل — دخل الساعة ${fmtTime(captain.checkIn)}` : 'لم تسجّل الحضور بعد'}
                </p>
              </div>
            </div>
            <button onClick={() => navigate('/shift')} className="rounded-xl bg-gold px-3.5 py-2 text-[11px] font-bold text-white">
              {captain?.shiftId ? 'تغيير الشفت' : 'اختيار الشفت'}
            </button>
          </div>
          <div className="mt-3 flex items-center gap-2 rounded-xl bg-page px-3.5 py-2.5">
            <CheckCircle2 className="h-4 w-4 text-gold-dark" />
            <p className="text-[11px] font-medium text-mute">
              {captain?.checkIn ? `✅ مسجّل الحضور — وقت الدخول: ${fmtTime(captain.checkIn)}` : 'حالة الحضور: لم تسجّل الحضور بعد'}
            </p>
          </div>
          {!withinShift && (
            <div className="mt-2 rounded-xl border border-dashed border-gold bg-white px-3.5 py-2.5 text-[11px] font-semibold text-mute">
              ⚠️ أنت خارج وقت شفتك الحالي ({shiftName}). لا يمكن تفعيل الاتصال الآن.
            </div>
          )}
          <div className="mt-3 flex gap-2">
            {!captain?.checkIn && withinShift && (
              <button
                className="btn-primary flex-1"
                onClick={() => {
                  checkIn()
                  toast('تم تسجيل حضورك بنجاح. شفت سعيد! 🎉')
                }}
              >
                تسجيل الحضور
              </button>
            )}
            {captain?.checkIn && !captain?.checkOut && (
              <button
                className="btn-secondary flex-1"
                onClick={() => {
                  checkOut()
                  setOnline(false)
                  toast('تم إنهاء الشفت وتسجيل وقت الخروج ✅')
                }}
              >
                إنهاء الشفت
              </button>
            )}
            {captain?.checkIn && captain?.checkOut && (
              <div className="flex flex-1 items-center gap-2 rounded-2xl border border-dashed border-gold bg-white px-3.5 py-2.5 text-[11px] font-bold">
                <Clock3 className="h-4 w-4 text-gold-dark" />
                وقت الخروج: {fmtTime(captain.checkOut)}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="px-5 pt-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-bold">طلباتك النشطة ({activeOrders.length} / 3)</h2>
          {activeOrders.length > 0 && (
            <button onClick={() => navigate('/orders')} className="text-[11px] font-bold text-gold-dark">عرض الكل</button>
          )}
        </div>
        {activeOrders.length === 0 ? (
          <div className="card flex flex-col items-center gap-3 p-8 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-dashed border-gold bg-page">
              <Inbox className="h-6 w-6 text-faint" strokeWidth={1.5} />
            </div>
            <p className="text-sm font-bold">لا توجد طلبات نشطة حالياً 📭</p>
            <p className="max-w-60 text-[11px] leading-relaxed text-mute">
              اتصل وكن داخل وقت شفتك وستصلك الطلبيات الجديدة هنا فوراً مع تنبيه صوتي.
            </p>
            <button onClick={() => setShowDemo(true)} className="mt-1 rounded-xl border border-dashed border-gold px-4 py-2 text-[11px] font-bold transition-colors active:bg-page">
              👁️ معاينة تدفق استقبال الطلبية
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {activeOrders.map((o) => (
              <button key={o.id} onClick={() => navigate(`/order?order=${o.id}`)} className="card flex w-full items-center gap-3 p-4 text-right">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gold-light">
                  <Package className="h-5 w-5 text-gold-dark" strokeWidth={1.7} />
                </span>
                <span className="flex-1">
                  <span className="block text-xs font-bold">{o.title} — {o.shopName}</span>
                  <span className="mt-0.5 block text-[11px] text-mute">{o.pickupArea} ← {o.dropArea}</span>
                </span>
                <span className="badge bg-gold-light text-gold-dark">{o.stage === 'returned' || o.stage === 'awaitRefund' ? 'مرتجع' : o.stage === 'toCustomer' ? 'بالطريق' : 'نشط'}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="px-5 pb-6 pt-6">
        <h2 className="mb-3 text-sm font-bold">آخر الطلبات المكتملة</h2>
        {delivered.length === 0 ? (
          <div className="card flex flex-col items-center gap-2 p-6 text-center">
            <p className="text-xs font-semibold text-mute">لا توجد طلبات مكتملة بعد</p>
            <p className="text-[11px] text-faint">ستظهر آخر 5 طلبات مكتملة هنا</p>
          </div>
        ) : (
          <div className="card divide-y divide-line">
            {delivered.map((o) => (
              <button key={o.id} onClick={() => navigate(`/order?order=${o.id}`)} className="flex w-full items-center justify-between px-4 py-3 text-right">
                <div>
                  <p className="text-xs font-bold">{o.title} — {o.shopName}</p>
                  <p className="mt-0.5 text-[10px] text-mute">{fmtTime(o.deliveredAt!)}</p>
                </div>
                <span className="text-xs font-bold text-gold-dark">{money(o.deliveryFee)}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {confirmOff && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center">
          <div className="animate-fade-up mx-auto w-full max-w-[430px] rounded-t-3xl bg-white p-6 sm:mx-6 sm:rounded-3xl">
            <h3 className="text-base font-bold">قطع الاتصال؟</h3>
            <p className="mt-2 text-xs leading-relaxed text-mute">هل تريد قطع الاتصال؟ لن تستلم طلبيات جديدة حتى تعود متصلاً.</p>
            <div className="mt-5 flex gap-2">
              <button
                className="btn-primary flex-1"
                onClick={() => {
                  setOnline(false)
                  setConfirmOff(false)
                  toast('أصبحت غير متصل 🔴')
                }}
              >
                تأكيد
              </button>
              <button className="btn-secondary flex-1" onClick={() => setConfirmOff(false)}>إلغاء</button>
            </div>
          </div>
        </div>
      )}

      {showDemo && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center">
          <div className="animate-fade-up mx-auto max-h-[92vh] w-full max-w-[430px] overflow-y-auto rounded-t-3xl bg-white p-6 sm:rounded-3xl">
            <div className="flex items-center gap-2">
              <h3 className="flex-1 text-base font-bold">معاينة استقبال طلبية</h3>
              <button onClick={() => setShowDemo(false)} className="flex h-8 w-8 items-center justify-center rounded-xl border border-line text-faint">✕</button>
            </div>
            <p className="mt-2 text-[11px] leading-relaxed text-mute">
              نظراً لعدم وجود Backend، أدخل بيانات الطلب هنا لمعاينة تدفق التنفيذ كاملاً. لن تُحفظ كبيانات جاهزة، بل كطلب حقيقي ضمن جلستك المحلية.
            </p>
            <div className="mt-4 space-y-3">
              <input className="field" placeholder="اسم المحل / المطعم *" value={form.shopName} onChange={(e) => setForm({ ...form, shopName: e.target.value })} />
              <input className="field" placeholder="هاتف المحل (اختياري)" value={form.shopPhone} onChange={(e) => setForm({ ...form, shopPhone: e.target.value })} />
              <input className="field" placeholder="عنوان المحل (اختياري)" value={form.shopAddress} onChange={(e) => setForm({ ...form, shopAddress: e.target.value })} />
              <div className="grid grid-cols-2 gap-2">
                <input className="field" placeholder="منطقة الاستلام *" value={form.pickupArea} onChange={(e) => setForm({ ...form, pickupArea: e.target.value })} />
                <input className="field" placeholder="منطقة التوصيل *" value={form.dropArea} onChange={(e) => setForm({ ...form, dropArea: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input className="field" placeholder="مبلغ الطلب للمحل *" inputMode="numeric" value={form.itemPrice} onChange={(e) => setForm({ ...form, itemPrice: e.target.value })} />
                <input className="field" placeholder="أجرة التوصيل *" inputMode="numeric" value={form.deliveryFee} onChange={(e) => setForm({ ...form, deliveryFee: e.target.value })} />
              </div>
              <input className="field" placeholder="اسم الزبون (اختياري)" value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} />
              <input className="field" placeholder="هاتف الزبون (اختياري)" value={form.customerPhone} onChange={(e) => setForm({ ...form, customerPhone: e.target.value })} />
              <input className="field" placeholder="عنوان التوصيل (اختياري)" value={form.customerAddress} onChange={(e) => setForm({ ...form, customerAddress: e.target.value })} />
              <textarea className="field min-h-16 resize-none" placeholder="ملاحظات الطلب (اختياري)" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
            </div>
            <button className="btn-primary mt-4 w-full" onClick={submitDemo}>بدء المعاينة 🚚</button>
          </div>
        </div>
      )}

      {node}
    </div>
  )
}
