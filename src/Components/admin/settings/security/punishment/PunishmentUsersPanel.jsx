import { useMemo } from "react";
import PunishmentBulkActionsBar from "./PunishmentBulkActionsBar";
import PunishmentFiltersBar from "./PunishmentFiltersBar";
import { Lock } from "lucide-react";
import { useLanguage } from "../../../../../Context/LanguageContext";

const STATUS_OPTIONS_KEYS = [
  { value: "all", labelKey: "punUsers.allStatus" },
  { value: "active", labelKey: "punUsers.active" },
  { value: "blocked", labelKey: "punUsers.blocked" },
  { value: "banned", labelKey: "punUsers.banned" },
];

const ACTIVITY_OPTIONS_KEYS = [
  { value: "all", labelKey: "punUsers.defaultActivity" },
  { value: "most_active", labelKey: "punUsers.mostActiveUsers" },
  { value: "least_active", labelKey: "punUsers.leastActiveUsers" },
];

function statusChipClass(status) {
  if (status === "banned") return "bg-rose-900/60 text-rose-200 border border-rose-700";
  if (status === "blocked") return "bg-amber-900/60 text-amber-200 border border-amber-700";
  return "bg-emerald-900/60 text-emerald-200 border border-emerald-700";
}

export default function PunishmentUsersPanel({
  users,
  roles,
  filters,
  setFilters,
  page,
  totalPages,
  total,
  loading,
  selectedUserIds,
  setSelectedUserIds,
  onPageChange,
  onChangeRole,
  onBlockUser,
  onUnbanUser,
  onBulkAction,
  onRequireOtp,
}) {
  const { t } = useLanguage();

  const STATUS_OPTIONS = useMemo(
    () => STATUS_OPTIONS_KEYS.map((opt) => ({ value: opt.value, label: t(opt.labelKey) })),
    [t]
  );
  const ACTIVITY_OPTIONS = useMemo(
    () => ACTIVITY_OPTIONS_KEYS.map((opt) => ({ value: opt.value, label: t(opt.labelKey) })),
    [t]
  );

  const roleOptions = [{ value: "all", label: t("punUsers.allRoles") }].concat(
    roles.map((role) => ({ value: role.name, label: role.name }))
  );

  const allVisibleSelected =
    users.length > 0 && users.every((row) => selectedUserIds.includes(row.id));

  const toggleSelectAllVisible = () => {
    const visibleIds = users.map((row) => row.id);
    setSelectedUserIds((prev) => {
      if (allVisibleSelected) {
        return prev.filter((id) => !visibleIds.includes(id));
      }
      return Array.from(new Set([...prev, ...visibleIds]));
    });
  };

  const promptReason = (title, fallback) => {
    const value = window.prompt(title, fallback);
    if (value === null) return "";
    return value.trim();
  };

  const runBulk = async (action, forceOtp = false) => {
    if (selectedUserIds.length === 0) return;
    const reason = promptReason("Enter reason for bulk action:", "Policy update");
    if (!reason) return;
    if (forceOtp) {
      onRequireOtp({ action: "bulk_critical", payload: { action, userIds: selectedUserIds, reason } });
      return;
    }
    await onBulkAction({ action, userIds: selectedUserIds, reason });
  };

  return (
    <div>
      <div className="mb-3 rounded-lg border border-amber-700 bg-amber-900/35 px-3 py-2 text-xs text-amber-200">
        {t("punUsers.safeguard")}
      </div>

      <PunishmentFiltersBar
        searchValue={filters.search}
        onSearchChange={(value) => setFilters((prev) => ({ ...prev, search: value }))}
        searchPlaceholder={t("punUsers.searchPlaceholder")}
        statusValue={filters.status}
        onStatusChange={(value) => setFilters((prev) => ({ ...prev, status: value }))}
        statusOptions={STATUS_OPTIONS}
        roleValue={filters.role}
        onRoleChange={(value) => setFilters((prev) => ({ ...prev, role: value }))}
        roleOptions={roleOptions}
        activityValue={filters.activity}
        onActivityChange={(value) => setFilters((prev) => ({ ...prev, activity: value }))}
        activityOptions={ACTIVITY_OPTIONS}
      />

      <PunishmentBulkActionsBar
        selectedCount={selectedUserIds.length}
        onSelectVisible={toggleSelectAllVisible}
        onClearSelection={() => setSelectedUserIds([])}
        onBulkDowngrade={() => runBulk("bulk_role_change", true)}
        onBulkBlock={() => runBulk("bulk_block", true)}
        onBulkBan={() => runBulk("bulk_ban", true)}
        onBulkUnban={() => runBulk("bulk_unban")}
      />

      <div className="overflow-x-auto rounded-xl border border-[#283f63]">
        <table className="min-w-full text-left text-sm text-slate-200">
          <thead className="bg-[#14233a] text-[11px] uppercase tracking-[0.1em] text-slate-400">
            <tr>
              <th className="px-3 py-2">
                <input
                  type="checkbox"
                  checked={allVisibleSelected}
                  onChange={toggleSelectAllVisible}
                  className="h-3.5 w-3.5 accent-cyan-500"
                />
              </th>
              <th className="px-3 py-2">{t("punUsers.user")}</th>
              <th className="px-3 py-2">{t("punUsers.contact")}</th>
              <th className="px-3 py-2">{t("punUsers.role")}</th>
              <th className="px-3 py-2">{t("punUsers.status")}</th>
              <th className="px-3 py-2">{t("punUsers.ip")}</th>
              <th className="px-3 py-2">{t("punUsers.actions")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1f3555] bg-[#0f1a2c]">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-3 py-6 text-center text-slate-400">
                  {t("punUsers.loading")}
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-3 py-6 text-center text-slate-400">
                  {t("punUsers.noMatch")}
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="hover:bg-[#13243e]">
                  <td className="px-3 py-2">
                    <input
                      type="checkbox"
                      checked={selectedUserIds.includes(user.id)}
                      onChange={() =>
                        setSelectedUserIds((prev) =>
                          prev.includes(user.id) ? prev.filter((id) => id !== user.id) : [...prev, user.id]
                        )
                      }
                      className="h-3.5 w-3.5 accent-cyan-500"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <p className="font-semibold text-slate-100">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-xs text-slate-400">@{user.username}</p>
                  </td>
                  <td className="px-3 py-2">
                    <p>{user.email}</p>
                    <p className="text-xs text-slate-400">{user.phone}</p>
                  </td>
                  <td className="px-3 py-2">
                    <select
                      value={user.role}
                      onChange={async (event) => {
                        const reason = promptReason("Reason for role update:", "Role change by admin");
                        if (!reason) return;
                        await onChangeRole({ userId: user.id, nextRole: event.target.value, reason });
                      }}
                      title="Requires Final Code OTP"
                      className="rounded border border-[#385177] bg-[#0b1526] px-2 py-1 text-xs text-slate-100 outline-none"
                    >
                      {roles.map((role) => (
                        <option key={role.id} value={role.name}>
                          {role.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-3 py-2">
                    <span className={`rounded px-2 py-1 text-xs font-semibold ${statusChipClass(user.status)}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-3 py-2 font-mono text-xs text-slate-300">{user.ipAddress}</td>
                  <td className="px-3 py-2">
                    <div className="flex flex-wrap gap-1">
                      <button
                        type="button"
                        onClick={async () => {
                          const reason = promptReason("Reason for block:", "Suspicious behavior");
                          if (!reason) return;
                          await onBlockUser({ userId: user.id, reason });
                        }}
                        title="Requires Final Code OTP"
                        className="rounded border border-amber-700 bg-amber-900/60 px-2 py-1 text-[11px] font-semibold text-amber-200"
                      >
                        <span className="inline-flex items-center gap-1">
                          {t("punUsers.block")} <Lock className="h-3 w-3" /> (OTP)
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const reason = promptReason("Reason for ban:", "Policy violation");
                          if (!reason) return;
                          onRequireOtp({
                            action: "ban_user",
                            payload: {
                              userId: user.id,
                              reason,
                              durationDays: 30,
                              permanent: false,
                            },
                          });
                        }}
                        title="Requires Final Code OTP"
                        className="rounded border border-rose-700 bg-rose-900/60 px-2 py-1 text-[11px] font-semibold text-rose-200"
                      >
                        <span className="inline-flex items-center gap-1">
                          {t("punUsers.ban")} <Lock className="h-3 w-3" /> (OTP)
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          const reason = promptReason("Reason for unban:", "Issue resolved");
                          if (!reason) return;
                          await onUnbanUser({ userId: user.id, reason });
                        }}
                        title="Requires Final Code OTP"
                        className="rounded border border-emerald-700 bg-emerald-900/60 px-2 py-1 text-[11px] font-semibold text-emerald-200"
                      >
                        <span className="inline-flex items-center gap-1">
                          {t("punUsers.unban")} <Lock className="h-3 w-3" /> (OTP)
                        </span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
        <p>
          {t("punUsers.totalUsers")} <span className="font-semibold text-slate-200">{total}</span>
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onPageChange(Math.max(1, page - 1))}
            disabled={page <= 1}
            className="rounded border border-slate-600 px-2 py-1 disabled:opacity-40"
          >
            {t("punUsers.prev")}
          </button>
          <span>
            {t("punUsers.page")} {page} / {totalPages}
          </span>
          <button
            type="button"
            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            disabled={page >= totalPages}
            className="rounded border border-slate-600 px-2 py-1 disabled:opacity-40"
          >
            {t("punUsers.next")}
          </button>
        </div>
      </div>
    </div>
  );
}
