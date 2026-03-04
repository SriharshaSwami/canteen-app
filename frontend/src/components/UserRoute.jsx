import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Route that only allows non-admin (user) access
// Redirects admins to admin panel
const UserRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Redirect admins to admin panel
  if (isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  return children;
};

export default UserRoute;
