import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Camera, Check, Paperclip, CheckCircle2, Loader2 } from 'lucide-react'
import Stepper from '../components/Stepper'
import { useStore } from '../lib/StoreContext'
import { COMPLAINT_TYPES } from '../lib/data'

export default function NewComplaint() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const preOrder = params.get('order')
  const { orders, createComplaint } = useStore()

  const [step, setStep] = useState(1)
  const [orderId, setOrderId] = useState(preOrder ?? '')
  const [type, setType] = useState<number | null>(null)
  const [desc, setDesc] = useState('')
  const [photo, setPhoto] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState<{ id: string } | null>(null)

  const next = () => {
    if (step === 1 && !orderId) return setError('اختر الطلب المرتبط أو "شكوى عامة"')
    if (step === 2 && type === null) return setError('اختر نوع الشكوى')
    if (step === 3 && desc.trim().length < 20) return setError('اشرح المشكلة بالتفصيل (20 حرفاً على الأقل)')
    setError('')
    setStep((s) => s + 1)
    window.scrollTo(0, 0)
  }

  const submit = () => {
    setLoading(true)
    setTimeout(() => {
      const c = createComplaint({
        orderId: orderId === 'general' ? undefined : orderId,
        type: type !== null ? COMPLAINT_TYPES[type] : COMPLAINT_TYPES[0],
        desc: desc.trim(),
        photo: photo ?? undefined,
      })
      setLoading(false)
      setDone({ id: c.id })
    }, 1000)
  }

  if (done) {
    return (
      <div className="app-shell items-center justify-center px-8 text-center">
        <div className="animate-fade-up flex w-full flex-col items-center gap-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gold text-white">
            <CheckCircle2 className="h-10 w-10" strokeWidth={1.6} />
          </div>
          <h1 className="text-lg font-extrabold">تم إرسال الشكوى بنجاح</h1>
          <p className="text-xs leading-relaxed text-mute">
            رقم الشكوى: <b className="text-gold-strong">{done.id}</b> · سيتم مراجعتها من قبل الإدارة خلال 24 ساعة.
          </p>
          <div className="w-full space-y-3">
            <button className="btn-primary w-full" onClick={() => navigate(`/complaint-details?id=${done.id}`)}>
              متابعة الشكوى
            </button>
            <button className="btn-secondary w-full" onClick={() => navigate('/home')}>
              العودة للرئيسية
            </button>
          </div>
        </div>
      </div>
    )
  }

  const recentOrders = orders.slice(0, 20)

  return (
    <div className="app-shell">
      <div className="sticky top-0 z-20 border-b border-line bg-white/95 px-4 py-3.5 backdrop-blur">
        <div className="flex items-center gap-3">
          <button onClick={() => (step > 1 ? setStep(step - 1) : navigate(-1))} className="flex h-9 w-9 items-center justify-center rounded-xl border border-line">
            <span className="text-sm font-bold">→</span>
          </button>
          <h1 className="flex-1 text-base font-extrabold">تقديم شكوى</h1>
          <span className="text-[11px] font-bold text-faint">الخطوة {step} / 4</span>
        </div>
        <div className="mt-3">
          <Stepper steps={['الطلب', 'النوع', 'الوصف', 'المراجعة']} current={step} />
        </div>
      </div>

      <div className="animate-fade-up flex-1 space-y-3 px-5 py-5" key={step}>
        {step === 1 && (
          <>
            <h2 className="section-title">اختر الطلب المرتبط</h2>
            <select className="field cursor-pointer" value={orderId} onChange={(e) => setOrderId(e.target.value)}>
              <option value="" disabled>
                {recentOrders.length > 0 ? 'آخر 20 طلباً' : 'لا توجد طلبات بعد'}
              </option>
              {recentOrders.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.id} — {o.customer.name}
                </option>
              ))}
              <option value="general">شكوى عامة (غير مرتبطة بطلب)</option>
            </select>
          </>
        )}

        {step === 2 && (
          <>
            <h2 className="section-title">نوع الشكوى</h2>
            {COMPLAINT_TYPES.map((t, i) => (
              <button
                key={t}
                onClick={() => setType(i)}
                className={`card flex w-full items-center gap-3 p-4 text-right transition-all ${type === i ? 'border-gold bg-gold-faint' : ''}`}
              >
                <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${type === i ? 'border-gold' : 'border-line'}`}>
                  {type === i && <span className="h-2.5 w-2.5 rounded-full bg-gold" />}
                </span>
                <span className="text-xs font-bold">{t}</span>
              </button>
            ))}
          </>
        )}

        {step === 3 && (
          <>
            <h2 className="section-title">وصف المشكلة</h2>
            <textarea
              className="field min-h-32 resize-none"
              placeholder="اشرح المشكلة بالتفصيل... (20 حرفاً على الأقل)"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
            />
            <p className="text-left text-[10px] text-faint" dir="ltr">
              {desc.trim().length} / 20
            </p>
            <div className="flex gap-2">
              <label
                className={`flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-2xl border py-3 text-xs font-bold ${
                  photo ? 'border-gold bg-gold-soft text-gold-deep' : 'border-dashed border-line-strong bg-white'
                }`}
              >
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0]
                    if (!f) return
                    const r = new FileReader()
                    r.onload = () => setPhoto(String(r.result))
                    r.readAsDataURL(f)
                  }}
                />
                {photo ? (
                  <>
                    <Check className="h-4 w-4" /> ✓ صورة مرفقة
                  </>
                ) : (
                  <>
                    <Camera className="h-4 w-4" /> 📷 إرفاق صورة
                  </>
                )}
              </label>
              <button className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-dashed border-line-strong bg-white py-3 text-xs font-bold">
                <Paperclip className="h-4 w-4" /> 📎 إرفاق ملف
              </button>
            </div>
            {photo && <img src={photo} alt="معاينة المرفق" className="max-h-40 rounded-xl border border-line" />}
          </>
        )}

        {step === 4 && (
          <>
            <h2 className="section-title">المراجعة والإرسال</h2>
            <div className="card divide-y divide-line">
              {[
                ['الطلب المرتبط', orderId === 'general' ? 'شكوى عامة' : orderId || '—'],
                ['نوع الشكوى', type !== null ? COMPLAINT_TYPES[type] : '—'],
                ['الوصف', desc.slice(0, 60) + (desc.length > 60 ? '…' : '')],
                ['المرفقات', photo ? 'صورة واحدة' : 'لا يوجد'],
              ].map(([k, v]) => (
                <div key={k} className="flex items-start justify-between gap-3 px-4 py-3">
                  <span className="shrink-0 text-xs text-mute">{k}</span>
                  <span className="text-left text-xs font-bold leading-relaxed">{v}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {error && <p className="rounded-xl border border-danger/40 bg-danger/5 px-4 py-3 text-xs font-bold text-danger">⚠ {error}</p>}
      </div>

      <div className="border-t border-line bg-white px-5 py-4">
        {step < 4 ? (
          <button className="btn-primary w-full" onClick={next}>
            التالي ←
          </button>
        ) : (
          <button className="btn-primary w-full" onClick={submit} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> جاري الإرسال...
              </>
            ) : (
              'إرسال الشكوى'
            )}
          </button>
        )}
      </div>
    </div>
  )
}
