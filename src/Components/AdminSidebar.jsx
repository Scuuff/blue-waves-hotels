import React, { useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import logo from "../assets/Images/white_logo.png";
import {
  LayoutDashboard,
  BedDouble,
  CalendarDays,
  Users,
  Settings,
  Hotel,
  LogOut,
  ChevronDown,
  Building2,
  Image as ImageIcon,
  Bell,
  CreditCard,
  Shield,
  FileText,
  Tag,
} from "lucide-react";
import { useLanguage } from "../Context/LanguageContext";
import useAdminThemeMode from "../hooks/useAdminThemeMode";

function AdminSidebar({ collapsed }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { darkMode } = useAdminThemeMode();
  const isRtl = language === "ar";
  const isSettingsPage = location.pathname.startsWith("/admin/settings");
  const [settingsOpen, setSettingsOpen] = useState(isSettingsPage);

  const sidebarBg = darkMode ? "bg-[#1e2a3a]" : "bg-[#7ea0d6]";
  const activeBg = darkMode ? "bg-[#0f1f3d]" : "bg-[#163f8f]";
  const cornerBase = darkMode ? "bg-[#1e2a3a]" : "bg-[#7ea0d6]";
  const cornerActive = darkMode ? "bg-[#0f1f3d]" : "bg-[#163f8f]";

  const handleLogout = () => {
    navigate("/");
  };

  const menuItems = [
    { name: t("sidebar.dashboard"), path: "/admin/dashboard", icon: LayoutDashboard },
    { name: t("sidebar.roomManagement"), path: "/admin/rooms", icon: BedDouble },
    { name: t("sidebar.bookings"), path: "/admin/bookings", icon: CalendarDays },
    { name: t("sidebar.userManagement"), path: "/admin/usermanagement", icon: Users },
    { name: t("sidebar.hotelManagement"), path: "/admin/hotels", icon: Hotel },
    { name: t("sidebar.offers") || "Offers", path: "/admin/offers", icon: Tag },
  ];

  const settingsSubItems = [
    { name: t("sidebar.general"), tab: "general", icon: Building2 },
    { name: t("sidebar.appearance"), tab: "appearance", icon: ImageIcon },
    { name: t("sidebar.notifications"), tab: "notifications", icon: Bell },
    { name: t("sidebar.payments"), tab: "payments", icon: CreditCard },
    { name: t("sidebar.security"), tab: "security", icon: Shield },
    { name: t("sidebar.backup"), tab: "backup", icon: FileText },
  ];

  const currentTab = new URLSearchParams(location.search).get("tab") || "general";

  return (
    <div
      className={`admin-route-sidebar min-h-screen flex flex-col overflow-hidden transition-all duration-300 ${
        collapsed
          ? `w-24 ${sidebarBg} text-white py-6`
          : `w-60 ${sidebarBg} text-white py-6`
      }`}
    >
      {!collapsed ? (
        <div className="flex items-center gap-2 px-4 py-6 mb-4">
          <img
            src={logo}
            alt="Blue Waves Hotel Logo"
            className="w-14 h-14 object-contain"
          />
          <h2 className="text-lg font-bold whitespace-nowrap">
            Blue Waves Hotel
          </h2>
        </div>
      ) : (
        <div className="flex justify-center py-6 mb-4">
          <img
            src={logo}
            alt="Blue Waves Hotel Logo"
            className="w-12 h-12 object-contain"
          />
        </div>
      )}

      <nav className={`flex-1 flex flex-col px-3 ${collapsed ? "gap-3" : "gap-2"}`}>
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink key={item.path} to={item.path} className="block">
              {({ isActive }) =>
                collapsed ? (
                  <div className="flex justify-center">
                    <div
                      title={item.name}
                      className={`admin-route-sidebar-item h-12 w-12 flex items-center justify-center transition-all duration-300 transform ${
                        isActive
                          ? `admin-route-sidebar-active ${activeBg} text-white rounded-2xl scale-105`
                          : "text-white hover:text-[#163f8f] hover:scale-105"
                      }`}
                    >
                      <Icon size={20} />
                    </div>
                  </div>
                ) : (
                  <div className="relative ps-4">
                    <div
                      className={`admin-route-sidebar-item flex items-center gap-3 py-3 px-5 transition-all duration-300 transform ${
                        isActive
                          ? `admin-route-sidebar-active ${activeBg} text-white w-full scale-100 ${isRtl ? "rounded-r-full" : "rounded-l-full"}`
                          : `text-white hover:text-[#163f8f] hover:scale-105 ${isRtl ? "rounded-r-full" : "rounded-l-full"}`
                      }`}
                    >
                      <Icon size={18} />
                      <span className="text-base font-semibold leading-tight">
                        {item.name}
                      </span>
                    </div>

                    {isActive && (
                      <>
                        <div className={`admin-route-sidebar-corner-active absolute -top-5 ${isRtl ? "left-0" : "right-0"} w-5 h-5 ${cornerActive}`} />
                        <div className={`admin-route-sidebar-corner-base absolute -top-5 ${isRtl ? "left-0" : "right-0"} w-5 h-5 ${cornerBase} ${isRtl ? "rounded-bl-full" : "rounded-br-full"}`} />

                        <div className={`admin-route-sidebar-corner-active absolute -bottom-5 ${isRtl ? "left-0" : "right-0"} w-5 h-5 ${cornerActive}`} />
                        <div className={`admin-route-sidebar-corner-base absolute -bottom-5 ${isRtl ? "left-0" : "right-0"} w-5 h-5 ${cornerBase} ${isRtl ? "rounded-tl-full" : "rounded-tr-full"}`} />
                      </>
                    )}
                  </div>
                )
              }
            </NavLink>
          );
        })}

        {collapsed ? (
          <button
            onClick={() => setSettingsOpen((prev) => !prev)}
            title={t("sidebar.settings")}
            className={`flex justify-center items-center px-4 py-3 rounded-2xl transition-all duration-300 ${
              isSettingsPage
                ? "bg-[#163f8f] text-white shadow-md"
                : "text-white hover:bg-[#163f8f]/40"
            }`}
          >
            <Settings size={20} />
          </button>
        ) : (
          <div>
            <div className="relative ps-4">
              <button
                onClick={() => setSettingsOpen((prev) => !prev)}
                className={`admin-route-sidebar-item w-full flex items-center gap-3 py-3 px-5 transition-all duration-300 transform ${
                  isSettingsPage
                    ? `admin-route-sidebar-active ${activeBg} text-white scale-100 ${isRtl ? "rounded-r-full" : "rounded-l-full"}`
                    : `text-white hover:text-[#163f8f] hover:scale-105 ${isRtl ? "rounded-r-full" : "rounded-l-full"}`
                }`}
              >
                <Settings size={20} />
                <span className="font-medium">{t("sidebar.settings")}</span>
                <ChevronDown
                  size={16}
                  className={`ml-auto transition-transform duration-300 ${
                    settingsOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
            </div>
            <div
              className={`overflow-hidden transition-all duration-300 ${
                settingsOpen ? "max-h-96 opacity-100 mt-2" : "max-h-0 opacity-0"
              }`}
            >
              <div className="flex flex-col gap-1 ps-4">
                {settingsSubItems.map((sub) => {
                  const SubIcon = sub.icon;
                  const isActive = isSettingsPage && currentTab === sub.tab;

                  return (
                    <NavLink
                      key={sub.tab}
                      to={`/admin/settings?tab=${sub.tab}`}
                    >
                      <div
                        className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-all duration-300 ${
                          isActive
                            ? `${activeBg}/70 text-white ${isRtl ? "rounded-r-full" : "rounded-l-full"}`
                            : `text-white/70 hover:text-white hover:bg-white/10 ${isRtl ? "rounded-r-full" : "rounded-l-full"}`
                        }`}
                      >
                        <SubIcon size={15} />
                        <span className="font-medium">{sub.name}</span>
                      </div>
                    </NavLink>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </nav>

      <div className={`px-3 py-6`}>
        {collapsed ? (
          <button
            title={t("sidebar.logout")}
            className={`admin-route-logout w-full h-12 flex items-center justify-center rounded-2xl shadow-sm transition-all duration-300 transform hover:scale-105 ${
              darkMode
                ? "bg-gray-700 text-white hover:bg-red-600 hover:shadow-[0_8px_20px_rgba(220,38,38,0.35)]"
                : "bg-white text-[#163f8f] hover:bg-[#163f8f] hover:text-white hover:shadow-[0_8px_20px_rgba(22,63,143,0.35)]"
            }`}
            onClick={handleLogout}
          >
            <LogOut size={20} />
          </button>
        ) : (
          <button
            onClick={handleLogout}
            className={`admin-route-logout w-full font-bold text-lg py-3 rounded-3xl flex items-center justify-center gap-2 shadow-sm transition-all duration-300 transform hover:scale-105 ${
              darkMode
                ? "bg-gray-700 text-white hover:bg-red-600 hover:shadow-[0_8px_20px_rgba(220,38,38,0.35)]"
                : "bg-white text-[#163f8f] hover:bg-[#163f8f] hover:text-white hover:shadow-[0_8px_20px_rgba(22,63,143,0.35)]"
            }`}
          >
            <LogOut size={18} />
            {t("sidebar.logout")}
          </button>
        )}
      </div>
    </div>
  );
}

export default AdminSidebar;
