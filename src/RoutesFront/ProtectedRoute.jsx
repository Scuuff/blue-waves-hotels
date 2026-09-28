import React from "react";
import { Link, Navigate } from "react-router-dom";
import { ShieldAlert } from "lucide-react";
import { useAuth } from "../Context/AuthContext";

// Shown when an administrator hits a guest-only flow (booking / payment).
// Admins manage the hotel — bookings belong to guest accounts.
function AdminBlockedScreen() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-[#f2f7fc] px-6 text-center dark:bg-[#0a1420]">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#2f6fb3]/10 dark:bg-[#9fc0ec]/10">
        <ShieldAlert size={30} className="text-[#2f6fb3] dark:text-[#9fc0ec]" />
      </span>
      <h1 className="font-serif text-3xl font-semibold text-[#16283c] dark:text-white">
        You're signed in as an administrator
      </h1>
      <p className="max-w-md text-sm leading-6 text-[#3c5068] dark:text-white/60">
        Room booking is for guest accounts. To make a booking, log out and sign
        in with a guest account — or head back to your dashboard to manage the
        hotel.
      </p>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Link
          to="/admin/dashboard"
          className="rounded-full bg-[#2f6fb3] px-7 py-3 text-sm font-semibold text-white transition hover:bg-[#26567E] dark:bg-[#9fc0ec] dark:text-[#0c1828] dark:hover:bg-white"
        >
          Go to Admin Dashboard
        </Link>
        <Link
          to="/"
          className="rounded-full border border-[#2f6fb3]/30 px-7 py-3 text-sm font-semibold text-[#2f6fb3] transition hover:bg-[#2f6fb3]/5 dark:border-[#9fc0ec]/30 dark:text-[#9fc0ec] dark:hover:bg-[#9fc0ec]/10"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}

export default function ProtectedRoute({ children, blockAdmin = false }) {
  const { isAuthenticated, currentUser } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (blockAdmin && currentUser?.role === "admin") {
    return <AdminBlockedScreen />;
  }

  return children;
}
