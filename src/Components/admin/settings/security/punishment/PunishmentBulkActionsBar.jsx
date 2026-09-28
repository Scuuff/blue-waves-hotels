import { Lock } from "lucide-react";
import { useLanguage } from "../../../../../Context/LanguageContext";

export default function PunishmentBulkActionsBar({
  selectedCount,
  onSelectVisible,
  onClearSelection,
  onBulkBlock,
  onBulkBan,
  onBulkUnban,
  onBulkDowngrade,
}) {
  const { t } = useLanguage();
  return (
    <div className="mb-3 flex flex-wrap items-center gap-2 rounded-lg border border-[#2b4166] bg-[#0d182b] p-2">
      <button
        type="button"
        onClick={onSelectVisible}
        className="rounded border border-slate-600 bg-slate-800 px-2.5 py-1 text-xs font-semibold text-slate-200"
      >
        {t("punBulk.selectVisible")}
      </button>
      <button
        type="button"
        onClick={onClearSelection}
        className="rounded border border-slate-600 bg-slate-800 px-2.5 py-1 text-xs font-semibold text-slate-200"
      >
        {t("punBulk.clear")}
      </button>
      <span className="text-xs text-slate-400">{t("punBulk.selected")} {selectedCount}</span>
      <span className="rounded border border-amber-700 bg-amber-900/50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-amber-200">
        {t("punBulk.otpNote")}
      </span>
      <div className="ml-auto flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={selectedCount === 0}
          onClick={onBulkDowngrade}
          title="Requires Final Code OTP"
          className="rounded border border-amber-700 bg-amber-900/60 px-2.5 py-1 text-xs font-semibold text-amber-200 disabled:opacity-40"
        >
          <span className="inline-flex items-center gap-1">
            {t("punBulk.bulkDowngrade")} <Lock className="h-3 w-3" /> (OTP)
          </span>
        </button>
        <button
          type="button"
          disabled={selectedCount === 0}
          onClick={onBulkBlock}
          title="Requires Final Code OTP"
          className="rounded border border-slate-600 bg-slate-700 px-2.5 py-1 text-xs font-semibold text-slate-200 disabled:opacity-40"
        >
          <span className="inline-flex items-center gap-1">
            {t("punBulk.bulkBlock")} <Lock className="h-3 w-3" /> (OTP)
          </span>
        </button>
        <button
          type="button"
          disabled={selectedCount === 0}
          onClick={onBulkBan}
          title="Requires Final Code OTP"
          className="rounded border border-rose-700 bg-rose-900/60 px-2.5 py-1 text-xs font-semibold text-rose-200 disabled:opacity-40"
        >
          <span className="inline-flex items-center gap-1">
            {t("punBulk.bulkBan")} <Lock className="h-3 w-3" /> (OTP)
          </span>
        </button>
        <button
          type="button"
          disabled={selectedCount === 0}
          onClick={onBulkUnban}
          title="Requires Final Code OTP"
          className="rounded border border-emerald-700 bg-emerald-900/60 px-2.5 py-1 text-xs font-semibold text-emerald-200 disabled:opacity-40"
        >
          <span className="inline-flex items-center gap-1">
            {t("punBulk.bulkUnban")} <Lock className="h-3 w-3" /> (OTP)
          </span>
        </button>
      </div>
    </div>
  );
}
