import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, MapPin, Loader2, ShieldAlert } from 'lucide-react'
import Modal from '../components/Modal'
import { useToast } from '../components/Toast'

const types = ['مطعم 🍕', 'سوبرماركت 🛒', 'صيدلية 💊', 'محل تجاري 🛍️']

/** تعديل بيانات المحل — تعديلات بسيطة فورية وحساسة تُرسل للمراجعة */
export default function EditStore() {
  const navigate = useNavigate()
  const { toast, node } = useToast()
  const [confirm, setConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [movedPin, setMovedPin] = useState(false)

  const save = () => {
    setConfirm(false)
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      toast('التعديلات البسيطة حُدثت فوراً ✅ والحساسة أُرسلت للمراجعة ⏳')
      setTimeout(() => navigate(-1), 1600)
    }, 900)
  }

  return (
    <div className="app-shell">
      <div className="flex items-center gap-3 border-b border-line bg-white px-4 py-4">
        <button onClick={() => navigate(-1)} className="flex h-9 w-9 items-center justify-center rounded-xl border border-line">
          <ArrowRight className="h-4.5 w-4.5" />
        </button>
        <h1 className="text-base font-bold">تعديل بيانات المحل</h1>
      </div>

      <div className="animate-fade-up flex-1 space-y-4 px-5 py-5">
        <div className="rounded-2xl border border-dashed border-black bg-white p-3.5 text-[10px] font-semibold leading-relaxed">
          <p className="flex items-center gap-1.5 text-[11px] font-bold">
            <ShieldAlert className="h-4 w-4" /> تصنيف التعديلات
          </p>
          <p className="mt-1 text-mute">
            ✅ فوري: اسم المحل، العنوان التفصيلي · ⏳ يتطلب موافقة الإدارة: رقم الهاتف (مع OTP)، الموقع الجغرافي، نوع النشاط، اسم المالك
          </p>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold">اسم المحل <span className="badge bg-black text-white">فوري</span></label>
          <input className="field" placeholder="اسم المحل الحالي" />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold">العنوان التفصيلي <span className="badge bg-black text-white">فوري</span></label>
          <input className="field" placeholder="العنوان الحالي" />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold">رقم الهاتف <span className="badge bg-faint text-white">⏳ OTP + موافقة</span></label>
          <div className="flex" dir="ltr">
            <span className="flex items-center rounded-l-2xl border border-r-0 border-line bg-white px-3 text-sm font-semibold text-mute">+964</span>
            <input className="field rounded-l-none" placeholder="7XX XXX XXXX" inputMode="tel" />
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold">نوع النشاط <span className="badge bg-faint text-white">⏳ موافقة</span></label>
          <select className="field cursor-pointer" defaultValue="">
            <option value="" disabled>النوع الحالي</option>
            {types.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold">اسم صاحب المحل <span className="badge bg-faint text-white">⏳ موافقة</span></label>
          <input className="field" placeholder="الاسم الحالي" />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold">الموقع الجغرافي <span className="badge bg-faint text-white">⏳ موافقة</span></label>
          <div
            className="relative h-44 overflow-hidden rounded-3xl border border-line"
            style={{
              backgroundImage:
                'linear-gradient(#e6e6e6 1px, transparent 1px), linear-gradient(90deg, #e6e6e6 1px, transparent 1px)',
              backgroundSize: '28px 28px',
              backgroundColor: '#fafafa',
            }}
          >
            <button onClick={() => setMovedPin(true)} className="absolute inset-0 flex flex-col items-center justify-center gap-2">
              <MapPin className={`h-9 w-9 transition-all ${movedPin ? 'scale-110 fill-black text-black' : 'text-faint'}`} strokeWidth={1.5} />
              <span className="rounded-full bg-white/90 px-3 py-1 text-[11px] font-bold shadow-sm">
                {movedPin ? '✓ تم تحديث موضع الدبوس' : 'اضغط لتحريك دبوس الموقع'}
              </span>
            </button>
          </div>
        </div>
      </div>

      <div className="border-t border-line bg-white px-5 py-4">
        <button className="btn-primary w-full" disabled={loading} onClick={() => (movedPin ? setConfirm(true) : save())}>
          {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> جاري الحفظ...</> : 'حفظ التغييرات'}
        </button>
      </div>

      {confirm && (
        <Modal title="تغيير موقع المحل؟" onClose={() => setConfirm(false)}>
          <p className="mt-2 text-xs leading-relaxed text-mute">
            هل تريد تغيير موقع محلك؟ قد يتغير تصنيف المنطقة وأجرة التوصيل. سيُرسل التعديل للمراجعة الإدارية للتأكد من منطقة Geofencing.
          </p>
          <div className="mt-5 flex gap-2">
            <button className="btn-primary flex-1" onClick={save}>تأكيد</button>
            <button className="btn-secondary flex-1" onClick={() => setConfirm(false)}>إلغاء</button>
          </div>
        </Modal>
      )}

      {node}
    </div>
  )
}
