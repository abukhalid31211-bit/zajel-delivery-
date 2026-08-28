import { useEffect, useMemo, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Package,
  Bike,
  Store,
  Map,
  Tag,
  Tags,
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
  ShieldAlert,
} from 'lucide-react'
import Logo from '../components/Logo'
import Modal from '../components/Modal'
import OfflineBanner from '../components/OfflineBanner'
import SessionExpiry from '../components/SessionExpiry'
import { useToast } from '../components/Toast'
import { clearSession, getSession } from '../lib/session'
import { getSettings, applyTheme, getTheme, getBrand } from '../lib/settings'
import { logSecurity } from '../lib/store'
import { dbGet } from '../lib/db'
import type { Captain, OrderItem, SentNotification, StoreItem } from '../lib/types'
import { can, inCaptainScope, inOrderScope, inStoreScope, isSuper, NAV_SECTION } from '../lib/rbac'
import { useT } from '../lib/i18n'

type Child = { to: string; label: string }
type Item = { to: string; label: string; icon: typeof LayoutDashboard; end?: boolean; children?: Child[] }

const nav: Item[] = [
  { to: '/', label: 'الرئيسية (Dashboard)', icon: LayoutDashboard, end: true },
  {
    to: '/orders',
    label: 'إدارة الطلبيات',
    icon: Package,
    children: [
      { to: '/orders', label: 'قائمة جميع الطلبات' },
      { to: '/orders?tab=active', label: 'الطلبيات النشطة' },
      { to: '/orders?tab=stuck', label: 'الطلبيات العالقة ⚠️' },
      { to: '/orders/details', label: 'تفاصيل الطلب' },
    ],
  },
  {
    to: '/captains',
    label: 'إدارة الكباتن',
    icon: Bike,
    children: [
      { to: '/captains', label: 'قائمة الكباتن' },
      { to: '/captains?tab=pending', label: 'طلبات تسجيل الكباتن' },
      { to: '/captains?tab=shifts', label: 'شفتات العمل' },
      { to: '/captains?tab=attendance', label: 'سجل الحضور والغياب' },
    ],
  },
  {
    to: '/stores',
    label: 'المحلات والمطاعم',
    icon: Store,
    children: [
      { to: '/stores', label: 'قائمة المحلات' },
      { to: '/stores?tab=pending', label: 'طلبات المحلات الجديدة' },
      { to: '/stores?tab=changes', label: 'طلبات تعديل البيانات' },
    ],
  },
  {
    to: '/zones',
    label: 'المناطق والجغرافيا',
    icon: Map,
    children: [
      { to: '/zones', label: 'المحافظات' },
      { to: '/zones?tab=districts', label: 'المناطق' },
      { to: '/zones?tab=geo', label: 'رسم الحدود (Geofencing)' },
    ],
  },
  {
    to: '/pricing',
    label: 'أسعار التوصيل',
    icon: Tag,
    children: [
      { to: '/pricing', label: 'نظام من ← إلى' },
      { to: '/pricing?tab=geo', label: 'نظام المناطق الجغرافية' },
    ],
  },
  { to: '/price-customization', label: 'تخصيص الأسعار', icon: Tags },
  {
    to: '/reports',
    label: 'التقارير والمحاسبة',
    icon: BarChart3,
    children: [
      { to: '/reports', label: 'تقرير الطلبيات' },
      { to: '/reports?tab=captains', label: 'تقرير الكباتن' },
      { to: '/reports?tab=stores', label: 'تقرير المحلات' },
      { to: '/reports?tab=zones', label: 'تقرير المناطق' },
      { to: '/reports?tab=captain-app', label: 'تقارير تطبيق الكابتن' },
      { to: '/reports?tab=store-app', label: 'تقارير تطبيق المحل' },
      { to: '/reports?tab=custom', label: 'تقرير مخصص' },
      { to: '/settlement', label: 'التسوية المالية' },
    ],
  },
  { to: '/settlement', label: 'التسوية المالية', icon: Wallet },
  { to: '/notifications', label: 'مركز الإشعارات', icon: Bell },
  { to: '/complaints', label: 'الشكاوى والمشاكل', icon: MessageSquareWarning },
  {
    to: '/cms',
    label: 'إدارة المحتوى (CMS)',
    icon: PenSquare,
    children: [
      { to: '/cms?tab=c-screens', label: 'شاشات الكابتن' },
      { to: '/cms?tab=s-screens', label: 'شاشات المحل' },
      { to: '/cms?tab=c-copy', label: 'قاموس الكابتن' },
      { to: '/cms?tab=s-copy', label: 'قاموس المحل' },
      { to: '/cms?tab=options', label: 'قوائم الخيارات' },
      { to: '/cms?tab=templates', label: 'قوالب الإشعارات' },
      { to: '/cms?tab=auto', label: 'الرسائل التلقائية' },
      { to: '/cms?tab=sms', label: 'رسائل SMS' },
      { to: '/cms?tab=legal', label: 'النصوص القانونية' },
      { to: '/cms?tab=faq', label: 'أسئلة شائعة' },
      { to: '/cms?tab=banners', label: 'البانرات' },
      { to: '/cms?tab=theme', label: 'الألوان والثيم' },
      { to: '/cms?tab=brand', label: 'الشعار والهوية' },
    ],
  },
  {
    to: '/admins',
    label: 'الأدمنات الفرعيين والصلاحيات',
    icon: ShieldCheck,
    children: [
      { to: '/admins', label: 'الأدمن الفرعي' },
      { to: '/admins?tab=perms', label: 'الصلاحيات' },
    ],
  },
  {
    to: '/audit-log',
    label: 'سجل العمليات',
    icon: FileClock,
    children: [
      { to: '/audit-log', label: 'سجل العمليات (Audit Log)' },
      { to: '/audit-log?tab=security', label: 'سجل الأمان' },
    ],
  },
  { to: '/settings', label: 'الإعدادات المركزية', icon: Settings },
]

