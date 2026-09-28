// components/admin/shared/ToggleSwitch.jsx
import useAdminThemeMode from "../../../hooks/useAdminThemeMode";

export default function ToggleSwitch({ enabled, onChange, label, description }) {
  const { darkMode } = useAdminThemeMode();
  return (
    <div className={`flex items-center justify-between py-3 border-b last:border-0 ${darkMode ? "border-gray-700" : "border-slate-100"}`}>
      <div>
        <p className={`font-medium ${darkMode ? "text-white" : "text-slate-800"}`}>{label}</p>
        {description && <p className={`text-sm ${darkMode ? "text-gray-400" : "text-slate-500"}`}>{description}</p>}
      </div>
      <button
        type="button"
        onClick={onChange}
        data-state={enabled ? "on" : "off"}
        className="admin-switch"
      >
        <span className="admin-switch-thumb" />
      </button>
    </div>
  );
}