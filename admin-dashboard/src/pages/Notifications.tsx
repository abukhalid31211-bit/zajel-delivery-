import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Send, History, Eye } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import DataTable from '../components/DataTable'
import Modal from '../components/Modal'
import StatusBadge from '../components/StatusBadge'
import { useToast } from '../components/Toast'
import { useDbList, logAudit } from '../lib/store'
import { uid, nowIso, formatDate } from '../lib/db'
import { getSession } from '../lib/session'
import OtherField, { OtherOption } from '../components/OtherOption'
import { ensureOtherDistrict, isOther } from '../lib/customOption'
import type { Captain, Governorate, SentNotification, StoreItem, District } from '../lib/types'

const audiences = ['جميع الكباتن', 'جميع المحلات', 'كابتن محدد', 'محل محدد', 'مجموعة محددة', 'كباتن محافظة معينة', 'كباتن منطقة معينة']

export default function Notifications() {
  const [params, setParams] = useSearchParams()
  const tab = params.get('tab') === 'log' ? 1 : 0
  const logs = useDbList<SentNotification>('notifications')
  const captains = useDbList<Captain>('captains').items
  const stores = useDbList<StoreItem>('stores').items
  const govs = useDbList<Governorate>('governorates').items
  const districtsList = useDbList<District>('districts')
  const districts = districtsList.items
  const [audience, setAudience] = useState('')
  const [otherDistrictName, setOtherDistrictName] = useState('')
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [priority, setPriority] = useState('عادي')
  const [target, setTarget] = useState('')
  const [preview, setPreview] = useState(false)
  const [confirm, setConfirm] = useState(false)
  const [detail, setDetail] = useState<SentNotification | null>(null)
  const { toast, node } = useToast()

  const count = (() => {
    if (audience === 'جميع الكباتن') return captains.length
    if (audience === 'جميع المحلات') return stores.length
    if (audience.includes('محدد') || audience.includes('مجموعة')) return target ? 1 : 0
    return 0
  })()

  const send = () => {
    if (isOther(target)) {
      const id = ensureOtherDistrict(districts, districtsList.setItems, otherDistrictName, '')
      if (!id) {
        toast('اكتب اسم المنطقة الجديدة')
        return
      }
      setTarget(id)
      setOtherDistrictName('')
    }
    const item: SentNotification = {
      id: uid(),
      title,
      body,
      audience,
      priority,
      count,
      sender: getSession()?.name || 'مدير النظام',
      createdAt: nowIso(),
    }
    logs.setItems((p) => [item, ...p])
    logAudit({ action: 'أخرى', entity: 'إشعار', details: title, oldValue: '—', newValue: audience })
    setConfirm(false)
    setTitle('')
    setBody('')
    setAudience('')
    toast('تم إرسال الإشعار بنجاح')
    setParams({ tab: 'log' })
  }

  return (
    <div>
      <PageHeader title="مركز الإشعارات" subtitle="إرسال الإشعارات والرسائل الترويجية للكباتن والمحلات" />

      <div className="mb-5 flex flex-wrap gap-2">
        {[
          { label: 'إرسال إشعار جديد', icon: Send },
          { label: 'سجل الإشعارات المرسلة', icon: History },
        ].map((t, i) => (
          <button
            key={t.label}
            onClick={() => setParams(i === 1 ? { tab: 'log' } : {})}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-colors ${
              tab === i ? 'bg-black text-white' : 'border border-line bg-white text-mute hover:bg-page'
            }`}
          >
            <t.icon className="h-3.5 w-3.5" /> {t.label}
          </button>
        ))}
      </div>

      {tab === 0 && (
        <div className="card max-w-2xl space-y-4 p-6">
          <div>
            <label className="mb-1.5 block text-xs font-semibold">المرسل إليه</label>
            <select className="field cursor-pointer" value={audience} onChange={(e) => { setAudience(e.target.value); setTarget(''); setOtherDistrictName('') }}>
              <option value="">اختر الفئة المستهدفة</option>
              {audiences.map((a) => <option key={a}>{a}</option>)}
            </select>
          </div>
          {audience === 'كابتن محدد' && (
            <select className="field cursor-pointer" value={target} onChange={(e) => setTarget(e.target.value)}>
              <option value="">{captains.length ? 'اختر كابتن' : 'لا يوجد كباتن'}</option>
              {captains.map((c) => <option key={c.id} value={c.id}>{c.name} — {c.phone}</option>)}
            </select>
          )}
          {audience === 'محل محدد' && (
            <select className="field cursor-pointer" value={target} onChange={(e) => setTarget(e.target.value)}>
              <option value="">{stores.length ? 'اختر محل' : 'لا توجد محلات'}</option>
              {stores.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          )}
          {audience === 'مجموعة محددة' && (
            <select className="field cursor-pointer" multiple value={target ? [target] : []} onChange={(e) => setTarget(e.target.value)}>
              {captains.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              {stores.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          )}
          {audience === 'كباتن محافظة معينة' && (
            <select className="field cursor-pointer" value={target} onChange={(e) => setTarget(e.target.value)}>
              <option value="">اختر المحافظة</option>
              {govs.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
          )}
          {audience === 'كباتن منطقة معينة' && (
            <div>
              <select className="field cursor-pointer" value={target} onChange={(e) => setTarget(e.target.value)}>
                <option value="">اختر المنطقة</option>
                {districts.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                <OtherOption label="➕ أخرى — منطقة جديدة" />
              </select>
              {isOther(target) && (
                <OtherField
                  label="اسم المنطقة"
                  placeholder="اكتب اسم المنطقة لحفظها واختيارها"
                  value={otherDistrictName}
                  onChange={setOtherDistrictName}
                  hint="تُحفظ في «المناطق والجغرافيا» وتظهر في قوائم المنطقة مرة أخرى."
                />
              )}
            </div>
          )}
          <div>
            <label className="mb-1.5 block text-xs font-semibold">عنوان الإشعار</label>
            <input className="field" placeholder="اكتب عنواناً واضحاً ومختصراً..." value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold">محتوى الإشعار</label>
            <textarea className="field min-h-28 resize-y" placeholder="اكتب محتوى الإشعار..." value={body} onChange={(e) => setBody(e.target.value)} />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold">الأولوية</label>
            <div className="flex gap-2">
              {['عادي', 'مهم', 'عاجل'].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={`rounded-xl px-4 py-2 text-xs font-semibold transition-colors ${
                    priority === p ? 'bg-black text-white' : 'border border-line text-mute hover:bg-page'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <button className="btn-primary flex-1 py-3" disabled={!audience || !title.trim() || !body.trim()} onClick={() => setConfirm(true)}>
              <Send className="h-4 w-4" /> إرسال الإشعار
            </button>
            <button className="btn-secondary" disabled={!title} onClick={() => setPreview(true)}>
              <Eye className="h-4 w-4" /> معاينة
            </button>
          </div>
        </div>
      )}

      {tab === 1 && (
        <DataTable
          columns={['التاريخ', 'العنوان', 'المرسل إليه', 'عدد المستلمين', 'الأولوية', 'المرسل (الأدمن)']}
          rows={logs.items.map((n) => ({
            key: n.id,
            onClick: () => setDetail(n),
            cells: [formatDate(n.createdAt), n.title, n.audience, String(n.count), <StatusBadge status={n.priority} />, n.sender],
          }))}
          emptyIcon={History}
          emptyTitle="لا توجد إشعارات مرسلة بعد"
          emptyHint="سيظهر هنا سجل كامل بجميع الإشعارات المرسلة مع تفاصيلها."
        />
      )}

      {preview && (
        <Modal title="معاينة الإشعار" onClose={() => setPreview(false)}>
          <div className="mt-4 rounded-2xl border border-line p-4">
            <p className="text-[10px] font-bold text-mute">{priority}</p>
            <p className="mt-1 text-sm font-bold">{title}</p>
            <p className="mt-2 text-xs leading-relaxed text-mute">{body}</p>
          </div>
          <button className="btn-primary mt-4 w-full" onClick={() => setPreview(false)}>إغلاق</button>
        </Modal>
      )}

      {confirm && (
        <Modal title="تأكيد الإرسال" onClose={() => setConfirm(false)}>
          <p className="mt-2 text-xs text-mute">هل تريد إرسال الإشعار إلى {count} مستلم؟</p>
          <div className="mt-4 flex gap-2">
            <button className="btn-primary flex-1" onClick={send}>تأكيد</button>
            <button className="btn-ghost flex-1" onClick={() => setConfirm(false)}>إلغاء</button>
          </div>
        </Modal>
      )}

      {detail && (
        <Modal title={detail.title} onClose={() => setDetail(null)}>
          <div className="mt-3 space-y-2 text-xs">
            <p><b>المرسل إليه:</b> {detail.audience}</p>
            <p><b>المستلمون:</b> {detail.count}</p>
            <p><b>الأولوية:</b> {detail.priority}</p>
            <p><b>المرسل:</b> {detail.sender}</p>
            <p className="leading-relaxed text-mute">{detail.body}</p>
          </div>
        </Modal>
      )}
      {node}
    </div>
  )
}
