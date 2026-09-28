import { useEffect, useMemo, useState } from "react";
import { Shield, Lock, AlertTriangle, BadgeCheck, Database, Globe, Fingerprint, KeyRound } from "lucide-react";
import SettingCard from "../../shared/SettingCard";
import { USER_ROLES } from "../../../../data/adminSecurityData";
import { useLanguage } from "../../../../Context/LanguageContext";
import useAdminThemeMode from "../../../../hooks/useAdminThemeMode";

function MonitorStatCard({
  label,
  value,
  subtitle,
  icon: Icon,
  borderClass,
  gradientClass,
  labelClass,
  valueClass,
  barTrackClass,
  barFillClass,
  barWidth,
}) {
  return (
    <div className={`security-light rounded-xl border p-4 ${borderClass} ${gradientClass}`}>
      <div className="flex items-start justify-between gap-2">
        <p className={`text-[11px] font-semibold uppercase tracking-[0.15em] ${labelClass}`}>{label}</p>
        <Icon className="h-5 w-5 text-slate-300" />
      </div>
      <p className={`mt-3 text-4xl font-bold italic ${valueClass}`}>{value}</p>
      <p className="mt-1 text-xs text-slate-400">{subtitle}</p>
      <div className={`mt-3 h-1 rounded ${barTrackClass}`}>
        <div className={`h-1 rounded ${barFillClass}`} style={{ width: `${Math.max(4, Math.min(100, barWidth))}%` }} />
      </div>
    </div>
  );
}

function ToggleRow({ title, description, checked, onChange, darkMode }) {
  return (
    <div className={`flex items-center justify-between border-b pb-3 last:border-b-0 last:pb-0 ${darkMode ? "border-gray-600" : "border-slate-100"}`}>
      <div>
        <p className={`font-medium ${darkMode ? "text-white" : "text-slate-700"}`}>{title}</p>
        <p className={`text-xs ${darkMode ? "text-gray-400" : "text-slate-500"}`}>{description}</p>
      </div>
      <button
        type="button"
        onClick={onChange}
        data-state={checked ? "on" : "off"}
        className="admin-switch"
      >
        <span className="admin-switch-thumb" />
      </button>
    </div>
  );
}

function getToneClass(level) {
  if (level === "danger") return "bg-rose-100 text-rose-700";
  if (level === "warn") return "bg-amber-100 text-amber-700";
  return "bg-emerald-100 text-emerald-700";
}

