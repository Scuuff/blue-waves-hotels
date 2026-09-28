const DEFAULT_ADMIN_IDENTITY = {
  userId: "u-001",
  role: "super_admin",
  name: "System Admin",
};

export function getCurrentAdminIdentity() {
  if (typeof window === "undefined") {
    return DEFAULT_ADMIN_IDENTITY;
  }

  try {
    const userId = localStorage.getItem("adminActorId") || DEFAULT_ADMIN_IDENTITY.userId;
    const role = localStorage.getItem("adminActorRole") || DEFAULT_ADMIN_IDENTITY.role;
    const name = localStorage.getItem("adminActorName") || DEFAULT_ADMIN_IDENTITY.name;
    return { userId, role, name };
  } catch {
    return DEFAULT_ADMIN_IDENTITY;
  }
}

export function buildScopedStorageKey(baseKey, userId) {
  return `${baseKey}:${userId}`;
}
