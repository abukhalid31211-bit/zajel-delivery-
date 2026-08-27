import { Navigate, useLocation } from 'react-router-dom'
import { getSession } from '../lib/session'

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const session = getSession()
  if (!session) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  return <>{children}</>
}
