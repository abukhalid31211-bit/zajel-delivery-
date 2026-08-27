import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { MapPin, Printer, RefreshCcw, X, Store, User, Bike } from 'lucide-react'
import Modal from '../components/Modal'
import { useToast } from '../components/Toast'
import EmptyState from '../components/EmptyState'
import StatusBadge from '../components/StatusBadge'
import { getSettings } from '../lib/settings'
import { logAudit, useDbList } from '../lib/store'
import { formatDate, nowIso } from '../lib/db'
import { can } from '../lib/rbac'
import { waitMinutes } from '../lib/orders'
import type { Captain, OrderItem } from '../lib/types'

const stages = ['طلب جديد', 'انتظار كابتن', 'قبول', 'متوجه', 'وصل المحل', 'استلام', 'بالطريق', 'تسليم', 'مكتمل']

const stageIndex = (status: string) => {
  const map: Record<string, number> = {
    'طلب جديد': 0,
    'بانتظار كابتن': 1,
    'تم قبول الكابتن': 2,
    'متوجه للمحل': 3,
    'وصل للمحل': 4,
    'استلم الطلب': 5,
    'بالطريق للزبون': 6,
    'تم التسليم': 7,
    مكتمل: 8,
    ملغي: -1,
  }
  return map[status] ?? 0
}

