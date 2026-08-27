import { useState } from 'react'
import { User, Camera, KeyRound } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import Modal from '../components/Modal'
import { useToast } from '../components/Toast'
import { getSession, setSession } from '../lib/session'
import { logSecurity } from '../lib/store'
import { passwordStrength } from '../lib/validate'

export default function Profile() {
  const session = getSession()
  const [name, setName] = useState(session?.name || '')
  const [phone, setPhone] = useState(session?.phone || '')
  const [open, setOpen] = useState(false)
  const [cur, setCur] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [err, setErr] = useState('')
  const { toast, node } = useToast()
  const strength = passwordStrength(next)

  return (
    <div>
      <PageHeader title="الملف الشخصي" subtitle="إدارة بيانات حسابك الإداري" />
      <div className="grid max-w-4xl grid-cols-1 gap-5 md:grid-cols-3">
        <div className="card flex flex-col items-center gap-3 p-6 text-center">
          <div className="relative">
            <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-black text-white">
              <User className="h-10 w-10" strokeWidth={1.5} />
            </div>
            <label className="absolute -bottom-1.5 -left-1.5 flex h-8 w-8 cursor-pointer items-center justify-center rounded-xl border border-line bg-white shadow-sm hover:bg-page">
              <Camera className="h-4 w-4" />
              <input type="file" accept="image/*" className="hidden" onChange={() => toast('تم اختيار الصورة — تُحفظ محلياً عند الربط')} />
            </label>
          </div>
          <div>
            <p className="text-sm font-bold">{session?.name || 'مدير النظام'}</p>
            <p className="mt-1 text-[11px] text-mute">{session?.role || 'Super Admin'}</p>
          </div>
          <span className="badge bg-black text-white">صلاحيات كاملة</span>
        </div>

        <div className="card space-y-4 p-6 md:col-span-2">
          <h2 className="text-sm font-bold">تعديل البيانات</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold">الاسم</label>
              <input className="field" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold">رقم الهاتف</label>
              <input className="field" dir="ltr" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
          </div>
          <div className="flex flex-wrap gap-2 pt-2">
            <button
              className="btn-primary"
              onClick={() => {
                if (session) setSession({ ...session, name, phone })
                toast('تم حفظ التغييرات')
              }}
            >
              حفظ التغييرات
            </button>
            <button className="btn-secondary" onClick={() => { setOpen(true); setErr(''); setCur(''); setNext(''); setConfirm('') }}>
              <KeyRound className="h-4 w-4" /> تغيير كلمة المرور
            </button>
          </div>
        </div>
      </div>

      {open && (
        <Modal title="تغيير كلمة المرور" onClose={() => setOpen(false)}>
          <div className="mt-4 space-y-3">
            <div>
              <label className="mb-1.5 block text-xs font-semibold">كلمة المرور الحالية</label>
              <input type="password" className="field" value={cur} onChange={(e) => setCur(e.target.value)} />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold">كلمة المرور الجديدة</label>
              <input type="password" className="field" value={next} onChange={(e) => setNext(e.target.value)} />
              {strength && <p className="mt-1 text-[11px] text-mute">{strength}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold">تأكيد كلمة المرور الجديدة</label>
              <input type="password" className="field" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
            </div>
            {err && <p className="text-[11px] font-medium">⚠ {err}</p>}
          </div>
          <div className="mt-4 flex gap-2">
            <button
              className="btn-primary flex-1"
              onClick={() => {
                if (!cur.trim()) return setErr('كلمة المرور الحالية غير صحيحة')
                if (next.length < 6) return setErr('كلمة المرور يجب أن تكون 6 أحرف على الأقل')
                if (next !== confirm) return setErr('كلمة المرور غير متطابقة')
                logSecurity({ type: 'تغيير كلمة مرور', user: session?.phone || '—', result: 'نجاح', details: 'من الملف الشخصي' })
                setOpen(false)
                toast('تم تغيير كلمة المرور بنجاح')
              }}
            >
              تغيير
            </button>
            <button className="btn-ghost flex-1" onClick={() => setOpen(false)}>إلغاء</button>
          </div>
        </Modal>
      )}
      {node}
    </div>
  )
}
