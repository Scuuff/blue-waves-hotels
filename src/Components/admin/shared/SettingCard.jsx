// components/admin/shared/SettingCard.jsx
import useAdminThemeMode from "../../../hooks/useAdminThemeMode";

export default function SettingCard({ title, icon: Icon, children }) {
  const { darkMode } = useAdminThemeMode();
  return (
    <div className={`admin-theme-surface rounded-xl shadow-sm border p-6 mb-6 transition-colors ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white"}`}>
      <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${darkMode ? "text-white" : "text-slate-800"}`}>
        {Icon && <Icon className="w-5 h-5 text-teal-500" />}
        {title}
      </h3>
      {children}
    </div>
  );
}