import { useCallback, useEffect, useMemo, useState } from "react";
import { punishmentApi } from "../services/punishmentApi";

function toIsoDay(value) {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 10);
}

export default function usePunishmentSystem() {
  const [roles, setRoles] = useState([]);
  const [users, setUsers] = useState([]);
  const [usersTotal, setUsersTotal] = useState(0);
  const [usersPage, setUsersPage] = useState(1);
  const [usersTotalPages, setUsersTotalPages] = useState(1);
  const [logs, setLogs] = useState([]);
  const [logsTotal, setLogsTotal] = useState(0);
  const [logsPage, setLogsPage] = useState(1);
  const [logsTotalPages, setLogsTotalPages] = useState(1);
  const [analytics, setAnalytics] = useState(null);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [selectedLogIds, setSelectedLogIds] = useState([]);
  const [error, setError] = useState("");

  const [userFilters, setUserFilters] = useState({
    search: "",
    role: "all",
    status: "all",
    activity: "all",
    limit: 10,
  });

  const [logFilters, setLogFilters] = useState({
    search: "",
    status: "all",
    activity: "all",
    module: "all",
    actionType: "all",
    dateFrom: "",
    dateTo: "",
    limit: 20,
  });

  const fetchRoles = useCallback(async () => {
    const result = await punishmentApi.getRoles();
    setRoles(result.roles ?? []);
  }, []);

  const fetchUsers = useCallback(
    async (page = usersPage, filters = userFilters) => {
      setLoadingUsers(true);
      setError("");
      try {
        const result = await punishmentApi.getUsers({ ...filters, page });
        setUsers(result.rows ?? []);
        setUsersTotal(result.total ?? 0);
        setUsersPage(result.page ?? 1);
        setUsersTotalPages(result.totalPages ?? 1);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoadingUsers(false);
      }
    },
    [userFilters, usersPage]
  );

  const fetchLogs = useCallback(
    async (page = logsPage, filters = logFilters) => {
      setLoadingLogs(true);
      setError("");
      try {
        const result = await punishmentApi.getLogs({ ...filters, page });
        setLogs(result.rows ?? []);
        setLogsTotal(result.total ?? 0);
        setLogsPage(result.page ?? 1);
        setLogsTotalPages(result.totalPages ?? 1);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoadingLogs(false);
      }
    },
    [logFilters, logsPage]
  );

  const fetchAnalytics = useCallback(async () => {
    setLoadingAnalytics(true);
    setError("");
    try {
      const result = await punishmentApi.getAnalytics();
      setAnalytics(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingAnalytics(false);
    }
  }, []);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  useEffect(() => {
    fetchUsers(1, userFilters);
  }, [fetchUsers, userFilters]);

  useEffect(() => {
    fetchLogs(1, logFilters);
  }, [fetchLogs, logFilters]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const changeRole = async ({ userId, nextRole, reason }) => {
    await punishmentApi.changeRole(userId, { nextRole, reason });
    await Promise.all([fetchUsers(), fetchLogs(), fetchAnalytics()]);
  };

  const banUser = async ({ userId, reason, durationDays, permanent }) => {
    await punishmentApi.banUser(userId, { reason, durationDays, permanent });
    await Promise.all([fetchUsers(), fetchLogs(), fetchAnalytics()]);
  };

  const blockUser = async ({ userId, reason }) => {
    await punishmentApi.blockUser(userId, { reason });
    await Promise.all([fetchUsers(), fetchLogs(), fetchAnalytics()]);
  };

  const unbanUser = async ({ userId, reason }) => {
    await punishmentApi.unbanUser(userId, { reason });
    await Promise.all([fetchUsers(), fetchLogs(), fetchAnalytics()]);
  };

  const blockIp = async ({ ip, reason, durationDays }) => {
    await punishmentApi.blockIp({ ip, reason, durationDays });
    await Promise.all([fetchLogs(), fetchAnalytics()]);
  };

  const runBulkAction = async (payload) => {
    await punishmentApi.bulkAction(payload);
    await Promise.all([fetchUsers(), fetchLogs(), fetchAnalytics()]);
    setSelectedUserIds([]);
  };

  const logModules = useMemo(() => {
    const unique = new Set(logs.map((log) => log.module).filter(Boolean));
    return ["all", ...Array.from(unique)];
  }, [logs]);

  const logActionTypes = useMemo(() => {
    const unique = new Set(logs.map((log) => log.actionType).filter(Boolean));
    return ["all", ...Array.from(unique)];
  }, [logs]);

  const usersByStatus = useMemo(
    () => ({
      active: users.filter((user) => user.status === "active").length,
      blocked: users.filter((user) => user.status === "blocked").length,
      banned: users.filter((user) => user.status === "banned").length,
    }),
    [users]
  );

  const logRowsForExport = useMemo(
    () => logs.filter((log) => selectedLogIds.includes(log.id)),
    [logs, selectedLogIds]
  );

  return {
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
    usersByStatus,
    changeRole,
    banUser,
    blockUser,
    unbanUser,
    blockIp,
    runBulkAction,
    fetchUsers,
    fetchLogs,
    fetchAnalytics,
    logRowsForExport,
    toIsoDay,
  };
}
