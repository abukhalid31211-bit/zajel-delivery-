import { Routes, Route, Navigate } from 'react-router-dom'
import AdminLayout from './layouts/AdminLayout'
import Login from './pages/Login'
import ForgotPassword from './pages/ForgotPassword'
import Dashboard from './pages/Dashboard'
import Orders from './pages/Orders'
import Captains from './pages/Captains'
import Stores from './pages/Stores'
import Zones from './pages/Zones'
import Pricing from './pages/Pricing'
import Reports from './pages/Reports'
import Settlement from './pages/Settlement'
import Notifications from './pages/Notifications'
import Complaints from './pages/Complaints'
import CMS from './pages/CMS'
import Admins from './pages/Admins'
import AuditLog from './pages/AuditLog'
import Settings from './pages/Settings'
import Profile from './pages/Profile'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route element={<AdminLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/captains" element={<Captains />} />
        <Route path="/stores" element={<Stores />} />
        <Route path="/zones" element={<Zones />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/settlement" element={<Settlement />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/complaints" element={<Complaints />} />
        <Route path="/cms" element={<CMS />} />
        <Route path="/admins" element={<Admins />} />
        <Route path="/audit-log" element={<AuditLog />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/profile" element={<Profile />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
