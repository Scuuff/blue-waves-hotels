// components/admin/settings/SecurityTab.jsx
import { useState } from "react";
import { ShieldAlert, Activity, Settings, Monitor, Lock, Scale } from "lucide-react";
import useAdminSecuritySettings from "../../../hooks/useAdminSecuritySettings";
import useFinalCodeSecurity from "../../../hooks/useFinalCodeSecurity";
import SecurityOverviewPanel from "./security/SecurityOverviewPanel";
import SecurityAlertsPanel from "./security/SecurityAlertsPanel";
import SecurityConfigurationForm from "./security/SecurityConfigurationForm";
import SecurityCyberMonitorPanel from "./security/SecurityCyberMonitorPanel";
import SecurityFinalCodePanel from "./security/SecurityFinalCodePanel";
import SecurityOtpModal from "./security/SecurityOtpModal";
import SecurityPunishmentSystemTab from "./security/SecurityPunishmentSystemTab";
import { DEFAULT_SECURITY_SETTINGS } from "../../../data/adminSecurityData";
import useAdminThemeMode from "../../../hooks/useAdminThemeMode";
import { useLanguage } from "../../../Context/LanguageContext";

const tabDefs = [
  { id: "overview", key: "security.overview", icon: ShieldAlert },
  { id: "alerts", key: "security.alerts", icon: Activity },
  { id: "cyberMonitor", key: "security.cyberMonitor", icon: Monitor },
  { id: "punishmentSystem", key: "security.punishmentSystem", icon: Scale },
  { id: "finalCode", key: "security.finalCode", icon: Lock },
  { id: "configuration", key: "security.configuration", icon: Settings },
];

export default function SecurityTab() {
  const [activeTab, setActiveTab] = useState("overview");
  const { darkMode } = useAdminThemeMode();
  const { t } = useLanguage();
  const { settings, updateSettings, securityStats } = useAdminSecuritySettings();
  const {
    secretCodes,
    createSecretCode,
    deleteSecretCode,
    generateOtpForAction,
    verifyOtp,
    clearFinalCodeStorage,
  } = useFinalCodeSecurity();

  const [pendingAction, setPendingAction] = useState("");
  const [pendingActionHandler, setPendingActionHandler] = useState(null);
  const [otpInput, setOtpInput] = useState("");
  const [otpError, setOtpError] = useState("");
  const [isOtpVerifying, setIsOtpVerifying] = useState(false);

  const executeProtectedAction = (action) => {
    if (action === "lockdown") {
      updateSettings({ panicMode: !settings.panicMode });
      return;
    }

    if (action === "nuclear_wipe") {
      localStorage.removeItem("groupAdminSecuritySettings");
      localStorage.removeItem("groupFinalCodeSecurity");
      updateSettings({ ...DEFAULT_SECURITY_SETTINGS, panicMode: false });
      clearFinalCodeStorage();
      return;
    }

    if (action === "right_to_be_forgotten") {
      localStorage.setItem(
        "groupRightToBeForgottenLastRun",
        JSON.stringify({ at: Date.now(), by: "admin-panel" })
      );
    }
  };

  const requestProtectedAction = (action) => {
    setPendingAction(action);
    setPendingActionHandler(null);
    setOtpInput("");
    setOtpError("");
  };

  const requestProtectedActionWithHandler = (action, onVerified) => {
    setPendingAction(action);
    setPendingActionHandler(() => onVerified);
    setOtpInput("");
    setOtpError("");
  };

  const handleOtpVerify = async () => {
    if (!pendingAction) return;
    setIsOtpVerifying(true);
    await new Promise((resolve) => setTimeout(resolve, 350));

    const result = verifyOtp(pendingAction, otpInput);
    if (!result.ok) {
      setOtpError(result.message);
      setIsOtpVerifying(false);
      return;
    }

    try {
      if (pendingActionHandler) {
        await pendingActionHandler();
      } else {
        executeProtectedAction(pendingAction);
      }
      setPendingAction("");
      setPendingActionHandler(null);
      setOtpInput("");
      setOtpError("");
    } catch (error) {
      setOtpError(error?.message ?? "Protected action failed.");
    } finally {
      setIsOtpVerifying(false);
    }
  };

  const handleGenerateOtp = (action, secret) => {
    return generateOtpForAction(action, secret);
  };

  return (
    <div className="space-y-6">
      <div
        className={`admin-security-tabs-shell rounded-xl border p-2 shadow-sm ${
          darkMode ? "border-[#2b4166] bg-[#101d33]" : "border-slate-200 bg-white"
        }`}
      >
        <div className="flex flex-wrap gap-2">
          {tabDefs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`admin-security-tab-button inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${
                  isActive
                    ? "active bg-teal-500 text-white"
                    : darkMode
                    ? "bg-[#15263f] text-slate-300 hover:bg-[#1a3050]"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                <Icon className="h-4 w-4" />
                {t(tab.key)}
              </button>
            );
          })}
        </div>
      </div>

      {activeTab === "overview" && (
        <SecurityOverviewPanel
          settings={settings}
          stats={securityStats}
          onUpdateSettings={updateSettings}
          onTogglePanicMode={() => updateSettings({ panicMode: !settings.panicMode })}
        />
      )}

      {activeTab === "alerts" && <SecurityAlertsPanel />}

      {activeTab === "cyberMonitor" && (
        <SecurityCyberMonitorPanel
          settings={settings}
          onUpdateSettings={updateSettings}
          onRequestProtectedAction={requestProtectedAction}
          isDarkMode={darkMode}
        />
      )}

      {activeTab === "finalCode" && (
        <SecurityFinalCodePanel
          secretCodes={secretCodes}
          onCreateSecretCode={createSecretCode}
          onDeleteSecretCode={deleteSecretCode}
          onGenerateOtp={handleGenerateOtp}
          isDarkMode={darkMode}
        />
      )}

      {activeTab === "punishmentSystem" && (
        <SecurityPunishmentSystemTab
          isDarkMode={darkMode}
          onRequestProtectedAction={requestProtectedActionWithHandler}
        />
      )}

      {activeTab === "configuration" && (
        <SecurityConfigurationForm settings={settings} onSubmit={updateSettings} />
      )}

      <SecurityOtpModal
        action={pendingAction}
        otpInput={otpInput}
        onOtpInputChange={setOtpInput}
        onClose={() => {
          setPendingAction("");
          setPendingActionHandler(null);
          setOtpError("");
          setOtpInput("");
        }}
        onVerify={handleOtpVerify}
        error={otpError}
        isVerifying={isOtpVerifying}
      />
    </div>
  );
}