import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowRight, Camera, MessageSquareText, Loader2 } from 'lucide-react'
import { useToast } from '../components/Toast'
import { useCaptain } from '../state'

export default function POD() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const { getOrder, sendSmsOtp, completeDelivery, money } = useCaptain()
  const { toast, node } = useToast()
  const orderId = params.get('order') || ''
  const order = getOrder(orderId)
  const [mode, setMode] = useState<'otp' | 'photo'>('otp')
  const [otp, setOtp] = useState(['', '', '', ''])
  const [smsSent, setSmsSent] = useState(false)
  const [photoTaken, setPhotoTaken] = useState(false)
  const [photoImage, setPhotoImage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!order) {
    return (
      <div className="app-shell items-center justify-center px-8 text-center">
        <h1 className="text-lg font-bold">الطلب غير موجود</h1>
        <button className="btn-primary mt-5 w-full" onClick={() => navigate('/home')}>العودة للرئيسية</button>
      </div>
    )
  }

  const setDigit = (i: number, v: string) => {
    if (!/^\d?$/.test(v)) return
    const next = [...otp]
    next[i] = v
    setOtp(next)
    if (v && i < 3) document.getElementById(`pod-${i + 1}`)?.focus()
  }

  const ready = mode === 'otp' ? otp.every((d) => d !== '') : photoTaken
  const saved = getOrder(order.id)

  const complete = () => {
    setLoading(true)
    setError('')
    const code = mode === 'otp' ? otp.join('') : ''
    const result = completeDelivery(order.id, code, photoTaken)
    setTimeout(() => {
      if (result) {
        setLoading(false)
        setError(result)
        return
      }
      navigate('/delivered?order=' + order.id, { replace: true })
    }, 800)
  }

  const onPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoImage(URL.createObjectURL(file))
    setPhotoTaken(true)
  }

  return (
    <div className="app-shell">
      <div className="flex items-center gap-3 border-b border-line bg-white px-4 py-4">
        <button onClick={() => navigate(-1)} className="flex h-9 w-9 items-center justify-center rounded-xl border border-line">
          <ArrowRight className="h-4.5 w-4.5" />
        </button>
        <div>
          <h1 className="text-base font-bold">إثبات التسليم للزبون</h1>
          <p className="text-[10px] text-mute">أكمل إثبات التسليم لإتمام {order.title}</p>
        </div>
      </div>

      <div className="animate-fade-up flex-1 space-y-5 px-5 py-6" key={mode}>
        {mode === 'otp' ? (
          <>
            <div className="card space-y-4 p-5">
              <p className="text-xs font-bold">رمز التحقق OTP</p>
              <p className="text-[11px] leading-relaxed text-mute">
                أدخل رمز التحقق المكون من 4 أرقام المرسل لرقم {order.customerPhone} عبر SMS، اطلبه من الزبون عند التسليم.
              </p>
              <button
                onClick={() => {
                  setSmsSent(true)
                  sendSmsOtp(order.id)
                  toast('تم إرسال رمز OTP للزبون (محاكاة SMS محلياً) 📩')
                }}
                className={`flex w-full items-center justify-center gap-2 rounded-2xl border py-3 text-xs font-bold transition-colors ${smsSent ? 'border-gold bg-gold text-white' : 'border-dashed border-line'}`}
              >
                <MessageSquareText className="h-4 w-4" />
                {smsSent ? 'أُرسل الرمز · اضغط لإعادة الإرسال' : '📩 إرسال رمز OTP للزبون عبر SMS'}
              </button>
              <div className="flex justify-center gap-3 pt-2" dir="ltr">
                {otp.map((d, i) => (
                  <input key={i} id={`pod-${i}`} className={`field h-14 w-14 text-center text-xl font-bold ${error && saved?.oTptAttempts ? 'animate-shake border-red-300' : ''}`} maxLength={1} inputMode="numeric" value={d} onChange={(e) => setDigit(i, e.target.value)} />
                ))}
              </div>
              {error && <p className="rounded-xl border border-red-200 bg-white px-3 py-2 text-[11px] font-semibold text-red-600">⚠ {error}</p>}
              {saved?.oTptAttempts ? <p className="text-[10px] text-faint">محاولات خاطئة: {saved.oTptAttempts} / 3</p> : null}
            </div>
            <button onClick={() => setMode('photo')} className="w-full text-center text-xs font-bold text-gold-dark underline-offset-4 hover:underline">
              لم يصل الرمز للزبون؟ إثبات بالصورة بدلاً من ذلك 📷
            </button>
          </>
        ) : (
          <>
            <div className="card space-y-4 p-5">
              <p className="text-xs font-bold">إثبات التسليم بالصورة</p>
              <p className="text-[11px] leading-relaxed text-mute">التقط صورة واضحة للطلبية أثناء التسليم (عند باب الزبون أو مع الإيصال).</p>
              {photoImage ? (
                <div className="space-y-2">
                  <img src={photoImage} alt="إثبات التسليم" className="h-48 w-full rounded-2xl object-cover" />
                  <label className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-gold py-3 text-xs font-bold text-mute">
                    <Camera className="h-4 w-4" /> إعادة التصوير
                    <input type="file" accept="image/*" capture="environment" className="hidden" onChange={onPhoto} />
                  </label>
                </div>
              ) : (
                <label className="flex h-44 w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-line">
                  <Camera className="h-8 w-8 text-faint" strokeWidth={1.4} />
                  <span className="text-xs font-bold">اضغط لفتح الكاميرا</span>
                  <input type="file" accept="image/*" capture="environment" className="hidden" onChange={onPhoto} />
                </label>
              )}
            </div>
            <button onClick={() => setMode('otp')} className="w-full text-center text-xs font-bold text-gold-dark underline-offset-4 hover:underline">
              العودة لإثبات OTP
            </button>
          </>
        )}
      </div>

      <div className="border-t border-line bg-white px-5 py-4">
        <button className="btn-primary w-full" disabled={!ready || loading} onClick={complete}>
          {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> جاري التحقق وإتمام التسليم...</> : `إتمام التسليم (تحصيل ${money(order.itemPrice + order.deliveryFee)})`}
        </button>
      </div>

      {node}
    </div>
  )
}
