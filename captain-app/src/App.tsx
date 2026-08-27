import { Routes, Route, Navigate } from 'react-router-dom'
import OfflineBanner from './components/OfflineBanner'
import Splash from './pages/Splash'
import Welcome from './pages/Welcome'
import Login from './pages/Login'
import Register from './pages/Register'
import Pending from './pages/Pending'
import ForgotPassword from './pages/ForgotPassword'
import Shift from './pages/Shift'
import Notifications from './pages/Notifications'
import TabLayout from './layouts/TabLayout'
import Home from './pages/Home'
import Orders from './pages/Orders'
import Ledger from './pages/Ledger'
import Profile from './pages/Profile'
import OrderAlert from './pages/OrderAlert'
import Order from './pages/Order'
import POD from './pages/POD'
import Delivered from './pages/Delivered'
import Problem from './pages/Problem'
import ReturnOrder from './pages/ReturnOrder'
import Emergency from './pages/Emergency'
import RateStore from './pages/RateStore'
import Stats from './pages/Stats'
import Documents from './pages/Documents'
import ChangePassword from './pages/ChangePassword'
import NewComplaint from './pages/NewComplaint'
import Complaints from './pages/Complaints'
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
        <Route path="/shift" element={<Shift />} />
        <Route path="/notifications" element={<Notifications />} />

        {/* رحلة تنفيذ الطلبية */}
        <Route path="/order-alert" element={<OrderAlert />} />
        <Route path="/order" element={<Order />} />
        <Route path="/pod" element={<POD />} />
        <Route path="/delivered" element={<Delivered />} />
        <Route path="/problem" element={<Problem />} />
        <Route path="/return" element={<ReturnOrder />} />
        <Route path="/emergency" element={<Emergency />} />
        <Route path="/rate-store" element={<RateStore />} />

        {/* الحساب والدعم */}
        <Route path="/stats" element={<Stats />} />
        <Route path="/documents" element={<Documents />} />
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
          <Route path="/ledger" element={<Ledger />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}
