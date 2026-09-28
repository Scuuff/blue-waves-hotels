// components/admin/AdminHeader.jsx
import useAdminThemeMode from "../../hooks/useAdminThemeMode";

export default function AdminHeader({ title }) {
  const { darkMode } = useAdminThemeMode();
  const tabNames = {
    general: "General",
    appearance: "Appearance",
    notifications: "Notifications",
    payments: "Payments",
    rooms: "Room Types",
    users: "User Management",
    security: "Security",
    integrations: "Integrations",
    backup: "Backup & Data"
  };

  return (
    <header className={`sticky top-0 z-10 flex flex-wrap items-start justify-between gap-3 border-b px-4 py-4 sm:px-6 lg:px-8 admin-theme-surface admin-theme-header ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white"}`}>
      <div className="min-w-0">
        <h2 className={`text-xl font-bold sm:text-2xl ${darkMode ? "text-white" : "text-slate-800"}`}>
          {tabNames[title]} Settings
        </h2>
        <p className={`text-sm ${darkMode ? "text-gray-400" : "text-slate-500"}`}>Manage your hotel configuration</p>
      </div>
      
    </header>
  );
}