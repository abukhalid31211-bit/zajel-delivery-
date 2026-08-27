import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, Loader2, LocateFixed } from 'lucide-react'
import { useStore } from '../lib/StoreContext'
import { BUSINESS_TYPES, OTHER_TYPE, GOVERNORATES, zoneFor, isValidIraqiPhone } from '../lib/data'
import { LocationPicker, DEFAULT_CENTER, zoneRing } from '../lib/MapLib'
import Stepper from '../components/Stepper'
import type { LatLng } from '../lib/data'

export default function Register() {
  const navigate = useNavigate()
  const { profile, registerStore, resubmit } = useStore()
  const isResubmit = profile?.status === 'rejected'

  const [step, setStep] = useState(1)
  const [type, setType] = useState(() => {
    const t = profile?.type ?? ''
    return t && !BUSINESS_TYPES.includes(t) ? OTHER_TYPE : t
  })
  const [customType, setCustomType] = useState(() => {
    const t = profile?.type ?? ''
    return t && !BUSINESS_TYPES.includes(t) ? t : ''
  })
  const [pinned, setPinned] = useState<LatLng | null>(profile?.location ?? null)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: isResubmit ? profile?.name ?? '' : '',
    phone: isResubmit ? profile?.phone ?? '' : '',
    owner: isResubmit ? profile?.owner ?? '' : '',
    gov: isResubmit ? profile?.governorate ?? '' : '',
    address: isResubmit ? profile?.address ?? '' : '',
    pass: '',
    confirm: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const zone = pinned ? zoneFor(pinned) : null

  const set = (k: string, v: string) => {
    setForm((f) => ({ ...f, [k]: v }))
    setErrors((e) => {
      const n = { ...e }
      delete n[k]
      return n
    })
  }

  const next = () => {
    const errs: Record<string, string> = {}
    if (step === 1) {
      if (!form.name.trim()) errs.name = 'اسم المحل مطلوب'
      if (!type) errs.type = 'نوع النشاط مطلوب'
      else if (type === OTHER_TYPE && !customType.trim()) errs.type = 'يرجى كتابة نوع النشاط'
      if (!form.phone.trim()) errs.phone = 'رقم الهاتف مطلوب'
      else if (!isValidIraqiPhone(form.phone)) errs.phone = 'رقم هاتف صحيح مطلوب'
      if (!form.owner.trim()) errs.owner = 'اسم صاحب المحل مطلوب'
      if (!form.pass) errs.pass = 'كلمة المرور مطلوبة'
      else if (form.pass.length < 6) errs.pass = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'
      if (form.pass !== form.confirm) errs.confirm = 'كلمة المرور غير متطابقة'
    }
    if (step === 2) {
      if (!pinned) errs.map = 'يرجى تحديد موقع المحل على الخريطة'
      if (!form.address.trim()) errs.address = 'العنوان التفصيلي مطلوب'
      if (!form.gov) errs.gov = 'اختر المحافظة'
    }
    setErrors(errs)
    if (Object.keys(errs).length) return
    setStep((s) => s + 1)
    window.scrollTo(0, 0)
  }

  const submit = () => {
    setLoading(true)
    const data = {
      name: form.name.trim(),
      type: type === OTHER_TYPE ? customType.trim() : type,
      phone: form.phone.trim(),
      owner: form.owner.trim(),
      password: form.pass,
      address: form.address.trim(),
      governorate: form.gov,
      location: pinned,
    }
    setTimeout(() => {
      if (isResubmit) resubmit(data)
      else registerStore(data)
      navigate('/pending', { replace: true })
    }, 1100)
  }

  return (
    <div className="app-shell">
      <div className="sticky top-0 z-20 border-b border-line bg-white/95 px-4 py-4 backdrop-blur">
        <div className="flex items-center gap-3">
          <button
            onClick={() => (step > 1 ? setStep(step - 1) : navigate('/welcome'))}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-line"
          >
            <span className="text-sm font-bold">→</span>
          </button>
          <div className="flex-1">
            <h1 className="text-base font-extrabold">{isResubmit ? 'إعادة تقديم طلب التسجيل' : 'تسجيل محل جديد'}</h1>
          </div>
        </div>
        <div className="mt-4">
          <Stepper steps={['بيانات المحل', 'الموقع', 'المراجعة']} current={step} />
        </div>
      </div>

      {isResubmit && profile?.rejectionReason && (
        <div className="border-b border-gold/30 bg-gold-faint px-5 py-3">
          <p className="text-[11px] font-bold leading-relaxed text-gold-deep">
            ⚠️ تم رفض طلبك السابق — السبب: {profile.rejectionReason}. يمكنك تعديل البيانات وإعادة التقديم.
          </p>
        </div>
      )}

      <div className="animate-fade-up flex-1 space-y-4 px-5 py-5" key={step}>
        {step === 1 && (
          <>
            <div>
              <label className="mb-1.5 block text-xs font-bold">اسم المحل / المطعم</label>
              <input className="field" placeholder="اسم المحل / المطعم" value={form.name} onChange={(e) => set('name', e.target.value)} />
              {errors.name && <p className="mt-1 text-[11px] font-bold text-danger">⚠ {errors.name}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold">نوع النشاط التجاري</label>
              <select
                className="field cursor-pointer"
                value={type}
                onChange={(e) => {
                  setType(e.target.value)
                  setErrors((er) => {
                    const n = { ...er }
                    delete n.type
                    return n
                  })
                }}
              >
                <option value="" disabled>
                  اختر نوع النشاط
                </option>
                {BUSINESS_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
                <option value={OTHER_TYPE}>{OTHER_TYPE}</option>
              </select>
              {type === OTHER_TYPE && (
                <input
                  className="field mt-2"
                  placeholder="اكتب نوع النشاط"
                  value={customType}
                  onChange={(e) => {
                    setCustomType(e.target.value)
                    setErrors((er) => {
                      const n = { ...er }
                      delete n.type
                      return n
                    })
                  }}
                />
              )}
              {errors.type && <p className="mt-1 text-[11px] font-bold text-danger">⚠ {errors.type}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold">رقم الهاتف</label>
              <div className="flex" dir="ltr">
                <span className="flex items-center rounded-l-2xl border border-r-0 border-line bg-gold-faint px-3 text-sm font-bold text-gold-deep">+964</span>
                <input className="field rounded-l-none" placeholder="7XX XXX XXXX" inputMode="tel" value={form.phone} onChange={(e) => set('phone', e.target.value)} />
              </div>
              {errors.phone && <p className="mt-1 text-[11px] font-bold text-danger">⚠ {errors.phone}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold">اسم صاحب المحل</label>
              <input className="field" placeholder="الاسم الكامل" value={form.owner} onChange={(e) => set('owner', e.target.value)} />
              {errors.owner && <p className="mt-1 text-[11px] font-bold text-danger">⚠ {errors.owner}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold">كلمة المرور</label>
              <input type="password" className="field" placeholder="6 أحرف على الأقل" value={form.pass} onChange={(e) => set('pass', e.target.value)} />
              {errors.pass && <p className="mt-1 text-[11px] font-bold text-danger">⚠ {errors.pass}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold">تأكيد كلمة المرور</label>
              <input type="password" className="field" placeholder="أعد إدخال كلمة المرور" value={form.confirm} onChange={(e) => set('confirm', e.target.value)} />
              {errors.confirm && <p className="mt-1 text-[11px] font-bold text-danger">⚠ {errors.confirm}</p>}
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div>
              <h2 className="section-title">تحديد موقع المحل</h2>
              <p className="mt-1 text-xs leading-relaxed text-mute">سيتم استخدام الموقع لتحديد منطقة التوصيل وحساب الأجرة تلقائياً</p>
            </div>

            <LocationPicker
              value={pinned ?? DEFAULT_CENTER}
              onChange={(pos) => {
                setPinned(pos)
                setErrors((e) => {
                  const n = { ...e }
                  delete n.map
                  return n
                })
              }}
              height={250}
              zones={zone ? [zoneRing(zone.center, zone.radiusKm)] : []}
            >
              <div className="pointer-events-none absolute bottom-3 right-3 z-[500]">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    navigator.geolocation?.getCurrentPosition(
                      (pos) => {
                        setPinned({ lat: pos.coords.latitude, lng: pos.coords.longitude })
                      },
                      () => {
                        setErrors((er) => ({ ...er, map: 'لم نتمكن من تحديد موقعك. يرجى تحريك الخريطة يدوياً' }))
                      },
                      { timeout: 8000 },
                    )
                  }}
                  className="pointer-events-auto flex items-center gap-1.5 rounded-xl bg-gold px-3 py-2 text-[11px] font-bold text-white shadow-lg"
                >
                  <LocateFixed className="h-3.5 w-3.5" /> استخدام موقعي الحالي
                </button>
              </div>
            </LocationPicker>

            {errors.map && <p className="text-[11px] font-bold text-danger">⚠ {errors.map}</p>}

            {pinned && (
              <div className={`animate-fade-up rounded-2xl border p-3.5 text-[11px] font-bold leading-relaxed ${zone ? 'border-gold/50 bg-gold-faint text-gold-deep' : 'border-dashed border-danger/50 bg-danger/5 text-danger'}`}>
                {zone ? (
                  <>محلك يقع في منطقة: <b>{zone.name} — {zone.governorate}</b> ✅</>
                ) : (
                  <>⚠️ موقعك خارج المناطق المحددة. تواصل مع الإدارة.</>
                )}
              </div>
            )}

            <div>
              <label className="mb-1.5 block text-xs font-bold">العنوان التفصيلي</label>
              <input className="field" placeholder="المحافظة، المنطقة، اسم الشارع، أقرب نقطة دالة" value={form.address} onChange={(e) => set('address', e.target.value)} />
              {errors.address && <p className="mt-1 text-[11px] font-bold text-danger">⚠ {errors.address}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold">المحافظة</label>
              <select className="field cursor-pointer" value={form.gov} onChange={(e) => set('gov', e.target.value)}>
                <option value="" disabled>
                  {zone ? `تحدد تلقائياً: ${zone.governorate}` : 'اختر المحافظة'}
                </option>
                {GOVERNORATES.map((g) => (
                  <option key={g}>{g}</option>
                ))}
              </select>
              {errors.gov && <p className="mt-1 text-[11px] font-bold text-danger">⚠ {errors.gov}</p>}
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <h2 className="section-title">مراجعة البيانات قبل الإرسال</h2>
            <div className="card divide-y divide-line">
              {[
                ['اسم المحل', form.name],
                ['نوع النشاط', type ? (type === OTHER_TYPE ? customType.trim() : type) : '—'],
                ['رقم الهاتف', `+964 ${form.phone}`],
                ['صاحب المحل', form.owner],
                ['المحافظة', form.gov || '—'],
                ['العنوان التفصيلي', form.address],
                ['منطقة التغطية', zone ? `${zone.name} ✅` : pinned ? 'خارج المناطق ⚠️' : '—'],
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
      </div>

      <div className="border-t border-line bg-white px-5 py-4">
        {step < 3 ? (
          <button className="btn-primary w-full" onClick={next}>
            التالي ←
          </button>
        ) : (
          <button className="btn-primary w-full" onClick={submit} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> جاري إرسال طلبك...
              </>
            ) : (
              <>
                <Check className="h-4 w-4" /> إرسال الطلب ✅
              </>
            )}
          </button>
        )}
      </div>
    </div>
  )
}
