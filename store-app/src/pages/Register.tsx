import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Check, Loader2, MapPin, LocateFixed, Pizza, ShoppingCart, Pill, ShoppingBag } from 'lucide-react'

const types = [
  { icon: Pizza, label: 'مطعم 🍕' },
  { icon: ShoppingCart, label: 'سوبرماركت 🛒' },
  { icon: Pill, label: 'صيدلية 💊' },
  { icon: ShoppingBag, label: 'محل تجاري 🛍️' },
]

const governorates = [
  'بغداد', 'البصرة', 'نينوى', 'أربيل', 'النجف', 'كربلاء', 'كركوك', 'الأنبار', 'ديالى', 'واسط',
  'ميسان', 'ذي قار', 'المثنى', 'القادسية', 'بابل', 'صلاح الدين', 'دهوك', 'السليمانية',
]

export default function Register() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [type, setType] = useState<number | null>(null)
  const [pinned, setPinned] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ name: '', phone: '', owner: '', gov: '', address: '', pass: '', confirm: '' })
  const [error, setError] = useState('')

  const next = () => {
    if (step === 1) {
      if (!form.name || type === null || !form.phone || !form.owner || !form.pass) return setError('يرجى ملء جميع الحقول المطلوبة')
      if (form.pass.length < 6) return setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل')
      if (form.pass !== form.confirm) return setError('كلمة المرور غير متطابقة')
    }
    if (step === 2) {
      if (!pinned) return setError('يرجى تحديد موقع المحل على الخريطة')
      if (!form.address || !form.gov) return setError('يرجى إدخال العنوان التفصيلي واختيار المحافظة')
    }
    setError('')
    setStep((s) => s + 1)
  }

  const submit = () => {
    setLoading(true)
    setTimeout(() => navigate('/pending'), 1200)
  }

  return (
    <div className="app-shell">
      <div className="sticky top-0 z-10 border-b border-line bg-white px-4 py-4">
        <div className="flex items-center gap-3">
          <button onClick={() => (step > 1 ? setStep(step - 1) : navigate('/welcome'))} className="flex h-9 w-9 items-center justify-center rounded-xl border border-line">
            <ArrowRight className="h-4.5 w-4.5" />
          </button>
          <h1 className="text-base font-bold">تسجيل محل جديد</h1>
        </div>
        <div className="mt-4 flex items-center gap-2">
          {['بيانات المحل', 'الموقع', 'المراجعة'].map((label, i) => (
            <div key={label} className="flex flex-1 flex-col items-center gap-1.5">
              <div className={`flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold ${step > i + 1 ? 'bg-black text-white' : step === i + 1 ? 'border-2 border-black bg-white' : 'border border-line bg-white text-faint'}`}>
                {step > i + 1 ? <Check className="h-3.5 w-3.5" /> : i + 1}
              </div>
              <span className={`text-[10px] font-semibold ${step === i + 1 ? 'text-black' : 'text-faint'}`}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="animate-fade-up flex-1 space-y-4 px-5 py-5" key={step}>
        {step === 1 && (
          <>
            <div>
              <label className="mb-1.5 block text-xs font-semibold">اسم المحل / المطعم</label>
              <input className="field" placeholder="مثال: مطعمك أو محلك التجاري" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold">نوع النشاط التجاري</label>
              <div className="grid grid-cols-2 gap-2">
                {types.map((t, i) => (
                  <button
                    key={t.label}
                    type="button"
                    onClick={() => setType(i)}
                    className={`flex items-center gap-2 rounded-2xl border px-3.5 py-3 text-xs font-semibold transition-all ${type === i ? 'border-black bg-black text-white' : 'border-line bg-white text-mute'}`}
                  >
                    <t.icon className="h-4 w-4" /> {t.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold">رقم الهاتف</label>
              <div className="flex" dir="ltr">
                <span className="flex items-center rounded-l-2xl border border-r-0 border-line bg-white px-3 text-sm font-semibold text-mute">+964</span>
                <input className="field rounded-l-none" placeholder="7XX XXX XXXX" inputMode="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold">اسم صاحب المحل</label>
              <input className="field" placeholder="الاسم الكامل" value={form.owner} onChange={(e) => setForm({ ...form, owner: e.target.value })} />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold">كلمة المرور</label>
              <input type="password" className="field" value={form.pass} onChange={(e) => setForm({ ...form, pass: e.target.value })} />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold">تأكيد كلمة المرور</label>
              <input type="password" className="field" value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} />
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h2 className="text-sm font-bold">تحديد موقع المحل</h2>
            <p className="-mt-2 text-xs leading-relaxed text-mute">سيتم استخدام الموقع لتحديد منطقة التوصيل وحساب الأجرة تلقائياً</p>
            {/* map placeholder */}
            <div
              className="relative h-64 overflow-hidden rounded-3xl border border-line"
              style={{
                backgroundImage:
                  'linear-gradient(#e6e6e6 1px, transparent 1px), linear-gradient(90deg, #e6e6e6 1px, transparent 1px)',
                backgroundSize: '28px 28px',
                backgroundColor: '#fafafa',
              }}
            >
              <button
                onClick={() => setPinned(true)}
                className="absolute inset-0 flex flex-col items-center justify-center gap-2"
              >
                <MapPin className={`h-10 w-10 transition-all ${pinned ? 'scale-110 fill-black text-black' : 'text-faint'}`} strokeWidth={1.5} />
                <span className="rounded-full bg-white/90 px-3 py-1 text-[11px] font-bold shadow-sm">
                  {pinned ? '✓ تم تثبيت الموقع' : 'اضغط لتثبيت الدبوس على موقع محلك'}
                </span>
              </button>
              <button
                onClick={() => setPinned(true)}
                className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-xl bg-black px-3 py-2 text-[11px] font-bold text-white shadow-lg"
              >
                <LocateFixed className="h-3.5 w-3.5" /> استخدام موقعي الحالي
              </button>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold">العنوان التفصيلي</label>
              <input className="field" placeholder="المحافظة، المنطقة، اسم الشارع، أقرب نقطة دالة" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold">المحافظة</label>
              <select className="field cursor-pointer" value={form.gov} onChange={(e) => setForm({ ...form, gov: e.target.value })}>
                <option value="" disabled>اختر المحافظة</option>
                {governorates.map((g) => (
                  <option key={g}>{g}</option>
                ))}
              </select>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <h2 className="text-sm font-bold">مراجعة البيانات قبل الإرسال</h2>
            <div className="card divide-y divide-line">
              {[
                ['اسم المحل', form.name],
                ['نوع النشاط', type !== null ? types[type].label : '—'],
                ['رقم الهاتف', `+964 ${form.phone}`],
                ['صاحب المحل', form.owner],
                ['المحافظة', form.gov],
                ['العنوان التفصيلي', form.address],
                ['الموقع على الخريطة', pinned ? 'محدد ✓' : '—'],
              ].map(([k, v]) => (
                <div key={k} className="flex items-center justify-between gap-3 px-4 py-3">
                  <span className="shrink-0 text-xs text-mute">{k}</span>
                  <span className="truncate text-xs font-bold">{v}</span>
                </div>
              ))}
            </div>
            <p className="text-[11px] leading-relaxed text-faint">
              ملاحظة: كل فرع يسجل كحساب مستقل برقم هاتف منفصل. بالضغط على "إرسال الطلب" فأنت توافق على شروط الاستخدام.
            </p>
          </>
        )}

        {error && <p className="rounded-xl border border-black bg-white px-4 py-3 text-xs font-semibold">⚠ {error}</p>}
      </div>

      <div className="border-t border-line bg-white px-5 py-4">
        {step < 3 ? (
          <button className="btn-primary w-full" onClick={next}>
            التالي ←
          </button>
        ) : (
          <button className="btn-primary w-full" onClick={submit} disabled={loading}>
            {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> جاري إرسال طلبك...</> : 'إرسال الطلب ✅'}
          </button>
        )}
      </div>
    </div>
  )
}
