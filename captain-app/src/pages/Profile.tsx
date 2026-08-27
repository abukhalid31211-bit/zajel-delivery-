import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  User, Camera, CalendarClock, KeyRound, FileUp, BarChart3, Globe, Headphones, Info, LogOut, ChevronLeft, Star, Trash2,
} from 'lucide-react'
import Modal from '../components/Modal'
import { useToast } from '../components/Toast'
import { useCaptain, type AccountStatus } from '../state'

const groups = [
  {
    title: 'الحساب',
    items: [
      { icon: CalendarClock, label: 'تغيير الشفت', to: '/shift' },
      { icon: KeyRound, label: 'تغيير كلمة المرور', to: '/change-password' },
      { icon: FileUp, label: 'تحديث الوثائق', to: '/documents' },
      { icon: BarChart3, label: 'إحصائياتي', to: '/stats' },
    ],
  },
  {
    title: 'عام',
    items: [
      { icon: Globe, label: 'تغيير اللغة (العربية)', to: '/language' },
      { icon: Headphones, label: 'المساعدة والدعم', to: '/support' },
      { icon: Info, label: 'معلومات التطبيق (إصدار 1.0.0)', to: '/about' },
      { icon: Trash2, label: 'حذف الحساب', to: '/delete-account' },
    ],
  },
]

const statuses: { value: AccountStatus; label: string }[] = [
  { value: 'active', label: 'نشط' },
  { value: 'pending', label: 'قيد الموافقة' },
  { value: 'suspended', label: 'موقوف' },
  { value: 'rejected', label: 'مرفوض' },
]

export default function Profile() {
  const navigate = useNavigate()
  const { state, setStatus, logout, money } = useCaptain()
  const { toast, node } = useToast()
  const [confirmLogout, setConfirmLogout] = useState(false)
  const captain = state.captain
  const delivered = state.orders.filter((o) => o.stage === 'delivered')
  const earned = delivered.reduce((a, o) => a + o.deliveryFee, 0)

  return (
    <div className="px-5 pt-6">
      <h1 className="text-lg font-bold">الملف الشخصي</h1>

      <div className="card mt-4 p-5">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#d4af37] to-[#986f00] text-white">
              <User className="h-7 w-7" strokeWidth={1.5} />
            </div>
            <label className="absolute -bottom-1 -left-1 flex h-7 w-7 cursor-pointer items-center justify-center rounded-xl border border-line bg-white shadow-sm">
              <Camera className="h-3.5 w-3.5" />
              <input type="file" accept="image/*" className="hidden" />
            </label>
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold">{captain?.name || 'كابتن زاجل'}</p>
            <p className="mt-0.5 text-[11px] text-mute">{captain ? `+964 ${captain.phone}` : 'أكمل تسجيل الدخول لعرض بياناتك'}</p>
            <div className="mt-1.5 flex items-center gap-2">
              <span className={`badge ${captain?.status === 'active' ? 'bg-gold text-white' : 'bg-faint text-white'}`}>
                {captain?.status === 'active' ? 'نشط 🟢' : captain?.status === 'pending' ? 'قيد الموافقة ⏳' : captain?.status === 'suspended' ? 'موقوف 🚫' : captain?.status === 'rejected' ? 'مرفوض ❌' : 'غير معروف'}
              </span>
              <span className="flex items-center gap-1 text-[11px] font-bold">
                <Star className="h-3.5 w-3.5 fill-gold text-gold" /> {state.ratings.length ? (state.ratings.reduce((a, r) => a + r.stars, 0) / state.ratings.length).toFixed(1) : 'لا تقييم'}
              </span>
            </div>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-3 divide-x divide-x-reverse divide-line rounded-2xl border border-line">
          {[
            ['إجمالي الطلبات', String(state.orders.length)],
            ['المكتملة', String(delivered.length)],
            ['أرباحك', money(earned)],
          ].map(([l, v]) => (
            <div key={l} className="px-2 py-3 text-center">
              <p className="text-base font-bold">{v}</p>
              <p className="mt-0.5 text-[10px] text-mute">{l}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="card mt-5 p-4">
        <p className="mb-2 text-[11px] font-bold text-faint">حالة الحساب (وضع العرض المحلي)</p>
        <div className="flex gap-2">
          {statuses.map((s) => (
            <button key={s.value} onClick={() => { setStatus(s.value); toast(`تم ضبط الحالة: ${s.label}`) }} className={`flex-1 rounded-xl px-2 py-2 text-[10px] font-bold ${captain?.status === s.value ? 'bg-gold text-white' : 'border border-line bg-white text-mute'}`}>{s.label}</button>
          ))}
        </div>
      </div>

      {groups.map((g) => (
        <div key={g.title} className="mt-5">
          <p className="mb-2 px-1 text-[11px] font-bold text-faint">{g.title}</p>
          <div className="card divide-y divide-line overflow-hidden">
            {g.items.map((item) => (
              <button key={item.label} onClick={() => navigate(item.to)} className="flex w-full items-center gap-3.5 px-4 py-3.5 text-right transition-colors active:bg-page">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gold-light">
                  <item.icon className="h-4.5 w-4.5 text-gold-dark" strokeWidth={1.7} />
                </span>
                <span className="flex-1 text-[13px] font-semibold">{item.label}</span>
                <ChevronLeft className="h-4 w-4 text-faint" />
              </button>
            ))}
          </div>
        </div>
      ))}

      <button onClick={() => setConfirmLogout(true)} className="card mt-5 mb-6 flex w-full items-center gap-3.5 px-4 py-3.5 text-right transition-colors active:bg-page">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gold text-white">
          <LogOut className="h-4.5 w-4.5" strokeWidth={1.7} />
        </span>
        <span className="flex-1 text-[13px] font-bold">تسجيل الخروج</span>
      </button>

      {confirmLogout && (
        <Modal title="تسجيل الخروج؟" onClose={() => setConfirmLogout(false)}>
          <p className="mt-2 text-xs leading-relaxed text-mute">هل تريد تسجيل الخروج من حسابك؟</p>
          <div className="mt-5 flex gap-2">
            <button className="btn-primary flex-1" onClick={() => { logout(); navigate('/login') }}>تأكيد</button>
            <button className="btn-secondary flex-1" onClick={() => setConfirmLogout(false)}>إلغاء</button>
          </div>
        </Modal>
      )}

      {node}
    </div>
  )
}
