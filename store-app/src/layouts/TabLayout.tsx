import { NavLink, Outlet } from 'react-router-dom'
import { Home, ClipboardList, BarChart3, User } from 'lucide-react'

const tabs = [
  { to: '/home', label: 'الرئيسية', icon: Home },
  { to: '/orders', label: 'سجل الطلبات', icon: ClipboardList },
  { to: '/reports', label: 'التقارير', icon: BarChart3 },
  { to: '/profile', label: 'حسابي', icon: User },
]

export default function TabLayout() {
  return (
    <div className="app-shell">
      <div className="flex-1 pb-24">
        <Outlet />
      </div>
      <nav className="fixed bottom-0 z-30 mx-auto w-full max-w-[430px] border-t border-line bg-white/95 backdrop-blur" style={{ insetInlineStart: 0, insetInlineEnd: 0 }}>
        <div className="flex items-stretch justify-around px-2 pb-[max(env(safe-area-inset-bottom),10px)] pt-2">
          {tabs.map((t) => (
            <NavLink
              key={t.to}
              to={t.to}
              className={({ isActive }) =>
                `flex flex-1 flex-col items-center gap-1 rounded-2xl py-1.5 transition-colors ${
                  isActive ? 'text-black' : 'text-faint'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span className={`flex h-9 w-14 items-center justify-center rounded-full transition-colors ${isActive ? 'bg-black text-white' : ''}`}>
                    <t.icon className="h-[19px] w-[19px]" strokeWidth={isActive ? 2 : 1.7} />
                  </span>
                  <span className="text-[10px] font-semibold">{t.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
