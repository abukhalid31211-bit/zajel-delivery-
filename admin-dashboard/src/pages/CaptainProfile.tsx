import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
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
import Lightbox from '../components/Lightbox'
import Toggle from '../components/Toggle'
import { useToast } from '../components/Toast'
import DataTable from '../components/DataTable'
import EmptyState from '../components/EmptyState'
import StatusBadge from '../components/StatusBadge'
import { useDbList, logAudit } from '../lib/store'
import { formatDate } from '../lib/db'
import type { AuditEntry, Captain, District, Governorate, Shift } from '../lib/types'

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
  const [params] = useSearchParams()
  const id = params.get('id')
  const captains = useDbList<Captain>('captains')
  const cap = captains.items.find((c) => c.id === id)
  const govs = useDbList<Governorate>('governorates')
  const districts = useDbList<District>('districts')
  const shifts = useDbList<Shift>('shifts')
  const audit = useDbList<AuditEntry>('audit')
  const [tab, setTab] = useState(0)
  const [modal, setModal] = useState<'approve' | 'reject' | 'suspend' | 'move' | null>(null)
  const [suspendMode, setSuspendMode] = useState<'now' | 'after'>('after')
  const [reason, setReason] = useState('')
  const [light, setLight] = useState<string | null>(null)
  const [range, setRange] = useState(2)
  const [newGov, setNewGov] = useState('')
  const name = cap?.name || '— الاسم الثلاثي'

  const zoneList = useMemo(() => districts.items.filter((d) => !cap?.govId || d.govId === cap.govId), [districts.items, cap])

  const setStatus = (status: Captain['status'], extra?: Partial<Captain>) => {
    if (!cap) return
    captains.setItems((p) => p.map((x) => (x.id === cap.id ? { ...x, status, ...extra } : x)))
  }

  return (
    <div>
      <div className="mb-4 flex items-center gap-2 text-[11px] text-faint">
        <Link to="/captains" className="hover:text-black">الكباتن</Link>
        <span>›</span>
        <span className="font-semibold text-black">{name}</span>
      </div>

      <div className="card mb-5 p-5">
        <div className="flex flex-wrap items-center gap-5">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-black text-white">
            <User className="h-9 w-9" strokeWidth={1.4} />
          </div>
          <div className="min-w-40 flex-1">
            <h1 className="text-lg font-bold">{name}</h1>
            <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-mute">
              <a className="flex items-center gap-1 hover:text-black" href={cap ? `tel:+964${cap.phone}` : undefined}><Phone className="h-3.5 w-3.5" /> +964 {cap?.phone || '—'}</a>
              <span>Gmail: {cap?.email || '—'}</span>
              <span>تاريخ التسجيل: {formatDate(cap?.createdAt)}</span>
              <span>المركبة: {cap?.vehicle || '🏍️ دراجة نارية'}</span>
              <span>المحافظة: {govs.items.find((g) => g.id === cap?.govId)?.name || '—'}</span>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <StatusBadge status={cap?.status || 'بانتظار الموافقة'} />
              <span className="flex items-center gap-1 text-xs font-bold"><Star className="h-3.5 w-3.5 fill-black" /> {cap?.rating || '—'}</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {(!cap || cap.status === 'بانتظار الموافقة') && (
              <>
                <button className="btn-primary" onClick={() => setModal('approve')}><CheckCircle2 className="h-4 w-4" /> موافقة</button>
                <button className="btn-secondary" onClick={() => setModal('reject')}>❌ رفض</button>
              </>
            )}
            {cap?.status === 'نشط' && (
              <button className="btn-ghost" onClick={() => setModal('suspend')}><Ban className="h-4 w-4" /> إيقاف</button>
            )}
            {cap?.status === 'موقوف' && (
              <button className="btn-primary" onClick={() => { setStatus('نشط'); toast('تم إعادة تفعيل الكابتن') }}>🔄 تفعيل</button>
            )}
            <button className="btn-ghost" onClick={() => setModal('move')}>نقل المحافظة</button>
          </div>
        </div>
      </div>

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
            <button className="btn-ghost" onClick={() => toast('أُرسل إشعار للكابتن بطلب تحديث وثائقه 📩')}>طلب تحديث الوثائق</button>
          </div>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {docs.map((d) => (
              <button key={d} type="button" className="card overflow-hidden text-right" onClick={() => setLight(d)}>
                <div className="flex h-36 items-center justify-center border-b border-dashed border-line bg-page">
                  <Camera className="h-8 w-8 text-faint" strokeWidth={1.3} />
                </div>
                <div className="p-3">
                  <p className="text-xs font-bold">{d}</p>
                  <p className="mt-0.5 text-[10px] text-faint">اضغط للعرض بالحجم الكامل (Lightbox)</p>
                </div>
              </button>
            ))}
          </div>
          <div className="card mt-5 p-5">
            <p className="text-xs font-bold">مراجعة الوثائق الجديدة</p>
            <p className="mt-1 text-[11px] leading-relaxed text-mute">عند رفع الكابتن لوثائق جديدة تظهر هنا معاينة للوثيقة القديمة والجديدة جنباً إلى جنب.</p>
            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
              {['الوثيقة القديمة', 'الوثيقة الجديدة'].map((t) => (
                <div key={t} className="rounded-xl border border-dashed border-line p-6 text-center text-[11px] text-mute">{t} — لا توجد صورة</div>
              ))}
            </div>
            <div className="mt-4 flex gap-2">
              <button className="btn-primary" onClick={() => toast('تم اعتماد الوثيقة الجديدة')}>✅ اعتماد الوثيقة الجديدة</button>
              <button className="btn-ghost" onClick={() => setModal('reject')}>❌ رفض الوثيقة</button>
            </div>
          </div>
        </div>
      )}

      {tab === 1 && (
        <div>
          <div className="card mb-5 flex flex-wrap items-center gap-3 p-4">
            <CalendarClock className="h-5 w-5" />
            <p className="text-xs font-semibold">الشفت الحالي: <b>{shifts.items.find((s) => s.id === cap?.shiftId)?.name || 'لم يُحدد بعد'}</b></p>
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
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-bold">أداء آخر 30 يوماً</h2>
              <div className="flex overflow-hidden rounded-xl border border-line text-[11px] font-semibold">
                {['يوم', 'أسبوع', 'شهر'].map((t, i) => (
                  <button key={t} type="button" onClick={() => setRange(i)} className={`px-3 py-1 ${i === range ? 'bg-black text-white' : 'text-mute'}`}>{t}</button>
                ))}
              </div>
            </div>
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
          rows={audit.items.filter((a) => !cap || a.entity === cap.name).map((a) => ({
            key: a.id,
            cells: [formatDate(a.at), a.action, a.admin, a.details],
          }))}
          emptyIcon={FileClock}
          emptyTitle="لا توجد إجراءات إدارية مسجلة"
          emptyHint="كل موافقة أو إيقاف أو تعديل على هذا الكابتن يُسجل هنا تلقائياً."
        />
      )}

      {tab === 6 && (
        <div className="card p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold">مناطق عمل الكابتن</h2>
            <span className="badge border border-line bg-page text-mute">المحافظة: {govs.items.find((g) => g.id === cap?.govId)?.name || '—'} (ثابتة)</span>
          </div>
          {zoneList.length === 0 ? (
            <EmptyState icon={MapPin} title="لا توجد مناطق مسندة" hint="تُدار مناطق عمل الكابتن هنا عبر مفاتيح تفعيل لكل منطقة. نقل المحافظة متاح للأدمن فقط بطلب مبرر." />
          ) : (
            <div className="space-y-2">
              {zoneList.map((d) => (
                <div key={d.id} className="flex items-center justify-between rounded-xl border border-line px-3 py-2">
                  <span className="text-xs font-semibold">{d.name}</span>
                  <Toggle
                    on={!!cap?.districtIds.includes(d.id)}
                    onChange={(v) => {
                      if (!cap) return
                      const districtIds = v ? [...cap.districtIds, d.id] : cap.districtIds.filter((x) => x !== d.id)
                      captains.setItems((p) => p.map((x) => (x.id === cap.id ? { ...x, districtIds } : x)))
                      toast('تم تحديث مناطق عمل الكابتن')
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {modal === 'approve' && (
        <Modal title="الموافقة على الكابتن" onClose={() => setModal(null)}>
          <p className="mt-2 text-xs leading-relaxed text-mute">هل تريد الموافقة على الكابتن {name}؟ سيتم تفعيل حسابه ويمكنه البدء باستلام الطلبيات.</p>
          <div className="mt-4 flex gap-2">
            <button className="btn-primary flex-1" onClick={() => { setStatus('نشط'); logAudit({ action: 'موافقة', entity: name, details: 'تفعيل حساب', oldValue: 'بانتظار الموافقة', newValue: 'نشط' }); setModal(null); toast('تمت الموافقة على الكابتن') }}>تأكيد الموافقة</button>
            <button className="btn-ghost flex-1" onClick={() => setModal(null)}>إلغاء</button>
          </div>
        </Modal>
      )}

      {modal === 'reject' && (
        <Modal title="رفض طلب الكابتن" onClose={() => setModal(null)}>
          <textarea className="field mt-4 min-h-24 resize-none" placeholder="سبب الرفض (مطلوب)" value={reason} onChange={(e) => setReason(e.target.value)} />
          <div className="mt-4 flex gap-2">
            <button className="btn-primary flex-1" disabled={!reason.trim()} onClick={() => { setStatus('مرفوض', { rejectReason: reason }); logAudit({ action: 'رفض', entity: name, details: reason, oldValue: 'بانتظار', newValue: 'مرفوض' }); setModal(null); setReason(''); toast('تم رفض الكابتن') }}>تأكيد الرفض</button>
            <button className="btn-ghost flex-1" onClick={() => setModal(null)}>إلغاء</button>
          </div>
        </Modal>
      )}

      {modal === 'suspend' && (
        <Modal title="إيقاف الكابتن" onClose={() => setModal(null)}>
          <div className="mt-4 space-y-3">
            <textarea className="field min-h-20 resize-none" placeholder="سبب الإيقاف (مطلوب)" value={reason} onChange={(e) => setReason(e.target.value)} />
            {([['now', 'إيقاف فوري (إنهاء الطلبات النشطة وإعادتها للتوزيع)'], ['after', 'إيقاف بعد انتهاء الطلبات الحالية']] as const).map(([val, label]) => (
              <button key={val} onClick={() => setSuspendMode(val)} className={`flex w-full items-center gap-3 rounded-xl border p-3 text-right text-xs font-bold ${suspendMode === val ? 'border-black' : 'border-line'}`}>
                <span className={`flex h-4 w-4 items-center justify-center rounded-full border-2 ${suspendMode === val ? 'border-black' : 'border-line'}`}>
                  {suspendMode === val && <span className="h-2 w-2 rounded-full bg-black" />}
                </span>
                {label}
              </button>
            ))}
          </div>
          <div className="mt-4 flex gap-2">
            <button className="btn-primary flex-1" disabled={!reason.trim()} onClick={() => { setStatus('موقوف'); logAudit({ action: 'إيقاف حساب', entity: name, details: reason, oldValue: 'نشط', newValue: 'موقوف' }); setModal(null); setReason(''); toast('تم إيقاف الكابتن') }}>إيقاف</button>
            <button className="btn-ghost flex-1" onClick={() => setModal(null)}>إلغاء</button>
          </div>
        </Modal>
      )}

      {modal === 'move' && (
        <Modal title="نقل المحافظة" onClose={() => setModal(null)}>
          <p className="mt-2 text-xs text-mute">الكابتن مسجّل في محافظة واحدة فقط. النقل متاح للأدمن بناءً على طلب مبرر.</p>
          <select className="field mt-3 cursor-pointer" value={newGov} onChange={(e) => setNewGov(e.target.value)}>
            <option value="">اختر المحافظة الجديدة</option>
            {govs.items.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>
          <textarea className="field mt-3 min-h-16 resize-none" placeholder="سبب النقل (مطلوب)" value={reason} onChange={(e) => setReason(e.target.value)} />
          <div className="mt-4 flex gap-2">
            <button className="btn-primary flex-1" disabled={!newGov || !reason.trim() || !cap} onClick={() => {
              captains.setItems((p) => p.map((x) => (x.id === cap!.id ? { ...x, govId: newGov, districtIds: [] } : x)))
              setModal(null)
              toast('تم نقل محافظة الكابتن')
            }}>تأكيد النقل</button>
            <button className="btn-ghost flex-1" onClick={() => setModal(null)}>إلغاء</button>
          </div>
        </Modal>
      )}

      {light && (
        <Lightbox title={light} onClose={() => setLight(null)}>
          <div className="flex h-80 w-full max-w-lg items-center justify-center rounded-2xl border border-dashed border-white/40 text-sm text-white/70">
            لا توجد صورة مرفوعة — {light}
          </div>
        </Lightbox>
      )}

      {node}
    </div>
  )
}
