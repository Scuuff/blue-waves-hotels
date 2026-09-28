import { useEffect, useMemo, useState } from "react";
import { Search, Download, CheckCheck, Trash2 } from "lucide-react";
import SettingCard from "../../shared/SettingCard";
import { SECURITY_ALERTS } from "../../../../data/adminSecurityData";
import { useLanguage } from "../../../../Context/LanguageContext";
import useAdminThemeMode from "../../../../hooks/useAdminThemeMode";

const ROW_OPTIONS = [10, 20, 50];

function parseAlertDate(value) {
  const normalized = value.includes("T") ? value : value.replace(" ", "T");
  return new Date(normalized);
}

function exportAlertsCsv(rows) {
  if (rows.length === 0) return;

  const headers = ["time", "action", "target", "ip", "result", "details", "reviewed"];
  const csv = [
    headers.join(","),
    ...rows.map((row) =>
      headers
        .map((key) => `"${String(row[key] ?? "").replaceAll('"', '""')}"`)
        .join(",")
    ),
  ].join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", "security-alerts.csv");
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export default function SecurityAlertsPanel() {
  const { t } = useLanguage();
  const { darkMode } = useAdminThemeMode();
  const inputClass = `rounded-lg border px-3 py-2 text-sm outline-none ring-teal-500 focus:ring-2 ${darkMode ? "border-gray-600 bg-gray-700 text-white" : "border-slate-300"}`;
  const [alerts, setAlerts] = useState(
    SECURITY_ALERTS.map((alert) => ({
      ...alert,
      reviewed: false,
    }))
  );
  const [query, setQuery] = useState("");
  const [eventFilter, setEventFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateStart, setDateStart] = useState("");
  const [dateEnd, setDateEnd] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState([]);

  const eventOptions = useMemo(() => {
    const set = new Set(alerts.map((alert) => alert.action));
    return ["all", ...Array.from(set)];
  }, [alerts]);

  const filteredAlerts = useMemo(
    () =>
      alerts.filter((alert) => {
      const matchesQuery =
        query.trim().length === 0 ||
        alert.action.toLowerCase().includes(query.toLowerCase()) ||
        alert.target.toLowerCase().includes(query.toLowerCase()) ||
        alert.ip.toLowerCase().includes(query.toLowerCase()) ||
        alert.details.toLowerCase().includes(query.toLowerCase());

      const matchesEvent = eventFilter === "all" || alert.action === eventFilter;
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "Success" && alert.result === "Success") ||
        (statusFilter === "Blocked" && alert.result === "Blocked") ||
        (statusFilter === "Reviewed" && alert.reviewed);

      const alertDate = parseAlertDate(alert.time);
      const matchesStart = !dateStart || alertDate >= new Date(`${dateStart}T00:00:00`);
      const matchesEnd = !dateEnd || alertDate <= new Date(`${dateEnd}T23:59:59`);

      return matchesQuery && matchesEvent && matchesStatus && matchesStart && matchesEnd;
    }),
    [alerts, query, eventFilter, statusFilter, dateStart, dateEnd]
  );

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(filteredAlerts.length / rowsPerPage)),
    [filteredAlerts.length, rowsPerPage]
  );

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages));
  }, [totalPages]);

  const paginatedAlerts = useMemo(() => {
    const safePage = Math.min(currentPage, totalPages);
    const start = (safePage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return filteredAlerts.slice(start, end);
  }, [filteredAlerts, currentPage, rowsPerPage, totalPages]);

  const selectedCount = selectedIds.length;
  const allVisibleSelected =
    paginatedAlerts.length > 0 && paginatedAlerts.every((alert) => selectedIds.includes(alert.id));

  const toggleRowSelection = (id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]));
  };

  const toggleSelectAllVisible = () => {
    const visibleIds = paginatedAlerts.map((alert) => alert.id);
    setSelectedIds((prev) => {
      if (allVisibleSelected) {
        return prev.filter((id) => !visibleIds.includes(id));
      }
      return Array.from(new Set([...prev, ...visibleIds]));
    });
  };

  const runBulkAction = (action) => {
    if (selectedIds.length === 0) return;

    if (action === "markReviewed") {
      setAlerts((prev) =>
        prev.map((alert) =>
          selectedIds.includes(alert.id) ? { ...alert, reviewed: true } : alert
        )
      );
      return;
    }

    if (action === "exportSelected") {
      const rows = alerts.filter((alert) => selectedIds.includes(alert.id));
      exportAlertsCsv(rows);
      return;
    }

    if (action === "deleteSelected") {
      setAlerts((prev) => prev.filter((alert) => !selectedIds.includes(alert.id)));
      setSelectedIds([]);
    }
  };

  return (
    <SettingCard title={t("secAlerts.title")}>
      <div className={`mb-4 grid gap-3 p-3 rounded-lg md:grid-cols-6 ${darkMode ? "bg-gray-700" : "bg-slate-50"}`}>
        <div className="relative">
          <Search className={`pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 ${darkMode ? "text-gray-400" : "text-slate-400"}`} />
          <input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setCurrentPage(1);
            }}
            placeholder={t("secAlerts.searchPlaceholder")}
            className={`w-full rounded-lg border py-2 pl-10 pr-3 text-sm outline-none ring-teal-500 focus:ring-2 ${darkMode ? "border-gray-600 bg-gray-700 text-white placeholder-gray-400" : "border-slate-300"}`}
          />
        </div>

        <select
          value={rowsPerPage}
          onChange={(event) => {
            setRowsPerPage(Number(event.target.value));
            setCurrentPage(1);
          }}
          className={inputClass}
        >
          {ROW_OPTIONS.map((rows) => (
            <option key={rows} value={rows}>
              {rows} {t("secAlerts.rows")}
            </option>
          ))}
        </select>

        <select
          value={eventFilter}
          onChange={(event) => {
            setEventFilter(event.target.value);
            setCurrentPage(1);
          }}
          className={inputClass}
        >
          {eventOptions.map((eventName) => (
            <option key={eventName} value={eventName}>
              {eventName === "all" ? t("secAlerts.allEvents") : eventName}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(event) => {
            setStatusFilter(event.target.value);
            setCurrentPage(1);
          }}
          className={inputClass}
        >
          <option value="all">{t("secAlerts.allStatuses")}</option>
          <option value="Success">{t("secAlerts.success")}</option>
          <option value="Blocked">{t("secAlerts.blocked")}</option>
          <option value="Reviewed">{t("secAlerts.reviewed")}</option>
        </select>

        <input
          type="date"
          value={dateStart}
          onChange={(event) => {
            setDateStart(event.target.value);
            setCurrentPage(1);
          }}
          className={inputClass}
        />
        <input
          type="date"
          value={dateEnd}
          onChange={(event) => {
            setDateEnd(event.target.value);
            setCurrentPage(1);
          }}
          className={inputClass}
        />
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleSelectAllVisible}
            className={`rounded-lg border px-3 py-1.5 text-xs font-semibold ${darkMode ? "border-gray-600 text-gray-300 hover:bg-gray-700" : "border-slate-300 text-slate-700 hover:bg-slate-50"}`}
          >
            {allVisibleSelected ? t("secAlerts.unselectVisible") : t("secAlerts.selectVisible")}
          </button>
          <button
            type="button"
            onClick={() => setSelectedIds([])}
            className={`rounded-lg border px-3 py-1.5 text-xs font-semibold ${darkMode ? "border-gray-600 text-gray-300 hover:bg-gray-700" : "border-slate-300 text-slate-700 hover:bg-slate-50"}`}
          >
            {t("secAlerts.clearSelection")}
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className={`text-xs font-medium ${darkMode ? "text-gray-400" : "text-slate-500"}`}>{selectedCount} {t("secAlerts.selected")}</span>
          <button
            type="button"
            onClick={() => runBulkAction("markReviewed")}
            disabled={selectedCount === 0}
            className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300"
          >
            <CheckCheck className="h-3.5 w-3.5" />
            {t("secAlerts.markReviewed")}
          </button>
          <button
            type="button"
            onClick={() => runBulkAction("exportSelected")}
            disabled={selectedCount === 0}
            className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
          >
            <Download className="h-3.5 w-3.5" />
            {t("secAlerts.exportSelected")}
          </button>
          <button
            type="button"
            onClick={() => runBulkAction("deleteSelected")}
            disabled={selectedCount === 0}
            className="inline-flex items-center gap-1 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-700 disabled:cursor-not-allowed disabled:bg-rose-300"
          >
            <Trash2 className="h-3.5 w-3.5" />
            {t("secAlerts.deleteSelected")}
          </button>
        </div>
      </div>

      <div className={`overflow-x-auto rounded-lg border ${darkMode ? "border-gray-600" : "border-slate-200"}`}>
        <table className="min-w-full text-sm">
          <thead className={`text-left ${darkMode ? "bg-gray-700 text-gray-300" : "bg-slate-50 text-slate-600"}`}>
            <tr>
              <th className="px-4 py-3 w-10">
                <input
                  type="checkbox"
                  checked={allVisibleSelected}
                  onChange={toggleSelectAllVisible}
                  className="h-4 w-4 accent-teal-500"
                />
              </th>
              <th className="px-4 py-3">{t("secAlerts.time")}</th>
              <th className="px-4 py-3">{t("secAlerts.action")}</th>
              <th className="px-4 py-3">{t("secAlerts.target")}</th>
              <th className="px-4 py-3">{t("secAlerts.ip")}</th>
              <th className="px-4 py-3">{t("secAlerts.status")}</th>
            </tr>
          </thead>
          <tbody>
            {paginatedAlerts.length === 0 ? (
              <tr>
                <td className={`px-4 py-6 text-center ${darkMode ? "text-gray-400" : "text-slate-500"}`} colSpan={6}>
                  {t("secAlerts.noMatch")}
                </td>
              </tr>
            ) : (
              paginatedAlerts.map((alert) => (
                <tr key={alert.id} className={`border-t ${darkMode ? "border-gray-600" : "border-slate-100"}`}>
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(alert.id)}
                      onChange={() => toggleRowSelection(alert.id)}
                      className="h-4 w-4 accent-teal-500"
                    />
                  </td>
                  <td className={`px-4 py-3 ${darkMode ? "text-gray-400" : "text-slate-500"}`}>{alert.time}</td>
                  <td className={`px-4 py-3 font-medium ${darkMode ? "text-white" : "text-slate-800"}`}>{alert.action}</td>
                  <td className={`px-4 py-3 ${darkMode ? "text-gray-300" : "text-slate-600"}`}>{alert.target}</td>
                  <td className={`px-4 py-3 font-mono ${darkMode ? "text-gray-300" : "text-slate-600"}`}>{alert.ip}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-semibold ${
                        alert.reviewed
                          ? "bg-violet-100 text-violet-700"
                          : alert.result === "Success"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-rose-100 text-rose-700"
                      }`}
                    >
                      {alert.reviewed ? t("secAlerts.reviewed") : alert.result}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className={`mt-3 flex items-center justify-between text-xs ${darkMode ? "text-gray-400" : "text-slate-500"}`}>
        <span>
          {t("secAlerts.showing")} {paginatedAlerts.length === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1} {t("secAlerts.to")}{" "}
          {Math.min(currentPage * rowsPerPage, filteredAlerts.length)} {t("secAlerts.of")} {filteredAlerts.length}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
            disabled={currentPage <= 1}
            className={`rounded border px-2 py-1 disabled:opacity-50 ${darkMode ? "border-gray-600 text-gray-300" : "border-slate-300"}`}
          >
            {t("secAlerts.previous")}
          </button>
          <span>
            {t("secAlerts.page")} {Math.min(currentPage, totalPages)} {t("secAlerts.of")} {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
            disabled={currentPage >= totalPages}
            className={`rounded border px-2 py-1 disabled:opacity-50 ${darkMode ? "border-gray-600 text-gray-300" : "border-slate-300"}`}
          >
            {t("secAlerts.next")}
          </button>
        </div>
      </div>
    </SettingCard>
  );
}
