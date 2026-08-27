import { Navigate, useLocation } from 'react-router-dom'
import { canAccessPath } from '../lib/rbac'

export default function RequirePerm({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  if (!canAccessPath(location.pathname, location.search)) {
    return <Navigate to="/unauthorized" replace />
  }
  return <>{children}</>
}
