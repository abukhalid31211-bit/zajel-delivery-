import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Camera, Check } from 'lucide-react'
import { useToast } from '../components/Toast'

const docs = [
  'صورة وجه البطاقة الموحدة / الهوية الوطنية',
  'صورة ظهر البطاقة الموحدة / الهوية الوطنية',
  'صورة وجه بطاقة السكن',
  'صورة ظهر بطاقة السكن',
]

export default function Documents() {
  const navigate = useNavigate()
  const { toast, node } = useToast()
  const [uploaded, setUploaded] = useState([false, false, false, false])
  const [submitted, setSubmitted] = useState(false)

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
        {submitted && (
          <div className="rounded-2xl border border-dashed border-black bg-white px-4 py-3 text-center text-xs font-bold">
            ⏳ وثائقك قيد المراجعة من قبل الإدارة
          </div>
        )}
        {docs.map((d, i) => (
          <button
            key={d}
            disabled={submitted}
            onClick={() => setUploaded((u) => u.map((v, j) => (j === i ? !v : v)))}
            className={`card flex w-full items-center gap-4 p-4 text-right transition-all ${uploaded[i] ? 'border-black' : 'border-dashed'} ${submitted ? 'opacity-60' : ''}`}
          >
            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${uploaded[i] ? 'bg-black text-white' : 'bg-page text-faint'}`}>
              {uploaded[i] ? <Check className="h-5 w-5" /> : <Camera className="h-5 w-5" strokeWidth={1.8} />}
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold leading-relaxed">{d}</p>
              <p className={`mt-0.5 text-[10px] font-medium ${uploaded[i] ? 'text-black' : 'text-faint'}`}>
                {submitted ? '⏳ قيد المراجعة' : uploaded[i] ? '✓ جاهزة للإرسال — اضغط للإلغاء' : '📷 اضغط لإعادة الرفع (كاميرا أو معرض)'}
              </p>
            </div>
          </button>
        ))}
      </div>

      <div className="border-t border-line bg-white px-5 py-4">
        <button
          className="btn-primary w-full"
          disabled={!uploaded.some(Boolean) || submitted}
          onClick={() => {
            setSubmitted(true)
            toast('تم إرسال الوثائق للمراجعة ✅')
          }}
        >
          {submitted ? '⏳ بانتظار مراجعة الإدارة' : 'إرسال للمراجعة'}
        </button>
      </div>

      {node}
    </div>
  )
}
