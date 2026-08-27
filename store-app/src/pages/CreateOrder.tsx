import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Loader2, MapPin, CheckCircle2, Truck, Star, Radio } from 'lucide-react'
import { useStore, type CreateOrderInput } from '../lib/StoreContext'
import { feeFor, zoneFor, isValidIraqiPhone, fmtIQD, type LatLng, type Captain } from '../lib/data'
import { LocationPicker, DEFAULT_CENTER, zoneRing } from '../lib/MapLib'
import Stepper from '../components/Stepper'
import Toggle from '../components/Toggle'
import Modal from '../components/Modal'

const emptyDraft: CreateOrderInput = {
  name: '', phone: '', notes: '', address: '', district: '', location: DEFAULT_CENTER, value: 0, orderNotes: '',
}

export default function CreateOrder() {
  const navigate = useNavigate()
  const { profile, orders, draft, saveDraft, createOrder } = useStore()
  const [step, setStep] = useState(1)
  const [pinned, setPinned] = useState<LatLng>(draft?.location ?? DEFAULT_CENTER)
  const [locationLocked, setLocationLocked] = useState(!!draft?.location)
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState<{ id: string } | null>(null)
  const [preferCaptain, setPreferCaptain] = useState(!!draft?.preferredCaptainId)
  const [restored, setRestored] = useState(!!draft)
  const [offlineWarn, setOfflineWarn] = useState(false)
  const restoredRef = useRef(false)
  const [form, setForm] = useState<CreateOrderInput>(draft ?? emptyDraft)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (restoredRef.current) return
    restoredRef.current = true
    if (draft) {
      setForm(draft)
      setStep(1)
      const t = setTimeout(() => setRestored(false), 5000)
      return () => clearTimeout(t)
    }
  }, [draft])

  /* حفظ المسودة تلقائياً (استعادة بعد انتهاء الجلسة — القسم 2.7) */
  useEffect(() => {
    const hasData = !!(form.name || form.phone || form.notes || form.address || form.value || form.orderNotes)
    saveDraft(hasData ? form : null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form])

  const set = (k: keyof CreateOrderInput, v: string | number | LatLng) => {
    setForm((f) => ({ ...f, [k]: v }))
    setErrors((e) => {
      const n = { ...e }
      delete n[k]
      return n
    })
  }

  const zone = zoneFor(pinned)
  const storePos = profile?.location ?? DEFAULT_CENTER
  const fee = zone ? feeFor(storePos, pinned) : null

  /* آخر 5 كباتن تعامل معهم المحل (من سجل الطلبات الفعلي) */
  const pastCaptains = (() => {
    const seen = new Map<string, Captain>()
    for (const o of orders) {
      if (o.captain && !seen.has(o.captain.id) && seen.size < 5) seen.set(o.captain.id, o.captain)
    }
    return [...seen.values()]
  })()

  const next = () => {
    const errs: Record<string, string> = {}
    if (step === 1) {
      if (!form.name.trim()) errs.name = 'اسم الزبون مطلوب'
      if (!form.phone.trim()) errs.phone = 'رقم هاتف صحيح مطلوب'
      else if (!isValidIraqiPhone(form.phone)) errs.phone = 'رقم هاتف صحيح مطلوب'
    }
    if (step === 2) {
      if (!locationLocked) errs.map = 'يرجى تحديد موقع التوصيل وتأكيده'
      if (!form.address.trim()) errs.address = 'العنوان التفصيلي مطلوب'
      if (!zone) errs.zone = 'يرجى تحديد منطقة التوصيل'
    }
    setErrors(errs)
    if (Object.keys(errs).length) return
    setStep((s) => s + 1)
    window.scrollTo(0, 0)
  }

  const submit = () => {
    const errs: Record<string, string> = {}
    if (!form.value || form.value <= 0) errs.value = 'قيمة الطلب مطلوبة'
    setErrors(errs)
    if (Object.keys(errs).length) return

    setLoading(true)
    setTimeout(() => {
      const order = createOrder({
        ...form,
        value: Number(form.value),
        location: pinned,
        district: zone?.name ?? '',
        preferredCaptainId: preferCaptain ? form.preferredCaptainId : undefined,
      })
      setLoading(false)
      setSent({ id: order.id })
      saveDraft(null)
    }, 1200)
  }

  if (sent) {
    return (
      <div className="app-shell items-center justify-center px-8 text-center">
        <div className="animate-fade-up flex flex-col items-center gap-5">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gold text-white shadow-lg shadow-gold/30">
            <CheckCircle2 className="h-12 w-12" strokeWidth={1.4} />
          </div>
          <div>
            <h1 className="text-xl font-extrabold">تم إرسال الطلب بنجاح!</h1>
            <p className="mt-1 text-sm font-extrabold text-gold-strong">رقم الطلب: {sent.id}</p>
            <p className="mt-2 max-w-72 text-[13px] leading-relaxed text-mute">
              جاري البحث عن كابتن قريب... سيتم إشعارك فور قبول كابتن لطلبك.
            </p>
          </div>
          <span className="badge bg-gold-soft text-gold-deep">🟡 بانتظار كابتن</span>
          <div className="mt-4 w-full space-y-3">
            <button className="btn-primary w-full" onClick={() => navigate(`/track?id=${sent.id}`)}>
              📋 متابعة الطلب
            </button>
            <button className="btn-secondary w-full" onClick={() => navigate('/home')}>
              🏠 العودة للرئيسية
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="app-shell">
      <div className="sticky top-0 z-20 border-b border-line bg-white/95 px-4 py-4 backdrop-blur">
        <div className="flex items-center gap-3">
          <button
            onClick={() => (step > 1 ? setStep(step - 1) : navigate('/home'))}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-line"
          >
            <ArrowRight className="h-4.5 w-4.5" />
          </button>
          <h1 className="flex-1 text-base font-extrabold">إنشاء طلبية توصيل جديدة</h1>
        </div>
        <div className="mt-4">
          <Stepper steps={['بيانات الزبون', 'موقع التوصيل', 'المبلغ والمراجعة']} current={step} />
        </div>
      </div>

      {restored && (
        <div className="border-b border-gold/30 bg-gold-faint px-5 py-3">
          <p className="text-[11px] font-bold leading-relaxed text-gold-deep">
            ✅ تم استعادة بياناتك المحفوظة. أكمل من حيث توقفت.
          </p>
        </div>
      )}

      <div className="animate-fade-up flex-1 space-y-4 px-5 py-5" key={step}>
        {step === 1 && (
          <>
            <div>
              <label className="mb-1.5 block text-xs font-bold">اسم الزبون *</label>
              <input className="field" placeholder="اسم الزبون الكامل" value={form.name} onChange={(e) => set('name', e.target.value)} />
              {errors.name && <p className="mt-1 text-[11px] font-bold text-danger">⚠ {errors.name}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold">رقم هاتف الزبون *</label>
              <div className="flex" dir="ltr">
                <span className="flex items-center rounded-l-2xl border border-r-0 border-line bg-gold-faint px-3 text-sm font-bold text-gold-deep">+964</span>
                <input className="field rounded-l-none" placeholder="7XX XXX XXXX" inputMode="tel" value={form.phone} onChange={(e) => set('phone', e.target.value)} />
              </div>
              {errors.phone && <p className="mt-1 text-[11px] font-bold text-danger">⚠ {errors.phone}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold">ملاحظات الوصول (اختياري)</label>
              <textarea
                className="field min-h-24 resize-none"
                placeholder="الطابق، رقم الشقة، توجيهات الدخول..."
                value={form.notes}
                onChange={(e) => set('notes', e.target.value)}
              />
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div>
              <h2 className="section-title">موقع التوصيل</h2>
              <p className="mt-1 text-xs leading-relaxed text-mute">حرّك الخريطة لوضع الدبوس على موقع التوصيل — المنطقة والأجرة تُحددان تلقائياً</p>
            </div>

            {!locationLocked ? (
              <LocationPicker
                value={pinned}
                onChange={(pos) => setPinned(pos)}
                height={250}
                zones={zone ? [zoneRing(zone.center, zone.radiusKm)] : []}
                gps={pinned === DEFAULT_CENTER}
              />
            ) : (
              <div className="relative">
                <LocationPicker value={pinned} locked height={200} zones={zone ? [zoneRing(zone.center, zone.radiusKm)] : []} />
                <div className="absolute inset-x-0 bottom-0 rounded-b-[18px] bg-gradient-to-t from-ink/70 to-transparent p-3 text-center text-[11px] font-bold text-white">
                  ✓ الموقع مؤكد — اضغط "تعديل الموقع" لتغييره
                </div>
              </div>
            )}
            {errors.map && <p className="text-[11px] font-bold text-danger">⚠ {errors.map}</p>}

            {/* بطاقة تأكيد الموقع (5.2.1) */}
            {pinned && !locationLocked && (
              <div className="card animate-fade-up space-y-2 p-4">
                <p className="flex items-center gap-1.5 text-xs font-extrabold">
                  <MapPin className="h-4 w-4 text-gold" /> الموقع المحدد
                </p>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-mute">منطقة التوصيل</span>
                  <span className="font-bold">{zone ? `${zone.name} — ${zone.governorate}` : 'خارج مناطق التغطية ⚠️'}</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-mute">أجرة التوصيل</span>
                  <span className="font-extrabold text-gold-strong">{fee ? fmtIQD(fee) : '⚠️ لم يتم تحديد أجرة التوصيل'}</span>
                </div>
                <div className="flex gap-2 pt-1">
                  <button
                    className="flex-1 rounded-xl border border-gold bg-white py-2.5 text-[11px] font-bold text-gold-strong"
                    onClick={() => setPinned(pinned)}
                  >
                    تعديل الموقع
                  </button>
                  <button
                    className="flex-1 rounded-xl bg-gold py-2.5 text-[11px] font-bold text-white disabled:bg-line"
                    disabled={!zone}
                    onClick={() => {
                      setLocationLocked(true)
                      setErrors((e) => {
                        const n = { ...e }
                        delete n.map
                        delete n.zone
                        return n
                      })
                    }}
                  >
                    تأكيد الموقع ✅
                  </button>
                </div>
              </div>
            )}
            {pinned && locationLocked && (
              <div className="card space-y-1.5 border-gold/40 p-4">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-mute">منطقة التوصيل</span>
                  <span className="font-bold">{zone ? `${zone.name} ✅` : 'غير محددة'}</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-mute">أجرة التوصيل</span>
                  <span className="font-extrabold text-gold-strong">{fee ? fmtIQD(fee) : '—'}</span>
                </div>
                <button className="w-full text-center text-[11px] font-bold text-gold-strong" onClick={() => setLocationLocked(false)}>
                  تعديل الموقع
                </button>
              </div>
            )}
            {errors.zone && <p className="text-[11px] font-bold text-danger">⚠ {errors.zone}</p>}

            <div>
              <label className="mb-1.5 block text-xs font-bold">العنوان التفصيلي للتوصيل *</label>
              <input className="field" placeholder="المنطقة، الشارع، أقرب نقطة دالة" value={form.address} onChange={(e) => set('address', e.target.value)} />
              {errors.address && <p className="mt-1 text-[11px] font-bold text-danger">⚠ {errors.address}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold">المنطقة</label>
              <div className="rounded-2xl border border-line bg-gold-faint px-4 py-3 text-xs font-bold text-gold-deep">
                {zone ? `${zone.name} — تُحدد تلقائياً من Geofencing` : 'تُحدد تلقائياً من Geofencing أو يدوياً'}
              </div>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <div>
              <label className="mb-1.5 block text-xs font-bold">قيمة الطلبية (دينار عراقي) *</label>
              <input
                className="field"
                placeholder="0"
                inputMode="numeric"
                dir="ltr"
                value={form.value ? String(form.value) : ''}
                onChange={(e) => set('value', Number(e.target.value.replace(/[^\d]/g, '')))}
              />
              <p className="mt-1 text-[10px] text-faint">هذا المبلغ سيدفعه الكابتن لك نقداً (كاش) فور استلام الطلبية</p>
              {errors.value && <p className="mt-1 text-[11px] font-bold text-danger">⚠ {errors.value}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold">ملاحظات الطلب (اختياري)</label>
              <textarea
                className="field min-h-20 resize-none"
                placeholder="أي تفاصيل إضافية عن الطلب..."
                value={form.orderNotes}
                onChange={(e) => set('orderNotes', e.target.value)}
              />
            </div>

            {/* طلب كابتن محدد */}
            <div className="card p-4">
              <button onClick={() => setPreferCaptain((v) => !v)} className="flex w-full items-center justify-between">
                <span className="text-xs font-extrabold">🔘 طلب كابتن محدد (اختياري)</span>
                <Toggle checked={preferCaptain} onChange={setPreferCaptain} />
              </button>
              {preferCaptain && (
                <div className="animate-fade-up mt-3">
                  {pastCaptains.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-line-strong p-4 text-center">
                      <p className="text-[11px] font-bold">لا يوجد كباتن سابقون بعد</p>
                      <p className="mt-1 text-[10px] leading-relaxed text-mute">
                        تظهر هنا قائمة آخر 5 كباتن تعاملت معهم مع تقييمهم وحالة اتصالهم. سيُرسل طلبك للطابور العام.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {pastCaptains.map((c) => {
                        const selected = form.preferredCaptainId === c.id
                        return (
                          <button
                            key={c.id}
                            onClick={() => {
                              set('preferredCaptainId', c.id)
                              setOfflineWarn(!c.online)
                            }}
                            className={`flex w-full items-center gap-3 rounded-xl border p-3 text-right transition-all ${
                              selected ? 'border-gold bg-gold-faint' : 'border-line bg-white'
                            }`}
                          >
                            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gold-soft text-xs font-extrabold text-gold-deep">
                              {c.name.charAt(0)}
                            </span>
                            <span className="flex-1">
                              <span className="block text-xs font-extrabold">{c.name}</span>
                              <span className="mt-0.5 flex items-center gap-1 text-[10px] text-mute">
                                <Star className="h-3 w-3 fill-gold text-gold" /> {c.rating} · {c.vehicle}
                              </span>
                            </span>
                            <span className={`flex items-center gap-1 text-[10px] font-bold ${c.online ? 'text-success' : 'text-danger'}`}>
                              <Radio className="h-3 w-3" /> {c.online ? 'متاح 🟢' : 'غير متاح 🔴'}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ملخص الطلب */}
            <div className="card divide-y divide-line">
              <p className="px-4 py-3 text-xs font-extrabold">ملخص الطلب</p>
              {[
                ['الزبون', form.name || '—'],
                ['الهاتف', form.phone ? `+964 ${form.phone}` : '—'],
                ['ملاحظات الوصول', form.notes || '—'],
                ['موقع التوصيل', form.address || '—'],
                ['المنطقة', zone?.name ?? '—'],
                ['موقع المحل', profile?.address ?? '—'],
                ['قيمة الطلبية', form.value ? fmtIQD(Number(form.value)) : '—'],
                ['أجرة التوصيل', fee ? fmtIQD(fee) : '—'],
              ].map(([k, v]) => (
                <div key={k} className="flex items-center justify-between gap-3 px-4 py-2.5">
                  <span className="shrink-0 text-[11px] text-mute">{k}</span>
                  <span className="truncate text-[11px] font-bold">{v}</span>
                </div>
              ))}
              <div className="flex items-center justify-between gap-3 bg-gold-faint px-4 py-3">
                <span className="text-xs font-extrabold">الإجمالي الذي يدفعه الزبون</span>
                <span className="text-sm font-extrabold text-gold-strong">
                  {form.value && fee ? fmtIQD(Number(form.value) + fee) : '—'}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3 px-4 py-3">
                <span className="text-[11px] text-mute">المبلغ الذي سيدفعه الكابتن للمحل</span>
                <span className="text-xs font-bold">{form.value ? fmtIQD(Number(form.value)) : '—'}</span>
              </div>
            </div>
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
                <Loader2 className="h-4 w-4 animate-spin" /> جاري إنشاء الطلب والبحث عن كابتن...
              </>
            ) : (
              <>
                <Truck className="h-5 w-5" /> إرسال الطلبية وطلب كابتن زاجل
              </>
            )}
          </button>
        )}
      </div>

      {/* تنبيه كابتن غير متصل */}
      {offlineWarn && (
        <Modal
          title="الكابتن غير متصل حالياً"
          subtitle="الكابتن المحدد غير متصل الآن. هل تريد إرسال الطلب للطابور العام لجميع الكباتن القريبين؟"
          onClose={() => setOfflineWarn(false)}
        >
          <div className="mt-4 flex gap-2">
            <button
              className="btn-primary flex-1"
              onClick={() => {
                set('preferredCaptainId', '')
                setOfflineWarn(false)
              }}
            >
              نعم — أرسل للطابور العام
            </button>
            <button
              className="btn-secondary flex-1"
              onClick={() => {
                set('preferredCaptainId', '')
                setPreferCaptain(false)
                setOfflineWarn(false)
              }}
            >
              إلغاء الاختيار
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}
