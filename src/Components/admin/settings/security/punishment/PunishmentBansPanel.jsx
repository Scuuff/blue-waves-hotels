import { useMemo, useState } from "react";
import { Lock } from "lucide-react";
import { useLanguage } from "../../../../../Context/LanguageContext";

export default function PunishmentBansPanel({ users, logs, onRequireOtp }) {
  const { t } = useLanguage();
  const [ip, setIp] = useState("");
  const [reason, setReason] = useState("Malicious requests detected");
  const [durationDays, setDurationDays] = useState(7);

  const bannedUsers = useMemo(
    () => users.filter((user) => user.status === "banned" || user.status === "blocked"),
    [users]
  );

  const ipBanEvents = useMemo(
    () => logs.filter((entry) => entry.actionType === "ip.blocked").slice(0, 8),
    [logs]
  );

  const submitIpBan = () => {
    if (!ip.trim()) return;
    onRequireOtp({
      action: "ip_ban",
      payload: { ip: ip.trim(), reason: reason.trim(), durationDays: Number(durationDays) || 7 },
    });
    setIp("");
  };

  return (
    <div className="grid gap-3 xl:grid-cols-2">
      <div className="rounded-xl border border-[#273b60] bg-[#0f1a2c] p-3">
        <h5 className="mb-2 text-xs font-semibold uppercase tracking-[0.1em] text-cyan-300">
          {t("punBans.banIp")}
        </h5>
        <p className="mb-2 rounded border border-amber-700 bg-amber-900/35 px-2 py-1 text-[11px] text-amber-200">
          {t("punBans.requiresOtp")}
        </p>
        <div className="space-y-2">
          <input
            value={ip}
            onChange={(event) => setIp(event.target.value)}
            placeholder={t("punBans.ipPlaceholder")}
            className="w-full rounded-lg border border-[#30496f] bg-[#0b1526] px-3 py-2 text-sm text-slate-100 outline-none ring-cyan-500 focus:ring-2"
          />
          <input
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder={t("punBans.reason")}
            className="w-full rounded-lg border border-[#30496f] bg-[#0b1526] px-3 py-2 text-sm text-slate-100 outline-none ring-cyan-500 focus:ring-2"
          />
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={1}
              value={durationDays}
              onChange={(event) => setDurationDays(event.target.value)}
              className="w-32 rounded-lg border border-[#30496f] bg-[#0b1526] px-3 py-2 text-sm text-slate-100 outline-none ring-cyan-500 focus:ring-2"
            />
            <span className="text-xs text-slate-400">{t("punBans.days")}</span>
            <button
              type="button"
              onClick={submitIpBan}
              title="Requires Final Code OTP"
              className="ml-auto rounded border border-rose-700 bg-rose-900/60 px-3 py-2 text-xs font-semibold text-rose-200"
            >
              <span className="inline-flex items-center gap-1">
                {t("punBans.applyIpBan")} <Lock className="h-3 w-3" /> (OTP)
              </span>
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-[#273b60] bg-[#0f1a2c] p-3">
        <h5 className="mb-2 text-xs font-semibold uppercase tracking-[0.1em] text-amber-300">
          {t("punBans.activeRestrictions")}
        </h5>
        <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
          {bannedUsers.length === 0 ? (
            <p className="text-xs text-slate-400">{t("punBans.noRestrictions")}</p>
          ) : (
            bannedUsers.map((user) => (
              <div key={user.id} className="rounded border border-[#2f4367] bg-[#0c172a] px-3 py-2 text-xs">
                <p className="font-semibold text-slate-100">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-slate-400">
                  @{user.username} - {user.email}
                </p>
                <p className="mt-1 text-rose-300 uppercase tracking-[0.08em]">{user.status}</p>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="rounded-xl border border-[#273b60] bg-[#0f1a2c] p-3 xl:col-span-2">
        <h5 className="mb-2 text-xs font-semibold uppercase tracking-[0.1em] text-slate-300">
          {t("punBans.recentIpBans")}
        </h5>
        <div className="max-h-56 overflow-y-auto rounded border border-[#2f4367] bg-[#0b1526]">
          <table className="min-w-full text-left text-xs text-slate-200">
            <thead className="bg-[#15253f] text-slate-400">
              <tr>
                <th className="px-3 py-2">{t("punBans.when")}</th>
                <th className="px-3 py-2">{t("punBans.ipTarget")}</th>
                <th className="px-3 py-2">{t("punBans.actor")}</th>
                <th className="px-3 py-2">{t("punBans.reason")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1f3555]">
              {ipBanEvents.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-3 py-4 text-center text-slate-500">
                    {t("punBans.noIpBanEvents")}
                  </td>
                </tr>
              ) : (
                ipBanEvents.map((entry) => (
                  <tr key={entry.id}>
                    <td className="px-3 py-2">{new Date(entry.at).toLocaleString()}</td>
                    <td className="px-3 py-2 font-mono">{entry.targetLabel}</td>
                    <td className="px-3 py-2">{entry.actorName ?? entry.actorUserId}</td>
                    <td className="px-3 py-2">{entry.reason || "-"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
