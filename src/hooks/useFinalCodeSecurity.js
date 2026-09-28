import { useEffect, useMemo, useState } from "react";
import { userPreferencesApi } from "../services/userPreferencesApi";
import { buildScopedStorageKey, getCurrentAdminIdentity } from "../utils/currentAdminIdentity";

const STORAGE_KEY = "groupFinalCodeSecurity";
const OTP_TTL_MS = 5 * 60 * 1000;

const DEFAULT_CODES = [
  {
    id: "default-owner-key",
    name: "Owner Key",
    code: "admin123",
    createdAt: "2026-02-12T10:00:00.000Z",
  },
];

function buildInitialState() {
  return {
    codes: DEFAULT_CODES,
    activeOtps: {},
    lastAction: "",
  };
}

export default function useFinalCodeSecurity() {
  const { userId } = getCurrentAdminIdentity();
  const scopedStorageKey = buildScopedStorageKey(STORAGE_KEY, userId);
  const [state, setState] = useState(buildInitialState);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const hydrate = async () => {
      const saved = localStorage.getItem(scopedStorageKey);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (isMounted) {
            setState((prev) => ({
              ...prev,
              ...parsed,
              codes: parsed.codes?.length ? parsed.codes : prev.codes,
              activeOtps: parsed.activeOtps ?? {},
            }));
          }
        } catch (error) {
          console.error("Failed to parse final code state:", error);
        }
      }

      try {
        const result = await userPreferencesApi.getScope("final_code_security", userId);
        const backendState = result?.value?.value;
        if (backendState && isMounted) {
          setState((prev) => ({
            ...prev,
            ...backendState,
            codes: backendState.codes?.length ? backendState.codes : prev.codes,
            activeOtps: backendState.activeOtps ?? {},
          }));
        }
      } catch {
        // backend optional
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
    localStorage.setItem(scopedStorageKey, JSON.stringify(state));
    userPreferencesApi.saveScope("final_code_security", userId, state).catch(() => {});
  }, [state, isHydrated, scopedStorageKey, userId]);

  const createSecretCode = (name, code) => {
    const item = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2, 7)}`,
      name: name.trim(),
      code: code.trim(),
      createdAt: new Date().toISOString(),
    };
    setState((prev) => ({ ...prev, codes: [item, ...prev.codes] }));
  };

  const deleteSecretCode = (id) => {
    setState((prev) => ({ ...prev, codes: prev.codes.filter((code) => code.id !== id) }));
  };

  const generateOtpForAction = (action, providedSecretCode) => {
    const matched = state.codes.find((item) => item.code === providedSecretCode.trim());
    if (!matched) {
      return { ok: false, message: "Invalid secret code." };
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = Date.now() + OTP_TTL_MS;

    setState((prev) => ({
      ...prev,
      activeOtps: {
        ...prev.activeOtps,
        [action]: {
          otp,
          expiresAt,
          issuedAt: Date.now(),
          sourceName: matched.name,
        },
      },
      lastAction: action,
    }));

    return { ok: true, otp, expiresAt };
  };

  const verifyOtp = (action, inputOtp) => {
    const record = state.activeOtps[action];
    if (!record) {
      return { ok: false, message: "No active OTP for this action." };
    }
    if (Date.now() > record.expiresAt) {
      return { ok: false, message: "OTP expired. Generate a new one." };
    }
    if (record.otp !== inputOtp.trim()) {
      return { ok: false, message: "Incorrect OTP." };
    }

    setState((prev) => {
      const nextOtps = { ...prev.activeOtps };
      delete nextOtps[action];
      return { ...prev, activeOtps: nextOtps };
    });

    return { ok: true, sourceName: record.sourceName };
  };

  const activeOtpInfo = useMemo(() => state.activeOtps, [state.activeOtps]);

  const clearFinalCodeStorage = () => {
    setState(buildInitialState());
  };

  return {
    secretCodes: state.codes,
    activeOtpInfo,
    createSecretCode,
    deleteSecretCode,
    generateOtpForAction,
    verifyOtp,
    clearFinalCodeStorage,
  };
}
