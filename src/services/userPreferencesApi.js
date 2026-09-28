import { apiGet, apiPost, toQuery } from "./apiClient";

export const userPreferencesApi = {
  async getScope(scope, userId) {
    const query = toQuery({ userId });
    return apiGet(`/admin/preferences/${scope}${query ? `?${query}` : ""}`);
  },

  async saveScope(scope, userId, value) {
    return apiPost(`/admin/preferences/${scope}`, { userId, value });
  },
};
