import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";

const ADMIN_EMAIL = "busvista@gmail.com";

/**
 * Protected Route wrapper for Admin Panel
 * Ensures only authorized admin session can access admin routes
 */
function AdminProtectedRoute({ children }) {
  const location = useLocation();
  const [authState, setAuthState] = useState({ loading: true, isAdmin: false });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setAuthState({
        loading: false,
        isAdmin: currentUser?.email?.toLowerCase() === ADMIN_EMAIL,
      });
    });
    return unsubscribe;
  }, []);

  if (authState.loading) return null;

  if (!authState.isAdmin) {
    // Redirect to Admin Login with state
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return children;
}

export default AdminProtectedRoute;
