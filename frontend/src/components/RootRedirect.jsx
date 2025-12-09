import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { isAdmin } from '../utils/admin'

function RootRedirect() {
  const { currentUser } = useAuth()
  
  if (!currentUser) {
    return <Navigate to="/login" replace />
  }
  
  if (isAdmin(currentUser.email)) {
    return <Navigate to="/admin" replace />
  }
  
  return <Navigate to="/home" replace />
}

export default RootRedirect

