import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Camera, Check, MessageSquareText, Loader2 } from 'lucide-react'
import { useToast } from '../components/Toast'

/** شاشة إثبات التسليم (POD): OTP عبر SMS أو صورة بديلة */
export default function POD() {
  const navigate = useNavigate()
  const { toast, node } = useToast()
  const [mode, setMode] = useState<'otp' | 'photo'>('otp')
  const [otp, setOtp] = useState(['', '', '', ''])
  const [smsSent, setSmsSent] = useState(false)
  const [photoTaken, setPhotoTaken] = useState(false)
  const [loading, setLoading] = useState(false)

  const setDigit = (i: number, v: string) => {
    if (!/^\d?$/.test(v)) return
    const next = [...otp]
    next[i] = v
    setOtp(next)
    if (v && i < 3) document.getElementById(`pod-${i + 1}`)?.focus()
  }

  const ready = mode === 'otp' ? otp.every((d) => d !== '') : photoTaken

  const complete = () => {
    setLoading(true)
    setTimeout(() => navigate('/delivered', { replace: true }), 900)
  }

  return (
    <div className="app-shell">
      <div className="flex items-center gap-3 border-b border-line bg-white px-4 py-4">
        <button onClick={() => navigate(-1)} className="flex h-9 w-9 items-center justify-center rounded-xl border border-line">
          <ArrowRight className="h-4.5 w-4.5" />
        </button>
        <div>
          <h1 className="text-base font-bold">إثبات التسليم للزبون</h1>
          <p className="text-[10px] text-mute">أكمل إثبات التسليم لإتمام الطلب #—</p>
        </div>
      </div>

      <div className="animate-fade-up flex-1 space-y-5 px-5 py-6" key={mode}>
        {mode === 'otp' ? (
          <>
            <div className="card space-y-4 p-5">
              <p className="text-xs font-bold">رمز التحقق OTP</p>
              <p className="text-[11px] leading-relaxed text-mute">
                أدخل رمز التحقق المكون من 4 أرقام المرسل لرقم الزبون عبر SMS، اطلبه من الزبون عند التسليم.
              </p>
              <button
                onClick={() => {
                  setSmsSent(true)
                  toast('تم إرسال رمز OTP للزبون عبر SMS 📩')
                }}
                className={`flex w-full items-center justify-center gap-2 rounded-2xl border py-3 text-xs font-bold transition-colors ${
                  smsSent ? 'border-black bg-black text-white' : 'border-dashed border-line'
                }`}
              >
                <MessageSquareText className="h-4 w-4" />
                {smsSent ? 'تم إرسال الرمز — يمكنك إعادة الإرسال' : '📩 إرسال رمز OTP للزبون عبر SMS'}
              </button>
              <div className="flex justify-center gap-3 pt-2" dir="ltr">
                {otp.map((d, i) => (
                  <input
                    key={i}
                    id={`pod-${i}`}
                    className="field h-14 w-14 text-center text-xl font-bold"
                    maxLength={1}
                    inputMode="numeric"
                    value={d}
                    onChange={(e) => setDigit(i, e.target.value)}
                  />
                ))}
              </div>
            </div>
            <button onClick={() => setMode('photo')} className="w-full text-center text-xs font-bold text-mute underline-offset-4 hover:underline">
              لم يصل الرمز للزبون؟ إثبات بالصورة بدلاً من ذلك 📷
            </button>
          </>
        ) : (
          <>
            <div className="card space-y-4 p-5">
              <p className="text-xs font-bold">إثبات التسليم بالصورة</p>
              <p className="text-[11px] leading-relaxed text-mute">
                التقط صورة واضحة للطلبية أثناء التسليم (عند باب الزبون أو مع الإيصال).
              </p>
              <button
                onClick={() => setPhotoTaken(true)}
                className={`flex h-44 w-full flex-col items-center justify-center gap-2 rounded-2xl border transition-colors ${
                  photoTaken ? 'border-black bg-black text-white' : 'border-dashed border-line'
                }`}
              >
                {photoTaken ? <Check className="h-8 w-8" /> : <Camera className="h-8 w-8 text-faint" strokeWidth={1.4} />}
                <span className="text-xs font-bold">{photoTaken ? '✓ تم التقاط صورة الإثبات' : 'اضغط لفتح الكاميرا'}</span>
                {photoTaken && <span className="text-[10px] text-white/60">اضغط مجدداً لإعادة التصوير</span>}
              </button>
            </div>
            <button onClick={() => setMode('otp')} className="w-full text-center text-xs font-bold text-mute underline-offset-4 hover:underline">
              العودة لإثبات OTP
            </button>
          </>
        )}
      </div>

      <div className="border-t border-line bg-white px-5 py-4">
        <button className="btn-primary w-full" disabled={!ready || loading} onClick={complete}>
          {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> جاري التحقق وإتمام التسليم...</> : 'إتمام التسليم'}
        </button>
      </div>

      {node}
    </div>
  )
}
