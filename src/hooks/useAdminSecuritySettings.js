import { useEffect, useMemo, useState } from "react";
import { DEFAULT_SECURITY_SETTINGS } from "../data/adminSecurityData";
import { userPreferencesApi } from "../services/userPreferencesApi";
import { buildScopedStorageKey, getCurrentAdminIdentity } from "../utils/currentAdminIdentity";

const STORAGE_KEY = "groupAdminSecuritySettings";
const TICK_MS = 2000;

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function formatRemaining(seconds) {
  const safe = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${minutes}m ${secs.toString().padStart(2, "0")}s`;
}

export default function useAdminSecuritySettings() {
  const { userId } = getCurrentAdminIdentity();
  const scopedStorageKey = buildScopedStorageKey(STORAGE_KEY, userId);
  const [settings, setSettings] = useState(DEFAULT_SECURITY_SETTINGS);
  const [isHydrated, setIsHydrated] = useState(false);
  const [bootTime] = useState(() => Date.now());
  const [runtimeNow, setRuntimeNow] = useState(() => Date.now());
  const [lastActivityAt, setLastActivityAt] = useState(() => Date.now());
  const [isOnline, setIsOnline] = useState(() => navigator.onLine);
  const [isFocused, setIsFocused] = useState(() => document.hasFocus());
  const [visibilityState, setVisibilityState] = useState(() => document.visibilityState);

  useEffect(() => {
    let isMounted = true;
    const hydrate = async () => {
      const localSaved = localStorage.getItem(scopedStorageKey);
      if (localSaved) {
        try {
          const parsed = JSON.parse(localSaved);
          if (isMounted) {
            setSettings((prev) => ({ ...prev, ...parsed }));
          }
        } catch (error) {
          console.error("Failed to parse security settings from localStorage:", error);
        }
      }

      try {
        const result = await userPreferencesApi.getScope("security_settings", userId);
        const backendSettings = result?.value?.value;
        if (backendSettings && isMounted) {
          setSettings((prev) => ({ ...prev, ...backendSettings }));
        }
      } catch {
        // backend may be unavailable; keep local settings
      } finally {
        if (isMounted) setIsHydrated(true);
      }
    };

    hydrate();
    return () => {
      isMounted = false;
    };
  }, [scopedStorageKey, userId]);

  useEffect(() => {
    if (!isHydrated) return;
    localStorage.setItem(scopedStorageKey, JSON.stringify(settings));
    userPreferencesApi.saveScope("security_settings", userId, settings).catch(() => {});
  }, [settings, isHydrated, scopedStorageKey, userId]);

  useEffect(() => {
    const tick = window.setInterval(() => {
      setRuntimeNow(Date.now());
    }, TICK_MS);

    return () => window.clearInterval(tick);
  }, []);

  useEffect(() => {
    const markActivity = () => {
      setLastActivityAt(Date.now());
    };

    const handleOnline = () => {
      setIsOnline(true);
      markActivity();
    };

    const handleOffline = () => {
      setIsOnline(false);
      markActivity();
    };

    const handleVisibility = () => {
      setVisibilityState(document.visibilityState);
      markActivity();
    };

    const handleFocus = () => {
      setIsFocused(true);
      markActivity();
    };

    const handleBlur = () => {
      setIsFocused(false);
      markActivity();
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("focus", handleFocus);
    window.addEventListener("blur", handleBlur);
    window.addEventListener("pointerdown", markActivity);
    window.addEventListener("keydown", markActivity);
    window.addEventListener("scroll", markActivity, { passive: true });

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("pointerdown", markActivity);
      window.removeEventListener("keydown", markActivity);
      window.removeEventListener("scroll", markActivity);
    };
  }, []);

  const securityStats = useMemo(() => {
    const uptimeSeconds = Math.floor((runtimeNow - bootTime) / 1000);
    const idleSeconds = Math.floor((runtimeNow - lastActivityAt) / 1000);
    const timeoutSeconds = settings.sessionTimeoutMinutes * 60;
    const sessionRemainingSeconds = clamp(timeoutSeconds - idleSeconds, 0, timeoutSeconds);

    const whitelistEntries = settings.ipWhitelist
      .split(",")
      .map((entry) => entry.trim())
      .filter(Boolean).length;

    const waveA = Math.sin(runtimeNow / 8500);
    const waveB = Math.cos(runtimeNow / 6100);
    const pulse = Math.sin(runtimeNow / 3200);

    const blocked = clamp(
      Math.round(
        6 +
          whitelistEntries * 1.2 +
          (settings.dlpEnforcement ? 2 : 0) +
          (settings.panicMode ? 3 : 0) +
          waveA * 2.4
      ),
      1,
      40
    );
    const activeThreats = clamp(
      Math.round(
        2 +
          (isOnline ? 0 : 2) +
          (visibilityState === "hidden" ? 1 : 0) +
          (settings.financialShield ? -1 : 1) +
          (settings.panicMode ? -1 : 0) +
          waveB * 1.8
      ),
      0,
      9
    );
    const checksPerMin = clamp(
      Math.round(
        56 +
          (settings.enforceTwoFactor ? 16 : 0) +
          (settings.dlpEnforcement ? 12 : 0) +
          (settings.piiMasking ? 8 : 0) +
          pulse * 7
      ),
      18,
      120
    );
    const successful = Math.max(0, Math.round((uptimeSeconds / 60) * checksPerMin));

    const passwordStrengthScore =
      (settings.minPasswordLength >= 12 ? 45 : settings.minPasswordLength >= 10 ? 35 : 24) +
      (settings.requireSpecialCharacter ? 25 : 10) +
      (settings.passwordExpiryDays <= 90 ? 20 : 10) +
      (settings.enforceTwoFactor ? 10 : 0);
    const passwordPolicyStrength =
      passwordStrengthScore >= 90 ? "Very Strong" : passwordStrengthScore >= 75 ? "Strong" : "Moderate";

    const authHealthScore = clamp(
      Math.round(
        56 +
          (settings.enforceTwoFactor ? 20 : 0) +
          (isFocused ? 8 : 2) +
          (isOnline ? 6 : -14) +
          (sessionRemainingSeconds / Math.max(timeoutSeconds, 1)) * 15
      ),
      0,
      100
    );
    const authStatus =
      sessionRemainingSeconds === 0
        ? "Session Expired"
        : sessionRemainingSeconds < 180
        ? "Expiring Soon"
        : "Authenticated";

    const complianceScore = clamp(
      Math.round(
        50 +
          (whitelistEntries > 0 ? 16 : 0) +
          (settings.auditRetentionDays >= 90 ? 18 : 8) +
          (settings.requireSpecialCharacter ? 9 : 0) +
          (settings.passwordExpiryDays <= 120 ? 7 : -4)
      ),
      0,
      100
    );

    const protectionScore = clamp(
      Math.round(
        48 +
          (settings.financialShield ? 24 : -8) +
          (settings.dlpEnforcement ? 15 : -6) +
          (settings.piiMasking ? 12 : -4) +
          (isOnline ? 6 : -2) +
          waveA * 4
      ),
      0,
      100
    );

    const integrityScore = clamp(
      Math.round(
        52 +
          (settings.panicMode ? 13 : 0) +
          (settings.enforceTwoFactor ? 10 : 0) +
          (settings.requireSpecialCharacter ? 8 : 0) +
          (isFocused ? 5 : 0) +
          waveB * 3
      ),
      0,
      100
    );

    const retentionState =
      settings.auditRetentionDays >= 120
        ? "Hardened"
        : settings.auditRetentionDays >= 90
        ? "Compliant"
        : "At Risk";

    const nextAuditInHours = clamp(
      Math.floor((settings.auditRetentionDays * 24 - (uptimeSeconds / 3600) % (settings.auditRetentionDays * 24))),
      1,
      settings.auditRetentionDays * 24
    );

    return {
      blockedIPs: blocked,
      activeThreats,
      successfulChecks: successful,
      panicMode: settings.panicMode,
      runtime: {
        updatedAt: runtimeNow,
        uptimeSeconds,
        isOnline,
        isFocused,
        visibilityState,
      },
      advancedThreatProtection: {
        posture: settings.panicMode ? "Lockdown Active" : activeThreats >= 5 ? "Elevated" : "Stable",
        checksPerMin,
        liveSources: isOnline ? (isFocused ? 3 : 2) : 1,
      },
      authentication: {
        status: authStatus,
        healthScore: authHealthScore,
        twoFactorLabel: settings.enforceTwoFactor ? "Enforced" : "Optional",
        sessionRemainingLabel: formatRemaining(sessionRemainingSeconds),
        sessionRemainingSeconds,
        passwordFlowActive: true,
        idleSeconds,
      },
      accessCompliance: {
        passwordPolicyStrength,
        whitelistEntries,
        retentionState,
        complianceScore,
        nextAuditInHours,
      },
      dataProtection: {
        shieldState: settings.financialShield ? "Protected" : "Disabled",
        dlpState: settings.dlpEnforcement ? "Active" : "Passive",
        piiState: settings.piiMasking ? "Masked" : "Visible",
        encryptionState: isOnline ? "TLS 1.3" : "Offline Cache",
        protectionScore,
      },
      systemIntegrity: {
        rulesState: settings.panicMode ? "Hardened" : "Strict",
        encryptionState: isOnline ? "TLS 1.3" : "Standby",
        rbacState: settings.panicMode ? "Strict+" : "Enforced",
        integrityScore,
        anomalies: activeThreats >= 6 ? "Detected" : activeThreats >= 3 ? "Monitored" : "Clear",
      },
    };
  }, [
    bootTime,
    runtimeNow,
    lastActivityAt,
    isOnline,
    isFocused,
    visibilityState,
    settings,
  ]);

  const updateSettings = (partial) => {
    setSettings((prev) => ({ ...prev, ...partial }));
  };

  return {
    settings,
    updateSettings,
    securityStats,
  };
}
