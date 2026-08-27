import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, ChevronLeft, FileText, ShieldCheck, Trash2, Check } from 'lucide-react'
import Modal from '../components/Modal'
import { useToast } from '../components/Toast'

export function About() {
  const navigate = useNavigate()
  return (
    <div className="app-shell">
      <div className="flex items-center gap-3 border-b border-line bg-white px-4 py-4">
        <button onClick={() => navigate(-1)} className="flex h-9 w-9 items-center justify-center rounded-xl border border-line">
          <ArrowRight className="h-4.5 w-4.5" />
        </button>
        <h1 className="text-base font-bold">معلومات التطبيق</h1>
      </div>
      <div className="animate-fade-up flex-1 px-5 py-6">
        <div className="card flex flex-col items-center gap-3 p-8 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-black">
            <svg viewBox="0 0 64 64" width="34" height="34">
              <path d="M14 20h30l-22 20h24v4H14l22-20H14z" fill="#fff" />
              <circle cx="50" cy="16" r="4" fill="#fff" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-bold">زاجل كابتن — Zajel Captain</p>
            <p className="mt-1 text-[11px] text-mute">يوصلك بسرعة وثقة</p>
          </div>
          <div className="flex gap-4 text-[11px] text-mute">
            <span>الإصدار: <b className="text-black" dir="ltr">1.0.0</b></span>
            <span>البناء: <b className="text-black" dir="ltr">100</b></span>
          </div>
        </div>
        <div className="card mt-4 divide-y divide-line overflow-hidden">
          {[
            { icon: FileText, label: 'شروط الاستخدام' },
            { icon: ShieldCheck, label: 'سياسة الخصوصية' },
          ].map((i) => (
            <button key={i.label} className="flex w-full items-center gap-3.5 px-4 py-3.5 text-right active:bg-page">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-page">
                <i.icon className="h-4.5 w-4.5" strokeWidth={1.7} />
              </span>
              <span className="flex-1 text-[13px] font-semibold">{i.label}</span>
              <ChevronLeft className="h-4 w-4 text-faint" />
            </button>
          ))}
        </div>
        <p className="mt-4 text-center text-[10px] leading-relaxed text-faint">
          النصوص القانونية تُدار من لوحة الإدارة (CMS) وتُعرض هنا فور نشرها.
        </p>
      </div>
    </div>
  )
}

export function Language() {
  const navigate = useNavigate()
  const { toast, node } = useToast()
  const [lang, setLang] = useState(0)
  const langs = [
    ['العربية', 'Arabic'],
    ['کوردی', 'Kurdish'],
    ['English', 'English'],
  ]
  return (
    <div className="app-shell">
      <div className="flex items-center gap-3 border-b border-line bg-white px-4 py-4">
        <button onClick={() => navigate(-1)} className="flex h-9 w-9 items-center justify-center rounded-xl border border-line">
          <ArrowRight className="h-4.5 w-4.5" />
        </button>
        <h1 className="text-base font-bold">تغيير اللغة</h1>
      </div>
      <div className="animate-fade-up flex-1 space-y-2.5 px-5 py-6">
        {langs.map(([name, en], i) => (
          <button
            key={name}
            onClick={() => setLang(i)}
            className={`card flex w-full items-center gap-3 p-4 text-right transition-all ${lang === i ? 'border-black shadow-md' : ''}`}
          >
            <span className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${lang === i ? 'border-black bg-black text-white' : 'border-line'}`}>
              {lang === i && <Check className="h-3 w-3" />}
            </span>
            <span className="flex-1 text-sm font-bold">{name}</span>
            <span className="text-[11px] text-faint">{en}</span>
          </button>
        ))}
        <p className="pt-2 text-center text-[10px] leading-relaxed text-faint">الترجمات تُدار مركزياً من لوحة الإدارة (CMS → العناوين والنصوص).</p>
      </div>
      <div className="border-t border-line bg-white px-5 py-4">
        <button className="btn-primary w-full" onClick={() => { toast('تم حفظ اللغة المفضلة ✅'); setTimeout(() => navigate(-1), 1000) }}>
          حفظ
        </button>
      </div>
      {node}
    </div>
  )
}

export function DeleteAccount() {
  const navigate = useNavigate()
  const [confirm, setConfirm] = useState(false)
  const { toast, node } = useToast()
  return (
    <div className="app-shell">
      <div className="flex items-center gap-3 border-b border-line bg-white px-4 py-4">
        <button onClick={() => navigate(-1)} className="flex h-9 w-9 items-center justify-center rounded-xl border border-line">
          <ArrowRight className="h-4.5 w-4.5" />
        </button>
        <h1 className="text-base font-bold">حذف الحساب</h1>
      </div>
      <div className="animate-fade-up flex-1 space-y-4 px-5 py-6">
        <div className="card flex flex-col items-center gap-3 p-6 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-3xl border-2 border-dashed border-black">
            <Trash2 className="h-7 w-7" strokeWidth={1.5} />
          </span>
          <p className="text-sm font-bold">طلب حذف الحساب نهائياً</p>
          <p className="max-w-64 text-[11px] leading-relaxed text-mute">
            سيتم حذف حسابك وجميع بياناتك بشكل نهائي بعد مراجعة الإدارة. لا يمكن التراجع عن هذا الإجراء.
          </p>
        </div>
        <div className="rounded-2xl border border-dashed border-black bg-white p-4 text-[11px] font-semibold leading-relaxed">
          ⚠️ شروط الحذف: لا توجد طلبات نشطة، ولا مبالغ معلقة غير مسوّاة مع الإدارة.
        </div>
      </div>
      <div className="border-t border-line bg-white px-5 py-4">
        <button className="w-full rounded-2xl border-2 border-black bg-white py-3.5 text-sm font-bold transition-transform active:scale-[0.98]" onClick={() => setConfirm(true)}>
          تقديم طلب حذف الحساب
        </button>
      </div>
      {confirm && (
        <Modal title="تأكيد طلب الحذف" onClose={() => setConfirm(false)}>
          <p className="mt-2 text-xs leading-relaxed text-mute">هل أنت متأكد؟ سيُرسل طلبك للإدارة للمراجعة والتنفيذ.</p>
          <div className="mt-5 flex gap-2">
            <button className="btn-primary flex-1" onClick={() => { setConfirm(false); toast('تم إرسال طلب الحذف للإدارة'); setTimeout(() => navigate('/login'), 1400) }}>
              تأكيد
            </button>
            <button className="btn-secondary flex-1" onClick={() => setConfirm(false)}>إلغاء</button>
          </div>
        </Modal>
      )}
      {node}
    </div>
  )
}
