import { useNavigate } from 'react-router-dom'
import {
  Store,
  Camera,
  FileEdit,
  KeyRound,
  Globe,
  Headphones,
  Info,
  LogOut,
  ChevronLeft,
  MapPin,
} from 'lucide-react'

const groups = [
  {
    title: 'الحساب',
    items: [
      { icon: FileEdit, label: 'تعديل بيانات المحل' },
      { icon: KeyRound, label: 'تغيير كلمة المرور' },
    ],
  },
  {
    title: 'عام',
    items: [
      { icon: Globe, label: 'تغيير اللغة — العربية' },
      { icon: Headphones, label: 'المساعدة والدعم' },
      { icon: Info, label: 'معلومات التطبيق — الإصدار 1.0.0' },
    ],
  },
]

export default function Profile() {
  const navigate = useNavigate()
  return (
    <div className="px-5 pt-6">
      <h1 className="text-lg font-bold">الملف الشخصي</h1>

      <div className="card mt-4 p-5">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-black text-white">
              <Store className="h-7 w-7" strokeWidth={1.5} />
            </div>
            <button className="absolute -bottom-1 -left-1 flex h-7 w-7 items-center justify-center rounded-xl border border-line bg-white shadow-sm">
              <Camera className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold">محل زاجل</p>
            <p className="mt-0.5 text-[11px] text-mute">أكمل تسجيل الدخول لعرض بيانات محلك</p>
            <span className="badge mt-1.5 bg-black text-white">نشط 🟢</span>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2 rounded-2xl bg-page px-3.5 py-3">
          <MapPin className="h-4 w-4 shrink-0 text-faint" />
          <p className="text-[11px] font-medium text-mute">العنوان والموقع على الخريطة — يُعرض بعد تسجيل الدخول</p>
        </div>
      </div>

      {groups.map((g) => (
        <div key={g.title} className="mt-5">
          <p className="mb-2 px-1 text-[11px] font-bold text-faint">{g.title}</p>
          <div className="card divide-y divide-line overflow-hidden">
            {g.items.map((item) => (
              <button key={item.label} className="flex w-full items-center gap-3.5 px-4 py-3.5 text-right transition-colors active:bg-page">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-page">
                  <item.icon className="h-4.5 w-4.5" strokeWidth={1.7} />
                </span>
                <span className="flex-1 text-[13px] font-semibold">{item.label}</span>
                <ChevronLeft className="h-4 w-4 text-faint" />
              </button>
            ))}
          </div>
        </div>
      ))}

      <button
        onClick={() => navigate('/login')}
        className="card mt-5 mb-6 flex w-full items-center gap-3.5 px-4 py-3.5 text-right transition-colors active:bg-page"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-black text-white">
          <LogOut className="h-4.5 w-4.5" strokeWidth={1.7} />
        </span>
        <span className="flex-1 text-[13px] font-bold">تسجيل الخروج</span>
      </button>
    </div>
  )
}
