import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowRight, Send, XCircle } from 'lucide-react'
import Modal from '../components/Modal'
import { useToast } from '../components/Toast'
import { useCaptain } from '../state'

const statuses = [
  { value: 'open', label: '🔴 مفتوحة' },
  { value: 'review', label: '🟡 قيد المراجعة' },
  { value: 'resolved', label: '🟢 محلولة' },
] as const

export default function ComplaintDetail() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { state, addComment, closeComplaint, setComplaintStatus, fmtDate, fmtTime } = useCaptain()
  const { toast, node } = useToast()
  const [comment, setComment] = useState('')
  const [confirmClose, setConfirmClose] = useState(false)
  const complaint = state.complaints.find((c) => c.id === id)

  if (!complaint) {
    return (
      <div className="app-shell items-center justify-center px-8 text-center">
        <h1 className="text-lg font-bold">الشكوى غير موجودة</h1>
        <button className="btn-primary mt-5 w-full" onClick={() => navigate('/complaints')}>العودة للشكاوى</button>
      </div>
    )
  }

  const send = () => {
    if (!comment.trim()) return toast('اكتب تعليقاً أولاً')
    addComment(complaint.id, comment.trim())
    setComment('')
    toast('تم إضافة التعليق ✅')
  }

  return (
    <div className="app-shell">
      <div className="flex items-center gap-3 border-b border-line bg-white px-4 py-4">
        <button onClick={() => navigate('/complaints')} className="flex h-9 w-9 items-center justify-center rounded-xl border border-line">
          <ArrowRight className="h-4.5 w-4.5" />
        </button>
        <div className="flex-1">
          <h1 className="text-base font-bold">شكوى #{complaint.id.slice(-5).toUpperCase()}</h1>
          <span className={`badge ${complaint.status === 'open' ? 'bg-red-50 text-red-600' : complaint.status === 'review' ? 'bg-amber-50 text-amber-600' : 'bg-green-50 text-green-600'}`}>
            {complaint.status === 'open' ? '🔴 مفتوحة' : complaint.status === 'review' ? '🟡 قيد المراجعة' : '🟢 محلولة'}
          </span>
        </div>
      </div>

      <div className="animate-fade-up flex-1 space-y-4 px-5 py-5">
        <div className="card divide-y divide-line">
          <div className="flex items-start justify-between px-4 py-3">
            <span className="text-xs text-mute">النوع</span>
            <span className="text-xs font-bold text-left">{complaint.type}</span>
          </div>
          <div className="flex items-start justify-between px-4 py-3">
            <span className="text-xs text-mute">الطلب المرتبط</span>
            <button onClick={() => complaint.orderId ? navigate(`/order?order=${complaint.orderId}`) : undefined} className="text-xs font-bold text-gold-dark">
              {complaint.orderId === 'general' ? 'شكوى عامة' : `#${complaint.orderId.slice(-5).toUpperCase()}`}
            </button>
          </div>
          <div className="px-4 py-3">
            <p className="text-xs text-mute">الوصف</p>
            <p className="mt-1 text-xs font-medium leading-relaxed">{complaint.desc}</p>
          </div>
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-xs text-mute">المرفقات</span>
            <span className="text-xs font-bold">{complaint.photo ? 'صورة واحدة ✓' : 'لا يوجد'}</span>
          </div>
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-xs text-mute">تاريخ التقديم</span>
            <span className="text-xs font-bold">{fmtDate(complaint.createdAt)} — {fmtTime(complaint.createdAt)}</span>
          </div>
        </div>

        <div className="card p-4">
          <p className="mb-2 text-xs font-bold">Timeline التحديثات</p>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[11px] text-mute">
              <span className="h-2 w-2 rounded-full bg-gold" /> {fmtDate(complaint.createdAt)} {fmtTime(complaint.createdAt)} — تم تقديم الشكوى
            </div>
            {complaint.comments.map((c, i) => (
              <div key={i} className="flex items-center gap-2 text-[11px] text-mute">
                <span className="h-2 w-2 rounded-full bg-gold" /> {fmtDate(c.at)} {fmtTime(c.at)} — {c.text}
              </div>
            ))}
          </div>
        </div>

        {complaint.adminReply ? (
          <div className="card border-gold p-4">
            <p className="text-xs font-bold">رد الإدارة:</p>
            <p className="mt-1 text-[11px] leading-relaxed text-mute">{complaint.adminReply}</p>
            <p className="mt-2 text-[10px] text-faint">—</p>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-gold bg-white p-4 text-center text-[11px] text-mute">لم يصدر رد من الإدارة بعد. سيظهر هنا فور مراجعة الشكوى.</div>
        )}

        <div className="card p-4">
          <p className="mb-1 text-[11px] font-bold text-faint">حالة الشكوى (وضع العرض المحلي)</p>
          <div className="flex gap-2">
            {statuses.map((s) => (
              <button key={s.value} onClick={() => setComplaintStatus(complaint.id, s.value)} className={`flex-1 rounded-xl px-2 py-2 text-[10px] font-bold ${complaint.status === s.value ? 'bg-gold text-white' : 'border border-line bg-white text-mute'}`}>{s.label}</button>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <input className="field" placeholder="إضافة تعليق..." value={comment} onChange={(e) => setComment(e.target.value)} />
          <button onClick={send} className="btn-primary shrink-0"><Send className="h-4 w-4" /></button>
        </div>

        {complaint.status === 'resolved' && (
          <button onClick={() => setConfirmClose(true)} className="flex w-full items-center justify-center gap-2 rounded-2xl border border-gold bg-white py-3.5 text-xs font-bold text-gold-dark">
            <XCircle className="h-4 w-4" /> إغلاق الشكوى
          </button>
        )}
      </div>

      {confirmClose && (
        <Modal title="إغلاق الشكوى؟" onClose={() => setConfirmClose(false)}>
          <p className="mt-2 text-xs leading-relaxed text-mute">تأكد من أن الشكوى محلولة قبل إغلاقها نهائياً.</p>
          <div className="mt-5 flex gap-2">
            <button className="btn-primary flex-1" onClick={() => { closeComplaint(complaint.id); setConfirmClose(false); navigate('/complaints'); toast('تم إغلاق الشكوى ✅') }}>تأكيد الإغلاق</button>
            <button className="btn-secondary flex-1" onClick={() => setConfirmClose(false)}>إلغاء</button>
          </div>
        </Modal>
      )}

      {node}
    </div>
  )
}
