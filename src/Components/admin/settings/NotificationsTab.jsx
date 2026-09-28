// components/admin/settings/NotificationsTab.jsx
import { Mail, Smartphone } from "lucide-react";
import SettingCard from "../shared/SettingCard";
import ToggleSwitch from "../shared/ToggleSwitch";
import { useLanguage } from "../../../Context/LanguageContext";

export default function NotificationsTab({ notifications, onToggle }) {
  const { t } = useLanguage();

  const emailSettings = [
    { key: "emailBookings", label: t("notifications.emailBookings") },
    { key: "emailCancellations", label: t("notifications.emailCancellations") },
    { key: "dailyReports", label: t("notifications.dailyReports") },
    { key: "weeklyReports", label: t("notifications.weeklyReports") },
    { key: "marketingEmails", label: t("notifications.marketingEmails") }
  ];

  const smsSettings = [
    { key: "smsBookings", label: t("notifications.smsBookings") },
    { key: "smsCancellations", label: t("notifications.smsCancellations") }
  ];

  return (
    <div className="space-y-6">
      <SettingCard title={t("notifications.email")} icon={Mail}>
        {emailSettings.map((setting) => (
          <ToggleSwitch
            key={setting.key}
            label={setting.label}
            enabled={notifications[setting.key]}
            onChange={() => onToggle(setting.key)}
          />
        ))}
      </SettingCard>

      <SettingCard title={t("notifications.sms")} icon={Smartphone}>
        {smsSettings.map((setting) => (
          <ToggleSwitch
            key={setting.key}
            label={setting.label}
            enabled={notifications[setting.key]}
            onChange={() => onToggle(setting.key)}
          />
        ))}
      </SettingCard>
    </div>
  );
}