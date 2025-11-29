import { Navigate, Outlet } from 'react-router'
import { useAuth } from '../context/AuthContext'

function Protected() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return null;

  if (!isAuthenticated) {
    return <Navigate to={'/auth'} replace></Navigate>;
  }

  return <Outlet />;
}

export default Protected