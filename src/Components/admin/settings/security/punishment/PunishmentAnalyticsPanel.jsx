import { useLanguage } from "../../../../../Context/LanguageContext";

export default function PunishmentAnalyticsPanel({ analytics, loading }) {
  const { t } = useLanguage();
  const cards = analytics?.cards ?? {
    users: 0,
    activeBans: 0,
    activeBlocks: 0,
    logEvents: 0,
  };
  const roleDistribution = analytics?.roleDistribution ?? [];
  const mostActive = analytics?.mostActive;
  const leastActive = analytics?.leastActive;
  const topModule = analytics?.topModule ?? { module: "none", count: 0 };

  return (
    <div className="space-y-3">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-cyan-700/50 bg-cyan-950/20 p-3">
          <p className="text-[11px] uppercase tracking-[0.1em] text-cyan-300">{t("punAnalytics.managedUsers")}</p>
          <p className="mt-2 text-3xl font-bold text-slate-50">{cards.users}</p>
        </div>
        <div className="rounded-xl border border-rose-700/50 bg-rose-950/20 p-3">
          <p className="text-[11px] uppercase tracking-[0.1em] text-rose-300">{t("punAnalytics.activeBans")}</p>
          <p className="mt-2 text-3xl font-bold text-slate-50">{cards.activeBans}</p>
        </div>
        <div className="rounded-xl border border-amber-700/50 bg-amber-950/20 p-3">
          <p className="text-[11px] uppercase tracking-[0.1em] text-amber-300">{t("punAnalytics.activeBlocks")}</p>
          <p className="mt-2 text-3xl font-bold text-slate-50">{cards.activeBlocks}</p>
        </div>
        <div className="rounded-xl border border-emerald-700/50 bg-emerald-950/20 p-3">
          <p className="text-[11px] uppercase tracking-[0.1em] text-emerald-300">{t("punAnalytics.auditEvents")}</p>
          <p className="mt-2 text-3xl font-bold text-slate-50">{cards.logEvents}</p>
        </div>
      </div>

      <div className="grid gap-3 xl:grid-cols-2">
        <div className="rounded-xl border border-[#273b60] bg-[#0f1a2c] p-3">
          <h5 className="mb-3 text-xs font-semibold uppercase tracking-[0.1em] text-slate-300">
            {t("punAnalytics.activityLeaders")}
          </h5>
          {loading ? (
            <p className="text-sm text-slate-400">{t("punAnalytics.loading")}</p>
          ) : (
            <div className="space-y-2 text-sm">
              <div className="rounded border border-[#2f4367] bg-[#0b1526] p-2">
                <p className="text-slate-400">{t("punAnalytics.mostActive")}</p>
                <p className="font-semibold text-slate-100">
                  {mostActive ? `${mostActive.name} (${mostActive.count})` : "N/A"}
                </p>
              </div>
              <div className="rounded border border-[#2f4367] bg-[#0b1526] p-2">
                <p className="text-slate-400">{t("punAnalytics.leastActive")}</p>
                <p className="font-semibold text-slate-100">
                  {leastActive ? `${leastActive.name} (${leastActive.count})` : "N/A"}
                </p>
              </div>
              <div className="rounded border border-[#2f4367] bg-[#0b1526] p-2">
                <p className="text-slate-400">{t("punAnalytics.topModule")}</p>
                <p className="font-semibold text-slate-100">
                  {topModule.module} ({topModule.count})
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="rounded-xl border border-[#273b60] bg-[#0f1a2c] p-3">
          <h5 className="mb-3 text-xs font-semibold uppercase tracking-[0.1em] text-slate-300">
            {t("punAnalytics.roleDistribution")}
          </h5>
          <div className="space-y-2">
            {roleDistribution.length === 0 ? (
              <p className="text-sm text-slate-400">{t("punAnalytics.noRoleData")}</p>
            ) : (
              roleDistribution.map((entry) => (
                <div key={entry.role} className="rounded border border-[#2f4367] bg-[#0b1526] p-2">
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="text-slate-300">{entry.role}</span>
                    <span className="text-slate-400">{entry.count}</span>
                  </div>
                  <div className="h-1.5 rounded bg-slate-800">
                    <div
                      className="h-1.5 rounded bg-cyan-500"
                      style={{
                        width: `${Math.min(
                          100,
                          (entry.count / Math.max(...roleDistribution.map((value) => value.count), 1)) * 100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
