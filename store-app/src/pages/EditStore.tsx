import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2, ShieldAlert, Smartphone } from 'lucide-react'
import Header from '../components/Header'
import Modal from '../components/Modal'
import OTPInput from '../components/OTPInput'
import Countdown from '../components/Countdown'
import { useToast } from '../components/Modal'
import { useStore } from '../lib/StoreContext'
import { OTHER_TYPE, businessTypeOptions, rememberBusinessType, zoneFor, isValidIraqiPhone } from '../lib/data'
import { LocationPicker, zoneRing, DEFAULT_CENTER } from '../lib/MapLib'

const badgeInstant = <span className="badge bg-gold text-white">فوري</span>
const badgeReview = <span className="badge bg-gold-soft text-gold-deep">⏳ موافقة الإدارة</span>
const badgeOtp = <span className="badge bg-gold-soft text-gold-deep">⏳ OTP + موافقة</span>

export default function EditStore() {
  const navigate = useNavigate()
  const { profile, updateProfile } = useStore()
  const { toast, node } = useToast()
  const [confirmLocation, setConfirmLocation] = useState(false)
  const [otpOpen, setOtpOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  /* أنواع النشاط: القائمة المعتمدة + ما أضافه المستخدم سابقاً عبر «أخرى» */
  const [typeOptions] = useState(businessTypeOptions)
  const [form, setForm] = useState({
    name: profile?.name ?? '',
    type: (() => {
      const t = profile?.type ?? ''
      return t && !businessTypeOptions().includes(t) ? OTHER_TYPE : t
    })(),
    phone: profile?.phone ?? '',
    owner: profile?.owner ?? '',
    address: profile?.address ?? '',
  })
  const [customType, setCustomType] = useState(() => {
    const t = profile?.type ?? ''
    return t && !businessTypeOptions().includes(t) ? t : ''
  })
  const [loc, setLoc] = useState(profile?.location ?? DEFAULT_CENTER)
  const [locMoved, setLocMoved] = useState(false)

  const zone = zoneFor(loc)

  const save = (sensitiveApplied = false) => {
    setLoading(true)
    setTimeout(() => {
      /* التعديلات البسيطة تُطبق فوراً */
      updateProfile({ name: form.name.trim() || profile?.name, address: form.address.trim() || profile?.address })
      /* التعديلات الحساسة تُرسل للمراجعة */
      /* «أخرى»: نوع النشاط المكتوب يدوياً يُحفظ ليعيد الظهور في القائمة */
      if (form.type === OTHER_TYPE) rememberBusinessType(customType)
      const resolvedType = form.type === OTHER_TYPE ? customType.trim() : form.type
      const sensitiveChanged = resolvedType !== profile?.type || form.owner !== profile?.owner || locMoved
      if (sensitiveChanged) {
        updateProfile(
          {
            type: resolvedType,
            owner: form.owner,
            location: locMoved ? loc : profile?.location ?? undefined,
          },
          { sensitive: true },
        )
      }
      setLoading(false)
      if (sensitiveApplied) {
        toast('تم إرسال التعديلات للمراجعة الإدارية ⏳')
      } else {
        toast(sensitiveChanged ? 'تم التحديث فوراً وإرسال الحساسة للمراجعة ⏳' : 'تم تحديث البيانات بنجاح ✅')
      }
      setTimeout(() => navigate(-1), 1600)
    }, 900)
  }

  const applyPhoneChange = () => {
    updateProfile({ phone: form.phone }, { sensitive: true })
    setOtpOpen(false)
    toast('تم إرسال رقم الهاتف الجديد لموافقة الإدارة ⏳')
  }

  return (
    <div className="app-shell">
      <Header title="تعديل بيانات المحل" to="/profile" />

      <div className="animate-fade-up flex-1 space-y-4 px-5 py-5">
        <div className="rounded-2xl border border-dashed border-gold bg-gold-faint p-3.5 text-[10px] font-bold leading-relaxed text-gold-deep">
          <p className="flex items-center gap-1.5 text-[11px] font-extrabold">
            <ShieldAlert className="h-4 w-4" /> تصنيف التعديلات
          </p>
          <p className="mt-1">
            ✅ فوري: اسم المحل، العنوان التفصيلي · ⏳ يتطلب موافقة الإدارة: رقم الهاتف (مع OTP)، الموقع الجغرافي، نوع النشاط، اسم المالك
          </p>
        </div>

        <div>
          <label className="mb-1.5 flex items-center justify-between text-xs font-bold">
            اسم المحل {badgeInstant}
          </label>
          <input className="field" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
        </div>
        <div>
          <label className="mb-1.5 flex items-center justify-between text-xs font-bold">
            العنوان التفصيلي {badgeInstant}
          </label>
          <input className="field" value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} />
        </div>
        <div>
          <label className="mb-1.5 flex items-center justify-between text-xs font-bold">
            رقم الهاتف {badgeOtp}
          </label>
          <div className="flex gap-2">
            <div className="flex flex-1" dir="ltr">
              <span className="flex items-center rounded-l-2xl border border-r-0 border-line bg-gold-faint px-3 text-sm font-bold text-gold-deep">+964</span>
              <input
                className="field rounded-l-none"
                placeholder="7XX XXX XXXX"
                inputMode="tel"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              />
            </div>
            <button
              className="btn-ghost shrink-0 !px-3.5"
              disabled={form.phone === profile?.phone}
              onClick={() => {
                if (!isValidIraqiPhone(form.phone)) {
                  toast('رقم هاتف صحيح مطلوب', 'error')
                  return
                }
                setOtpOpen(true)
              }}
            >
              <Smartphone className="h-4 w-4" /> تحقق
            </button>
          </div>
        </div>
        <div>
          <label className="mb-1.5 flex items-center justify-between text-xs font-bold">
            نوع النشاط {badgeReview}
          </label>
          <select className="field cursor-pointer" value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}>
            <option value="" disabled>
              اختر نوع النشاط
            </option>
            {typeOptions.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
            <option value={OTHER_TYPE}>{OTHER_TYPE} — نوع نشاط آخر</option>
          </select>
          {form.type === OTHER_TYPE && (
            <input
              className="field mt-2"
              placeholder="اكتب نوع النشاط"
              value={customType}
              onChange={(e) => setCustomType(e.target.value)}
            />
          )}
          {form.type === OTHER_TYPE && (
            <p className="mt-1 text-[10px] leading-relaxed text-faint">اكتب الاسم وسيُحفظ مع بياناتك ويظهر في هذه القائمة مرة أخرى.</p>
          )}
        </div>
        <div>
          <label className="mb-1.5 flex items-center justify-between text-xs font-bold">
            اسم صاحب المحل {badgeReview}
          </label>
          <input className="field" value={form.owner} onChange={(e) => setForm((f) => ({ ...f, owner: e.target.value }))} />
        </div>
        <div>
          <label className="mb-1.5 flex items-center justify-between text-xs font-bold">
            الموقع الجغرافي {badgeReview}
          </label>
          <LocationPicker
            value={loc}
            onChange={(pos) => {
              setLoc(pos)
              setLocMoved(true)
            }}
            height={180}
            zones={zone ? [zoneRing(zone.center, zone.radiusKm)] : []}
          />
          {locMoved && (
            <p className={`mt-2 rounded-xl border p-3 text-[11px] font-bold ${zone ? 'border-gold/50 bg-gold-faint text-gold-deep' : 'border-danger/40 bg-danger/5 text-danger'}`}>
              {zone ? `الموقع الجديد في منطقة: ${zone.name} ✅ — سيُعاد حساب تصنيف المنطقة والأجرة بعد الموافقة.` : '⚠️ الموقع الجديد خارج مناطق التغطية — سيُرفض عند المراجعة على الأرجح.'}
            </p>
          )}
        </div>
      </div>

      <div className="border-t border-line bg-white px-5 py-4">
        <button
          className="btn-primary w-full"
          disabled={loading}
          onClick={() => (locMoved ? setConfirmLocation(true) : save())}
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> جاري الحفظ...
            </>
          ) : (
            'حفظ التغييرات'
          )}
        </button>
      </div>

      {/* تأكيد تغيير الموقع */}
      {confirmLocation && (
        <Modal title="تغيير موقع المحل؟" subtitle="قد يتغير تصنيف المنطقة وأجرة التوصيل. سيُرسل التعديل للمراجعة الإدارية للتأكد من منطقة Geofencing." onClose={() => setConfirmLocation(false)}>
          <div className="mt-4 flex gap-2">
            <button
              className="btn-primary flex-1"
              onClick={() => {
                setConfirmLocation(false)
                save(true)
              }}
            >
              تأكيد وإرسال للمراجعة
            </button>
            <button className="btn-secondary flex-1" onClick={() => setConfirmLocation(false)}>
              إلغاء
            </button>
          </div>
        </Modal>
      )}

      {/* OTP لتغيير رقم الهاتف */}
      {otpOpen && (
        <Modal title="التحقق من الرقم الجديد" subtitle={`أدخل رمز التحقق المكون من 4 أرقام المرسل إلى +964 ${form.phone}`} onClose={() => setOtpOpen(false)}>
          <div className="mt-4 space-y-4 text-center">
            <OTPInput length={4} onComplete={applyPhoneChange} />
            <p className="text-[11px] text-faint">
              إعادة إرسال الرمز بعد <Countdown seconds={60} />
            </p>
            <p className="rounded-xl bg-gold-faint p-3 text-[10px] leading-relaxed text-gold-deep">
              بعد التحقق يُرسل الرقم الجديد لموافقة الإدارة قبل اعتماده نهائياً.
            </p>
          </div>
        </Modal>
      )}

      {node}
    </div>
  )
}
