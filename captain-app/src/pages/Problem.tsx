import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Camera, Check } from 'lucide-react'
import Modal from '../components/Modal'
import { useToast } from '../components/Toast'

const problems = [
  '📞 الزبون لا يرد على الهاتف',
  '🏠 الزبون غير موجود في العنوان',
  '❌ الزبون يرفض استلام الطلبية',
  '💰 الزبون يرفض دفع المبلغ',
  '📍 العنوان خاطئ أو غير دقيق',
  '🚪 لا أستطيع الوصول للموقع (طابق عالٍ، باب مغلق...)',
  '❓ مشكلة أخرى',
]

export default function Problem() {
  const navigate = useNavigate()
  const { toast, node } = useToast()
  const [selected, setSelected] = useState<number | null>(null)
  const [other, setOther] = useState('')
  const [photo, setPhoto] = useState(false)
  const [confirm, setConfirm] = useState(false)
  const [action, setAction] = useState<'wait' | 'return'>('wait')

  const canSubmit = selected !== null && (selected !== 6 || other.trim().length > 0)

  return (
    <div className="app-shell">
      <div className="flex items-center gap-3 border-b border-line bg-white px-4 py-4">
        <button onClick={() => navigate(-1)} className="flex h-9 w-9 items-center justify-center rounded-xl border border-line">
          <ArrowRight className="h-4.5 w-4.5" />
        </button>
        <div>
          <h1 className="text-base font-bold">⚠️ مشكلة في التسليم</h1>
          <p className="text-[10px] text-mute">اختر المشكلة التي تواجهها مع هذا الطلب</p>
        </div>
      </div>

      <div className="animate-fade-up flex-1 space-y-2.5 px-5 py-5">
        {problems.map((p, i) => (
          <button
            key={p}
            onClick={() => setSelected(i)}
            className={`card flex w-full items-center gap-3 p-4 text-right transition-all ${selected === i ? 'border-black shadow-md' : ''}`}
          >
            <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${selected === i ? 'border-black' : 'border-line'}`}>
              {selected === i && <span className="h-2.5 w-2.5 rounded-full bg-black" />}
            </span>
            <span className="text-xs font-bold">{p}</span>
          </button>
        ))}

        {selected === 6 && (
          <textarea
            className="field animate-fade-up min-h-20 resize-none"
            placeholder="اشرح المشكلة... (مطلوب)"
            value={other}
            onChange={(e) => setOther(e.target.value)}
          />
        )}

        <button
          onClick={() => setPhoto((v) => !v)}
          className={`flex w-full items-center justify-center gap-2 rounded-2xl border py-3 text-xs font-bold transition-colors ${
            photo ? 'border-black bg-black text-white' : 'border-dashed border-line bg-white'
          }`}
        >
          {photo ? <Check className="h-4 w-4" /> : <Camera className="h-4 w-4" />}
          {photo ? '✓ تم التقاط صورة إثبات' : '📷 التقط صورة إثبات (موصى به)'}
        </button>
      </div>

      <div className="border-t border-line bg-white px-5 py-4">
        <button className="btn-primary w-full" disabled={!canSubmit} onClick={() => setConfirm(true)}>
          تسجيل المشكلة
        </button>
      </div>

      {confirm && (
        <Modal title="تأكيد تسجيل المشكلة" onClose={() => setConfirm(false)}>
          <p className="mt-2 text-xs leading-relaxed text-mute">
            سيتم تسجيل المشكلة وإشعار الإدارة والمحل فوراً. ماذا تريد أن تفعل بالطلب؟
          </p>
          <div className="mt-4 space-y-2">
            {(
              [
                ['wait', '⏳ الانتظار 10 دقائق ثم المحاولة مرة أخرى', 'يبقى الطلب نشطاً وتحاول التواصل مجدداً'],
                ['return', '🔄 إرجاع الطلبية للمحل واسترداد المبلغ', 'ينتقل الطلب لحالة "مرتجع" وتعود للمحل'],
              ] as const
            ).map(([val, label, hint]) => (
              <button
                key={val}
                onClick={() => setAction(val)}
                className={`flex w-full items-start gap-3 rounded-2xl border p-3.5 text-right transition-all ${action === val ? 'border-black' : 'border-line'}`}
              >
                <span className={`mt-0.5 flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full border-2 ${action === val ? 'border-black' : 'border-line'}`}>
                  {action === val && <span className="h-2 w-2 rounded-full bg-black" />}
                </span>
                <span>
                  <span className="block text-xs font-bold">{label}</span>
                  <span className="mt-0.5 block text-[10px] text-mute">{hint}</span>
                </span>
              </button>
            ))}
          </div>
          <div className="mt-4 flex gap-2">
            <button
              className="btn-primary flex-1"
              onClick={() => {
                if (action === 'return') navigate('/return')
                else {
                  toast('تم تسجيل المشكلة. انتظر 10 دقائق ثم حاول مجدداً ⏳')
                  setConfirm(false)
                  setTimeout(() => navigate('/order'), 1200)
                }
              }}
            >
              تأكيد
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
