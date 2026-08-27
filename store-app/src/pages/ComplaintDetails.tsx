import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { CheckCircle2, MessageCirclePlus } from 'lucide-react'
import Header from '../components/Header'
import Modal from '../components/Modal'
import { useToast } from '../components/Modal'
import { useStore } from '../lib/StoreContext'
import { COMPLAINT_STATUS_META, fmtDateTime } from '../lib/data'

/** تفاصيل الشكوى — Timeline التحديثات ورد الإدارة والتعليقات */
export default function ComplaintDetails() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const id = params.get('id')
  const { complaints, orders, closeComplaint, commentComplaint } = useStore()
  const { toast, node } = useToast()
  const c = complaints.find((x) => x.id === id) ?? null

  const [commentOpen, setCommentOpen] = useState(false)
  const [comment, setComment] = useState('')

  if (!c) {
    return (
      <div className="app-shell">
        <Header title="تفاصيل الشكوى" to="/complaints" />
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-8 text-center">
          <p className="text-sm font-extrabold">الشكوى غير موجودة</p>
          <button className="btn-primary" onClick={() => navigate('/complaints')}>شكاواي</button>
        </div>
      </div>
    )
  }

  const meta = COMPLAINT_STATUS_META[c.status]
  const linkedOrder = c.orderId ? orders.find((o) => o.id === c.orderId) : null

  return (
    <div className="app-shell">
      <Header
        title={`شكوى ${c.id}`}
        to="/complaints"
        actions={<span className={`badge ${meta.cls}`}>{meta.emoji} {meta.label}</span>}
      />

      <div className="animate-fade-up flex-1 space-y-4 px-5 py-5">
        {/* بطاقة المعلومات */}
        <div className="card divide-y divide-line">
          <p className="px-4 py-3 text-xs font-extrabold">معلومات الشكوى</p>
          {[
            ['نوع الشكوى', c.type],
            ['تاريخ التقديم', fmtDateTime(c.createdAt)],
          ].map(([k, v]) => (
            <div key={k} className="flex items-center justify-between gap-3 px-4 py-2.5">
              <span className="shrink-0 text-[11px] text-mute">{k}</span>
              <span className="truncate text-[11px] font-bold">{v}</span>
            </div>
          ))}
          {linkedOrder && (
            <button
              onClick={() => navigate(`/order-details?id=${linkedOrder.id}`)}
              className="flex w-full items-center justify-between px-4 py-2.5"
            >
              <span className="text-[11px] text-mute">الطلب المرتبط</span>
              <span className="text-[11px] font-extrabold text-gold-strong underline underline-offset-4">{linkedOrder.id} ←</span>
            </button>
          )}
          <div className="px-4 py-3">
            <p className="text-[11px] text-mute">الوصف</p>
            <p className="mt-1 text-[12px] font-bold leading-relaxed">{c.desc}</p>
          </div>
          {c.photo && (
            <div className="px-4 py-3">
              <p className="mb-2 text-[11px] text-mute">الصورة المرفقة</p>
              <img src={c.photo} alt="مرفق الشكوى" className="max-h-44 rounded-xl border border-line" />
            </div>
          )}
        </div>

        {/* Timeline التحديثات */}
        <div className="card p-4">
          <p className="mb-3 text-xs font-extrabold">سجل متابعة الشكوى</p>
          <div className="space-y-0">
            {c.timeline
              .slice()
              .reverse()
              .map((ev, i, arr) => (
                <div key={`${ev.at}-${i}`} className="relative flex gap-3 pb-4 last:pb-0">
                  {i !== arr.length - 1 && <span className="absolute right-[5px] top-5 bottom-0 w-px bg-line" />}
                  <span className={`relative z-10 mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${i === 0 ? 'bg-gold' : 'bg-line-strong'}`} />
                  <div>
                    <p className={`text-[11px] ${i === 0 ? 'font-extrabold' : 'font-bold text-mute'}`}>{ev.label}</p>
                    {ev.detail && <p className="mt-0.5 text-[10px] leading-relaxed text-faint">{ev.detail}</p>}
                    <p className="mt-0.5 text-[10px] text-faint">{fmtDateTime(ev.at)}</p>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* رد الإدارة */}
        {c.adminReply && (
          <div className="card border-gold/50 bg-gold-faint p-4">
            <p className="flex items-center gap-1.5 text-xs font-extrabold text-gold-deep">
              <CheckCircle2 className="h-4 w-4" /> رد الإدارة:
            </p>
            <p className="mt-2 text-[12px] font-bold leading-relaxed">{c.adminReply.text}</p>
            <p className="mt-2 text-[10px] text-faint">{fmtDateTime(c.adminReply.at)}</p>
          </div>
        )}
      </div>

      <div className="space-y-2.5 border-t border-line bg-white px-5 py-4">
        {c.status === 'resolved' && (
          <button
            className="btn-primary w-full"
            onClick={() => {
              closeComplaint(c.id)
              toast('تم إغلاق الشكوى ✅')
              setTimeout(() => navigate('/complaints'), 900)
            }}
          >
            <CheckCircle2 className="h-4 w-4" /> إغلاق الشكوى
          </button>
        )}
        <button className="btn-secondary w-full" onClick={() => setCommentOpen(true)}>
          <MessageCirclePlus className="h-4 w-4" /> إضافة تعليق
        </button>
      </div>

      {/* تعليق إضافي */}
      {commentOpen && (
        <Modal title="إضافة تعليق" subtitle="أضف معلومات إضافية لتصل للإدارة مع الشكوى." onClose={() => setCommentOpen(false)}>
          <textarea
            className="field mt-2 min-h-24 resize-none"
            placeholder="اكتب تعليقك..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <div className="mt-4 flex gap-2">
            <button
              className="btn-primary flex-1"
              disabled={!comment.trim()}
              onClick={() => {
                commentComplaint(c.id, comment.trim())
                setCommentOpen(false)
                setComment('')
                toast('تم إضافة التعليق وإرساله للإدارة ✅')
              }}
            >
              إرسال
            </button>
            <button className="btn-secondary flex-1" onClick={() => setCommentOpen(false)}>
              إلغاء
            </button>
          </div>
        </Modal>
      )}

      {node}
    </div>
  )
}
