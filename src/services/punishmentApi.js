import { apiGet, apiPatch, apiPost, toQuery } from "./apiClient";

export const punishmentApi = {
  getRoles() {
    return apiGet("/admin/punishment/roles");
  },

  getUsers(params) {
    const query = toQuery(params);
    return apiGet(`/admin/punishment/users${query ? `?${query}` : ""}`);
  },

  changeRole(userId, payload) {
    return apiPatch(`/admin/punishment/users/${userId}/role`, payload);
  },

  banUser(userId, payload) {
    return apiPost(`/admin/punishment/users/${userId}/ban`, payload);
  },

  blockUser(userId, payload) {
    return apiPost(`/admin/punishment/users/${userId}/block`, payload);
  },

  unbanUser(userId, payload) {
    return apiPost(`/admin/punishment/users/${userId}/unban`, payload);
  },

  blockIp(payload) {
    return apiPost("/admin/punishment/ip-ban", payload);
  },

  bulkAction(payload) {
    return apiPost("/admin/punishment/bulk", payload);
  },

  getLogs(params) {
    const query = toQuery(params);
    return apiGet(`/admin/punishment/logs${query ? `?${query}` : ""}`);
  },

  getAnalytics() {
    return apiGet("/admin/punishment/analytics");
  },

};
