import { useLanguage } from "../../../../../Context/LanguageContext";

export default function PunishmentFiltersBar({
  searchValue,
  onSearchChange,
  searchPlaceholder,
  statusValue,
  onStatusChange,
  statusOptions,
  roleValue,
  onRoleChange,
  roleOptions,
  activityValue,
  onActivityChange,
  activityOptions,
  dateFrom,
  onDateFromChange,
  dateTo,
  onDateToChange,
  moduleValue,
  onModuleChange,
  moduleOptions,
  actionValue,
  onActionChange,
  actionOptions,
}) {
  const { t } = useLanguage();
  return (
    <div className="mb-4 grid gap-2 rounded-xl border border-[#273b60] bg-[#0d182b] p-3 md:grid-cols-6">
      <input
        value={searchValue}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder={searchPlaceholder}
        className="rounded-lg border border-[#30496f] bg-[#0b1526] px-3 py-2 text-sm text-slate-100 outline-none ring-cyan-500 focus:ring-2"
      />

      {statusOptions ? (
        <select
          value={statusValue}
          onChange={(event) => onStatusChange(event.target.value)}
          className="rounded-lg border border-[#30496f] bg-[#0b1526] px-3 py-2 text-sm text-slate-100 outline-none ring-cyan-500 focus:ring-2"
        >
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : null}

      {roleOptions ? (
        <select
          value={roleValue}
          onChange={(event) => onRoleChange(event.target.value)}
          className="rounded-lg border border-[#30496f] bg-[#0b1526] px-3 py-2 text-sm text-slate-100 outline-none ring-cyan-500 focus:ring-2"
        >
          {roleOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : null}

      {activityOptions ? (
        <select
          value={activityValue}
          onChange={(event) => onActivityChange(event.target.value)}
          className="rounded-lg border border-[#30496f] bg-[#0b1526] px-3 py-2 text-sm text-slate-100 outline-none ring-cyan-500 focus:ring-2"
        >
          {activityOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : null}

      {moduleOptions ? (
        <select
          value={moduleValue}
          onChange={(event) => onModuleChange(event.target.value)}
          className="rounded-lg border border-[#30496f] bg-[#0b1526] px-3 py-2 text-sm text-slate-100 outline-none ring-cyan-500 focus:ring-2"
        >
          {moduleOptions.map((option) => (
            <option key={option} value={option}>
              {option === "all" ? t("punFilters.allModules") : option}
            </option>
          ))}
        </select>
      ) : null}

      {actionOptions ? (
        <select
          value={actionValue}
          onChange={(event) => onActionChange(event.target.value)}
          className="rounded-lg border border-[#30496f] bg-[#0b1526] px-3 py-2 text-sm text-slate-100 outline-none ring-cyan-500 focus:ring-2"
        >
          {actionOptions.map((option) => (
            <option key={option} value={option}>
              {option === "all" ? t("punFilters.allActions") : option}
            </option>
          ))}
        </select>
      ) : null}

      {(onDateFromChange || onDateToChange) && (
        <>
          <input
            type="date"
            value={dateFrom}
            onChange={(event) => onDateFromChange(event.target.value)}
            className="rounded-lg border border-[#30496f] bg-[#0b1526] px-3 py-2 text-sm text-slate-100 outline-none ring-cyan-500 focus:ring-2"
          />
          <input
            type="date"
            value={dateTo}
            onChange={(event) => onDateToChange(event.target.value)}
            className="rounded-lg border border-[#30496f] bg-[#0b1526] px-3 py-2 text-sm text-slate-100 outline-none ring-cyan-500 focus:ring-2"
          />
        </>
      )}
    </div>
  );
}
