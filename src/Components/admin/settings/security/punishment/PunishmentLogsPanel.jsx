import { useMemo } from "react";
import { useLanguage } from "../../../../../Context/LanguageContext";
import PunishmentFiltersBar from "./PunishmentFiltersBar";

function exportRowsCsv(rows) {
  if (!rows.length) return;
  const headers = ["at", "actionType", "module", "actorName", "targetLabel", "status", "reason"];
  const csv = [
    headers.join(","),
    ...rows.map((row) =>
      headers
        .map((key) => `"${String(row[key] ?? "").replaceAll('"', '""')}"`)
        .join(",")
    ),
  ].join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "elghg05t-punishment-logs.csv";
  link.click();
  URL.revokeObjectURL(url);
}

export default function PunishmentLogsPanel({
  logs,
  total,
  page,
  totalPages,
  loading,
  filters,
  setFilters,
  moduleOptions,
  actionOptions,
  selectedLogIds,
  setSelectedLogIds,
  onPageChange,
}) {
  const { t } = useLanguage();

  const STATUS_OPTIONS = useMemo(() => [
    { value: "all", label: t("punLogs.allStatus") },
    { value: "active", label: t("punLogs.activeUsers") },
    { value: "blocked", label: t("punLogs.blockedUsers") },
    { value: "banned", label: t("punLogs.bannedUsers") },
    { value: "success", label: t("punLogs.success") },
    { value: "denied", label: t("punLogs.denied") },
  ], [t]);

  const ACTIVITY_OPTIONS = useMemo(() => [
    { value: "all", label: t("punLogs.latestFirst") },
    { value: "most_active", label: t("punLogs.mostActive") },
    { value: "least_active", label: t("punLogs.leastActive") },
  ], [t]);

  const allVisibleSelected =
    logs.length > 0 && logs.every((row) => selectedLogIds.includes(row.id));

  const toggleSelectAllVisible = () => {
    const visibleIds = logs.map((row) => row.id);
    setSelectedLogIds((prev) => {
      if (allVisibleSelected) {
        return prev.filter((id) => !visibleIds.includes(id));
      }
      return Array.from(new Set([...prev, ...visibleIds]));
    });
  };

  const selectedRows = logs.filter((entry) => selectedLogIds.includes(entry.id));

  return (
    <div>
      <PunishmentFiltersBar
        searchValue={filters.search}
        onSearchChange={(value) => setFilters((prev) => ({ ...prev, search: value }))}
        searchPlaceholder="Search by user/email/phone/first/last"
        statusValue={filters.status}
        onStatusChange={(value) => setFilters((prev) => ({ ...prev, status: value }))}
        statusOptions={STATUS_OPTIONS}
        activityValue={filters.activity}
        onActivityChange={(value) => setFilters((prev) => ({ ...prev, activity: value }))}
        activityOptions={ACTIVITY_OPTIONS}
        dateFrom={filters.dateFrom}
        onDateFromChange={(value) => setFilters((prev) => ({ ...prev, dateFrom: value }))}
        dateTo={filters.dateTo}
        onDateToChange={(value) => setFilters((prev) => ({ ...prev, dateTo: value }))}
        moduleValue={filters.module}
        onModuleChange={(value) => setFilters((prev) => ({ ...prev, module: value }))}
        moduleOptions={moduleOptions}
        actionValue={filters.actionType}
        onActionChange={(value) => setFilters((prev) => ({ ...prev, actionType: value }))}
        actionOptions={actionOptions}
      />

      <div className="mb-3 flex flex-wrap items-center gap-2 rounded-lg border border-[#2b4166] bg-[#0d182b] p-2">
        <button
          type="button"
          onClick={toggleSelectAllVisible}
          className="rounded border border-slate-600 bg-slate-800 px-2.5 py-1 text-xs font-semibold text-slate-200"
        >
          {t("punLogs.selectVisible")}
        </button>
        <button
          type="button"
          onClick={() => setSelectedLogIds([])}
          className="rounded border border-slate-600 bg-slate-800 px-2.5 py-1 text-xs font-semibold text-slate-200"
        >
          {t("punLogs.clear")}
        </button>
        <span className="text-xs text-slate-400">{t("punLogs.selectedLogs")} {selectedLogIds.length}</span>
        <button
          type="button"
          disabled={selectedRows.length === 0}
          onClick={() => exportRowsCsv(selectedRows)}
          className="ml-auto rounded border border-cyan-700 bg-cyan-900/60 px-2.5 py-1 text-xs font-semibold text-cyan-200 disabled:opacity-40"
        >
          {t("punLogs.exportCsv")}
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-[#283f63]">
        <table className="min-w-full text-left text-xs text-slate-200">
          <thead className="bg-[#14233a] uppercase tracking-[0.1em] text-slate-400">
            <tr>
              <th className="px-3 py-2">
                <input
                  type="checkbox"
                  checked={allVisibleSelected}
                  onChange={toggleSelectAllVisible}
                  className="h-3.5 w-3.5 accent-cyan-500"
                />
              </th>
              <th className="px-3 py-2">{t("punLogs.when")}</th>
              <th className="px-3 py-2">{t("punLogs.actor")}</th>
              <th className="px-3 py-2">{t("punLogs.action")}</th>
              <th className="px-3 py-2">{t("punLogs.module")}</th>
              <th className="px-3 py-2">{t("punLogs.target")}</th>
              <th className="px-3 py-2">{t("punLogs.status")}</th>
              <th className="px-3 py-2">{t("punLogs.reason")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1f3555] bg-[#0f1a2c]">
            {loading ? (
              <tr>
                <td colSpan={8} className="px-3 py-6 text-center text-slate-400">
                  {t("punLogs.loading")}
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-3 py-6 text-center text-slate-400">
                  {t("punLogs.noMatch")}
                </td>
              </tr>
            ) : (
              logs.map((entry) => (
                <tr key={entry.id} className="hover:bg-[#13243e]">
                  <td className="px-3 py-2">
                    <input
                      type="checkbox"
                      checked={selectedLogIds.includes(entry.id)}
                      onChange={() =>
                        setSelectedLogIds((prev) =>
                          prev.includes(entry.id) ? prev.filter((id) => id !== entry.id) : [...prev, entry.id]
                        )
                      }
                      className="h-3.5 w-3.5 accent-cyan-500"
                    />
                  </td>
                  <td className="px-3 py-2">{new Date(entry.at).toLocaleString()}</td>
                  <td className="px-3 py-2">{entry.actorName ?? entry.actorUserId}</td>
                  <td className="px-3 py-2 font-mono">{entry.actionType}</td>
                  <td className="px-3 py-2">{entry.module}</td>
                  <td className="px-3 py-2">{entry.targetLabel ?? "-"}</td>
                  <td className="px-3 py-2">
                    <span
                      className={`rounded px-2 py-1 text-[10px] font-semibold ${
                        entry.status === "denied"
                          ? "bg-rose-900/60 text-rose-200 border border-rose-700"
                          : "bg-emerald-900/60 text-emerald-200 border border-emerald-700"
                      }`}
                    >
                      {entry.status}
                    </span>
                  </td>
                  <td className="px-3 py-2">{entry.reason || "-"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
        <p>
          {t("punLogs.totalLogs")} <span className="font-semibold text-slate-200">{total}</span>
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onPageChange(Math.max(1, page - 1))}
            disabled={page <= 1}
            className="rounded border border-slate-600 px-2 py-1 disabled:opacity-40"
          >
            {t("punLogs.prev")}
          </button>
          <span>
            {t("punLogs.page")} {page} / {totalPages}
          </span>
          <button
            type="button"
            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            disabled={page >= totalPages}
            className="rounded border border-slate-600 px-2 py-1 disabled:opacity-40"
          >
            {t("punLogs.next")}
          </button>
        </div>
      </div>
    </div>
  );
}
