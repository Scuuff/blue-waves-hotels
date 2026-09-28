import { Outlet, useLocation } from "react-router-dom";
import Navbar from "../Navbar";

export default function Layout() {
  const location = useLocation();
  const hideFooter = location.pathname === "/favorites";

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <main className="flex-1 pt-24">
        <Outlet />
      </main>
      {!hideFooter && (
        <footer className="text-center py-6 text-gray-400 text-xs border-t border-gray-100">
          Copyright 2026 LuxeStay. All rights reserved.
        </footer>
      )}
    </div>
  );
}
