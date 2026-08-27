import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Check, Loader2, MapPin, CheckCircle2, Truck } from 'lucide-react'

export default function CreateOrder() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [pinned, setPinned] = useState(false)
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [form, setForm] = useState({ name: '', phone: '', notes: '', address: '', district: '', value: '', orderNotes: '' })
  const [error, setError] = useState('')

  const next = () => {
    if (step === 1) {
      if (!form.name) return setError('اسم الزبون مطلوب')
      if (!form.phone) return setError('رقم هاتف صحيح مطلوب')
    }
    if (step === 2) {
      if (!pinned) return setError('يرجى تحديد موقع التوصيل على الخريطة')
      if (!form.address) return setError('العنوان التفصيلي مطلوب')
    }
    setError('')
    setStep((s) => s + 1)
  }

  const submit = () => {
    if (!form.value) return setError('قيمة الطلب مطلوبة')
    setError('')
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setSent(true)
    }, 1200)
  }

  if (sent) {
    return (
      <div className="app-shell items-center justify-center px-8 text-center">
        <div className="animate-fade-up flex flex-col items-center gap-5">
          <CheckCircle2 className="h-24 w-24" strokeWidth={0.9} />
          <div>
            <h1 className="text-xl font-bold">تم إرسال الطلب بنجاح!</h1>
            <p className="mt-2 max-w-72 text-[13px] leading-relaxed text-mute">
              جاري البحث عن كابتن قريب... سيتم إشعارك فور قبول كابتن لطلبك.
            </p>
          </div>
          <span className="badge bg-faint text-white">🟡 بانتظار كابتن</span>
          <div className="mt-4 w-full space-y-3">
            <button className="btn-primary w-full" onClick={() => navigate('/orders')}>
              📋 متابعة الطلب
            </button>
            <button className="btn-secondary w-full" onClick={() => navigate('/home')}>
              🏠 العودة للرئيسية
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="app-shell">
      <div className="sticky top-0 z-10 border-b border-line bg-white px-4 py-4">
        <div className="flex items-center gap-3">
          <button onClick={() => (step > 1 ? setStep(step - 1) : navigate('/home'))} className="flex h-9 w-9 items-center justify-center rounded-xl border border-line">
            <ArrowRight className="h-4.5 w-4.5" />
          </button>
          <h1 className="text-base font-bold">إنشاء طلبية توصيل جديدة</h1>
        </div>
        <div className="mt-4 flex items-center gap-2">
          {['بيانات الزبون', 'موقع التوصيل', 'المبلغ والمراجعة'].map((label, i) => (
            <div key={label} className="flex flex-1 flex-col items-center gap-1.5">
              <div className={`flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold ${step > i + 1 ? 'bg-black text-white' : step === i + 1 ? 'border-2 border-black bg-white' : 'border border-line bg-white text-faint'}`}>
                {step > i + 1 ? <Check className="h-3.5 w-3.5" /> : i + 1}
              </div>
              <span className={`text-[10px] font-semibold ${step === i + 1 ? 'text-black' : 'text-faint'}`}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="animate-fade-up flex-1 space-y-4 px-5 py-5" key={step}>
        {step === 1 && (
          <>
            <div>
              <label className="mb-1.5 block text-xs font-semibold">اسم الزبون *</label>
              <input className="field" placeholder="اسم الزبون الكامل" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold">رقم هاتف الزبون *</label>
              <div className="flex" dir="ltr">
                <span className="flex items-center rounded-l-2xl border border-r-0 border-line bg-white px-3 text-sm font-semibold text-mute">+964</span>
                <input className="field rounded-l-none" placeholder="7XX XXX XXXX" inputMode="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold">ملاحظات الوصول (اختياري)</label>
              <textarea className="field min-h-24 resize-none" placeholder="الطابق، رقم الشقة، توجيهات الدخول..." value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div
              className="relative h-60 overflow-hidden rounded-3xl border border-line"
              style={{
                backgroundImage:
                  'linear-gradient(#e6e6e6 1px, transparent 1px), linear-gradient(90deg, #e6e6e6 1px, transparent 1px)',
                backgroundSize: '28px 28px',
                backgroundColor: '#fafafa',
              }}
            >
              <button onClick={() => setPinned(true)} className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                <MapPin className={`h-10 w-10 transition-all ${pinned ? 'scale-110 fill-black text-black' : 'text-faint'}`} strokeWidth={1.5} />
                <span className="rounded-full bg-white/90 px-3 py-1 text-[11px] font-bold shadow-sm">
                  {pinned ? '✓ تم تحديد موقع التوصيل' : 'اضغط لتحديد موقع التوصيل'}
                </span>
              </button>
            </div>

            {pinned && (
              <div className="card animate-fade-up space-y-2 p-4">
                <p className="text-xs font-bold">📍 الموقع المحدد</p>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-mute">منطقة التوصيل</span>
                  <span className="font-bold">تُحدد عند ربط نظام الخرائط</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-mute">أجرة التوصيل</span>
                  <span className="font-bold">تُحسب تلقائياً من نظام الأسعار</span>
                </div>
              </div>
            )}

            <div>
              <label className="mb-1.5 block text-xs font-semibold">العنوان التفصيلي للتوصيل *</label>
              <input className="field" placeholder="المنطقة، الشارع، أقرب نقطة دالة" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold">المنطقة</label>
              <select className="field cursor-pointer" value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })}>
                <option value="" disabled>تُعبأ تلقائياً من Geofencing أو يدوياً</option>
              </select>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <div>
              <label className="mb-1.5 block text-xs font-semibold">قيمة الطلبية (دينار عراقي) *</label>
              <input className="field" placeholder="0" inputMode="numeric" dir="ltr" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value.replace(/[^\d]/g, '') })} />
              <p className="mt-1 text-[10px] text-faint">هذا المبلغ سيدفعه الكابتن لك نقداً (كاش) فور استلام الطلبية</p>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold">ملاحظات الطلب (اختياري)</label>
              <textarea className="field min-h-20 resize-none" placeholder="أي تفاصيل إضافية عن الطلب..." value={form.orderNotes} onChange={(e) => setForm({ ...form, orderNotes: e.target.value })} />
            </div>

            <div className="card divide-y divide-line">
              <p className="px-4 py-3 text-xs font-bold">ملخص الطلب</p>
              {[
                ['الزبون', form.name || '—'],
                ['الهاتف', form.phone ? `+964 ${form.phone}` : '—'],
                ['عنوان التوصيل', form.address || '—'],
                ['قيمة الطلبية', form.value ? `${Number(form.value).toLocaleString('en')} د.ع` : '—'],
                ['أجرة التوصيل', 'تُحسب تلقائياً'],
                ['الإجمالي من الزبون', 'القيمة + الأجرة'],
              ].map(([k, v]) => (
                <div key={k} className="flex items-center justify-between gap-3 px-4 py-2.5">
                  <span className="shrink-0 text-[11px] text-mute">{k}</span>
                  <span className="truncate text-[11px] font-bold">{v}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {error && <p className="rounded-xl border border-black bg-white px-4 py-3 text-xs font-semibold">⚠ {error}</p>}
      </div>

      <div className="border-t border-line bg-white px-5 py-4">
        {step < 3 ? (
          <button className="btn-primary w-full" onClick={next}>
            التالي ←
          </button>
        ) : (
          <button className="btn-primary w-full" onClick={submit} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> جاري إنشاء الطلب والبحث عن كابتن...
              </>
            ) : (
              <>
                <Truck className="h-5 w-5" /> إرسال الطلبية وطلب كابتن زاجل
              </>
            )}
          </button>
        )}
      </div>
    </div>
  )
}