export default function AdminLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const session = getSession()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [logoutOpen, setLogoutOpen] = useState(false)
  const [bellOpen, setBellOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [q, setQ] = useState('')
  const [openMenus, setOpenMenus] = useState<string[]>([])
  const { toast, node } = useToast()
  const settings = getSettings()
  const brand = getBrand()
  const notes = dbGet<SentNotification[]>('notifications', [])
  const t = useT()
  const visibleNav = nav.filter((item) => {
    const sec = NAV_SECTION[item.to] || 'ANY'
    if (sec === 'ANY') return true
    if (sec === 'SUPER') return isSuper()
    return can(sec)
  })

  useEffect(() => {
    applyTheme(getTheme())
  }, [])

  useEffect(() => {
    const match = nav.find((n) => n.children && (location.pathname === n.to || location.pathname.startsWith(n.to + '/')))
    if (match) setOpenMenus((m) => (m.includes(match.to) ? m : [...m, match.to]))
  }, [location.pathname])

  const readySearch = q.trim().length >= 3
  const qn = q.trim()
  const orderHits = useMemo(
    () => (qn.length < 3 ? [] : dbGet<OrderItem[]>('orders', []).filter((o) => inOrderScope(o) && `${o.number} ${o.storeName} ${o.customerName} ${o.customerPhone}`.includes(qn)).slice(0, 5)),
    [qn],
  )
  const capHits = useMemo(
    () => (qn.length < 3 ? [] : dbGet<Captain[]>('captains', []).filter((c) => inCaptainScope(c) && `${c.name} ${c.phone}`.includes(qn)).slice(0, 5)),
    [qn],
  )
  const storeHits = useMemo(
    () => (qn.length < 3 ? [] : dbGet<StoreItem[]>('stores', []).filter((s) => inStoreScope(s) && `${s.name} ${s.phone}`.includes(qn)).slice(0, 5)),
    [qn],
  )

  return (
    <div className="flex min-h-screen">
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
          {visibleNav.map((item) => (
            <div key={item.to + item.label}>
              <div className="flex items-center">
                <NavLink
                  to={item.to}
                  end={item.end}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex min-w-0 flex-1 items-center gap-3 rounded-xl px-3.5 py-2.5 text-[13px] font-medium transition-colors ${
                      isActive ? 'bg-black text-white' : 'text-mute hover:bg-page hover:text-black'
                    }`
                  }
                >
                  <item.icon className="h-[18px] w-[18px] shrink-0" strokeWidth={1.8} />
                  <span className="truncate">{item.label}</span>
                </NavLink>
                {item.children && (
                  <button
                    type="button"
                    className="rounded-lg p-1.5 text-faint hover:bg-page hover:text-black"
                    onClick={() => setOpenMenus((m) => (m.includes(item.to) ? m.filter((x) => x !== item.to) : [...m, item.to]))}
                  >
                    <ChevronDown className={`h-3.5 w-3.5 transition-transform ${openMenus.includes(item.to) ? 'rotate-180' : ''}`} />
                  </button>
                )}
              </div>
              {item.children && openMenus.includes(item.to) && (
                <div className="mb-1 mr-6 mt-0.5 space-y-0.5 border-r border-line pr-2">
                  {item.children.map((c) => (
                    <NavLink
                      key={c.to + c.label}
                      to={c.to}
                      onClick={() => setSidebarOpen(false)}
                      className="block rounded-lg px-2.5 py-1.5 text-[11px] font-medium text-mute hover:bg-page hover:text-black"
                    >
                      {c.label}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
        <div className="border-t border-line p-3">
          <button
            onClick={() => setLogoutOpen(true)}
            className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-[13px] font-medium text-mute transition-colors hover:bg-page hover:text-black"
          >
            <LogOut className="h-[18px] w-[18px]" strokeWidth={1.8} />
            تسجيل الخروج
          </button>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 z-30 bg-black/30 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <div className="flex min-w-0 flex-1 flex-col lg:mr-64">
        <OfflineBanner />
        {settings.maintenance && (
          <div className="bg-[#333] px-4 py-2 text-center text-[11px] font-semibold text-white">
            ⚠️ النظام في وضع الصيانة. إنشاء الطلبات متوقف حالياً — {settings.maintenanceMessage}
          </div>
        )}
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-line bg-white/90 px-4 backdrop-blur lg:px-6">
          <button className="lg:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </button>
          <div className="relative hidden max-w-md flex-1 md:block">
            <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
            <input
              className="field bg-page pr-9"
              placeholder="ابحث عن طلب، كابتن، محل، رقم هاتف..."
              value={q}
              onChange={(e) => {
                setQ(e.target.value)
                setSearchOpen(true)
              }}
              onFocus={() => setSearchOpen(true)}
              onKeyDown={(e) => e.key === 'Enter' && navigate('/search')}
            />
            {searchOpen && (
              <div className="absolute top-12 z-30 w-full overflow-hidden rounded-2xl border border-line bg-white shadow-lg">
                {!readySearch && <p className="px-4 py-3 text-[11px] text-mute">{t('search_min')}</p>}
                {readySearch && (
                  <div className="max-h-80 divide-y divide-line overflow-y-auto">
                    <div className="px-4 py-2">
                      <p className="text-[11px] font-bold">طلبات</p>
                      {orderHits.length === 0 ? <p className="mt-1 text-[11px] text-faint">{t('search_none')}</p> : orderHits.map((o) => (
                        <button key={o.id} className="block w-full py-1.5 text-right text-xs hover:underline" onClick={() => { setSearchOpen(false); navigate(`/orders/details?id=${o.id}`) }}>{o.number} · {o.status} · {o.storeName}</button>
                      ))}
                    </div>
                    <div className="px-4 py-2">
                      <p className="text-[11px] font-bold">كباتن</p>
                      {capHits.length === 0 ? <p className="mt-1 text-[11px] text-faint">{t('search_none')}</p> : capHits.map((c) => (
                        <button key={c.id} className="block w-full py-1.5 text-right text-xs hover:underline" onClick={() => { setSearchOpen(false); navigate(`/captains/profile?id=${c.id}`) }}>{c.name} · {c.phone} · {c.status}</button>
                      ))}
                    </div>
                    <div className="px-4 py-2">
                      <p className="text-[11px] font-bold">محلات</p>
                      {storeHits.length === 0 ? <p className="mt-1 text-[11px] text-faint">{t('search_none')}</p> : storeHits.map((s) => (
                        <button key={s.id} className="block w-full py-1.5 text-right text-xs hover:underline" onClick={() => { setSearchOpen(false); navigate(`/stores/profile?id=${s.id}`) }}>{s.name} · {s.phone} · {s.status}</button>
                      ))}
                    </div>
                  </div>
                )}
                <button
                  className="w-full border-t border-line px-4 py-2.5 text-center text-[11px] font-semibold hover:bg-page"
                  onClick={() => {
                    setSearchOpen(false)
                    navigate('/search')
                  }}
                >
                  بحث متقدم
                </button>
              </div>
            )}
          </div>
          <button className="flex h-10 w-10 items-center justify-center rounded-xl border border-line md:hidden" onClick={() => navigate('/search')}>
            <Search className="h-[18px] w-[18px]" />
          </button>
          <div className="flex-1 md:hidden" />
          <div className="relative">
            <button
              className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-line transition-colors hover:bg-page"
              onClick={() => {
                setBellOpen((v) => !v)
                setProfileOpen(false)
              }}
            >
              <Bell className="h-[18px] w-[18px]" strokeWidth={1.8} />
              {notes.length > 0 && <span className="absolute left-2 top-2 h-1.5 w-1.5 rounded-full bg-black" />}
            </button>
            {bellOpen && (
              <div className="animate-fade-up absolute left-0 top-12 w-80 overflow-hidden rounded-2xl border border-line bg-white shadow-lg">
                <p className="border-b border-line px-4 py-2.5 text-xs font-bold">الإشعارات</p>
                {notes.slice(0, 10).length === 0 ? (
                  <p className="px-4 py-8 text-center text-[11px] text-mute">لا توجد إشعارات غير مقروءة</p>
                ) : (
                  notes.slice(0, 10).map((n) => (
                    <div key={n.id} className="border-b border-line px-4 py-2.5 last:border-0">
                      <p className="text-xs font-bold">{n.title}</p>
                      <p className="mt-0.5 text-[11px] text-mute">{n.body}</p>
                    </div>
                  ))
                )}
                <button
                  className="w-full px-4 py-2.5 text-center text-[11px] font-semibold hover:bg-page"
                  onClick={() => {
                    setBellOpen(false)
                    navigate('/notifications?tab=log')
                  }}
                >
                  عرض الكل
                </button>
              </div>
            )}
          </div>
          <div className="relative">
            <button
              onClick={() => {
                setProfileOpen((v) => !v)
                setBellOpen(false)
              }}
              className="flex items-center gap-2.5 rounded-xl border border-line py-1.5 pl-3 pr-1.5 transition-colors hover:bg-page"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-black text-white">
                <User className="h-4 w-4" />
              </span>
              <span className="hidden text-right sm:block">
                <span className="block text-xs font-semibold leading-none">{session?.name || 'مدير النظام'}</span>
                <span className="mt-1 block text-[10px] leading-none text-faint">{session?.role || 'Super Admin'}</span>
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
                  onClick={() => {
                    setProfileOpen(false)
                    setLogoutOpen(true)
                  }}
                  className="flex w-full items-center gap-2 border-t border-line px-4 py-2.5 text-xs font-medium hover:bg-page"
                >
                  <LogOut className="h-4 w-4" /> تسجيل الخروج
                </button>
              </div>
            )}
          </div>
        </header>

        <main className="animate-fade-up flex-1 p-4 lg:p-6" onClick={() => { setSearchOpen(false); setBellOpen(false); setProfileOpen(false) }}>
          <Outlet />
        </main>

        <footer className="border-t border-line px-6 py-3 text-center text-[11px] text-faint">
          {brand.short} — يوصلك بسرعة وثقة © {new Date().getFullYear()}
        </footer>
      </div>

      {logoutOpen && (
        <Modal title="هل تريد تسجيل الخروج؟" onClose={() => setLogoutOpen(false)}>
          <p className="mt-2 text-xs text-mute">سيتم إنهاء الجلسة والعودة إلى شاشة تسجيل الدخول.</p>
          <div className="mt-4 flex gap-2">
            <button
              className="btn-primary flex-1"
              onClick={() => {
                logSecurity({ type: 'تسجيل دخول ناجح', user: session?.phone || '—', result: 'نجاح', details: 'تسجيل خروج' })
                clearSession()
                navigate('/login')
              }}
            >
              نعم
            </button>
            <button className="btn-ghost flex-1" onClick={() => setLogoutOpen(false)}>
              إلغاء
            </button>
          </div>
        </Modal>
      )}

      <SessionExpiry toast={toast} />
      {node}
      <span className="hidden">
        <ShieldAlert className="h-0 w-0" />
      </span>
    </div>
  )
}
