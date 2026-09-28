import { useMemo, useState } from "react";
import { KeyRound, Lock } from "lucide-react";
import { useLanguage } from "../../../../Context/LanguageContext";

const ACTION_OPTIONS = [
  { value: "right_to_be_forgotten", label: "Right to be Forgotten (Data Deletion)" },
  { value: "lockdown", label: "Lockdown" },
  { value: "nuclear_wipe", label: "Nuclear Data Wipe" },
  { value: "role_change", label: "Punishment: Role Change" },
  { value: "ban_user", label: "Punishment: Ban User" },
  { value: "block_user", label: "Punishment: Block User" },
  { value: "unban_user", label: "Punishment: Unban User" },
  { value: "ip_ban", label: "Punishment: IP Ban" },
  { value: "bulk_critical", label: "Punishment: Bulk Critical Action" },
];

function prettyActionLabel(value) {
  const found = ACTION_OPTIONS.find((item) => item.value === value);
  return found ? found.label : value;
}

export default function SecurityFinalCodePanel({
  secretCodes,
  onCreateSecretCode,
  onDeleteSecretCode,
  onGenerateOtp,
  isDarkMode = true,
}) {
  const lightMode = !isDarkMode;
  const { t } = useLanguage();
  const [targetAction, setTargetAction] = useState("right_to_be_forgotten");
  const [secretInput, setSecretInput] = useState("");
  const [otpPreview, setOtpPreview] = useState("");
  const [otpExpiresAt, setOtpExpiresAt] = useState(null);
  const [newSecretName, setNewSecretName] = useState("");
  const [newSecretCode, setNewSecretCode] = useState("");
  const [notice, setNotice] = useState("");

  const expiresText = useMemo(() => {
    if (!otpExpiresAt) return "";
    return new Date(otpExpiresAt).toLocaleTimeString();
  }, [otpExpiresAt]);

  const handleGenerate = () => {
    const result = onGenerateOtp(targetAction, secretInput);
    if (!result.ok) {
      setNotice(result.message);
      setOtpPreview("");
      setOtpExpiresAt(null);
      return;
    }
    setOtpPreview(result.otp);
    setOtpExpiresAt(result.expiresAt);
    setNotice(`OTP generated for ${prettyActionLabel(targetAction)}.`);
  };

  const handleCreateCode = () => {
    if (!newSecretName.trim() || !newSecretCode.trim()) {
      setNotice("Please fill both secret code name and value.");
      return;
    }
    onCreateSecretCode(newSecretName, newSecretCode);
    setNewSecretName("");
    setNewSecretCode("");
    setNotice("Secret code created.");
  };

  return (
    <section
      className={`security-final-root space-y-4 rounded-2xl border p-4 ${
        lightMode
          ? "security-light border-slate-200 bg-gradient-to-b from-slate-50 to-white"
          : "border-[#273b60] bg-[#0a1424]"
      }`}
    >
      <div className="mb-1">
        <h3 className="text-3xl font-semibold text-white">{t("secFinalCode.title")}</h3>
        <p className="text-lg text-slate-300">
          {t("secFinalCode.desc")}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-indigo-500/70 bg-[#1b273b] p-6">
          <h4 className="mb-5 flex items-center gap-2 text-3xl font-semibold text-white">
            <KeyRound className="h-6 w-6 text-indigo-400" />
            {t("secFinalCode.generateOtp")}
          </h4>

          <label className="mb-2 block text-xl font-medium text-slate-200">{t("secFinalCode.targetAction")}</label>
          <select
            value={targetAction}
            onChange={(event) => setTargetAction(event.target.value)}
            className="mb-4 w-full rounded-md border border-slate-500 bg-slate-700 px-4 py-2 text-white outline-none focus:border-indigo-400"
          >
            {ACTION_OPTIONS.map((action) => (
              <option key={action.value} value={action.value}>
                {action.label}
              </option>
            ))}
          </select>

          <label className="mb-2 block text-xl font-medium text-slate-200">{t("secFinalCode.secretCode")}</label>
          <input
            type="password"
            value={secretInput}
            onChange={(event) => setSecretInput(event.target.value)}
            className="mb-5 w-full rounded-md border border-slate-500 bg-slate-700 px-4 py-2 text-white outline-none focus:border-indigo-400"
            placeholder={t("secFinalCode.secretCodePlaceholder")}
          />

          <button
            type="button"
            onClick={handleGenerate}
            className="w-full rounded-md bg-indigo-600 py-3 text-xl font-semibold text-white hover:bg-indigo-500"
          >
            {t("secFinalCode.generateBtn")}
          </button>

          {otpPreview ? (
            <div className="mt-4 rounded border border-indigo-500/50 bg-[#0f1626] p-4 text-center">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{t("secFinalCode.oneTimeCode")}</p>
              <p className="mt-2 text-4xl font-bold tracking-[0.3em] text-indigo-300">{otpPreview}</p>
              <p className="mt-2 text-xs text-red-300">{t("secFinalCode.validFor")} {expiresText}</p>
            </div>
          ) : null}
        </div>

        <div className="rounded-xl border border-slate-500 bg-[#1b273b] p-6">
          <h4 className="mb-5 flex items-center gap-2 text-3xl font-semibold text-white">
            <Lock className="h-6 w-6 text-slate-400" />
            {t("secFinalCode.management")}
          </h4>

          <div className="mb-5 rounded border border-slate-600 bg-slate-700/40 p-4">
            <p className="mb-3 text-xl font-semibold text-slate-100">{t("secFinalCode.createNew")}</p>
            <div className="grid gap-3 md:grid-cols-2">
              <input
                value={newSecretName}
                onChange={(event) => setNewSecretName(event.target.value)}
                className="rounded-md border border-slate-500 bg-slate-700 px-3 py-2 text-white outline-none focus:border-indigo-400"
                placeholder={t("secFinalCode.namePlaceholder")}
              />
              <input
                value={newSecretCode}
                onChange={(event) => setNewSecretCode(event.target.value)}
                className="rounded-md border border-slate-500 bg-slate-700 px-3 py-2 text-white outline-none focus:border-indigo-400"
                placeholder={t("secFinalCode.secretCodeLabel")}
              />
            </div>
            <button
              type="button"
              onClick={handleCreateCode}
              className="mt-3 w-full rounded-md bg-slate-600 py-2 text-xl font-semibold text-white hover:bg-slate-500"
            >
              {t("secFinalCode.createCode")}
            </button>
          </div>

          <p className="mb-2 text-sm uppercase tracking-[0.13em] text-slate-400">{t("secFinalCode.activeCodes")}</p>
          <div className="space-y-2">
            {secretCodes.length === 0 ? (
              <p className="text-slate-400 italic">{t("secFinalCode.noActiveCodes")}</p>
            ) : (
              secretCodes.map((code) => (
                <div
                  key={code.id}
                  className="flex items-center justify-between rounded-md border border-slate-600 bg-slate-700/60 px-3 py-3"
                >
                  <div>
                    <p className="text-lg font-semibold text-white">{code.name}</p>
                    <p className="text-sm text-slate-400">
                      {t("secFinalCode.created")} {new Date(code.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onDeleteSecretCode(code.id)}
                    className="rounded border border-red-700 bg-red-900/50 px-2 py-1 text-red-300 hover:bg-red-800/60"
                    title={t("secFinalCode.deleteCode")}
                  >
                    🗑
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {notice ? (
        <div className="rounded border border-indigo-700 bg-indigo-900/30 p-3 text-sm text-indigo-200">
          {notice}
        </div>
      ) : null}
    </section>
  );
}
