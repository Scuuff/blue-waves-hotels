import React, { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Menu, Sun, Moon, Sparkles, Globe, ChevronDown, Check } from "lucide-react";
import useAdminThemeMode from "../hooks/useAdminThemeMode";
import { useLanguage } from "../Context/LanguageContext";

const languages = [
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "ar", label: "العربية", flag: "🇪🇬" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "es", label: "Español", flag: "🇪🇸" },
];

function AdminNavbar({ onToggleSidebar, title }) {
  const location = useLocation();
  const { darkMode, toggleDarkMode } = useAdminThemeMode();
  const { language, setLanguage, t } = useLanguage();
  const [langOpen, setLangOpen] = useState(false);
  const dropdownRef = useRef(null);

  const currentLang = languages.find((l) => l.code === language) || languages[0];
  const isRtl = language === "ar";
  const navThemeTextClass = isRtl
    ? "text-[11px] font-extrabold leading-[1.05]"
    : "text-[11px] font-extrabold uppercase tracking-[0.16em] leading-[1.05]";

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setLangOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const pageTitle = (() => {
    if (location.pathname.startsWith("/admin/dashboard")) return t("sidebar.dashboard") || "Dashboard";
    if (location.pathname.startsWith("/admin/rooms")) return t("sidebar.roomManagement") || "Room Management";
    if (location.pathname.startsWith("/admin/bookings")) return t("sidebar.bookings") || "Bookings";
    if (location.pathname.startsWith("/admin/usermanagement")) return t("sidebar.userManagement") || "User Management";
    if (location.pathname.startsWith("/admin/hotels")) return t("sidebar.hotelManagement") || "Hotel Management";
    if (location.pathname.startsWith("/admin/offers")) return t("sidebar.offers") || "Offers";
    if (location.pathname.startsWith("/admin/settings")) return t("sidebar.settings") || "Settings";

    return title || t("navbar.title") || "Admin";
  })();

  return (
    <div className="admin-route-navbar flex justify-between items-center bg-[#163f8f] p-4 shadow">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-lg bg-[#163f8f] hover:bg-[#7ea0d6] transition-all duration-300"
        >
          <Menu size={22} className="text-white" />
        </button>

        <h1 className="text-lg font-semibold text-white">
          {pageTitle}
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={toggleDarkMode}
          className={`relative h-[52px] w-[148px] rounded-full px-2 transition-all duration-500 ${
            darkMode ? "bg-[#163f8f]" : "bg-white"
          }`}
          aria-pressed={darkMode}
        >
          <div
            className={`absolute top-1/2 h-[40px] w-[40px] -translate-y-1/2 rounded-full flex items-center justify-center shadow-md transition-all duration-500 ${
              isRtl
                ? darkMode
                  ? "right-2 bg-white text-[#163f8f]"
                  : "right-[100px] bg-[#163f8f] text-white"
                : darkMode
                  ? "left-[100px] bg-white text-[#163f8f]"
                  : "left-2 bg-[#163f8f] text-white"
            }`}
          >
            {darkMode ? (
              <div className="relative flex items-center justify-center">
                <Moon size={18} fill="currentColor" strokeWidth={1.5} />
                <Sparkles
                  size={9}
                  className="absolute -top-1 -right-1"
                  strokeWidth={2}
                />
              </div>
            ) : (
              <Sun size={18} fill="currentColor" strokeWidth={1.5} />
            )}
          </div>

          <div
            className={`absolute inset-y-0 left-0 right-0 flex items-center transition-all duration-500 ${
              darkMode ? "text-white" : "text-[#163f8f]"
            }`}
          >
            {darkMode ? (
              <span
                className={`${navThemeTextClass} ${
                  isRtl ? "me-auto pe-4 ps-14 text-start" : "ms-0 ps-4 pe-14 text-left"
                }`}
              >
                {t("appearance.dark")}
                
              </span>
            ) : (
              <span
                className={`${navThemeTextClass} ${
                  isRtl ? "ms-0 ps-4 pe-14 text-end" : "ms-auto pe-4 ps-14 text-right"
                }`}
              >
                {t("appearance.light")}
                
              </span>
            )}
          </div>
        </button>

        {/* Language Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setLangOpen((prev) => !prev)}
            className="flex items-center gap-2 bg-white text-[#163f8f] font-semibold text-sm py-2.5 px-4 rounded-2xl shadow-sm transition-all duration-300 transform hover:scale-105 hover:shadow-[0_8px_20px_rgba(22,63,143,0.35)]"
          >
            <span className="text-lg leading-none">{currentLang.flag}</span>
            <span className="hidden sm:inline">{currentLang.label}</span>
            <ChevronDown
              size={14}
              className={`transition-transform duration-300 ${langOpen ? "rotate-180" : ""}`}
            />
          </button>

          {langOpen && (
            <div className={`absolute ${isRtl ? "left-0" : "right-0"} mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-200 py-1 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2`}>
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setLanguage(lang.code);
                    setLangOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                    language === lang.code
                      ? "bg-[#163f8f]/10 text-[#163f8f] font-semibold"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <span className="text-lg leading-none">{lang.flag}</span>
                  <span className="flex-1 text-start">{lang.label}</span>
                  {language === lang.code && <Check size={16} className="text-[#163f8f]" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminNavbar;
