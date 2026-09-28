// components/admin/settings/BackupTab.jsx
import { useState } from "react";
import { FileText, Clock, Download, RefreshCw } from "lucide-react";
import SettingCard from "../shared/SettingCard";
import { useLanguage } from "../../../Context/LanguageContext";
import useAdminThemeMode from "../../../hooks/useAdminThemeMode";

export default function BackupTab() {
  const { t } = useLanguage();
  const { darkMode } = useAdminThemeMode();
  const [settings, setSettings] = useState({
    autoBackup: true,
    frequency: "daily",
    retention: 30,
    lastBackup: "2024-01-15 03:00"
  });

  return (
    <div className="space-y-6">
      <SettingCard title={t("backup.settings")} icon={FileText}>
        <div className={`flex items-center justify-between p-4 rounded-lg mb-6 ${darkMode ? "bg-gray-700" : "bg-slate-50"}`}>
          <div>
            <p className={`font-medium ${darkMode ? "text-white" : "text-slate-800"}`}>{t("backup.automatic")}</p>
            <p className={`text-sm ${darkMode ? "text-gray-400" : "text-slate-500"}`}>{t("backup.automaticDesc")}</p>
          </div>
          <button
            type="button"
            onClick={() => setSettings((prev) => ({ ...prev, autoBackup: !prev.autoBackup }))}
            data-state={settings.autoBackup ? "on" : "off"}
            className="admin-switch"
          >
            <span className="admin-switch-thumb" />
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-slate-700"}`}>
              {t("backup.frequency")}
            </label>
            <select
              value={settings.frequency}
              onChange={(e) => setSettings((prev) => ({ ...prev, frequency: e.target.value }))}
              className={`w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-teal-500 outline-none ${darkMode ? "bg-gray-700 border-gray-600 text-white" : "border-slate-300 bg-white"}`}
            >
              <option value="hourly">{t("backup.hourly")}</option>
              <option value="daily">{t("backup.daily")}</option>
              <option value="weekly">{t("backup.weekly")}</option>
            </select>
          </div>
          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-slate-700"}`}>
              {t("backup.retention")}
            </label>
            <input
              type="number"
              value={settings.retention}
              onChange={(e) => setSettings((prev) => ({ ...prev, retention: parseInt(e.target.value) }))}
              className={`w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-teal-500 outline-none ${darkMode ? "bg-gray-700 border-gray-600 text-white" : "border-slate-300"}`}
            />
          </div>
        </div>

        <div className={`mt-6 p-4 border rounded-lg ${darkMode ? "bg-teal-900/20 border-teal-700" : "bg-teal-50 border-teal-200"}`}>
          <p className={`text-sm flex items-center gap-2 ${darkMode ? "text-teal-300" : "text-teal-800"}`}>
            <Clock className="w-4 h-4" />
            {t("backup.lastBackup")}: {settings.lastBackup}
          </p>
        </div>

        <div className="mt-6 flex gap-4">
          <button className="flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-lg transition-colors">
            <Download className="w-4 h-4" />
            {t("backup.download")}
          </button>
          <button className={`flex items-center gap-2 border px-4 py-2 rounded-lg transition-colors ${darkMode ? "border-gray-600 text-gray-300 hover:bg-gray-700" : "border-slate-300 hover:bg-slate-50"}`}>
            <RefreshCw className="w-4 h-4" />
            {t("backup.restore")}
          </button>
        </div>
      </SettingCard>
    </div>
  );
}