import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Camera, Check, Paperclip, CheckCircle2, Loader2 } from 'lucide-react'

const types = [
  '🚚 مشكلة في التوصيل (تأخر، ضياع، تلف)',
  '💰 مشكلة في المبلغ (دفع ناقص، رفض دفع)',
  '📦 مشكلة في التسليم (تسليم خاطئ، إثبات مزور)',
  '🤝 مشكلة مع الطرف الآخر (كابتن / محل)',
  '📱 مشكلة تقنية (التطبيق، الموقع، الإشعارات)',
  '❓ أخرى',
]

export default function NewComplaint() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [order, setOrder] = useState('')
  const [type, setType] = useState<number | null>(null)
  const [desc, setDesc] = useState('')
  const [photo, setPhoto] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const next = () => {
    if (step === 1 && !order) return setError('اختر الطلب المرتبط أو "شكوى عامة"')
    if (step === 2 && type === null) return setError('اختر نوع الشكوى')
    if (step === 3 && desc.trim().length < 20) return setError('اشرح المشكلة بالتفصيل (20 حرفاً على الأقل)')
    setError('')
    setStep((s) => s + 1)
  }

  const submit = () => {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setDone(true)
    }, 1000)
  }

  if (done) {
    return (
      <div className="app-shell items-center justify-center px-8 text-center">
        <div className="animate-fade-up flex w-full flex-col items-center gap-4">
          <CheckCircle2 className="h-20 w-20" strokeWidth={1} />
          <h1 className="text-lg font-bold">تم إرسال الشكوى بنجاح</h1>
          <p className="text-xs leading-relaxed text-mute">
            رقم الشكوى: <b className="text-black">#—</b> · سيتم مراجعتها من قبل الإدارة خلال 24 ساعة.
          </p>
          <div className="w-full space-y-3">
            <button className="btn-primary w-full" onClick={() => navigate('/complaints')}>متابعة الشكوى</button>
            <button className="btn-secondary w-full" onClick={() => navigate('/home')}>العودة للرئيسية</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="app-shell">
      <div className="sticky top-0 z-10 border-b border-line bg-white px-4 py-4">
        <div className="flex items-center gap-3">
          <button onClick={() => (step > 1 ? setStep(step - 1) : navigate(-1))} className="flex h-9 w-9 items-center justify-center rounded-xl border border-line">
            <ArrowRight className="h-4.5 w-4.5" />
          </button>
          <h1 className="text-base font-bold">تقديم شكوى</h1>
          <span className="mr-auto text-[11px] font-bold text-faint">الخطوة {step} / 4</span>
        </div>
        <div className="mt-3 flex gap-1.5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className={`h-1.5 flex-1 rounded-full ${i <= step ? 'bg-black' : 'bg-line'}`} />
          ))}
        </div>
      </div>

      <div className="animate-fade-up flex-1 space-y-3 px-5 py-5" key={step}>
        {step === 1 && (
          <>
            <h2 className="text-sm font-bold">اختر الطلب المرتبط</h2>
            <select className="field cursor-pointer" value={order} onChange={(e) => setOrder(e.target.value)}>
              <option value="" disabled>آخر 20 طلباً — لا توجد طلبات بعد</option>
              <option value="general">شكوى عامة (غير مرتبطة بطلب)</option>
            </select>
          </>
        )}

        {step === 2 && (
          <>
            <h2 className="text-sm font-bold">نوع الشكوى</h2>
            {types.map((t, i) => (
              <button
                key={t}
                onClick={() => setType(i)}
                className={`card flex w-full items-center gap-3 p-4 text-right transition-all ${type === i ? 'border-black shadow-md' : ''}`}
              >
                <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${type === i ? 'border-black' : 'border-line'}`}>
                  {type === i && <span className="h-2.5 w-2.5 rounded-full bg-black" />}
                </span>
                <span className="text-xs font-bold">{t}</span>
              </button>
            ))}
          </>
        )}

        {step === 3 && (
          <>
            <h2 className="text-sm font-bold">وصف المشكلة</h2>
            <textarea
              className="field min-h-32 resize-none"
              placeholder="اشرح المشكلة بالتفصيل... (20 حرفاً على الأقل)"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
            />
            <p className="text-left text-[10px] text-faint" dir="ltr">{desc.trim().length} / 20</p>
            <div className="flex gap-2">
              <button
                onClick={() => setPhoto((v) => !v)}
                className={`flex flex-1 items-center justify-center gap-2 rounded-2xl border py-3 text-xs font-bold ${photo ? 'border-black bg-black text-white' : 'border-dashed border-line bg-white'}`}
              >
                {photo ? <Check className="h-4 w-4" /> : <Camera className="h-4 w-4" />} {photo ? '✓ صورة مرفقة' : '📷 إرفاق صورة'}
              </button>
              <button className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-dashed border-line bg-white py-3 text-xs font-bold">
                <Paperclip className="h-4 w-4" /> 📎 إرفاق ملف
              </button>
            </div>
          </>
        )}

        {step === 4 && (
          <>
            <h2 className="text-sm font-bold">المراجعة والإرسال</h2>
            <div className="card divide-y divide-line">
              {[
                ['الطلب المرتبط', order === 'general' ? 'شكوى عامة' : order || '—'],
                ['نوع الشكوى', type !== null ? types[type] : '—'],
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

        {error && <p className="rounded-xl border border-black bg-white px-4 py-3 text-xs font-semibold">⚠ {error}</p>}
      </div>

      <div className="border-t border-line bg-white px-5 py-4">
        {step < 4 ? (
          <button className="btn-primary w-full" onClick={next}>التالي ←</button>
        ) : (
          <button className="btn-primary w-full" onClick={submit} disabled={loading}>
            {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> جاري الإرسال...</> : 'إرسال الشكوى'}
          </button>
        )}
      </div>
    </div>
  )
}
