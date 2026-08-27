import { useState, useEffect } from 'react'
import { Routes, Route, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Lock, Loader2, LogOut } from 'lucide-react'
import { StoreProvider, useStore } from './lib/StoreContext'
import OfflineBanner from './components/OfflineBanner'
import Modal from './components/Modal'

import Splash from './pages/Splash'
import Welcome from './pages/Welcome'
import Login from './pages/Login'
import Register from './pages/Register'
import Pending from './pages/Pending'
import ForgotPassword from './pages/ForgotPassword'
import CreateOrder from './pages/CreateOrder'
import Notifications from './pages/Notifications'
import Track from './pages/Track'
import OrderDetails from './pages/OrderDetails'
import RateCaptain from './pages/RateCaptain'
import EditStore from './pages/EditStore'
import ChangePassword from './pages/ChangePassword'
import Complaints from './pages/Complaints'
import ComplaintDetails from './pages/ComplaintDetails'
import NewComplaint from './pages/NewComplaint'
import Support from './pages/Support'
import TabLayout from './layouts/TabLayout'
import Home from './pages/Home'
import Orders from './pages/Orders'
import Reports from './pages/Reports'
import Profile from './pages/Profile'
import { About, Language, DeleteAccount } from './pages/Misc'
import { Suspended, Rejected, UpdateRequired, Maintenance } from './pages/SystemStates'

function RequireAuth() {
  const { booted, profile } = useStore()
  const location = useLocation()
  if (!booted) return <div className="app-shell" />
  if (!profile) return <Navigate to="/login" state={{ from: location.pathname + location.search }} replace />
  if (profile.status === 'pending') return <Navigate to="/pending" replace />
  if (profile.status === 'rejected') return <Navigate to="/rejected" replace />
  if (profile.status === 'suspended') return <Navigate to="/suspended" replace />
  return <Outlet />
}

/** نافذة انتهاء الجلسة (القسم 2.7) — إعادة المصادقة والعودة لنفس الشاشة */
function SessionGuard() {
  const { sessionActive, sessionSuspendedForPasswordChange, profile, reauth, endSession, rememberRoute } = useStore()
  const location = useLocation()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (sessionActive) rememberRoute(location.pathname + location.search)
  }, [sessionActive, location.pathname, location.search, rememberRoute])

  const needsGuard = !!profile && !sessionActive
  if (!needsGuard) return null

  const submit = () => {
    if (!password) return setError('كلمة المرور مطلوبة')
    setLoading(true)
    setTimeout(() => {
      const ok = reauth(password)
      setLoading(false)
      if (!ok) {
        setError('كلمة المرور غير صحيحة.')
        return
      }
      setPassword('')
      setError('')
    }, 700)
  }

  return (
    <Modal title="انتهت جلستك" subtitle="لأسباب أمنية، تم تسجيل خروجك. يرجى تسجيل الدخول مرة أخرى." dismissable={false}>
      <div className="mt-1 flex items-center justify-center gap-2 rounded-2xl bg-gold-faint py-3 text-gold-deep">
        <Lock className="h-4 w-4" />
        <span className="text-xs font-extrabold">{sessionSuspendedForPasswordChange ? 'تم تغيير كلمة المرور — سجّل الدخول مجدداً' : 'ستعود لنفس الشاشة بعد الدخول'}</span>
      </div>
      <div className="mt-4 space-y-3">
        <div>
          <label className="mb-1.5 block text-xs font-bold">رقم الهاتف (معبأ تلقائياً)</label>
          <div className="rounded-2xl border border-line bg-page px-4 py-3 text-sm font-bold text-mute" dir="ltr">
            +964 {profile?.phone}
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-bold">كلمة المرور</label>
          <input
            type="password"
            className="field"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              setError('')
            }}
            placeholder="أدخل كلمة المرور"
          />
        </div>
        {error && <p className="text-[11px] font-bold text-danger">⚠ {error}</p>}
        <button className="btn-primary w-full" onClick={submit} disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> جاري التحقق...
            </>
          ) : (
            'تسجيل الدخول'
          )}
        </button>
        <button
          className="flex w-full items-center justify-center gap-1.5 text-xs font-bold text-mute"
          onClick={() => {
            endSession('password')
            navigate('/login')
          }}
        >
          <LogOut className="h-3.5 w-3.5" /> تسجيل الدخول بحساب آخر
        </button>
      </div>
    </Modal>
  )
}

function Shell() {
  return (
    <>
      <OfflineBanner />
      <SessionGuard />
      <Routes>
        {/* عام */}
        <Route path="/" element={<Splash />} />
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/pending" element={<Pending />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/rejected" element={<Rejected />} />
        <Route path="/update-required" element={<UpdateRequired />} />
        <Route path="/maintenance" element={<Maintenance />} />
        <Route path="/suspended" element={<Suspended />} />

        {/* يتطلب تسجيل دخول */}
        <Route element={<RequireAuth />}>
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/create-order" element={<CreateOrder />} />
          <Route path="/track" element={<Track />} />
          <Route path="/order-details" element={<OrderDetails />} />
          <Route path="/rate-captain" element={<RateCaptain />} />
          <Route path="/edit-store" element={<EditStore />} />
          <Route path="/change-password" element={<ChangePassword />} />
          <Route path="/complaints" element={<Complaints />} />
          <Route path="/complaint-details" element={<ComplaintDetails />} />
          <Route path="/complaints/new" element={<NewComplaint />} />
          <Route path="/support" element={<Support />} />
          <Route path="/about" element={<About />} />
          <Route path="/language" element={<Language />} />
          <Route path="/delete-account" element={<DeleteAccount />} />

          <Route element={<TabLayout />}>
            <Route path="/home" element={<Home />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}

export default function App() {
  return (
    <StoreProvider>
      <Shell />
    </StoreProvider>
  )
}
