import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Package,
  Bike,
  Store,
  Map,
  Tag,
  BarChart3,
  Wallet,
  Bell,
  MessageSquareWarning,
  ShieldCheck,
  FileClock,
  Settings,
  PenSquare,
  Search,
  LogOut,
  User,
  ChevronDown,
  Menu,
  X,
} from 'lucide-react'
import Logo from '../components/Logo'

const nav = [
  { to: '/', label: 'الرئيسية (Dashboard)', icon: LayoutDashboard, end: true },
  { to: '/orders', label: 'إدارة الطلبيات', icon: Package },
  { to: '/captains', label: 'إدارة الكباتن', icon: Bike },
  { to: '/stores', label: 'المحلات والمطاعم', icon: Store },
  { to: '/zones', label: 'المناطق والجغرافيا', icon: Map },
  { to: '/pricing', label: 'أسعار التوصيل', icon: Tag },
  { to: '/reports', label: 'التقارير والمحاسبة', icon: BarChart3 },
  { to: '/settlement', label: 'التسوية المالية', icon: Wallet },
  { to: '/notifications', label: 'مركز الإشعارات', icon: Bell },
  { to: '/complaints', label: 'الشكاوى والمشاكل', icon: MessageSquareWarning },
  { to: '/cms', label: 'إدارة المحتوى (CMS)', icon: PenSquare },
  { to: '/admins', label: 'الأدمن والصلاحيات', icon: ShieldCheck },
  { to: '/audit-log', label: 'سجل العمليات', icon: FileClock },
  { to: '/settings', label: 'الإعدادات المركزية', icon: Settings },
]

export default function AdminLayout() {
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  return (
    <div className="flex min-h-screen">
      {/* ---- Sidebar ---- */}
      <aside
        className={`fixed inset-y-0 right-0 z-40 flex w-64 flex-col border-l border-line bg-white transition-transform lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <Logo size={38} />
          <button className="lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-[13px] font-medium transition-colors ${
                  isActive ? 'bg-black text-white' : 'text-mute hover:bg-page hover:text-black'
                }`
              }
            >
              <item.icon className="h-[18px] w-[18px] shrink-0" strokeWidth={1.8} />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-line p-3">
          <button
            onClick={() => navigate('/login')}
            className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-[13px] font-medium text-mute transition-colors hover:bg-page hover:text-black"
          >
            <LogOut className="h-[18px] w-[18px]" strokeWidth={1.8} />
            تسجيل الخروج
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ---- Main ---- */}
      <div className="flex min-w-0 flex-1 flex-col lg:mr-64">
        {/* Topbar */}
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-line bg-white/90 px-4 backdrop-blur lg:px-6">
          <button className="lg:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </button>
          <div className="relative hidden max-w-md flex-1 md:block">
            <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
            <input
              className="field bg-page pr-9"
              placeholder="ابحث عن طلب، كابتن، محل، رقم هاتف... (Enter للبحث المتقدم)"
              onKeyDown={(e) => e.key === 'Enter' && navigate('/search')}
            />
          </div>
          <div className="flex-1 md:hidden" />
          <button className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-line transition-colors hover:bg-page">
            <Bell className="h-[18px] w-[18px]" strokeWidth={1.8} />
            <span className="absolute left-2 top-2 h-1.5 w-1.5 rounded-full bg-black" />
          </button>
          <div className="relative">
            <button
              onClick={() => setProfileOpen((v) => !v)}
              className="flex items-center gap-2.5 rounded-xl border border-line py-1.5 pl-3 pr-1.5 transition-colors hover:bg-page"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-black text-white">
                <User className="h-4 w-4" />
              </span>
              <span className="hidden text-right sm:block">
                <span className="block text-xs font-semibold leading-none">مدير النظام</span>
                <span className="mt-1 block text-[10px] leading-none text-faint">Super Admin</span>
              </span>
              <ChevronDown className="h-3.5 w-3.5 text-faint" />
            </button>
            {profileOpen && (
              <div className="animate-fade-up absolute left-0 top-12 w-44 overflow-hidden rounded-xl border border-line bg-white shadow-lg">
                <button
                  onClick={() => {
                    setProfileOpen(false)
                    navigate('/profile')
                  }}
                  className="flex w-full items-center gap-2 px-4 py-2.5 text-xs font-medium hover:bg-page"
                >
                  <User className="h-4 w-4" /> الملف الشخصي
                </button>
                <button
                  onClick={() => navigate('/login')}
                  className="flex w-full items-center gap-2 border-t border-line px-4 py-2.5 text-xs font-medium hover:bg-page"
                >
                  <LogOut className="h-4 w-4" /> تسجيل الخروج
                </button>
              </div>
            )}
          </div>
        </header>

        <main className="animate-fade-up flex-1 p-4 lg:p-6">
          <Outlet />
        </main>

        <footer className="border-t border-line px-6 py-3 text-center text-[11px] text-faint">
          زاجل ديلفري — يوصلك بسرعة وثقة © {new Date().getFullYear()}
        </footer>
      </div>
    </div>
  )
}