export default function OrderDetails() {
  const { toast, node } = useToast()
  const [params] = useSearchParams()
  const orders = useDbList<OrderItem>('orders')
  const order = orders.items.find((o) => o.id === params.get('id'))
  const captains = useDbList<Captain>('captains').items.filter((c) => c.status === 'نشط')
  const [modal, setModal] = useState<'reassign' | 'cancel' | null>(null)
  const [assignMode, setAssignMode] = useState<'auto' | 'manual'>('auto')
  const [reason, setReason] = useState('')
  const [cancelReason, setCancelReason] = useState('')
  const [captainId, setCaptainId] = useState('')
  const settings = getSettings()
  const idx = order ? stageIndex(order.status) : 0

  const patch = (fn: (o: OrderItem) => OrderItem) => {
    if (!order) return
    orders.setItems((p) => p.map((x) => (x.id === order.id ? fn(x) : x)))
  }

  const autoCaptain = useMemo(() => captains[0], [captains])

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-[11px] text-faint">
            <Link to="/orders" className="hover:text-black">الطلبيات</Link>
            <span>›</span>
            <span className="font-semibold text-black">#{order?.number || '—'}</span>
          </div>
          <h1 className="mt-1 text-xl font-bold tracking-tight">تفاصيل الطلب #{order?.number || '—'}</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="btn-ghost" onClick={() => window.print()}>
            <Printer className="h-4 w-4" /> طباعة الطلب
          </button>
          {order && order.status !== 'مكتمل' && order.status !== 'ملغي' && can('الطلبيات', 'تعديل') && (
            <button className="btn-secondary" onClick={() => setModal('reassign')}>
              <RefreshCcw className="h-4 w-4" /> إعادة تعيين الكابتن
            </button>
          )}
          {order && order.status !== 'مكتمل' && order.status !== 'ملغي' && can('الطلبيات', 'تعديل') && (
            <button className="btn-primary" onClick={() => setModal('cancel')}>
              <X className="h-4 w-4" /> إلغاء الطلب
            </button>
          )}
        </div>
      </div>

      {!order && (
        <div className="card mb-5 p-4 text-xs text-mute">لا يوجد طلب محدد. أنشئ طلباً من صفحة الطلبيات أو افتح صفاً من الجدول.</div>
      )}

      <div className="card mb-5 p-5">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {stages.map((s, i) => (
            <div key={s} className="flex min-w-16 flex-1 flex-col items-center gap-1.5">
              <div className={`h-2 w-full rounded-full ${idx < 0 ? 'bg-[#333]' : i <= idx ? 'bg-black' : 'bg-line'}`} />
              <span className={`whitespace-nowrap text-[10px] font-semibold ${i === idx ? 'text-black' : 'text-faint'}`}>{s}</span>
            </div>
          ))}
        </div>
        {order?.status === 'ملغي' && <p className="mt-3 text-center text-xs font-bold">الطلب ملغي ❌</p>}
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="card p-5">
          <h2 className="mb-3 text-sm font-bold">📦 بيانات الطلب</h2>
          <div className="divide-y divide-line text-xs">
            {[
              ['رقم الطلب', order?.number || '#—'],
              ['تاريخ الإنشاء', formatDate(order?.createdAt)],
              ['الحالة', order?.status || '—'],
              ['قيمة الطلب', `${order?.value || '—'} د.ع`],
              ['أجرة التوصيل', `${order?.fee || '—'} د.ع`],
              ['الملاحظات', order?.notes || '—'],
            ].map(([k, v]) => (
              <div key={k} className="flex items-center justify-between py-2.5">
                <span className="text-mute">{k}</span>
                {k === 'الحالة' && order ? <StatusBadge status={order.status} /> : <span className="font-bold">{v}</span>}
              </div>
            ))}
          </div>
        </div>
        <div className="card p-5">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-bold"><Store className="h-4 w-4" /> بيانات المحل</h2>
          <div className="divide-y divide-line text-xs">
            <div className="flex justify-between py-2.5"><span className="text-mute">اسم المحل</span><Link className="font-bold" to={order ? `/stores/profile?id=${order.storeId}` : '/stores'}>{order?.storeName || '—'}</Link></div>
            <div className="flex justify-between py-2.5"><span className="text-mute">المنطقة</span><span className="font-bold">{order?.districtName || '—'}</span></div>
          </div>
        </div>
        <div className="card p-5">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-bold"><User className="h-4 w-4" /> بيانات الزبون</h2>
          <div className="divide-y divide-line text-xs">
            <div className="flex justify-between py-2.5"><span className="text-mute">الاسم</span><span className="font-bold">{order?.customerName || '—'}</span></div>
            <div className="flex justify-between py-2.5"><span className="text-mute">الهاتف</span>{order?.customerPhone ? <a className="font-bold" href={`tel:+964${order.customerPhone}`}>+964 {order.customerPhone}</a> : <span>—</span>}</div>
          </div>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="card p-5">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-bold"><Bike className="h-4 w-4" /> بطاقة الكابتن</h2>
          {order?.captainId ? (
            <div className="text-xs">
              <Link className="font-bold" to={`/captains/profile?id=${order.captainId}`}>{order.captainName}</Link>
              <p className="mt-1 text-mute">مدة الانتظار قبل التعيين: {waitMinutes(order.waitingStartedAt)} د</p>
            </div>
          ) : (
            <EmptyState icon={Bike} title="لم يُعين كابتن بعد" hint="استخدم إعادة التعيين لاختيار كابتن تلقائي أو يدوي." />
          )}
        </div>
        <div className="card overflow-hidden lg:col-span-2">
          <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
            <h2 className="flex items-center gap-2 text-sm font-bold"><MapPin className="h-4 w-4" /> الخريطة الحية</h2>
          </div>
          <div className="flex h-56 items-center justify-center bg-page text-xs text-mute">📍 {order?.storeName || 'المحل'} · 🏠 التوصيل · 🚚 {order?.captainName || 'بدون كابتن'}</div>
        </div>
      </div>

      <div className="card mt-5 p-5">
        <h2 className="mb-4 text-sm font-bold">🕐 سجل الطلب</h2>
        {!order?.timeline?.length ? (
          <EmptyState title="لا توجد أحداث مسجلة" />
        ) : (
          <div className="space-y-2">
            {order.timeline.map((e, i) => (
              <div key={i} className="rounded-xl border border-line px-3 py-2 text-xs">
                <span className="text-faint">{formatDate(e.at)}</span> — {e.text}
              </div>
            ))}
          </div>
        )}
      </div>

      {modal === 'reassign' && order && (
        <Modal title={`إعادة تعيين كابتن للطلب #${order.number}`} onClose={() => setModal(null)}>
          <p className="mt-1.5 text-xs text-mute">الكابتن الحالي: {order.captainName || '—'}.</p>
          <div className="mt-4 space-y-2">
            {([['auto', 'تعيين تلقائي (نظام الطابور الذكي)'], ['manual', 'اختيار يدوي']] as const).map(([val, label]) => (
              <button key={val} onClick={() => setAssignMode(val)} className={`flex w-full items-center gap-3 rounded-xl border p-3.5 text-right text-xs font-bold ${assignMode === val ? 'border-black' : 'border-line'}`}>
                {label}
              </button>
            ))}
            {assignMode === 'manual' && (
              <select className="field cursor-pointer" value={captainId} onChange={(e) => setCaptainId(e.target.value)}>
                <option value="">{captains.length ? 'اختر كابتن' : 'لا يوجد كباتن نشطون — أضف كابتن ووافق عليه'}</option>
                {captains.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            )}
            <textarea className="field min-h-16" placeholder="سبب إعادة التعيين (مطلوب)" value={reason} onChange={(e) => setReason(e.target.value)} />
          </div>
          <div className="mt-4 flex gap-2">
            <button
              className="btn-primary flex-1"
              disabled={!reason.trim()}
              onClick={() => {
                const cap = assignMode === 'auto' ? autoCaptain : captains.find((c) => c.id === captainId)
                if (!cap) return toast('الكابتن غير متاح حالياً')
                patch((o) => ({
                  ...o,
                  captainId: cap.id,
                  captainName: cap.name,
                  status: 'تم قبول الكابتن',
                  attempts: o.attempts + 1,
                  timeline: [...o.timeline, { at: nowIso(), text: `إعادة تعيين إلى ${cap.name} — ${reason}` }],
                }))
                logAudit({ action: 'إعادة تعيين', entity: order.number, details: reason, oldValue: order.captainName || '—', newValue: cap.name })
                setModal(null)
                setReason('')
                toast(`تم تعيين الكابتن ${cap.name}`)
              }}
            >
              تأكيد
            </button>
            <button className="btn-ghost flex-1" onClick={() => setModal(null)}>إلغاء</button>
          </div>
        </Modal>
      )}

      {modal === 'cancel' && order && (
        <Modal title={`إلغاء الطلب #${order.number}`} onClose={() => setModal(null)}>
          <select className="field mt-4 cursor-pointer" value={cancelReason} onChange={(e) => setCancelReason(e.target.value)}>
            <option value="">سبب الإلغاء</option>
            {settings.cancelReasons.map((r) => <option key={r}>{r}</option>)}
          </select>
          <div className="mt-4 flex gap-2">
            <button
              className="btn-primary flex-1"
              disabled={settings.cancelRequireReason && !cancelReason}
              onClick={() => {
                patch((o) => ({
                  ...o,
                  status: 'ملغي',
                  timeline: [...o.timeline, { at: nowIso(), text: `أُلغي بواسطة الإدارة — ${cancelReason}` }],
                }))
                logAudit({ action: 'إلغاء طلب', entity: order.number, details: cancelReason, oldValue: order.status, newValue: 'ملغي' })
                setModal(null)
                toast('تم إلغاء الطلب')
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
