import { apiPost } from "./apiClient";

export async function logAuditEvent({
  actionType,
  module,
  entityType,
  entityId,
  targetUserId,
  targetLabel,
  status = "success",
  reason = "",
  before = null,
  after = null,
}) {
  try {
    await apiPost("/audit/events", {
      actionType,
      module,
      entityType,
      entityId,
      targetUserId,
      targetLabel,
      status,
      reason,
      before,
      after,
    });
  } catch (error) {
    console.warn("Audit event failed:", error.message);
  }
}
