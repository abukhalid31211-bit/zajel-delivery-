import { useNavigate } from 'react-router-dom'
import { ArrowRight, Star, TriangleAlert, Headphones, BadgeCheck, Camera } from 'lucide-react'

/** تفاصيل الطلب المكتمل من منظور المحل */
export default function OrderDetails() {
  const navigate = useNavigate()
  return (
    <div className="app-shell">
      <div className="flex items-center gap-3 border-b border-line bg-white px-4 py-4">
        <button onClick={() => navigate(-1)} className="flex h-9 w-9 items-center justify-center rounded-xl border border-line">
          <ArrowRight className="h-4.5 w-4.5" />
        </button>
        <div>
          <h1 className="text-base font-bold">تفاصيل الطلب #—</h1>
          <span className="badge mt-0.5 bg-black text-white">🟢 مكتمل</span>
        </div>
      </div>

      <div className="animate-fade-up flex-1 space-y-4 px-5 py-5">
        <div className="card divide-y divide-line">
          <p className="px-4 py-3 text-xs font-bold">الملخص</p>
          {[
            ['تاريخ الإنشاء', '—'],
            ['تاريخ التسليم', '—'],
            ['المدة الكلية', '— دقيقة'],
          ].map(([k, v]) => (
            <div key={k} className="flex items-center justify-between px-4 py-2.5">
              <span className="text-[11px] text-mute">{k}</span>
              <span className="text-[11px] font-bold">{v}</span>
            </div>
          ))}
        </div>

        <div className="card divide-y divide-line">
          <p className="px-4 py-3 text-xs font-bold">بيانات الزبون والكابتن</p>
          {[
            ['الزبون', '—'],
            ['هاتف الزبون', '—'],
            ['عنوان التوصيل', '—'],
            ['الكابتن', '—'],
            ['تقييم الكابتن', '— ⭐'],
          ].map(([k, v]) => (
            <div key={k} className="flex items-center justify-between px-4 py-2.5">
              <span className="text-[11px] text-mute">{k}</span>
              <span className="text-[11px] font-bold">{v}</span>
            </div>
          ))}
        </div>

        <div className="card divide-y divide-line">
          <p className="px-4 py-3 text-xs font-bold">المبالغ</p>
          {[
            ['قيمة الطلبية', '— د.ع'],
            ['أجرة التوصيل', '— د.ع'],
            ['الإجمالي من الزبون', '— د.ع'],
          ].map(([k, v]) => (
            <div key={k} className="flex items-center justify-between px-4 py-2.5">
              <span className="text-[11px] text-mute">{k}</span>
              <span className="text-[11px] font-bold">{v}</span>
            </div>
          ))}
        </div>

        <div className="card p-4">
          <p className="flex items-center gap-2 text-xs font-bold">
            <BadgeCheck className="h-4 w-4" /> إثبات التسليم
          </p>
          <div className="mt-3 flex gap-2">
            <div className="flex-1 rounded-xl border border-line p-3 text-center">
              <p className="text-[10px] text-mute">نوع الإثبات</p>
              <p className="mt-1 text-xs font-bold">OTP ✅ / صورة 📷</p>
            </div>
            <div className="flex flex-1 flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-line p-3">
              <Camera className="h-4 w-4 text-faint" />
              <p className="text-[10px] text-faint">صورة الإثبات تُعرض هنا (Lightbox)</p>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <p className="mb-3 text-xs font-bold">سجل الطلب الكامل (Timeline)</p>
          <p className="text-[11px] leading-relaxed text-mute">
            يعرض التسلسل الزمني الكامل: الإنشاء ← قبول الكابتن ← الوصول ← الاستلام ← التسليم، مع وقت كل مرحلة.
          </p>
        </div>
      </div>

      <div className="space-y-2.5 border-t border-line bg-white px-5 py-4">
        <button className="btn-primary w-full" onClick={() => navigate('/rate-captain')}>
          <Star className="h-4 w-4" /> ⭐ تقييم كابتن زاجل
        </button>
        <div className="grid grid-cols-2 gap-2">
          <button className="btn-secondary" onClick={() => navigate('/complaints/new')}>
            <TriangleAlert className="h-4 w-4" /> تقديم شكوى
          </button>
          <a href="tel:+964" className="btn-secondary">
            <Headphones className="h-4 w-4" /> الدعم
          </a>
        </div>
      </div>
    </div>
  )
}
