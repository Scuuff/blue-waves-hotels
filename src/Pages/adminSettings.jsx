// pages/AdminSettings.jsx
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import AdminSidebar from "../Components/AdminSidebar";
import AdminHeader from "../Components/AdminNavbar";
import GeneralTab from "../Components/admin/settings/GeneralTab";
import AppearanceTab from "../Components/admin/settings/AppearanceTab";
import NotificationsTab from "../Components/admin/settings/NotificationsTab";
import PaymentsTab from "../Components/admin/settings/PaymentsTab";


import SecurityTab from "../Components/admin/settings/SecurityTab";

import BackupTab from "../Components/admin/settings/BackupTab";
import { logAuditEvent } from "../services/auditLogger";
import useAdminThemeMode from "../hooks/useAdminThemeMode";
import { userPreferencesApi } from "../services/userPreferencesApi";
import { getMyProfile } from "../services/ProfileApi";
import { buildScopedStorageKey, getCurrentAdminIdentity } from "../utils/currentAdminIdentity";
import { useLanguage } from "../Context/LanguageContext";

export default function AdminSettings() {

  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useLanguage();
  const { userId } = getCurrentAdminIdentity();
  const tabStorageKey = buildScopedStorageKey("groupAdminSettingsActiveTab", userId);
  const generalStorageKey = buildScopedStorageKey("groupAdminGeneralSettings", userId);
  const notificationsStorageKey = buildScopedStorageKey("groupAdminNotificationSettings", userId);

  const validTabs = ["general", "appearance", "notifications", "payments", "security", "backup"];
  const tabFromUrl = searchParams.get("tab");
  const activeTab = validTabs.includes(tabFromUrl) ? tabFromUrl : "general";

  const setActiveTab = (tab) => {
    setSearchParams({ tab });
  };
  const [collapsed, setCollapsed] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const { darkMode, setDarkMode } = useAdminThemeMode();

  // General Settings State
  const [generalSettings, setGeneralSettings] = useState({
    hotelName: "Grand Plaza Hotel",
    tagline: "Luxury Redefined",
    description: "Experience world-class hospitality in the heart of the city.",
    email: "admin@grandplaza.com",
    phone: "+1 (555) 123-4567",
    address: "123 Luxury Avenue, New York, NY 10001",
    timezone: "America/New_York",
    currency: "USD",
    language: "en",
    checkInTime: "15:00",
    checkOutTime: "11:00"
  });

  const [notifications, setNotifications] = useState({
    emailBookings: true,
    emailCancellations: true,
    smsBookings: false,
    smsCancellations: false,
    dailyReports: true,
    weeklyReports: false,
    marketingEmails: false
  });
  const hasSyncedGeneralRef = useRef(false);
  const hasSyncedNotificationsRef = useRef(false);

  useEffect(() => {
    let isMounted = true;
    const hydrate = async () => {
      try {
        const localGeneral = localStorage.getItem(generalStorageKey);
        if (localGeneral && isMounted) {
          setGeneralSettings((prev) => ({ ...prev, ...JSON.parse(localGeneral) }));
        }
      } catch {
        // ignore malformed local data
      }

      try {
        const localNotifications = localStorage.getItem(notificationsStorageKey);
        if (localNotifications && isMounted) {
          setNotifications((prev) => ({ ...prev, ...JSON.parse(localNotifications) }));
        }
      } catch {
        // ignore malformed local data
      }

      try {
        const generalResult = await userPreferencesApi.getScope("admin_general", userId);
        const backendGeneral = generalResult?.value?.value;
        if (backendGeneral && isMounted) {
          setGeneralSettings((prev) => ({ ...prev, ...backendGeneral }));
        }
      } catch {
        // backend optional
      }

      try {
        const notificationsResult = await userPreferencesApi.getScope("admin_notifications", userId);
        const backendNotifications = notificationsResult?.value?.value;
        if (backendNotifications && isMounted) {
          setNotifications((prev) => ({ ...prev, ...backendNotifications }));
        }
      } catch {
        // backend optional
      }
    };

    hydrate();
    return () => {
      isMounted = false;
    };
  }, [generalStorageKey, notificationsStorageKey, userId]);

  useEffect(() => {
    let isMounted = true;

    const hydrateProfileContact = async () => {
      try {
        const data = await getMyProfile();
        const profileUser = data?.user || {};

        if (!isMounted) return;

        setGeneralSettings((prev) => ({
          ...prev,
          email: profileUser.email || prev.email,
          phone: profileUser.phone || prev.phone,
          address: profileUser.address || prev.address,
        }));
      } catch {
        // If the profile API is unavailable, keep the existing values.
      }
    };

    hydrateProfileContact();

    return () => {
      isMounted = false;
    };
  }, [userId]);

  const handleSaveAppearance = async () => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 700));
    const themeValue = { darkMode };
    localStorage.setItem(buildScopedStorageKey("darkMode", userId), String(darkMode));
    await userPreferencesApi.saveScope("appearance", userId, themeValue);
    await logAuditEvent({
      actionType: "appearance.saved",
      module: "admin_settings",
      entityType: "appearance",
      entityId: "theme_mode",
      targetLabel: "Appearance settings",
      status: "success",
      reason: "Appearance saved from dedicated button",
      after: themeValue,
    });
    setLastSaved(new Date().toLocaleTimeString());
    setIsSaving(false);
  };

  const handleGeneralChange = (field, value) => {
    setGeneralSettings((prev) => ({ ...prev, [field]: value }));
  };

  const toggleNotification = (key) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  useEffect(() => {
    if (!hasSyncedGeneralRef.current) {
      hasSyncedGeneralRef.current = true;
      return;
    }
    const timeoutId = setTimeout(() => {
      localStorage.setItem(generalStorageKey, JSON.stringify(generalSettings));
      userPreferencesApi.saveScope("admin_general", userId, generalSettings).catch(() => {});
    }, 450);
    return () => clearTimeout(timeoutId);
  }, [generalSettings, generalStorageKey, userId]);

  useEffect(() => {
    if (!hasSyncedNotificationsRef.current) {
      hasSyncedNotificationsRef.current = true;
      return;
    }
    const timeoutId = setTimeout(() => {
      localStorage.setItem(notificationsStorageKey, JSON.stringify(notifications));
      userPreferencesApi.saveScope("admin_notifications", userId, notifications).catch(() => {});
    }, 450);
    return () => clearTimeout(timeoutId);
  }, [notifications, notificationsStorageKey, userId]);

  const renderTab = () => {
    switch (activeTab) {
      case "general":
        return <GeneralTab settings={generalSettings} onChange={handleGeneralChange} />;

      case "appearance":
        // ✅ PASS DARK MODE HERE
        return (
          <AppearanceTab
            darkMode={darkMode}
            setDarkMode={setDarkMode}
            onSaveAppearance={handleSaveAppearance}
            isSaving={isSaving}
            lastSaved={lastSaved}
          />
        );

      case "notifications":
        return <NotificationsTab notifications={notifications} onToggle={toggleNotification} />;

      case "payments":
        return <PaymentsTab />;

      case "security":
        return <SecurityTab />;

      case "backup":
        return <BackupTab />;

      default:
        return <GeneralTab settings={generalSettings} onChange={handleGeneralChange} />;
    }
  };

  return (
    // ✅ APPLY DARK MODE TO WHOLE PAGE
    <div
      className={`admin-theme min-h-screen flex ${
        darkMode ? "admin-theme-dark bg-gray-900 text-white" : "admin-theme-light bg-gray-50"
      }`}
    >

      <AdminSidebar collapsed={collapsed} />

      <main className="min-w-0 flex-1">

        <AdminHeader 
          onToggleSidebar={() => setCollapsed(!collapsed)} 
        />

        <div className="w-full px-4 py-4 sm:px-6 lg:px-8">
          <div className={`mb-4 rounded-lg border p-3 lg:hidden admin-theme-surface ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-slate-200"}`}>
            <label htmlFor="mobile-admin-tab" className={`mb-2 block text-xs font-semibold uppercase tracking-wide ${darkMode ? "text-gray-400" : "text-slate-500"}`}>
              {t("sidebar.settings")}
            </label>
            <select
              id="mobile-admin-tab"
              value={activeTab}
              onChange={(event) => setActiveTab(event.target.value)}
              className={`w-full rounded-lg border px-3 py-2 text-sm outline-none ring-teal-500 focus:ring-2 ${darkMode ? "bg-gray-700 border-gray-600 text-white" : "border-slate-300"}`}
            >
              <option value="general">{t("sidebar.general")}</option>
              <option value="appearance">{t("sidebar.appearance")}</option>
              <option value="notifications">{t("sidebar.notifications")}</option>
              <option value="payments">{t("sidebar.payments")}</option>
              <option value="security">{t("sidebar.security")}</option>
              <option value="backup">{t("sidebar.backup")}</option>
            </select>
          </div>
          {renderTab()}
        </div>

      </main>

    </div>
  );
}