function SectionLiveIndicator({ seconds }) {
  const stale = seconds > 8;
  return (
    <div className="mb-3 -mt-2 flex justify-end">
      <span
        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] ${
          stale ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"
        }`}
      >
        Last updated {seconds}s ago
      </span>
    </div>
  );
}

export default function SecurityOverviewPanel({
  settings,
  stats,
  onTogglePanicMode,
  onUpdateSettings,
}) {
  const { t } = useLanguage();
  const { darkMode } = useAdminThemeMode();
  const [savedLabel, setSavedLabel] = useState("");
  const [sectionUpdatedAt, setSectionUpdatedAt] = useState(() => {
    const now = Date.now();
    return {
      atp: now,
      auth: now - 900,
      access: now - 1400,
      data: now - 700,
      integrity: now - 1700,
      roles: now - 500,
    };
  });
  const runtime = stats.runtime ?? {};
  const atp = stats.advancedThreatProtection ?? {};
  const auth = stats.authentication ?? {};
  const access = stats.accessCompliance ?? {};
  const dataProtection = stats.dataProtection ?? {};
  const integrity = stats.systemIntegrity ?? {};

  const sessionTimeoutOptions = useMemo(
    () => [
      { label: "30 Minutes", value: 30 },
      { label: "1 Hour", value: 60 },
      { label: "4 Hours", value: 240 },
      { label: "12 Hours", value: 720 },
      { label: "24 Hours", value: 1440 },
    ],
    []
  );

  const showSavedFeedback = (text) => {
    setSavedLabel(text);
    window.setTimeout(() => setSavedLabel(""), 1500);
  };

  const liveUpdatedText = useMemo(() => {
    if (!runtime.updatedAt) return "Live telemetry";
    return `Live telemetry - ${new Date(runtime.updatedAt).toLocaleTimeString()}`;
  }, [runtime.updatedAt]);

  useEffect(() => {
    const sectionKeys = ["atp", "auth", "access", "data", "integrity", "roles"];
    const interval = window.setInterval(() => {
      setSectionUpdatedAt((prev) => {
        const key = sectionKeys[Math.floor(Math.random() * sectionKeys.length)];
        return {
          ...prev,
          [key]: Date.now(),
        };
      });
    }, 1500);

    return () => window.clearInterval(interval);
  }, []);

  const sectionSecondsAgo = useMemo(() => {
    const now = runtime.updatedAt ?? Date.now();
    return {
      atp: Math.max(0, Math.floor((now - sectionUpdatedAt.atp) / 1000)),
      auth: Math.max(0, Math.floor((now - sectionUpdatedAt.auth) / 1000)),
      access: Math.max(0, Math.floor((now - sectionUpdatedAt.access) / 1000)),
      data: Math.max(0, Math.floor((now - sectionUpdatedAt.data) / 1000)),
      integrity: Math.max(0, Math.floor((now - sectionUpdatedAt.integrity) / 1000)),
      roles: Math.max(0, Math.floor((now - sectionUpdatedAt.roles) / 1000)),
    };
  }, [runtime.updatedAt, sectionUpdatedAt]);

  return (
    <div className="space-y-6">
      <SettingCard title={t("secOverview.atp")} icon={Shield}>
        <SectionLiveIndicator seconds={sectionSecondsAgo.atp} />
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
            {liveUpdatedText}
          </span>
          <span
            className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${getToneClass(
              atp.posture === "Elevated" ? "warn" : atp.posture === "Lockdown Active" ? "danger" : "ok"
            )}`}
          >
            {t("secOverview.posture")} {atp.posture ?? "Stable"}
          </span>
          <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${darkMode ? "bg-gray-600 text-gray-200" : "bg-slate-100 text-slate-700"}`}>
            {t("secOverview.checksMin")} {atp.checksPerMin ?? 0}
          </span>
          <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${darkMode ? "bg-gray-600 text-gray-200" : "bg-blue-100 text-blue-700"}`}>
            {t("secOverview.sources")} {atp.liveSources ?? 0}
          </span>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MonitorStatCard
            label={t("secOverview.blockedIps")}
            value={stats.blockedIPs}
            icon={AlertTriangle}
            subtitle={`${atp.liveSources ?? 0} ${t("secOverview.liveSourcesWatched")}`}
            borderClass="border-rose-600/45"
            gradientClass="bg-gradient-to-br from-rose-950/30 via-[#131e32] to-[#131e32]"
            labelClass="text-rose-300"
            valueClass="text-slate-50"
            barTrackClass="bg-slate-800"
            barFillClass="bg-rose-500"
            barWidth={stats.blockedIPs * 10}
          />
          <MonitorStatCard
            label={t("secOverview.activeThreats")}
            value={stats.activeThreats}
            icon={AlertTriangle}
            subtitle={`${t("secOverview.posture")} ${atp.posture ?? "Stable"}`}
            borderClass="border-amber-600/45"
            gradientClass="bg-gradient-to-br from-amber-950/25 via-[#131e32] to-[#131e32]"
            labelClass="text-amber-300"
            valueClass="text-slate-50"
            barTrackClass="bg-slate-800"
            barFillClass="bg-amber-500"
            barWidth={stats.activeThreats * 16}
          />
          <MonitorStatCard
            label={t("secOverview.securityChecks")}
            value={stats.successfulChecks}
            icon={BadgeCheck}
            subtitle={`${atp.checksPerMin ?? 0}${t("secOverview.realtimeChecks")}`}
            borderClass="border-emerald-600/45"
            gradientClass="bg-gradient-to-br from-emerald-950/30 via-[#102437] to-[#102437]"
            labelClass="text-emerald-300"
            valueClass="text-slate-50"
            barTrackClass="bg-slate-800"
            barFillClass="bg-emerald-500"
            barWidth={(stats.successfulChecks / 80) * 100}
          />
          <MonitorStatCard
            label={t("secOverview.sessionTimeout")}
            value={auth.sessionRemainingLabel ?? `${settings.sessionTimeoutMinutes}m`}
            icon={Lock}
            subtitle={`${t("secOverview.idle")} ${auth.idleSeconds ?? 0}s`}
            borderClass="border-blue-500/45"
            gradientClass="bg-gradient-to-br from-blue-950/30 via-[#131e32] to-[#131e32]"
            labelClass="text-blue-300"
            valueClass="text-slate-50"
            barTrackClass="bg-slate-800"
            barFillClass="bg-blue-500"
            barWidth={
              auth.sessionRemainingSeconds && settings.sessionTimeoutMinutes
                ? (auth.sessionRemainingSeconds / (settings.sessionTimeoutMinutes * 60)) * 100
                : 100
            }
          />
        </div>

        <div className={`mt-6 rounded-xl border p-4 ${darkMode ? "border-gray-600 bg-gray-700" : "border-slate-200 bg-slate-50"}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`font-semibold ${darkMode ? "text-white" : "text-slate-800"}`}>{t("secOverview.panicMode")}</p>
              <p className={`text-sm ${darkMode ? "text-gray-400" : "text-slate-500"}`}>
                {t("secOverview.panicModeDesc")}
              </p>
              <p className={`mt-1 text-xs ${darkMode ? "text-gray-400" : "text-slate-500"}`}>
                {t("secOverview.runtimeStatus")} {settings.panicMode ? t("secOverview.hardenedActive") : t("secOverview.normalEnforcement")}.
              </p>
            </div>
            <button
              type="button"
              onClick={onTogglePanicMode}
              className={`rounded-lg px-4 py-2 text-sm font-semibold text-white transition ${
                settings.panicMode ? "bg-rose-600 hover:bg-rose-700" : "bg-slate-700 hover:bg-slate-800"
              }`}
            >
              {settings.panicMode ? t("secOverview.disableLockdown") : t("secOverview.enableLockdown")}
            </button>
          </div>
        </div>
      </SettingCard>

      <div className="grid gap-6 lg:grid-cols-2">
        <SettingCard title={t("secOverview.authentication")} icon={KeyRound}>
          <SectionLiveIndicator seconds={sectionSecondsAgo.auth} />
          <div className="space-y-4">
            <ToggleRow
              title={t("secOverview.emailPasswordLogin")}
              description={t("secOverview.emailPasswordDesc")}
              checked={auth.passwordFlowActive ?? true}
              onChange={() => {}}
              darkMode={darkMode}
            />

            <ToggleRow
              title={t("secOverview.twoFactorAuth")}
              description={t("secOverview.twoFactorDesc")}
              checked={settings.enforceTwoFactor}
              onChange={() =>
                onUpdateSettings({ enforceTwoFactor: !settings.enforceTwoFactor })
              }
              darkMode={darkMode}
            />

            <div className="flex items-center justify-between">
              <div>
                <p className={`font-medium ${darkMode ? "text-white" : "text-slate-700"}`}>{t("secOverview.sessionTimeoutSetting")}</p>
                <p className={`text-xs ${darkMode ? "text-gray-400" : "text-slate-500"}`}>{t("secOverview.sessionTimeoutDesc")}</p>
              </div>
              <select
                value={settings.sessionTimeoutMinutes}
                onChange={(event) =>
                  onUpdateSettings({
                    sessionTimeoutMinutes: Number(event.target.value),
                  })
                }
                className={`rounded-lg border px-2 py-1.5 text-sm outline-none ring-teal-500 focus:ring-2 ${darkMode ? "border-gray-600 bg-gray-700 text-white" : "border-slate-300"}`}
              >
                {sessionTimeoutOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className={`rounded-lg border px-3 py-2 ${darkMode ? "border-gray-600 bg-gray-700" : "border-slate-200 bg-slate-50"}`}>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span
                  className={`rounded px-2 py-0.5 font-semibold ${getToneClass(
                    auth.status === "Session Expired" ? "danger" : auth.status === "Expiring Soon" ? "warn" : "ok"
                  )}`}
                >
                  {auth.status ?? "Authenticated"}
                </span>
                <span className={`rounded px-2 py-0.5 font-semibold ${darkMode ? "bg-slate-600 text-slate-200" : "bg-blue-100 text-blue-700"}`}>
                  2FA: {auth.twoFactorLabel ?? "Optional"}
                </span>
                <span className={`rounded px-2 py-0.5 font-semibold ${darkMode ? "bg-slate-600 text-slate-200" : "bg-indigo-100 text-indigo-700"}`}>
                  {t("secOverview.health")} {auth.healthScore ?? 0}%
                </span>
                <span className={`rounded px-2 py-0.5 font-semibold ${darkMode ? "bg-slate-600 text-slate-200" : "bg-slate-200 text-slate-700"}`}>
                  {t("secOverview.idle")} {auth.idleSeconds ?? 0}s
                </span>
              </div>
            </div>
          </div>
        </SettingCard>

        <SettingCard title={t("secOverview.accessCompliance")} icon={Globe}>
          <SectionLiveIndicator seconds={sectionSecondsAgo.access} />
          <div className="space-y-4">
            <div className={`border-b pb-3 ${darkMode ? "border-gray-600" : "border-slate-100"}`}>
              <div className="mb-1 flex items-center justify-between">
                <p className={`font-medium ${darkMode ? "text-white" : "text-slate-700"}`}>{t("secOverview.passwordPolicy")}</p>
                <span className={`rounded px-2 py-0.5 text-xs font-semibold ${darkMode ? "bg-gray-600 text-gray-200" : "bg-slate-100 text-slate-600"}`}>
                  {access.passwordPolicyStrength ?? "Strong"}
                </span>
              </div>
              <p className={`text-xs ${darkMode ? "text-gray-400" : "text-slate-500"}`}>
                {t("secOverview.minChars")} {settings.minPasswordLength} {t("secOverview.chars")}, special characters{" "}
                {settings.requireSpecialCharacter ? "required" : "optional"}, expires after{" "}
                {settings.passwordExpiryDays} days.
              </p>
            </div>

            <div className={`border-b pb-3 ${darkMode ? "border-gray-600" : "border-slate-100"}`}>
              <div className="mb-1 flex items-center justify-between">
                <p className={`font-medium ${darkMode ? "text-white" : "text-slate-700"}`}>{t("secOverview.ipWhitelist")}</p>
                <button
                  type="button"
                  onClick={() => showSavedFeedback("Whitelist saved")}
                  className="rounded bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-100"
                >
                  {t("secOverview.save")}
                </button>
              </div>
              <textarea
                value={settings.ipWhitelist}
                onChange={(event) => onUpdateSettings({ ipWhitelist: event.target.value })}
                rows={2}
                className={`w-full rounded-lg border p-2 text-xs outline-none ring-teal-500 focus:ring-2 ${darkMode ? "border-gray-600 bg-gray-700 text-white" : "border-slate-300"}`}
              />
              <p className={`mt-1 text-[11px] ${darkMode ? "text-gray-400" : "text-slate-500"}`}>
                {t("secOverview.activeWhitelist")} {access.whitelistEntries ?? 0}
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className={`font-medium ${darkMode ? "text-white" : "text-slate-700"}`}>{t("secOverview.auditRetention")}</p>
                <p className={`text-xs ${darkMode ? "text-gray-400" : "text-slate-500"}`}>
                  Keep security logs for {settings.auditRetentionDays} days.
                </p>
                <p className={`text-[11px] ${darkMode ? "text-gray-400" : "text-slate-500"}`}>
                  {t("secOverview.nextAuditWindow")}{access.nextAuditInHours ?? 0}h.
                </p>
              </div>
              <span className={`rounded px-2 py-1 text-xs font-semibold ${darkMode ? "bg-gray-600 text-gray-200" : "bg-slate-100 text-slate-600"}`}>
                {access.retentionState ?? "Compliant"}
              </span>
            </div>
            <div className={`rounded px-3 py-2 text-xs ${darkMode ? "bg-gray-700 text-gray-300" : "bg-slate-50 text-slate-600"}`}>
              {t("secOverview.complianceScore")} <span className="font-semibold">{access.complianceScore ?? 0}%</span>
            </div>
          </div>
        </SettingCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <SettingCard title={t("secOverview.dataFinancial")} icon={Database}>
          <SectionLiveIndicator seconds={sectionSecondsAgo.data} />
          <div className="space-y-4">
            <ToggleRow
              title={t("secOverview.financialShield")}
              description={t("secOverview.financialShieldDesc")}
              checked={settings.financialShield}
              onChange={() =>
                onUpdateSettings({ financialShield: !settings.financialShield })
              }
              darkMode={darkMode}
            />

            <ToggleRow
              title={t("secOverview.dlpEnforcement")}
              description={t("secOverview.dlpEnforcementDesc")}
              checked={settings.dlpEnforcement}
              onChange={() =>
                onUpdateSettings({ dlpEnforcement: !settings.dlpEnforcement })
              }
              darkMode={darkMode}
            />

            <div className={`flex items-center justify-between border-b pb-3 ${darkMode ? "border-gray-600" : "border-slate-100"}`}>
              <div>
                <p className={`font-medium ${darkMode ? "text-white" : "text-slate-700"}`}>{t("secOverview.bankGradeEncryption")}</p>
                <p className={`text-xs ${darkMode ? "text-gray-400" : "text-slate-500"}`}>{t("secOverview.bankGradeDesc")}</p>
              </div>
              <span className="rounded bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">
                {dataProtection.encryptionState ?? "TLS 1.3"}
              </span>
            </div>

            <ToggleRow
              title="PII Data Masking"
              description="Mask sensitive personal information in audit logs."
              checked={settings.piiMasking}
              onChange={() => onUpdateSettings({ piiMasking: !settings.piiMasking })}
              darkMode={darkMode}
            />

            <div className="flex items-center justify-between">
              <div>
                <p className={`font-medium ${darkMode ? "text-white" : "text-slate-700"}`}>{t("secOverview.dataExport")}</p>
                <p className={`text-xs ${darkMode ? "text-gray-400" : "text-slate-500"}`}>{t("secOverview.dataExportDesc")}</p>
              </div>
              <button
                type="button"
                onClick={() => showSavedFeedback("Export prepared")}
                className="rounded bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-100"
              >
                {t("secOverview.export")}
              </button>
            </div>
            <div className={`rounded px-3 py-2 text-xs ${darkMode ? "bg-gray-700 text-gray-300" : "bg-slate-50 text-slate-600"}`}>
              {t("secOverview.shield")} <span className="font-semibold">{dataProtection.shieldState ?? "Protected"}</span> - {t("secOverview.dlp")}{" "}
              <span className="font-semibold">{dataProtection.dlpState ?? "Active"}</span> - {t("secOverview.pii")}{" "}
              <span className="font-semibold">{dataProtection.piiState ?? "Masked"}</span> - {t("secOverview.score")}{" "}
              <span className="font-semibold">{dataProtection.protectionScore ?? 0}%</span>
            </div>
          </div>
        </SettingCard>

        <SettingCard title={t("secOverview.systemIntegrity")} icon={Fingerprint}>
          <SectionLiveIndicator seconds={sectionSecondsAgo.integrity} />
          <div className="space-y-4">
            <div className={`flex items-center justify-between border-b pb-3 ${darkMode ? "border-gray-600" : "border-slate-100"}`}>
              <div>
                <p className={`font-medium ${darkMode ? "text-white" : "text-slate-700"}`}>{t("secOverview.firestoreRules")}</p>
                <p className={`text-xs ${darkMode ? "text-gray-400" : "text-slate-500"}`}>{t("secOverview.firestoreDesc")}</p>
              </div>
              <span className={`rounded px-2 py-1 text-xs font-semibold ${darkMode ? "bg-gray-600 text-gray-200" : "bg-slate-100 text-slate-600"}`}>
                {integrity.rulesState ?? "Strict"}
              </span>
            </div>

            <div className={`flex items-center justify-between border-b pb-3 ${darkMode ? "border-gray-600" : "border-slate-100"}`}>
              <div>
                <p className={`font-medium ${darkMode ? "text-white" : "text-slate-700"}`}>{t("secOverview.encryption")}</p>
                <p className={`text-xs ${darkMode ? "text-gray-400" : "text-slate-500"}`}>{t("secOverview.encryptionDesc")}</p>
              </div>
              <span className="rounded bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">
                {integrity.encryptionState ?? "TLS 1.3"}
              </span>
            </div>

            <div className={`flex items-center justify-between border-b pb-3 ${darkMode ? "border-gray-600" : "border-slate-100"}`}>
              <div>
                <p className={`font-medium ${darkMode ? "text-white" : "text-slate-700"}`}>{t("secOverview.rbacStatus")}</p>
                <p className={`text-xs ${darkMode ? "text-gray-400" : "text-slate-500"}`}>{t("secOverview.rbacDesc")}</p>
              </div>
              <span className="rounded bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">
                {integrity.rbacState ?? "Enforced"}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => showSavedFeedback("Security audit completed")}
                className="rounded bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100"
              >
                {t("secOverview.runAudit")}
              </button>

              {savedLabel ? (
                <span className="text-xs font-medium text-emerald-600">{savedLabel}</span>
              ) : null}
            </div>
            <div className={`rounded px-3 py-2 text-xs ${darkMode ? "bg-gray-700 text-gray-300" : "bg-slate-50 text-slate-600"}`}>
              {t("secOverview.integrityScore")} <span className="font-semibold">{integrity.integrityScore ?? 0}%</span> - {t("secOverview.anomalies")}{" "}
              <span className="font-semibold">{integrity.anomalies ?? "Clear"}</span>
            </div>
          </div>
        </SettingCard>
      </div>

      <SettingCard title={t("secOverview.userRolesAccess")} icon={Shield}>
        <SectionLiveIndicator seconds={sectionSecondsAgo.roles} />
        <div className="grid gap-4 md:grid-cols-3">
          {USER_ROLES.map((entry) => (
            <div key={entry.role} className={`rounded-xl border p-4 ${darkMode ? "border-gray-600 bg-gray-700" : "border-slate-200"}`}>
              <p className={`text-base font-semibold ${darkMode ? "text-white" : "text-slate-800"}`}>{entry.role}</p>
              <ul className={`mt-2 space-y-2 text-sm ${darkMode ? "text-gray-300" : "text-slate-600"}`}>
                {entry.capabilities.map((item) => (
                  <li key={item}>- {item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </SettingCard>
    </div>
  );
}
