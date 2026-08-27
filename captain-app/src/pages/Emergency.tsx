import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Siren, MapPin, Clock, Hash } from 'lucide-react'
import Modal from '../components/Modal'
import { useToast } from '../components/Toast'
import { useCaptain } from '../state'

export default function Emergency() {
  const navigate = useNavigate()
  const { toast, node } = useToast()
  const { sendEmergency } = useCaptain()
  const [confirm, setConfirm] = useState(false)
  const [desc, setDesc] = useState('')

  return (
    <div className="app-shell">
      <div className="flex items-center gap-3 border-b border-line bg-white px-4 py-4">
        <button onClick={() => navigate(-1)} className="flex h-9 w-9 items-center justify-center rounded-xl border border-line">
          <ArrowRight className="h-4.5 w-4.5" />
        </button>
        <h1 className="text-base font-bold">🚨 طوارئ</h1>
      </div>

      <div className="animate-fade-up flex-1 space-y-4 px-5 py-6">
        <div className="card flex flex-col items-center gap-3 p-6 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-3xl border-2 border-dashed border-black">
            <Siren className="h-7 w-7" strokeWidth={1.6} />
          </span>
          <p className="text-sm font-bold">تنبيه طوارئ فوري للإدارة</p>
          <p className="max-w-64 text-[11px] leading-relaxed text-mute">
            اضغط الزر أدناه لإرسال تنبيه طوارئ لغرفة عمليات الإدارة مع تفاصيل موقعك وطلبك الحالي.
          </p>
        </div>

        <div className="card divide-y divide-line">
          <p className="px-4 py-3 text-xs font-bold">معلومات تُرسل تلقائياً</p>
          {[
            { icon: Hash, label: 'رقم الطلب الحالي', value: '#—' },
            { icon: MapPin, label: 'موقعك الحالي (GPS)', value: 'يُرسل تلقائياً' },
            { icon: Clock, label: 'وقت التنبيه', value: 'لحظة الإرسال' },
          ].map((r) => (
            <div key={r.label} className="flex items-center gap-3 px-4 py-3">
              <r.icon className="h-4 w-4 shrink-0 text-faint" />
              <span className="flex-1 text-xs text-mute">{r.label}</span>
              <span className="text-xs font-bold">{r.value}</span>
            </div>
          ))}
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold">وصف المشكلة (اختياري)</label>
          <textarea className="field min-h-24 resize-none" placeholder="مثال: حادث، تعطل المركبة، موقف خطر..." value={desc} onChange={(e) => setDesc(e.target.value)} />
        </div>
      </div>

      <div className="border-t border-line bg-white px-5 py-4">
        <button
          className="w-full rounded-2xl border-2 border-black bg-black py-4 text-sm font-bold text-white transition-transform active:scale-[0.98]"
          onClick={() => setConfirm(true)}
        >
          🚨 إرسال تنبيه طوارئ
        </button>
      </div>

      {confirm && (
        <Modal title="إرسال تنبيه طوارئ؟" onClose={() => setConfirm(false)}>
          <p className="mt-2 text-xs leading-relaxed text-mute">
            سيصل التنبيه فوراً للوحة الإدارة مع موقعك وبيانات طلبك. ستتواصل معك الإدارة بأسرع وقت.
          </p>
          <div className="mt-5 flex gap-2">
            <button
              className="btn-primary flex-1"
              onClick={() => {
                setConfirm(false)
                sendEmergency(desc)
                toast('تم إرسال تنبيه الطوارئ 🚨 ستتواصل معك الإدارة قريباً')
                setTimeout(() => navigate(-1), 1500)
              }}
            >
              تأكيد الإرسال
            </button>
            <button className="btn-secondary flex-1" onClick={() => setConfirm(false)}>
              إلغاء
            </button>
          </div>
        </Modal>
      )}

      {node}
    </div>
  )
}
