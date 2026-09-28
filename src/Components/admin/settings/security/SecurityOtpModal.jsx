import { ShieldCheck, X } from "lucide-react";
import { useLanguage } from "../../../../Context/LanguageContext";

function actionText(action, t) {
  if (action === "lockdown") return t("secOtp.lockdown");
  if (action === "nuclear_wipe") return t("secOtp.nuclearWipe");
  if (action === "right_to_be_forgotten") return t("secOtp.rightToBeForgotten");
  if (action === "role_change") return t("secOtp.roleChange");
  if (action === "ban_user") return t("secOtp.userBan");
  if (action === "block_user") return t("secOtp.userBlock");
  if (action === "unban_user") return t("secOtp.userUnban");
  if (action === "ip_ban") return t("secOtp.ipBan");
  if (action === "bulk_critical") return t("secOtp.bulkAction");
  return t("secOtp.criticalAction");
}

export default function SecurityOtpModal({
  action,
  otpInput,
  onOtpInputChange,
  onClose,
  onVerify,
  error,
  isVerifying,
}) {
  const { t } = useLanguage();
  if (!action) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-2xl rounded-xl border border-indigo-500 bg-[#1f2b3d] shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-600 px-6 py-4">
          <h4 className="flex items-center gap-2 text-3xl font-semibold text-white">
            <ShieldCheck className="h-6 w-6 text-indigo-400" />
            {t("secOtp.verification")}
          </h4>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-slate-300 hover:bg-slate-700 hover:text-white"
            aria-label="Close"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-indigo-900/40">
            <ShieldCheck className="h-9 w-9 text-indigo-300" />
          </div>

          <p className="mb-5 text-center text-2xl text-slate-200">
            {t("secOtp.pleaseEnter")} <strong>{t("secOtp.finalCodeTab")}</strong> {t("secOtp.tabFor")}{" "}
            <span className="font-bold text-indigo-300">{actionText(action, t)}</span>.
          </p>

          <label className="mb-2 block text-lg font-semibold uppercase tracking-[0.08em] text-slate-300">
            {t("secOtp.oneTimeCode")}
          </label>
          <input
            type="text"
            maxLength={6}
            value={otpInput}
            onChange={(event) => onOtpInputChange(event.target.value)}
            className="mb-4 w-full rounded-lg border border-indigo-400 bg-slate-700 px-4 py-4 text-center text-3xl font-bold tracking-[0.55em] text-slate-200 outline-none placeholder:text-slate-500 focus:border-indigo-300"
            placeholder="000000"
          />

          {error ? (
            <p className="mb-3 rounded border border-red-700 bg-red-900/30 px-3 py-2 text-sm text-red-300">
              {error}
            </p>
          ) : null}

          <button
            type="button"
            onClick={onVerify}
            disabled={isVerifying}
            className="w-full rounded-lg bg-indigo-600 py-4 text-2xl font-bold text-white hover:bg-indigo-500 disabled:opacity-65"
          >
            {isVerifying ? t("secOtp.verifying") : t("secOtp.verify")}
          </button>
        </div>
      </div>
    </div>
  );
}
