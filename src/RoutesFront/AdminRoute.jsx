import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";

export default function AdminRoute({ children }) {
  const { isAuthenticated, currentUser } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (currentUser?.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
}