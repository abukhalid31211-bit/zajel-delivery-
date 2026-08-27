import { Routes, Route, Navigate } from 'react-router-dom'
import Splash from './pages/Splash'
import Welcome from './pages/Welcome'
import Login from './pages/Login'
import Register from './pages/Register'
import Pending from './pages/Pending'
import ForgotPassword from './pages/ForgotPassword'
import CreateOrder from './pages/CreateOrder'
import Notifications from './pages/Notifications'
import TabLayout from './layouts/TabLayout'
import Home from './pages/Home'
import Orders from './pages/Orders'
import Reports from './pages/Reports'
import Profile from './pages/Profile'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Splash />} />
      <Route path="/welcome" element={<Welcome />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/pending" element={<Pending />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/create-order" element={<CreateOrder />} />
      <Route path="/notifications" element={<Notifications />} />
      <Route element={<TabLayout />}>
        <Route path="/home" element={<Home />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/profile" element={<Profile />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
