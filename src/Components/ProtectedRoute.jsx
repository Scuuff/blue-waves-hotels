import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";

export default function ProtectedRoute({ children, role }) {
  const { currentUser, isAuthenticated, isAuthLoading } = useAuth();

  if (isAuthLoading) {
    return <div className="p-10 text-center text-slate-500">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (role && currentUser.role !== role) {
    return <Navigate to="/" replace />;
  }

  return children;
}
