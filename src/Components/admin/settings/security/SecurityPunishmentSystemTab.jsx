import { useState } from "react";
import { BarChart3, Ban, Shield, Users } from "lucide-react";
import { useLanguage } from "../../../../Context/LanguageContext";
import usePunishmentSystem from "../../../../hooks/usePunishmentSystem";
import PunishmentUsersPanel from "./punishment/PunishmentUsersPanel";
import PunishmentBansPanel from "./punishment/PunishmentBansPanel";
import PunishmentLogsPanel from "./punishment/PunishmentLogsPanel";
import PunishmentAnalyticsPanel from "./punishment/PunishmentAnalyticsPanel";

const SUB_TABS = [
  { id: "users", labelKey: "secPunishment.usersRoles", icon: Users },
  { id: "bans", labelKey: "secPunishment.bansBlocks", icon: Ban },
  { id: "logs", labelKey: "secPunishment.logs", icon: Shield },
  { id: "analytics", labelKey: "secPunishment.analytics", icon: BarChart3 },
];

export default function SecurityPunishmentSystemTab({
  isDarkMode = true,
  onRequestProtectedAction,
}) {
  const lightMode = !isDarkMode;
  const { t } = useLanguage();
  const {
    roles,
    users,
    usersTotal,
    usersPage,
    usersTotalPages,
    logs,
    logsTotal,
    logsPage,
    logsTotalPages,
    analytics,
    loadingUsers,
    loadingLogs,
    loadingAnalytics,
    selectedUserIds,
    setSelectedUserIds,
    selectedLogIds,
    setSelectedLogIds,
    error,
    userFilters,
    setUserFilters,
    logFilters,
    setLogFilters,
    logModules,
    logActionTypes,
    changeRole,
    banUser,
    blockUser,
    unbanUser,
    blockIp,
    runBulkAction,
    fetchUsers,
    fetchLogs,
    fetchAnalytics,
  } = usePunishmentSystem();

  const [activeSubTab, setActiveSubTab] = useState("users");
  const [toast, setToast] = useState("");

  const showToast = (text) => {
    setToast(text);
    window.setTimeout(() => setToast(""), 1800);
  };

  const refreshAll = async () => {
    await Promise.all([fetchUsers(usersPage), fetchLogs(logsPage), fetchAnalytics()]);
  };

  const requestProtected = (action, execute) => {
    if (!onRequestProtectedAction) return;
    onRequestProtectedAction(action, async () => {
      await execute();
      showToast("Critical action completed");
    });
  };

  return (
    <section
      className={`security-punishment-root space-y-4 rounded-2xl border p-4 ${
        lightMode
          ? "security-light border-slate-200 bg-gradient-to-b from-slate-50 to-white"
          : "border-[#273b60] bg-[#0a1424]"
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-base font-semibold text-white">{t("secPunishment.title")}</h3>
          <p className="text-xs text-slate-400">
            {t("secPunishment.desc")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded border border-amber-700 bg-amber-900/60 px-2 py-1 text-[11px] font-semibold text-amber-200">
            {t("secPunishment.otpRequired")}
          </span>
          <button
            type="button"
            onClick={refreshAll}
            className="rounded border border-cyan-700 bg-cyan-900/60 px-2.5 py-1 text-xs font-semibold text-cyan-200"
          >
            {t("secPunishment.refresh")}
          </button>
        </div>
      </div>

      {toast ? (
        <div className="rounded border border-emerald-700 bg-emerald-900/40 px-3 py-2 text-sm text-emerald-200">
          {toast}
        </div>
      ) : null}
      {error ? (
        <div className="rounded border border-rose-700 bg-rose-900/40 px-3 py-2 text-sm text-rose-200">
          {error}
        </div>
      ) : null}

      <div className="rounded-xl border border-[#243654] bg-[#121d30]/95 p-2">
        <div className="flex flex-wrap gap-2">
          {SUB_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveSubTab(tab.id)}
                className={`inline-flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.08em] ${
                  isActive
                    ? "border border-cyan-600 bg-cyan-900/60 text-cyan-200"
                    : "border border-slate-700 bg-slate-800 text-slate-300"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {t(tab.labelKey)}
              </button>
            );
          })}
        </div>
      </div>

      {activeSubTab === "users" && (
        <PunishmentUsersPanel
          users={users}
          roles={roles}
          filters={userFilters}
          setFilters={setUserFilters}
          page={usersPage}
          totalPages={usersTotalPages}
          total={usersTotal}
          loading={loadingUsers}
          selectedUserIds={selectedUserIds}
          setSelectedUserIds={setSelectedUserIds}
          onPageChange={(nextPage) => fetchUsers(nextPage)}
          onChangeRole={async (payload) => {
            requestProtected("role_change", () => changeRole(payload));
          }}
          onBlockUser={async (payload) => {
            requestProtected("block_user", () => blockUser(payload));
          }}
          onUnbanUser={async (payload) => {
            requestProtected("unban_user", () => unbanUser(payload));
          }}
          onBulkAction={async (payload) => {
            requestProtected("bulk_critical", () => runBulkAction(payload));
          }}
          onRequireOtp={(request) => {
            if (request.action === "ban_user") {
              requestProtected("ban_user", () => banUser(request.payload));
            } else if (request.action === "ip_ban") {
              requestProtected("ip_ban", () => blockIp(request.payload));
            } else if (request.action === "bulk_critical") {
              requestProtected("bulk_critical", () => runBulkAction(request.payload));
            }
          }}
        />
      )}

      {activeSubTab === "bans" && (
        <PunishmentBansPanel
          users={users}
          logs={logs}
          onRequireOtp={(request) => {
            if (request.action === "ip_ban") {
              requestProtected("ip_ban", () => blockIp(request.payload));
            }
          }}
        />
      )}

      {activeSubTab === "logs" && (
        <PunishmentLogsPanel
          logs={logs}
          total={logsTotal}
          page={logsPage}
          totalPages={logsTotalPages}
          loading={loadingLogs}
          filters={logFilters}
          setFilters={setLogFilters}
          moduleOptions={logModules}
          actionOptions={logActionTypes}
          selectedLogIds={selectedLogIds}
          setSelectedLogIds={setSelectedLogIds}
          onPageChange={(nextPage) => fetchLogs(nextPage)}
        />
      )}

      {activeSubTab === "analytics" && (
        <PunishmentAnalyticsPanel analytics={analytics} loading={loadingAnalytics} />
      )}

    </section>
  );
}
