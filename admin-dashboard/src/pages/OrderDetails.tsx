import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MapPin, Printer, RefreshCcw, X, Store, User, Bike } from 'lucide-react'
import Modal from '../components/Modal'
import { useToast } from '../components/Toast'
import EmptyState from '../components/EmptyState'

const stages = ['طلب جديد', 'انتظار كابتن', 'قبول', 'متوجه', 'وصل المحل', 'استلام', 'بالطريق', 'تسليم', 'مكتمل']

export default function OrderDetails() {
  const { toast, node } = useToast()
  const [modal, setModal] = useState<'reassign' | 'cancel' | null>(null)
  const [assignMode, setAssignMode] = useState<'auto' | 'manual'>('auto')
  const [reason, setReason] = useState('')

  return (
    <div>
      {/* breadcrumb + header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-[11px] text-faint">
            <Link to="/orders" className="hover:text-black">الطلبيات</Link>
            <span>›</span>
            <span className="font-semibold text-black">#—</span>
          </div>
          <h1 className="mt-1 text-xl font-bold tracking-tight">تفاصيل الطلب #—</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="btn-ghost" onClick={() => window.print()}>
            <Printer className="h-4 w-4" /> طباعة الطلب
          </button>
          <button className="btn-secondary" onClick={() => setModal('reassign')}>
            <RefreshCcw className="h-4 w-4" /> إعادة تعيين الكابتن
          </button>
          <button className="btn-primary" onClick={() => setModal('cancel')}>
            <X className="h-4 w-4" /> إلغاء الطلب
          </button>
        </div>
      </div>

      {/* progress bar */}
      <div className="card mb-5 p-5">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {stages.map((s, i) => (
            <div key={s} className="flex min-w-16 flex-1 flex-col items-center gap-1.5">
              <div className={`h-2 w-full rounded-full ${i === 0 ? 'bg-black' : 'bg-line'}`} />
              <span className={`whitespace-nowrap text-[10px] font-semibold ${i === 0 ? 'text-black' : 'text-faint'}`}>{s}</span>
            </div>
          ))}
        </div>
      </div>

      {/* info columns */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="card p-5">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-bold">📦 بيانات الطلب</h2>
          <div className="divide-y divide-line text-xs">
            {[
              ['رقم الطلب', '#—'],
              ['تاريخ ووقت الإنشاء', '—'],
              ['الحالة الحالية', 'طلب جديد'],
              ['قيمة الطلب', '— د.ع'],
              ['أجرة التوصيل', '— د.ع'],
              ['الملاحظات', '—'],
            ].map(([k, v]) => (
              <div key={k} className="flex items-center justify-between py-2.5">
                <span className="text-mute">{k}</span>
                <span className="font-bold">{v}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-5">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-bold">
            <Store className="h-4 w-4" /> بيانات المحل
          </h2>
          <div className="divide-y divide-line text-xs">
            {[
              ['اسم المحل', '—'],
              ['رقم الهاتف', '—'],
              ['العنوان', '—'],
              ['المنطقة', '—'],
            ].map(([k, v]) => (
              <div key={k} className="flex items-center justify-between py-2.5">
                <span className="text-mute">{k}</span>
                <span className="font-bold">{v}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-5">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-bold">
            <User className="h-4 w-4" /> بيانات الزبون
          </h2>
          <div className="divide-y divide-line text-xs">
            {[
              ['اسم الزبون', '—'],
              ['رقم الهاتف', '—'],
              ['عنوان التوصيل', '—'],
              ['ملاحظات الوصول', '—'],
            ].map(([k, v]) => (
              <div key={k} className="flex items-center justify-between py-2.5">
                <span className="text-mute">{k}</span>
                <span className="font-bold">{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* captain + map */}
      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="card p-5">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-bold">
            <Bike className="h-4 w-4" /> بطاقة الكابتن
          </h2>
          <EmptyState
            icon={Bike}
            title="لم يُعين كابتن بعد"
            hint="عند التعيين تظهر هنا بيانات الكابتن: الاسم، الهاتف، الشفت وموقعه الحالي المباشر."
          />
        </div>
        <div className="card overflow-hidden lg:col-span-2">
          <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
            <h2 className="flex items-center gap-2 text-sm font-bold">
              <MapPin className="h-4 w-4" /> الخريطة الحية
            </h2>
            <span className="text-[10px] text-faint">📍 المحل · 🏠 التوصيل · 🚚 الكابتن</span>
          </div>
          <div
            className="flex h-72 items-center justify-center"
            style={{
              backgroundImage:
                'linear-gradient(#eee 1px, transparent 1px), linear-gradient(90deg, #eee 1px, transparent 1px)',
              backgroundSize: '32px 32px',
              backgroundColor: '#fafafa',
            }}
          >
            <p className="text-xs font-semibold text-mute">تُعرض المواقع وخط المسار عند ربط مزود الخرائط</p>
          </div>
        </div>
      </div>

      {/* timers + timeline */}
      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="card overflow-hidden">
          <h2 className="border-b border-line px-5 py-4 text-sm font-bold">⏱️ مؤقتات المراحل</h2>
          <div className="overflow-x-auto">
            <table className="w-full min-w-max text-right text-xs">
              <thead>
                <tr className="border-b border-line bg-page/60 text-[11px] text-mute">
                  {['المرحلة', 'وقت البداية', 'وقت النهاية', 'المدة'].map((c) => (
                    <th key={c} className="px-4 py-3 font-semibold">{c}</th>
                  ))}
                </tr>
              </thead>
            </table>
          </div>
          <EmptyState title="لا توجد مراحل مسجلة بعد" hint="تُسجل مدة كل مرحلة تلقائياً مع إجمالي زمن الرحلة." />
        </div>

        <div className="card p-5">
          <h2 className="mb-4 text-sm font-bold">🕐 سجل الطلب الكامل (Timeline)</h2>
          <EmptyState
            title="لا توجد أحداث مسجلة"
            hint="يعرض التسلسل الزمني الكامل لكل حدث: الإنشاء، الإرسال للكابتن، القبول، الوصول، الاستلام (مع صورة)، التسليم (مع إثبات OTP/صورة)."
          />
        </div>
      </div>

      {/* modals */}
      {modal === 'reassign' && (
        <Modal title="إعادة تعيين كابتن للطلب #—" onClose={() => setModal(null)}>
          <p className="mt-1.5 text-xs text-mute">الكابتن الحالي: — · سيتم سحبه وتعيين كابتن جديد.</p>
          <div className="mt-4 space-y-2">
            {(
              [
                ['auto', '🔘 تعيين تلقائي (نظام الطابور الذكي)', 'النظام يختار الكابتن التالي المناسب'],
                ['manual', '🔘 اختيار يدوي', 'كباتن متصلون + داخل الشفت + لم يبلغوا الحد الأقصى + نفس المنطقة'],
              ] as const
            ).map(([val, label, hint]) => (
              <button
                key={val}
                onClick={() => setAssignMode(val)}
                className={`flex w-full items-start gap-3 rounded-xl border p-3.5 text-right transition-all ${assignMode === val ? 'border-black' : 'border-line'}`}
              >
                <span className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ${assignMode === val ? 'border-black' : 'border-line'}`}>
                  {assignMode === val && <span className="h-2 w-2 rounded-full bg-black" />}
                </span>
                <span>
                  <span className="block text-xs font-bold">{label}</span>
                  <span className="mt-0.5 block text-[10px] text-mute">{hint}</span>
                </span>
              </button>
            ))}
            {assignMode === 'manual' && (
              <select className="field cursor-pointer text-mute" defaultValue="">
                <option value="" disabled>لا يوجد كباتن متاحون حالياً</option>
              </select>
            )}
            <textarea className="field min-h-16 resize-none" placeholder="سبب إعادة التعيين (مطلوب)" value={reason} onChange={(e) => setReason(e.target.value)} />
          </div>
          <div className="mt-4 flex gap-2">
            <button
              className="btn-primary flex-1"
              disabled={!reason.trim()}
              onClick={() => {
                setModal(null)
                toast('تم إعادة التعيين. جاري البحث عن كابتن... 🔄')
              }}
            >
              تأكيد
            </button>
            <button className="btn-ghost flex-1" onClick={() => setModal(null)}>إلغاء</button>
          </div>
        </Modal>
      )}

      {modal === 'cancel' && (
        <Modal title="إلغاء الطلب #—" onClose={() => setModal(null)}>
          <div className="mt-4 space-y-3">
            <div>
              <label className="mb-1.5 block text-xs font-semibold">سبب الإلغاء</label>
              <select className="field cursor-pointer" defaultValue="">
                <option value="" disabled>اختر السبب</option>
                <option>طلب من المحل</option>
                <option>مشكلة مع الكابتن</option>
                <option>خطأ في البيانات</option>
                <option>أخرى</option>
              </select>
            </div>
            <textarea className="field min-h-16 resize-none" placeholder="تفاصيل إضافية (اختياري)" />
            <div className="flex gap-4 text-xs font-medium">
              <label className="flex items-center gap-1.5">
                <input type="checkbox" defaultChecked className="h-4 w-4 accent-black" /> إشعار المحل
              </label>
              <label className="flex items-center gap-1.5">
                <input type="checkbox" defaultChecked className="h-4 w-4 accent-black" /> إشعار الكابتن
              </label>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              className="btn-primary flex-1"
              onClick={() => {
                setModal(null)
                toast('تم إلغاء الطلب وتسجيله في سجل العمليات')
              }}
            >
              تأكيد الإلغاء
            </button>
            <button className="btn-ghost flex-1" onClick={() => setModal(null)}>رجوع</button>
          </div>
        </Modal>
      )}

      {node}
    </div>
  )
}
