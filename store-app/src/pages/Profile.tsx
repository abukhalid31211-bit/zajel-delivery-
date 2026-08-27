import { useNavigate } from 'react-router-dom'
import {
  Store, Camera, FileEdit, KeyRound, Globe, Headphones, Info, LogOut, ChevronLeft, MapPin, Trash2,
} from 'lucide-react'
import Modal from '../components/Modal'
import { useToast } from '../components/Modal'
import { useState } from 'react'
import { useStore } from '../lib/StoreContext'
import { MapView } from '../lib/MapLib'

const groups = [
  {
    title: 'الحساب',
    items: [
      { icon: FileEdit, label: 'تعديل بيانات المحل', to: '/edit-store' },
      { icon: KeyRound, label: 'تغيير كلمة المرور', to: '/change-password' },
    ],
  },
  {
    title: 'عام',
    items: [
      { icon: Globe, label: 'تغيير اللغة', to: '/language', hint: '' },
      { icon: Headphones, label: 'المساعدة والدعم', to: '/support' },
      { icon: Info, label: 'معلومات التطبيق', to: '/about' },
      { icon: Trash2, label: 'حذف الحساب', to: '/delete-account' },
    ],
  },
]

export default function Profile() {
  const navigate = useNavigate()
  const { profile, updateProfile, logout, language } = useStore()
  const { toast, node } = useToast()
  const [confirmLogout, setConfirmLogout] = useState(false)
  const [langLabel, setLangLabel] = useState(language === 'ar' ? 'العربية' : language === 'ku' ? 'کوردی' : 'English')

  const onLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      updateProfile({ logo: String(reader.result) })
      toast('تم تحديث صورة المحل ✅')
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="px-5 pt-6">
      <h1 className="text-lg font-extrabold">الملف الشخصي</h1>

      <div className="card mt-4 p-5">
        <div className="flex items-center gap-4">
          <div className="relative">
            {profile?.logo ? (
              <img src={profile.logo} alt="شعار المحل" className="h-16 w-16 rounded-2xl border border-line object-cover" />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gold-soft text-gold-strong">
                <Store className="h-7 w-7" strokeWidth={1.5} />
              </div>
            )}
            <label className="absolute -bottom-1 -left-1 flex h-7 w-7 cursor-pointer items-center justify-center rounded-xl border border-line bg-white shadow-sm">
              <Camera className="h-3.5 w-3.5 text-gold-strong" />
              <input type="file" accept="image/*" className="hidden" onChange={onLogo} />
            </label>
          </div>
          <div className="flex-1">
            <p className="text-sm font-extrabold">{profile?.name ?? 'محل زاجل'}</p>
            <p className="mt-0.5 text-[11px] text-mute">{profile?.type ?? '—'}</p>
            <span className="badge mt-1.5 bg-gold text-white">نشط 🟢</span>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2 rounded-2xl bg-gold-faint px-3.5 py-3">
          <MapPin className="h-4 w-4 shrink-0 text-gold" />
          <p className="text-[11px] font-bold text-gold-deep">
            {profile?.address ? `${profile.address} — ${profile.governorate}` : 'العنوان والموقع على الخريطة'}
          </p>
        </div>
        {profile?.location && (
          <div className="mt-3">
            <MapView center={profile.location} height={130} markers={[{ pos: profile.location, kind: 'store', label: profile.name }]} />
          </div>
        )}
      </div>

      {groups.map((g) => (
        <div key={g.title} className="mt-5">
          <p className="mb-2 px-1 text-[11px] font-extrabold text-faint">{g.title}</p>
          <div className="card divide-y divide-line overflow-hidden">
            {g.items.map((item) => (
              <button
                key={item.label}
                onClick={() => {
                  if (item.to === '/language') {
                    setLangLabel(language === 'ar' ? 'العربية' : language === 'ku' ? 'کوردی' : 'English')
                  }
                  navigate(item.to)
                }}
                className="flex w-full items-center gap-3.5 px-4 py-3.5 text-right transition-colors active:bg-gold-faint"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gold-soft text-gold-strong">
                  <item.icon className="h-4.5 w-4.5" strokeWidth={1.7} />
                </span>
                <span className="flex-1 text-[13px] font-bold">{item.label}</span>
                {item.label === 'تغيير اللغة' && <span className="text-[10px] text-faint">{langLabel}</span>}
                <ChevronLeft className="h-4 w-4 text-faint" />
              </button>
            ))}
          </div>
        </div>
      ))}

      <button
        onClick={() => setConfirmLogout(true)}
        className="card mt-5 mb-6 flex w-full items-center gap-3.5 px-4 py-3.5 text-right transition-colors active:bg-gold-faint"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gold text-white">
          <LogOut className="h-4.5 w-4.5" strokeWidth={1.7} />
        </span>
        <span className="flex-1 text-[13px] font-bold">تسجيل الخروج</span>
      </button>

      {confirmLogout && (
        <Modal title="تسجيل الخروج؟" subtitle="ستحتاج إلى تسجيل الدخول مجدداً للوصول إلى حسابك." onClose={() => setConfirmLogout(false)}>
          <div className="mt-4 flex gap-2">
            <button
              className="btn-primary flex-1"
              onClick={() => {
                logout()
                navigate('/login')
              }}
            >
              تسجيل الخروج
            </button>
            <button className="btn-secondary flex-1" onClick={() => setConfirmLogout(false)}>
              إلغاء
            </button>
          </div>
        </Modal>
      )}

      {node}
    </div>
  )
}
