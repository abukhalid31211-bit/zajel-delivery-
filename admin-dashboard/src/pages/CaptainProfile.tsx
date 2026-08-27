import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  User,
  FileImage,
  CalendarClock,
  Package,
  Star,
  Gauge,
  FileClock,
  MapPin,
  Ban,
  CheckCircle2,
  Phone,
  Camera,
} from 'lucide-react'
import Modal from '../components/Modal'
import { useToast } from '../components/Toast'
import DataTable from '../components/DataTable'
import EmptyState from '../components/EmptyState'

const tabs = [
  { label: 'الوثائق', icon: FileImage },
  { label: 'الشفت والحضور', icon: CalendarClock },
  { label: 'الطلبات', icon: Package },
  { label: 'التقييمات', icon: Star },
  { label: 'مؤشرات الأداء', icon: Gauge },
  { label: 'سجل الإجراءات', icon: FileClock },
  { label: 'المناطق', icon: MapPin },
]

const docs = ['وجه البطاقة الموحدة', 'ظهر البطاقة الموحدة', 'وجه بطاقة السكن', 'ظهر بطاقة السكن']

export default function CaptainProfile() {
  const { toast, node } = useToast()
  const [tab, setTab] = useState(0)
  const [modal, setModal] = useState<'approve' | 'reject' | 'suspend' | null>(null)
  const [suspendMode, setSuspendMode] = useState<'now' | 'after'>('after')
  const [reason, setReason] = useState('')

  return (
    <div>
      <div className="mb-4 flex items-center gap-2 text-[11px] text-faint">
        <Link to="/captains" className="hover:text-black">الكباتن</Link>
        <span>›</span>
        <span className="font-semibold text-black">ملف الكابتن</span>
      </div>

      {/* identity card */}
      <div className="card mb-5 p-5">
        <div className="flex flex-wrap items-center gap-5">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-black text-white">
            <User className="h-9 w-9" strokeWidth={1.4} />
          </div>
          <div className="min-w-40 flex-1">
            <h1 className="text-lg font-bold">— الاسم الثلاثي</h1>
            <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-mute">
              <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" /> +964 —</span>
              <span>Gmail: —</span>
              <span>تاريخ التسجيل: —</span>
              <span>المركبة: 🏍️ دراجة نارية</span>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <span className="badge bg-faint text-white">🟡 بانتظار الموافقة</span>
              <span className="flex items-center gap-1 text-xs font-bold"><Star className="h-3.5 w-3.5 fill-black" /> —</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button className="btn-primary" onClick={() => setModal('approve')}>
              <CheckCircle2 className="h-4 w-4" /> موافقة
            </button>
            <button className="btn-secondary" onClick={() => setModal('reject')}>❌ رفض</button>
            <button className="btn-ghost" onClick={() => setModal('suspend')}>
              <Ban className="h-4 w-4" /> إيقاف
            </button>
          </div>
        </div>
      </div>

      {/* tabs */}
      <div className="mb-5 flex flex-wrap gap-2">
        {tabs.map((t, i) => (
          <button
            key={t.label}
            onClick={() => setTab(i)}
            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-[11px] font-semibold transition-colors ${
              tab === i ? 'bg-black text-white' : 'border border-line bg-white text-mute hover:bg-page'
            }`}
          >
            <t.icon className="h-3.5 w-3.5" /> {t.label}
          </button>
        ))}
      </div>

      {tab === 0 && (
        <div>
          <div className="card mb-5 flex flex-wrap items-center justify-between gap-3 p-4">
            <p className="text-xs font-semibold">حالة الوثائق: <span className="badge bg-faint text-white">بانتظار المزامنة</span></p>
            <button className="btn-ghost" onClick={() => toast('أُرسل إشعار للكابتن بطلب تحديث وثائقه 📩')}>
              طلب تحديث الوثائق
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {docs.map((d) => (
              <div key={d} className="card overflow-hidden">
                <div className="flex h-36 items-center justify-center border-b border-dashed border-line bg-page">
                  <Camera className="h-8 w-8 text-faint" strokeWidth={1.3} />
                </div>
                <div className="p-3">
                  <p className="text-xs font-bold">{d}</p>
                  <p className="mt-0.5 text-[10px] text-faint">تُعرض الصورة بحجم كامل (Lightbox) عند النقر</p>
                </div>
              </div>
            ))}
          </div>
          <div className="card mt-5 p-5">
            <p className="text-xs font-bold">مراجعة الوثائق الجديدة</p>
            <p className="mt-1 text-[11px] leading-relaxed text-mute">
              عند رفع الكابتن لوثائق جديدة تظهر هنا معاينة للوثيقة القديمة والجديدة جنباً إلى جنب مع خيار ✅ اعتماد أو ❌ رفض مع السبب.
            </p>
          </div>
        </div>
      )}

      {tab === 1 && (
        <div>
          <div className="card mb-5 flex flex-wrap items-center gap-3 p-4">
            <CalendarClock className="h-5 w-5" />
            <p className="text-xs font-semibold">الشفت الحالي: <b>لم يُحدد بعد</b></p>
          </div>
          <DataTable
            columns={['التاريخ', 'الشفت', 'وقت الدخول', 'وقت الخروج', 'مدة العمل الفعلية']}
            emptyIcon={CalendarClock}
            emptyTitle="لا توجد سجلات حضور"
            emptyHint="يُسجل الحضور والانصراف تلقائياً عند اتصال الكابتن داخل شفته."
          />
        </div>
      )}

      {tab === 2 && (
        <DataTable
          columns={['رقم الطلب', 'المحل', 'الحالة', 'القيمة', 'الأجرة', 'التاريخ']}
          emptyIcon={Package}
          emptyTitle="لا توجد طلبات لهذا الكابتن"
          emptyHint="تظهر هنا جميع طلبيات الكابتن مع إمكانية فتح تفاصيل كل طلب."
        />
      )}

      {tab === 3 && (
        <div className="card p-5">
          <div className="mb-4 flex items-center gap-6">
            <div>
              <p className="text-[11px] text-mute">متوسط التقييم</p>
              <p className="text-2xl font-bold">— ⭐</p>
            </div>
            <div>
              <p className="text-[11px] text-mute">عدد التقييمات</p>
              <p className="text-2xl font-bold">0</p>
            </div>
          </div>
          <EmptyState icon={Star} title="لا توجد تقييمات بعد" hint="كل تقييم يعرض: اسم المحل، عدد النجوم، التاريخ ورقم الطلب المرتبط." />
        </div>
      )}

      {tab === 4 && (
        <div>
          <div className="mb-5 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
            {['إجمالي الطلبات', 'المكتملة', 'الملغاة', 'متوسط وقت التوصيل', 'متوسط التقييم', 'ساعات العمل'].map((l) => (
              <div key={l} className="card p-4">
                <p className="text-[11px] font-medium text-mute">{l}</p>
                <p className="mt-1.5 text-xl font-bold">—</p>
              </div>
            ))}
          </div>
          <div className="card p-5">
            <h2 className="mb-3 text-sm font-bold">أداء آخر 30 يوماً</h2>
            <div className="flex h-40 items-end gap-1 border-b border-line">
              {Array.from({ length: 30 }).map((_, i) => (
                <div key={i} className="flex-1 rounded-t-sm bg-page" style={{ height: 4 }} />
              ))}
            </div>
            <p className="mt-4 text-center text-[11px] text-faint">لا توجد بيانات أداء بعد</p>
          </div>
        </div>
      )}

      {tab === 5 && (
        <DataTable
          columns={['التاريخ والوقت', 'الإجراء', 'من قام به', 'التفاصيل']}
          emptyIcon={FileClock}
          emptyTitle="لا توجد إجراءات إدارية مسجلة"
          emptyHint="كل موافقة أو إيقاف أو تعديل على هذا الكابتن يُسجل هنا تلقائياً."
        />
      )}

      {tab === 6 && (
        <div className="card p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold">مناطق عمل الكابتن</h2>
            <span className="badge border border-line bg-page text-mute">المحافظة: — (ثابتة)</span>
          </div>
          <EmptyState
            icon={MapPin}
            title="لا توجد مناطق مسندة"
            hint="تُدار مناطق عمل الكابتن هنا عبر مفاتيح تفعيل لكل منطقة. نقل المحافظة متاح للأدمن فقط بطلب مبرر."
          />
        </div>
      )}

      {/* modals */}
      {modal === 'approve' && (
        <Modal title="الموافقة على الكابتن" onClose={() => setModal(null)}>
          <p className="mt-2 text-xs leading-relaxed text-mute">
            هل تريد الموافقة على الكابتن؟ سيتم تفعيل حسابه ويمكنه البدء باستلام الطلبيات، ويُرسل له إشعار فوري.
          </p>
          <div className="mt-4 flex gap-2">
            <button className="btn-primary flex-1" onClick={() => { setModal(null); toast('تمت الموافقة على الكابتن ✅ وسُجلت في Audit Log') }}>
              تأكيد الموافقة
            </button>
            <button className="btn-ghost flex-1" onClick={() => setModal(null)}>إلغاء</button>
          </div>
        </Modal>
      )}

      {modal === 'reject' && (
        <Modal title="رفض طلب الكابتن" onClose={() => setModal(null)}>
          <textarea
            className="field mt-4 min-h-24 resize-none"
            placeholder="سبب الرفض (مطلوب) — يُرسل للكابتن مع الإشعار"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
          <div className="mt-4 flex gap-2">
            <button
              className="btn-primary flex-1"
              disabled={!reason.trim()}
              onClick={() => { setModal(null); setReason(''); toast('تم رفض الكابتن وإرسال السبب له') }}
            >
              تأكيد الرفض
            </button>
            <button className="btn-ghost flex-1" onClick={() => setModal(null)}>إلغاء</button>
          </div>
        </Modal>
      )}

      {modal === 'suspend' && (
        <Modal title="إيقاف الكابتن" onClose={() => setModal(null)}>
          <div className="mt-4 space-y-3">
            <textarea className="field min-h-20 resize-none" placeholder="سبب الإيقاف (مطلوب)" value={reason} onChange={(e) => setReason(e.target.value)} />
            {(
              [
                ['now', 'إيقاف فوري (إنهاء الطلبات النشطة وإعادتها للتوزيع)'],
                ['after', 'إيقاف بعد انتهاء الطلبات الحالية'],
              ] as const
            ).map(([val, label]) => (
              <button
                key={val}
                onClick={() => setSuspendMode(val)}
                className={`flex w-full items-center gap-3 rounded-xl border p-3 text-right text-xs font-bold transition-all ${suspendMode === val ? 'border-black' : 'border-line'}`}
              >
                <span className={`flex h-4 w-4 items-center justify-center rounded-full border-2 ${suspendMode === val ? 'border-black' : 'border-line'}`}>
                  {suspendMode === val && <span className="h-2 w-2 rounded-full bg-black" />}
                </span>
                {label}
              </button>
            ))}
          </div>
          <div className="mt-4 flex gap-2">
            <button
              className="btn-primary flex-1"
              disabled={!reason.trim()}
              onClick={() => { setModal(null); setReason(''); toast('تم إيقاف الكابتن 🚫 وسُجل الإجراء') }}
            >
              إيقاف
            </button>
            <button className="btn-ghost flex-1" onClick={() => setModal(null)}>إلغاء</button>
          </div>
        </Modal>
      )}

      {node}
    </div>
  )
}
