import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowRight, Camera } from 'lucide-react'
import Modal from '../components/Modal'
import { useToast } from '../components/Toast'
import { useCaptain } from '../state'

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
  const [params] = useSearchParams()
  const { getOrder, reportProblem } = useCaptain()
  const { toast, node } = useToast()
  const orderId = params.get('order') || ''
  const order = getOrder(orderId)
  const [selected, setSelected] = useState<number | null>(null)
  const [other, setOther] = useState('')
  const [photo, setPhoto] = useState(false)
  const [photoImage, setPhotoImage] = useState<string | null>(null)
  const [confirm, setConfirm] = useState(false)
  const [action, setAction] = useState<'wait' | 'return'>('wait')

  const canSubmit = selected !== null && (selected !== 6 || other.trim().length > 0)

  const onPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoImage(URL.createObjectURL(file))
    setPhoto(true)
  }

  if (!order) {
    return (
      <div className="app-shell items-center justify-center px-8 text-center">
        <h1 className="text-lg font-bold">الطلب غير موجود</h1>
        <button className="btn-primary mt-5 w-full" onClick={() => navigate('/home')}>العودة للرئيسية</button>
      </div>
    )
  }

  const selectedProblem = selected === null ? '' : selected === 6 ? other : problems[selected].replace(/^\S+\s/, '')

  return (
    <div className="app-shell">
      <div className="flex items-center gap-3 border-b border-line bg-white px-4 py-4">
        <button onClick={() => navigate(-1)} className="flex h-9 w-9 items-center justify-center rounded-xl border border-line">
          <ArrowRight className="h-4.5 w-4.5" />
        </button>
        <div>
          <h1 className="text-base font-bold">⚠️ مشكلة في التسليم</h1>
          <p className="text-[10px] text-mute">اختر المشكلة التي تواجهها مع {order.title}</p>
        </div>
      </div>

      <div className="animate-fade-up flex-1 space-y-2.5 px-5 py-5">
        {problems.map((p, i) => (
          <button key={p} onClick={() => setSelected(i)} className={`card flex w-full items-center gap-3 p-4 text-right transition-all ${selected === i ? 'border-gold shadow-md' : ''}`}>
            <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${selected === i ? 'border-gold' : 'border-line'}`}>
              {selected === i && <span className="h-2.5 w-2.5 rounded-full bg-gold" />}
            </span>
            <span className="text-xs font-bold">{p}</span>
          </button>
        ))}

        {selected === 6 && (
          <textarea className="field animate-fade-up min-h-20 resize-none" value={other} onChange={(e) => setOther(e.target.value)} />
        )}

        {photoImage ? (
          <div className="space-y-2">
            <img src={photoImage} alt="إثبات المشكلة" className="h-40 w-full rounded-2xl object-cover" />
            <label className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-gold py-3 text-xs font-bold text-mute">
              <Camera className="h-4 w-4" /> إعادة التصوير
              <input type="file" accept="image/*" className="hidden" onChange={onPhoto} />
            </label>
          </div>
        ) : (
          <label className={`flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border py-3 text-xs font-bold transition-colors ${photo ? 'border-gold bg-gold text-white' : 'border-dashed border-line bg-white'}`}>
            <Camera className="h-4 w-4" />
            {photo ? '✓ تم التقاط صورة إثبات' : '📷 التقط صورة إثبات (موصى به)'}
            <input type="file" accept="image/*" className="hidden" onChange={onPhoto} />
          </label>
        )}
      </div>

      <div className="border-t border-line bg-white px-5 py-4">
        <button className="btn-primary w-full" disabled={!canSubmit} onClick={() => setConfirm(true)}>تسجيل المشكلة</button>
      </div>

      {confirm && (
        <Modal title="تأكيد تسجيل المشكلة" onClose={() => setConfirm(false)}>
          <p className="mt-2 text-xs leading-relaxed text-mute">سيتم تسجيل المشكلة وإشعار الإدارة والمحل فوراً. ماذا تريد أن تفعل بالطلب؟</p>
          <div className="mt-4 space-y-2">
            {([
              ['wait', '⏳ الانتظار 10 دقائق ثم المحاولة مرة أخرى', 'يبقى الطلب نشطاً وتحاول التواصل مجدداً'],
              ['return', '🔄 إرجاع الطلبية للمحل واسترداد المبلغ', 'ينتقل الطلب لحالة "مرتجع" وتعود للمحل'],
            ] as const).map(([val, label, hint]) => (
              <button key={val} onClick={() => setAction(val)} className={`flex w-full items-start gap-3 rounded-2xl border p-3.5 text-right transition-all ${action === val ? 'border-gold' : 'border-line'}`}>
                <span className={`mt-0.5 flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full border-2 ${action === val ? 'border-gold' : 'border-line'}`}>
                  {action === val && <span className="h-2 w-2 rounded-full bg-gold" />}
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
                reportProblem(order.id, selectedProblem, action)
                setConfirm(false)
                if (action === 'return') navigate(`/return?order=${order.id}`)
                else {
                  toast('تم تسجيل المشكلة. انتظر 10 دقائق ثم حاول مجدداً ⏳')
                  setTimeout(() => navigate(`/order?order=${order.id}`), 1200)
                }
              }}
            >
              تأكيد
            </button>
            <button className="btn-secondary flex-1" onClick={() => setConfirm(false)}>إلغاء</button>
          </div>
        </Modal>
      )}

      {node}
    </div>
  )
}
