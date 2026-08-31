import React from "react";
import { Navigate, useLocation } from "react-router-dom";

/**
 * Protected Route wrapper for Admin Panel
 * Ensures only authorized admin session can access admin routes
 */
function AdminProtectedRoute({ children }) {
  const location = useLocation();
  const isAdminAuth = localStorage.getItem("busvista_admin_auth") === "true";

  if (!isAdminAuth) {
    // Redirect to Admin Login with state
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return children;
}

export default AdminProtectedRoute;
