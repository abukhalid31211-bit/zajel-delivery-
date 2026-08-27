import { useNavigate } from 'react-router-dom'
import {
  User,
  Camera,
  CalendarClock,
  KeyRound,
  FileUp,
  BarChart3,
  Globe,
  Headphones,
  Info,
  LogOut,
  ChevronLeft,
  Star,
  Trash2,
} from 'lucide-react'

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
      { icon: Globe, label: 'تغيير اللغة — العربية', to: '/language' },
      { icon: Headphones, label: 'المساعدة والدعم', to: '/support' },
      { icon: Info, label: 'معلومات التطبيق — الإصدار 1.0.0', to: '/about' },
      { icon: Trash2, label: 'حذف الحساب', to: '/delete-account' },
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
              <User className="h-7 w-7" strokeWidth={1.5} />
            </div>
            <button className="absolute -bottom-1 -left-1 flex h-7 w-7 items-center justify-center rounded-xl border border-line bg-white shadow-sm">
              <Camera className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold">كابتن زاجل</p>
            <p className="mt-0.5 text-[11px] text-mute">أكمل تسجيل الدخول لعرض بياناتك</p>
            <div className="mt-1.5 flex items-center gap-2">
              <span className="badge bg-black text-white">نشط 🟢</span>
              <span className="flex items-center gap-1 text-[11px] font-bold">
                <Star className="h-3.5 w-3.5 fill-black" /> —
              </span>
            </div>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-3 divide-x divide-x-reverse divide-line rounded-2xl border border-line">
          {[
            ['إجمالي الطلبات', '0'],
            ['المكتملة', '0'],
            ['ساعات الأسبوع', '0'],
          ].map(([l, v]) => (
            <div key={l} className="px-2 py-3 text-center">
              <p className="text-base font-bold">{v}</p>
              <p className="mt-0.5 text-[10px] text-mute">{l}</p>
            </div>
          ))}
        </div>
      </div>

      {groups.map((g) => (
        <div key={g.title} className="mt-5">
          <p className="mb-2 px-1 text-[11px] font-bold text-faint">{g.title}</p>
          <div className="card divide-y divide-line overflow-hidden">
            {g.items.map((item) => (
              <button
                key={item.label}
                onClick={() => navigate(item.to)}
                className="flex w-full items-center gap-3.5 px-4 py-3.5 text-right transition-colors active:bg-page"
              >
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
