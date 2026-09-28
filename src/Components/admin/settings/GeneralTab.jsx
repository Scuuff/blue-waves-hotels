// components/admin/settings/GeneralTab.jsx
import { Building2, Mail, Globe, Clock } from "lucide-react";
import SettingCard from "../shared/SettingCard";
import { useLanguage } from "../../../Context/LanguageContext";
import useAdminThemeMode from "../../../hooks/useAdminThemeMode";

export default function GeneralTab({ settings, onChange }) {
  const { t } = useLanguage();
  const { darkMode } = useAdminThemeMode();

  const labelClass = `block text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-slate-700"}`;
  const inputClass = `w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-teal-500 outline-none ${darkMode ? "bg-gray-700 border-gray-600 text-white" : "border-slate-300"}`;
  const selectClass = `w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-teal-500 outline-none ${darkMode ? "bg-gray-700 border-gray-600 text-white" : "border-slate-300 bg-white"}`;
  return (
    <div className="space-y-6">
      <SettingCard title={t("general.hotelInfo")} icon={Building2}>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className={labelClass}>
              {t("general.hotelName")}
            </label>
            <input
              type="text"
              value={settings.hotelName}
              onChange={(e) => onChange("hotelName", e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>
              {t("general.tagline")}
            </label>
            <input
              type="text"
              value={settings.tagline}
              onChange={(e) => onChange("tagline", e.target.value)}
              className={inputClass}
            />
          </div>
          <div className="md:col-span-2">
            <label className={labelClass}>
              {t("general.description")}
            </label>
            <textarea
              value={settings.description}
              onChange={(e) => onChange("description", e.target.value)}
              rows={3}
              className={`${inputClass} resize-none`}
            />
          </div>
        </div>
      </SettingCard>

      <SettingCard title={t("general.contactInfo")} icon={Mail}>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className={labelClass}>
              {t("general.email")}
            </label>
            <input
              type="email"
              value={settings.email}
              onChange={(e) => onChange("email", e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>
              {t("general.phone")}
            </label>
            <input
              type="tel"
              value={settings.phone}
              onChange={(e) => onChange("phone", e.target.value)}
              className={inputClass}
            />
          </div>
          <div className="md:col-span-2">
            <label className={labelClass}>
              {t("general.address")}
            </label>
            <input
              type="text"
              value={settings.address}
              onChange={(e) => onChange("address", e.target.value)}
              className={inputClass}
            />
          </div>
        </div>
      </SettingCard>

      <SettingCard title={t("general.regional")} icon={Globe}>
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <label className={labelClass}>
              {t("general.timezone")}
            </label>
            <select
              value={settings.timezone}
              onChange={(e) => onChange("timezone", e.target.value)}
              className={selectClass}
            >
              <option value="America/New_York">Eastern Time (ET)</option>
              <option value="America/Chicago">Central Time (CT)</option>
              <option value="America/Denver">Mountain Time (MT)</option>
              <option value="America/Los_Angeles">Pacific Time (PT)</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>
              {t("general.currency")}
            </label>
            <select
              value={settings.currency}
              onChange={(e) => onChange("currency", e.target.value)}
              className={selectClass}
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>
              {t("general.language")}
            </label>
            <select
              value={settings.language}
              onChange={(e) => onChange("language", e.target.value)}
              className={selectClass}
            >
              <option value="en">English</option>
              <option value="ar">العربية</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
            </select>
          </div>
        </div>
      </SettingCard>

      <SettingCard title={t("general.checkinout")} icon={Clock}>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className={labelClass}>
              {t("general.checkin")}
            </label>
            <input
              type="time"
              value={settings.checkInTime}
              onChange={(e) => onChange("checkInTime", e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>
              {t("general.checkout")}
            </label>
            <input
              type="time"
              value={settings.checkOutTime}
              onChange={(e) => onChange("checkOutTime", e.target.value)}
              className={inputClass}
            />
          </div>
        </div>
      </SettingCard>
    </div>
  );
}