import { CheckCircle2, Loader2, Moon, Sun } from "lucide-react";
import { useLanguage } from "../../../Context/LanguageContext";
import useAdminThemeMode from "../../../hooks/useAdminThemeMode";

export default function AppearanceTab({ darkMode, setDarkMode, onSaveAppearance, isSaving, lastSaved }) {
  const { t, language } = useLanguage();
  const { darkMode: dm } = useAdminThemeMode();
  const isRtl = language === "ar";
  const themeLabelTextClass = isRtl
    ? `text-xs font-bold ${dm ? "text-gray-300" : "text-slate-700"}`
    : `text-xs font-bold uppercase tracking-[0.12em] ${dm ? "text-gray-300" : "text-slate-700"}`;
  const premiumHeadingClass = isRtl
    ? `mb-2 text-xs font-semibold ${dm ? "text-gray-400" : "text-slate-500"}`
    : `mb-2 text-xs font-semibold uppercase tracking-[0.08em] ${dm ? "text-gray-400" : "text-slate-500"}`;
  const previewHeadingClass = isRtl
    ? `text-sm font-semibold ${dm ? "text-gray-400" : "text-slate-500"}`
    : `text-sm font-semibold uppercase tracking-[0.08em] ${dm ? "text-gray-400" : "text-slate-500"}`;
  const premiumSwitchLabelClass = isRtl
    ? "text-sm font-bold"
    : "text-xs font-bold uppercase tracking-[0.08em]";

  return (
    <div className="space-y-6" dir={isRtl ? "rtl" : "ltr"}>
      <div className={`rounded-xl border p-6 shadow-sm admin-theme-surface ${dm ? "bg-gray-800 border-gray-700" : "bg-white border-slate-200"}`}>
        <h2 className={`text-xl font-semibold ${dm ? "text-white" : "text-gray-800"}`}>{t("appearance.theme")}</h2>
        <p className={`mt-1 text-sm ${dm ? "text-gray-400" : "text-slate-500"}`}>
          {t("appearance.themeDesc")}
        </p>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setDarkMode(false)}
            className={`rounded-lg border p-4 text-start transition ${
              darkMode
                ? dm ? "border-gray-600 bg-gray-700 hover:bg-gray-600" : "border-slate-300 bg-slate-50 hover:bg-slate-100"
                : "border-teal-500 bg-teal-50 ring-2 ring-teal-200"
            }`}
          >
            <p className={`text-sm font-semibold ${dm ? "text-white" : "text-slate-800"}`}>{t("appearance.light")}</p>
            <p className={`mt-1 text-xs ${dm ? "text-gray-400" : "text-slate-600"}`}>{t("appearance.lightDesc")}</p>
          </button>

          <button
            type="button"
            onClick={() => setDarkMode(true)}
            className={`rounded-lg border p-4 text-start transition ${
              darkMode
                ? "border-cyan-500 bg-cyan-950/40 ring-2 ring-cyan-700/50"
                : dm ? "border-gray-600 bg-gray-700 hover:bg-gray-600" : "border-slate-300 bg-slate-50 hover:bg-slate-100"
            }`}
          >
            <p className={`text-sm font-semibold ${dm ? "text-white" : "text-slate-800"}`}>{t("appearance.dark")}</p>
            <p className={`mt-1 text-xs ${dm ? "text-gray-400" : "text-slate-600"}`}>{t("appearance.darkDesc")}</p>
          </button>
        </div>

        <div className={`mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border px-3 py-2 ${dm ? "bg-gray-700 border-gray-600" : "bg-slate-50 border-slate-200"}`}>
          <span className={`text-sm font-medium ${dm ? "text-gray-300" : "text-slate-700"}`}>{t("appearance.quickToggle")}</span>
          <button
            type="button"
            onClick={() => setDarkMode(!darkMode)}
            className={`rounded-md px-3 py-1.5 text-xs font-semibold ${
              darkMode ? "bg-slate-900 text-white" : "bg-slate-200 text-slate-800"
            }`}
          >
            {darkMode ? t("appearance.darkEnabled") : t("appearance.lightEnabled")}
          </button>
        </div>

        <div className={`mt-4 rounded-xl border p-4 ${dm ? "bg-gray-700 border-gray-600" : "bg-slate-50 border-slate-200"}`}>
          <p className={premiumHeadingClass}>
            {t("appearance.premiumSwitch")}
          </p>
          <div
            className={`flex items-center gap-4 ${isRtl ? "justify-end" : "justify-start"}`}
          >
            <span
              className={`${themeLabelTextClass} ${premiumSwitchLabelClass} ${
                darkMode ? "text-cyan-200" : "text-amber-700"
              }`}
            >
              {darkMode ? t("appearance.dark") : t("appearance.light")}
            </span>

            <button
              type="button"
              onClick={() => setDarkMode(!darkMode)}
              className={`relative h-14 w-[88px] shrink-0 overflow-hidden rounded-full border p-1 transition-all duration-300 ${
                darkMode
                  ? "border-cyan-700 bg-gradient-to-r from-slate-900 via-[#10213f] to-[#12325f]"
                  : "border-amber-200 bg-gradient-to-r from-amber-100 via-yellow-50 to-orange-100"
              }`}
              aria-pressed={darkMode}
            >
              <span
                className={`absolute top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full shadow-lg transition-all duration-300 ${
                  isRtl
                    ? darkMode
                      ? "right-1.5 bg-slate-100 text-[#12325f]"
                      : "right-[42px] bg-white text-amber-500"
                    : darkMode
                      ? "left-[42px] bg-slate-100 text-[#12325f]"
                      : "left-1.5 bg-white text-amber-500"
                }`}
              >
                {darkMode ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              </span>
            </button>
          </div>
        </div>
      </div>

      <div className={`rounded-xl border p-6 shadow-sm admin-theme-surface ${dm ? "bg-gray-800 border-gray-700" : "bg-white border-slate-200"}`}>
        <h3 className={previewHeadingClass}>{t("appearance.livePreview")}</h3>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <div className={`rounded-lg border p-3 ${dm ? "bg-gray-700 border-gray-600" : "bg-slate-50 border-slate-200"}`}>
            <p className={`text-xs ${dm ? "text-gray-400" : "text-slate-500"}`}>{t("appearance.cardSurface")}</p>
            <p className={`mt-1 text-sm font-semibold ${dm ? "text-white" : "text-slate-800"}`}>{t("appearance.themeReady")}</p>
          </div>
          <div className={`rounded-lg border p-3 ${dm ? "bg-gray-700 border-gray-600" : "bg-slate-50 border-slate-200"}`}>
            <p className={`text-xs ${dm ? "text-gray-400" : "text-slate-500"}`}>{t("appearance.inputSurface")}</p>
            <input
              disabled
              value={t("appearance.previewInput")}
              readOnly
              className={`mt-1 w-full rounded border px-2 py-1.5 text-xs ${dm ? "bg-gray-600 border-gray-500 text-gray-200" : "bg-white border-slate-300 text-slate-700"}`}
            />
          </div>
          <div className={`rounded-lg border p-3 ${dm ? "bg-gray-700 border-gray-600" : "bg-slate-50 border-slate-200"}`}>
            <p className={`text-xs ${dm ? "text-gray-400" : "text-slate-500"}`}>{t("appearance.actionSurface")}</p>
            <button type="button" className="mt-1 rounded bg-teal-500 px-3 py-1.5 text-xs font-semibold text-white">
              {t("appearance.primaryButton")}
            </button>
          </div>
        </div>

        <div className={`mt-6 flex flex-wrap items-center justify-center gap-3 rounded-xl border p-3 ${dm ? "bg-gray-700 border-gray-600" : "bg-slate-50 border-slate-200"}`}>
          <button
            type="button"
            onClick={onSaveAppearance}
            disabled={isSaving}
            className={`group relative overflow-hidden rounded-2xl border px-5 py-3 text-sm font-semibold shadow-lg transition-all ${
              darkMode
                ? "border-cyan-700 bg-gradient-to-r from-[#0f2a4d] via-[#123b68] to-[#0f2a4d] text-cyan-100 hover:shadow-cyan-900/40"
                : "border-teal-300 bg-gradient-to-r from-teal-100 via-cyan-100 to-teal-100 text-teal-900 hover:shadow-teal-200/70"
            } disabled:opacity-60`}
          >
            <span className="absolute inset-y-0 left-[-35%] w-1/3 -skew-x-12 bg-white/30 opacity-0 transition-all duration-500 group-hover:left-[115%] group-hover:opacity-100" />
            {t("appearance.saveTheme")}
          </button>

          {isSaving ? (
            <span className="inline-flex items-center gap-2 rounded-lg border border-cyan-300/40 bg-cyan-950/10 px-3 py-2 text-xs font-semibold text-cyan-700">
              <Loader2 className="h-4 w-4 animate-spin" />
              {t("appearance.savingTheme")}
            </span>
          ) : lastSaved ? (
            <span className="inline-flex items-center gap-2 rounded-lg border border-emerald-300/40 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
              <CheckCircle2 className="h-4 w-4" />
              {t("appearance.savedAt")} {lastSaved}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}