import { Routes, Route, Navigate } from 'react-router-dom'
import AdminLayout from './layouts/AdminLayout'
import RequireAuth from './components/RequireAuth'
import RequirePerm from './components/RequirePerm'
import Login from './pages/Login'
import ForgotPassword from './pages/ForgotPassword'
import Dashboard from './pages/Dashboard'
import Orders from './pages/Orders'
import Captains from './pages/Captains'
import Stores from './pages/Stores'
import Zones from './pages/Zones'
import Pricing from './pages/Pricing'
import PriceCustomization from './pages/PriceCustomization'
import Reports from './pages/Reports'
import Settlement from './pages/Settlement'
import Notifications from './pages/Notifications'
import Complaints from './pages/Complaints'
import CMS from './pages/CMS'
import CmsEditor from './pages/CmsEditor'
import Admins from './pages/Admins'
import AuditLog from './pages/AuditLog'
import Settings from './pages/Settings'
import Profile from './pages/Profile'
import OrderDetails from './pages/OrderDetails'
import CaptainProfile from './pages/CaptainProfile'
import StoreProfile from './pages/StoreProfile'
import ComplaintDetails from './pages/ComplaintDetails'
import AdvancedSearch from './pages/AdvancedSearch'
import Unauthorized from './pages/Unauthorized'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route
        element={
          <RequireAuth>
            <RequirePerm>
              <AdminLayout />
            </RequirePerm>
          </RequireAuth>
        }
      >
        <Route path="/" element={<Dashboard />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/orders/details" element={<OrderDetails />} />
        <Route path="/captains" element={<Captains />} />
        <Route path="/captains/profile" element={<CaptainProfile />} />
        <Route path="/stores" element={<Stores />} />
        <Route path="/stores/profile" element={<StoreProfile />} />
        <Route path="/zones" element={<Zones />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/price-customization" element={<PriceCustomization />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/settlement" element={<Settlement />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/complaints" element={<Complaints />} />
        <Route path="/complaints/details" element={<ComplaintDetails />} />
        <Route path="/cms" element={<CMS />} />
        <Route path="/cms/editor" element={<CmsEditor />} />
        <Route path="/admins" element={<Admins />} />
        <Route path="/audit-log" element={<AuditLog />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/search" element={<AdvancedSearch />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
