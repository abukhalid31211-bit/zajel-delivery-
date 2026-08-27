import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, FileText, ShieldCheck, Trash2, Check } from 'lucide-react'
import Header from '../components/Header'
import Modal from '../components/Modal'
import { useToast } from '../components/Modal'
import { useStore } from '../lib/StoreContext'

export function About() {
  return (
    <div className="app-shell">
      <Header title="معلومات التطبيق" to="/profile" />
      <div className="animate-fade-up flex-1 px-5 py-6">
        <div className="card flex flex-col items-center gap-3 p-8 text-center">
          <div className="animate-logo-pulse flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-gold to-gold-strong">
            <svg viewBox="0 0 64 64" width="34" height="34">
              <path d="M14 20h30l-22 20h24v4H14l22-20H14z" fill="#fff" />
              <circle cx="50" cy="16" r="4" fill="#fff" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-extrabold">زاجل محل — Zajel Store</p>
            <p className="mt-1 text-[11px] text-mute">يوصلك بسرعة وثقة</p>
          </div>
          <div className="flex gap-4 text-[11px] text-mute">
            <span>
              الإصدار: <b className="text-gold-strong" dir="ltr">1.0.0</b>
            </span>
            <span>
              البناء: <b className="text-gold-strong" dir="ltr">100</b>
            </span>
          </div>
        </div>
        <div className="card mt-4 divide-y divide-line overflow-hidden">
          {[
            { icon: FileText, label: 'شروط الاستخدام' },
            { icon: ShieldCheck, label: 'سياسة الخصوصية' },
          ].map((i) => (
            <button key={i.label} className="flex w-full items-center gap-3.5 px-4 py-3.5 text-right active:bg-gold-faint">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gold-soft text-gold-strong">
                <i.icon className="h-4.5 w-4.5" strokeWidth={1.7} />
              </span>
              <span className="flex-1 text-[13px] font-bold">{i.label}</span>
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
  const { language, setLanguage } = useStore()
  const { toast, node } = useToast()
  const [lang, setLang] = useState<string>(language)
  const langs = [
    ['ar', 'العربية', 'Arabic'],
    ['ku', 'کوردی', 'Kurdish'],
    ['en', 'English', 'English'],
  ]
  return (
    <div className="app-shell">
      <Header title="تغيير اللغة" to="/profile" />
      <div className="animate-fade-up flex-1 space-y-2.5 px-5 py-6">
        {langs.map(([code, name, en]) => (
          <button
            key={code}
            onClick={() => setLang(code)}
            className={`card flex w-full items-center gap-3 p-4 text-right transition-all ${lang === code ? 'border-gold bg-gold-faint' : ''}`}
          >
            <span className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${lang === code ? 'border-gold bg-gold text-white' : 'border-line'}`}>
              {lang === code && <Check className="h-3 w-3" />}
            </span>
            <span className="flex-1 text-sm font-extrabold">{name}</span>
            <span className="text-[11px] text-faint">{en}</span>
          </button>
        ))}
        <p className="pt-2 text-center text-[10px] leading-relaxed text-faint">
          تُطبق اللغة المختارة فوراً على واجهة التطبيق واتجاهها — الترجمات تُدار مركزياً من لوحة الإدارة (CMS).
        </p>
      </div>
      <div className="border-t border-line bg-white px-5 py-4">
        <button
          className="btn-primary w-full"
          onClick={() => {
            setLanguage(lang)
            toast('تم حفظ اللغة المفضلة ✅')
            setTimeout(() => navigate('/profile'), 1000)
          }}
        >
          حفظ
        </button>
      </div>
      {node}
    </div>
  )
}

export function DeleteAccount() {
  const navigate = useNavigate()
  const { orders, deleteAccountRequest } = useStore()
  const [confirm, setConfirm] = useState(false)
  const { toast, node } = useToast()

  const activeCount = orders.filter((o) => ['searching', 'assigned', 'heading', 'arrived', 'picked_up', 'on_way'].includes(o.status)).length
  const blocked = activeCount > 0

  return (
    <div className="app-shell">
      <Header title="حذف الحساب" to="/profile" />
      <div className="animate-fade-up flex-1 space-y-4 px-5 py-6">
        <div className="card flex flex-col items-center gap-3 p-6 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-3xl border-2 border-dashed border-gold">
            <Trash2 className="h-7 w-7 text-gold" strokeWidth={1.5} />
          </span>
          <p className="text-sm font-extrabold">طلب حذف الحساب نهائياً</p>
          <p className="max-w-64 text-[11px] leading-relaxed text-mute">
            سيتم حذف حسابك وجميع بياناتك بشكل نهائي بعد مراجعة الإدارة. لا يمكن التراجع عن هذا الإجراء.
          </p>
        </div>
        <div className={`rounded-2xl border p-4 text-[11px] font-bold leading-relaxed ${blocked ? 'border-danger/50 bg-danger/5 text-danger' : 'border-dashed border-gold bg-gold-faint text-gold-deep'}`}>
          {blocked
            ? `⚠️ شروط الحذف غير مستوفاة: لديك ${activeCount} طلبات نشطة. أكملها أو ألغها أولاً، ولا مبالغ معلقة غير مسوّاة مع الإدارة.`
            : '✅ الشروط مستوفاة: لا توجد طلبات نشطة، ولا مبالغ معلقة غير مسوّاة مع الإدارة.'}
        </div>
      </div>
      <div className="border-t border-line bg-white px-5 py-4">
        <button
          className="w-full rounded-2xl border-2 border-gold bg-white py-3.5 text-sm font-extrabold text-gold-strong transition-transform active:scale-[0.98] disabled:opacity-40"
          disabled={blocked}
          onClick={() => setConfirm(true)}
        >
          تقديم طلب حذف الحساب
        </button>
      </div>
      {confirm && (
        <Modal title="تأكيد طلب الحذف" subtitle="هل أنت متأكد؟ سيُرسل طلبك للإدارة للمراجعة والتنفيذ." onClose={() => setConfirm(false)}>
          <div className="mt-4 flex gap-2">
            <button
              className="btn-primary flex-1"
              onClick={() => {
                setConfirm(false)
                const res = deleteAccountRequest()
                if (res.ok) toast('تم إرسال طلب الحذف للإدارة')
                else toast(res.error ?? 'تعذر إرسال الطلب', 'error')
                if (res.ok) setTimeout(() => navigate('/login'), 1400)
              }}
            >
              تأكيد
            </button>
            <button className="btn-secondary flex-1" onClick={() => setConfirm(false)}>
              إلغاء
            </button>
          </div>
        </Modal>
      )}
      {node}
    </div>
  )
}
