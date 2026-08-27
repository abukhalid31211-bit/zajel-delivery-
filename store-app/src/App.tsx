import { Routes, Route, Navigate } from 'react-router-dom'
import OfflineBanner from './components/OfflineBanner'
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
import Track from './pages/Track'
import OrderDetails from './pages/OrderDetails'
import RateCaptain from './pages/RateCaptain'
import EditStore from './pages/EditStore'
import ChangePassword from './pages/ChangePassword'
import Complaints from './pages/Complaints'
import NewComplaint from './pages/NewComplaint'
import Support from './pages/Support'
import { About, Language, DeleteAccount } from './pages/Misc'
import { Suspended, Rejected, UpdateRequired, Maintenance } from './pages/SystemStates'

export default function App() {
  return (
    <>
      <OfflineBanner />
      <Routes>
        <Route path="/" element={<Splash />} />
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/pending" element={<Pending />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/create-order" element={<CreateOrder />} />
        <Route path="/notifications" element={<Notifications />} />

        {/* المتابعة والتقييم */}
        <Route path="/track" element={<Track />} />
        <Route path="/order-details" element={<OrderDetails />} />
        <Route path="/rate-captain" element={<RateCaptain />} />

        {/* الحساب والدعم */}
        <Route path="/edit-store" element={<EditStore />} />
        <Route path="/change-password" element={<ChangePassword />} />
        <Route path="/complaints" element={<Complaints />} />
        <Route path="/complaints/new" element={<NewComplaint />} />
        <Route path="/support" element={<Support />} />
        <Route path="/about" element={<About />} />
        <Route path="/language" element={<Language />} />
        <Route path="/delete-account" element={<DeleteAccount />} />

        {/* حالات النظام */}
        <Route path="/suspended" element={<Suspended />} />
        <Route path="/rejected" element={<Rejected />} />
        <Route path="/update-required" element={<UpdateRequired />} />
        <Route path="/maintenance" element={<Maintenance />} />

        <Route element={<TabLayout />}>
          <Route path="/home" element={<Home />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}
