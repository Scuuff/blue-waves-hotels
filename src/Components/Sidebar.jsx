import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import { LogOut } from "lucide-react";

function Sidebar() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside className="fixed left-0 top-0 z-30 hidden h-screen w-64 flex-col bg-[#2F4156] px-5 py-6 text-white md:flex">
      <div className="mb-10">
        <h1 className="text-2xl font-bold tracking-wide">NovaNest</h1>
        <p className="mt-1 text-sm text-[#C8D9E6]">Admin Panel</p>
      </div>

      <nav className="flex flex-col gap-3">
        {/* Dashboard */}
        <NavLink
          to="/admin/dashboard"
          className={({ isActive }) =>
            `rounded-xl px-4 py-3 text-sm font-medium ${
              isActive
                ? "bg-[#567C8D] text-white shadow-md"
                : "text-[#F5EFEB] opacity-70 hover:bg-[#567C8D]/40"
            }`
          }
        >
          Dashboard
        </NavLink>

        
        <NavLink
          to="/admin/hotels"
          className={({ isActive }) =>
            `rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
              isActive
                ? "bg-[#567C8D] text-white shadow-md"
                : "text-[#F5EFEB] hover:bg-[#567C8D]/40"
            }`
          }
        >
          Hotel Management
        </NavLink>

        
        <NavLink
          to="/admin/rooms"
          className={({ isActive }) =>
            `rounded-xl px-4 py-3 text-sm font-medium ${
              isActive
                ? "bg-[#567C8D]"
                : "text-[#F5EFEB] opacity-70 hover:bg-[#567C8D]/40"
            }`
          }
        >
          Room Management
        </NavLink>

       
        <NavLink
          to="/admin/bookings"
          className={({ isActive }) =>
            `rounded-xl px-4 py-3 text-sm font-medium ${
              isActive
                ? "bg-[#567C8D]"
                : "text-[#F5EFEB] opacity-70 hover:bg-[#567C8D]/40"
            }`
          }
        >
          Booking Management
        </NavLink>

        
        <NavLink
          to="/admin/settings"
          className={({ isActive }) =>
            `rounded-xl px-4 py-3 text-sm font-medium ${
              isActive
                ? "bg-[#567C8D]"
                : "text-[#F5EFEB] opacity-70 hover:bg-[#567C8D]/40"
            }`
          }
        >
          Settings
        </NavLink>

      
        <div className="rounded-xl px-4 py-3 text-sm font-medium text-[#F5EFEB] opacity-70">
          Admin Profile
        </div>

       
        <button
          onClick={handleLogout}
          className="mt-6 flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium bg-red-500 hover:bg-red-600 transition"
        >
          <LogOut size={16} />
          Logout
        </button>
      </nav>
    </aside>
  );
}

export default Sidebar;