import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Camera, Check, Loader2, X, Bike, Car, Footprints } from 'lucide-react'
import { useCaptain } from '../state'

const docs = [
  'صورة وجه البطاقة الموحدة / الهوية الوطنية',
  'صورة ظهر البطاقة الموحدة / الهوية الوطنية',
  'صورة وجه بطاقة السكن',
  'صورة ظهر بطاقة السكن',
]

const vehicles = [
  { icon: Bike, label: 'دراجة نارية 🏍️' },
  { icon: Car, label: 'سيارة 🚗' },
  { icon: Bike, label: 'دراجة هوائية 🚲' },
  { icon: Footprints, label: 'مشي 🚶' },
]

const governorates = [
  'بغداد', 'البصرة', 'نينوى', 'أربيل', 'النجف', 'كربلاء', 'كركوك', 'الأنبار', 'ديالى', 'واسط',
  'ميسان', 'ذي قار', 'المثنى', 'القادسية', 'بابل', 'صلاح الدين', 'دهوك', 'السليمانية',
]

export default function Register() {
  const navigate = useNavigate()
  const { register } = useCaptain()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [picker, setPicker] = useState<{ index: number; mode: 'camera' | 'gallery' } | null>(null)
  const [previews, setPreviews] = useState<(string | null)[]>([null, null, null, null])
  const [vehicle, setVehicle] = useState(0)
  const [form, setForm] = useState({ name: '', phone: '', gmail: '', gov: '', pass: '', confirm: '' })
  const [error, setError] = useState('')

  const openPicker = (index: number) => setPicker({ index, mode: 'gallery' })

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || picker === null) return
    const url = URL.createObjectURL(file)
    setPreviews((p) => p.map((v, i) => (i === picker.index ? url : v)))
    setPicker(null)
  }

  const removePreview = (index: number) => {
    setPreviews((p) => p.map((v, i) => (i === index ? null : v)))
  }

  const next = () => {
    if (step === 1) {
      if (!form.name.trim() || !form.phone.trim() || !form.gmail.trim() || !form.gov || !form.pass.trim()) return setError('يرجى ملء جميع الحقول المطلوبة')
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.gmail)) return setError('أدخل بريد Gmail صحيح')
      if (form.pass.length < 6) return setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل')
      if (form.pass !== form.confirm) return setError('كلمة المرور غير متطابقة')
      setError('')
      setStep(2)
      return
    }
    if (step === 2 && previews.some((p) => !p)) return setError('يرجى رفع جميع الوثائق الأربع')
    setError('')
    if (step < 3) setStep(3)
  }

  const submit = () => {
    setLoading(true)
    setTimeout(() => {
      const ok = register({
        name: form.name.trim(),
        phone: form.phone.trim(),
        password: form.pass,
        gmail: form.gmail.trim(),
        gov: form.gov,
        vehicle: vehicles[vehicle].label,
        docs: previews.map(Boolean),
      })
      if (!ok) {
        setLoading(false)
        setError('يوجد حساب مسجل بهذا الرقم مسبقاً.')
        return
      }
      navigate('/pending', { replace: true })
    }, 900)
  }

  const strength = !form.pass ? null : form.pass.length < 6 ? 'ضعيفة' : form.pass.length <= 8 ? 'متوسطة' : 'قوية'
  const strengthColor = !form.pass ? '#999' : form.pass.length < 6 ? '#ef4444' : form.pass.length <= 8 ? '#f59e0b' : '#16a34a'

  return (
    <div className="app-shell">
      <div className="sticky top-0 z-10 border-b border-line bg-white px-4 py-4">
        <div className="flex items-center gap-3">
          <button onClick={() => (step > 1 ? setStep(step - 1) : navigate('/welcome'))} className="flex h-9 w-9 items-center justify-center rounded-xl border border-line">
            <ArrowRight className="h-4.5 w-4.5" />
          </button>
          <h1 className="text-base font-bold">إنشاء حساب كابتن</h1>
        </div>
        <div className="mt-4 flex items-center gap-2">
          {['البيانات الشخصية', 'الوثائق', 'المراجعة'].map((label, i) => (
            <div key={label} className="flex flex-1 flex-col items-center gap-1.5">
              <div className={`flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold ${step > i + 1 ? 'bg-gold text-white' : step === i + 1 ? 'border-2 border-gold bg-white' : 'border border-line bg-white text-faint'}`}>
                {step > i + 1 ? <Check className="h-3.5 w-3.5" /> : i + 1}
              </div>
              <span className={`text-[10px] font-semibold ${step === i + 1 ? 'text-gold-dark' : 'text-faint'}`}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="animate-fade-up flex-1 space-y-4 px-5 py-5" key={step}>
        {step === 1 && (
          <>
            <div>
              <label className="mb-1.5 block text-xs font-semibold">الاسم الثلاثي (كما في الهوية)</label>
              <input className="field" placeholder="الاسم الكامل المطابق للهوية" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold">رقم الهاتف</label>
              <div className="flex" dir="ltr">
                <span className="flex items-center rounded-l-2xl border border-r-0 border-line bg-white px-3 text-sm font-semibold text-mute">+964</span>
                <input className="field rounded-l-none" placeholder="7XX XXX XXXX" inputMode="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold">حساب البريد الإلكتروني (Gmail)</label>
              <input className="field" placeholder="example@gmail.com" dir="ltr" value={form.gmail} onChange={(e) => setForm({ ...form, gmail: e.target.value })} />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold">المحافظة التي تعمل بها</label>
              <select className="field cursor-pointer" value={form.gov} onChange={(e) => setForm({ ...form, gov: e.target.value })}>
                <option value="" disabled>اختر محافظة واحدة</option>
                {governorates.map((g) => (
                  <option key={g}>{g}</option>
                ))}
              </select>
              <p className="mt-1 text-[10px] text-faint">تعمل في محافظة واحدة فقط ولا يمكن تغييرها إلا بطلب إداري</p>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold">نوع وسيلة النقل</label>
              <div className="grid grid-cols-2 gap-2">
                {vehicles.map((v, i) => (
                  <button
                    key={v.label}
                    type="button"
                    onClick={() => setVehicle(i)}
                    className={`flex items-center gap-2 rounded-2xl border px-3.5 py-3 text-xs font-semibold transition-all ${vehicle === i ? 'border-gold bg-gold text-white' : 'border-line bg-white text-mute'}`}
                  >
                    <v.icon className="h-4 w-4" /> {v.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold">كلمة المرور</label>
              <input type="password" className="field" value={form.pass} onChange={(e) => setForm({ ...form, pass: e.target.value })} />
              {strength && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-line">
                    <div className="h-full transition-all" style={{ width: form.pass.length < 6 ? '33%' : form.pass.length <= 8 ? '66%' : '100%', background: strengthColor }} />
                  </div>
                  <span className="text-[10px] font-medium text-mute">{strength}</span>
                </div>
              )}
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold">تأكيد كلمة المرور</label>
              <input type="password" className="field" value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} />
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h2 className="text-sm font-bold">رفع الوثائق العراقية المطلوبة</h2>
            <p className="-mt-2 text-xs text-mute">التقط صوراً واضحة للوثائق الأربع التالية:</p>
            {docs.map((d, i) => (
              <div key={d} className={`card relative w-full overflow-hidden p-4 text-right transition-all ${previews[i] ? 'border-gold' : 'border-dashed'}`}>
                {previews[i] ? (
                  <div className="flex flex-col gap-3">
                    <img src={previews[i]!} alt={d} className="h-40 w-full rounded-xl object-cover" />
                    <div className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-2 text-xs font-bold">
                        <Check className="h-4 w-4 text-green-600" /> تم الرفع
                      </span>
                      <button onClick={() => removePreview(i)} className="flex h-8 items-center gap-1 rounded-xl border border-line px-2 text-[10px] font-bold text-mute">
                        <X className="h-3.5 w-3.5" /> حذف وإعادة الرفع
                      </button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => openPicker(i)} className="flex w-full items-center gap-4 text-right">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-page text-faint">
                      <Camera className="h-5 w-5" strokeWidth={1.8} />
                    </span>
                    <span className="flex-1">
                      <span className="block text-xs font-bold leading-relaxed">{d}</span>
                      <span className="mt-0.5 block text-[10px] font-medium text-faint">لم يتم الرفع — اضغط للتقاط صورة أو الاختيار من المعرض</span>
                    </span>
                  </button>
                )}
              </div>
            ))}
          </>
        )}

        {step === 3 && (
          <>
            <h2 className="text-sm font-bold">مراجعة البيانات قبل الإرسال</h2>
            <div className="card divide-y divide-line">
              {[
                ['الاسم الثلاثي', form.name],
                ['رقم الهاتف', `+964 ${form.phone}`],
                ['Gmail', form.gmail],
                ['المحافظة', form.gov],
                ['وسيلة النقل', vehicles[vehicle].label],
                ['الوثائق', `${previews.filter(Boolean).length} / 4 ✓`],
              ].map(([k, v]) => (
                <div key={k} className="flex items-center justify-between px-4 py-3">
                  <span className="text-xs text-mute">{k}</span>
                  <span className="text-xs font-bold">{v}</span>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {previews.map((p, i) => (
                <div key={i} className="card overflow-hidden">
                  <img src={p || ''} alt={`وثيقة ${i + 1}`} className="h-28 w-full object-cover" />
                  <p className="px-2 py-2 text-[9px] font-semibold leading-snug text-mute">{docs[i]}</p>
                </div>
              ))}
            </div>
            <p className="text-[11px] leading-relaxed text-faint">
              بالضغط على "إرسال الطلب" فإنك توافق على شروط الاستخدام وسياسة الخصوصية الخاصة بنظام زاجل ديلفري.
            </p>
          </>
        )}

        {error && <p className="rounded-xl border border-red-200 bg-white px-4 py-3 text-xs font-semibold text-red-600">⚠ {error}</p>}
      </div>

      <div className="border-t border-line bg-white px-5 py-4">
        {step < 3 ? (
          <button className="btn-primary w-full" onClick={next}>
            {step === 2 ? <ArrowRight className="h-4 w-4 rotate-180" /> : null} التالي
          </button>
        ) : (
          <button className="btn-primary w-full" onClick={submit} disabled={loading}>
            {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> جاري إرسال طلبك...</> : 'إرسال الطلب ✅'}
          </button>
        )}
      </div>

      {picker && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center" onClick={() => setPicker(null)}>
          <div className="animate-fade-up mx-auto w-full max-w-[430px] rounded-t-3xl bg-white p-6 sm:rounded-3xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base font-bold">رفع صورة الوثيقة</h3>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <label className="flex cursor-pointer flex-col items-center gap-2 rounded-2xl border border-dashed border-gold py-6 text-xs font-bold">
                <Camera className="h-6 w-6 text-gold-dark" />
                التقاط صورة بالكاميرا
                <input type="file" accept="image/*" capture="environment" className="hidden" onChange={onFile} />
              </label>
              <label className="flex cursor-pointer flex-col items-center gap-2 rounded-2xl border border-dashed border-gold py-6 text-xs font-bold">
                🖼️ اختيار من المعرض
                <input type="file" accept="image/*" className="hidden" onChange={onFile} />
              </label>
            </div>
            <button className="btn-secondary mt-3 w-full" onClick={() => setPicker(null)}>إلغاء</button>
          </div>
        </div>
      )}
    </div>
  )
}
