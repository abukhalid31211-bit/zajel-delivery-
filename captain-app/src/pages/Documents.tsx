import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Camera, X } from 'lucide-react'
import { useToast } from '../components/Toast'
import { useCaptain } from '../state'

const docs = [
  'صورة وجه البطاقة الموحدة / الهوية الوطنية',
  'صورة ظهر البطاقة الموحدة / الهوية الوطنية',
  'صورة وجه بطاقة السكن',
  'صورة ظهر بطاقة السكن',
]

export default function Documents() {
  const navigate = useNavigate()
  const { state } = useCaptain()
  const { toast, node } = useToast()
  const captain = state.captain
  const [previews, setPreviews] = useState<(string | null)[]>([null, null, null, null])
  const [submitted, setSubmitted] = useState(false)
  const uploaded = previews.map((p, i) => p || captain?.docs?.[i])

  const onFile = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPreviews((p) => p.map((v, i) => (i === index ? URL.createObjectURL(file) : v)))
  }

  const all = uploaded.every(Boolean)

  return (
    <div className="app-shell">
      <div className="flex items-center gap-3 border-b border-line bg-white px-4 py-4">
        <button onClick={() => navigate(-1)} className="flex h-9 w-9 items-center justify-center rounded-xl border border-line">
          <ArrowRight className="h-4.5 w-4.5" />
        </button>
        <div>
          <h1 className="text-base font-bold">تحديث الوثائق</h1>
          <p className="text-[10px] text-mute">حدّث وثائقك للمتابعة في استلام الطلبيات</p>
        </div>
      </div>

      <div className="animate-fade-up flex-1 space-y-3 px-5 py-5">
        {submitted && <div className="rounded-2xl border border-dashed border-gold bg-white px-4 py-3 text-center text-xs font-bold">⏳ وثائقك قيد المراجعة من قبل الإدارة</div>}
        {docs.map((d, i) => (
          <div key={d} className={`card w-full p-4 text-right ${uploaded[i] ? 'border-gold' : 'border-dashed'}`}>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-4">
                <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${uploaded[i] ? 'bg-gold text-white' : 'bg-page text-faint'}`}>
                  <Camera className="h-5 w-5" strokeWidth={1.8} />
                </span>
                <div className="flex-1">
                  <p className="text-xs font-bold leading-relaxed">{d}</p>
                  <p className={`mt-0.5 text-[10px] font-medium ${uploaded[i] ? 'text-gold-dark' : 'text-faint'}`}>
                    {uploaded[i] ? (previews[i] ? '✓ مرفوعة حديثاً' : '✓ مرفوعة سابقاً — اضغط لإعادة الرفع') : 'لم تُرفع بعد'}
                  </p>
                </div>
              </div>
              {submitted ? (
                <span className="badge bg-faint text-white">⏳ قيد المراجعة</span>
              ) : uploaded[i] ? (
                <label className="flex h-8 cursor-pointer items-center gap-1 rounded-xl border border-line px-2 text-[10px] font-bold text-mute">
                  <Camera className="h-3.5 w-3.5" /> إعادة
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => onFile(e, i)} />
                </label>
              ) : (
                <label className="flex h-8 cursor-pointer items-center gap-1 rounded-xl border border-dashed border-gold px-2 text-[10px] font-bold text-gold-dark">
                  <Camera className="h-3.5 w-3.5" /> رفع
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => onFile(e, i)} />
                </label>
              )}
            </div>
            {previews[i] && (
              <div className="relative mt-3">
                <img src={previews[i]!} alt={d} className="h-40 w-full rounded-xl object-cover" />
                <button onClick={() => setPreviews((p) => p.map((v, j) => (j === i ? null : v)))} className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-xl bg-black/50 text-white">
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="border-t border-line bg-white px-5 py-4">
        <button className="btn-primary w-full" disabled={!all || submitted} onClick={() => { setSubmitted(true); toast('تم إرسال الوثائق للمراجعة ✅') }}>
          {submitted ? '⏳ بانتظار مراجعة الإدارة' : 'إرسال للمراجعة'}
        </button>
      </div>

      {node}
    </div>
  )
}
