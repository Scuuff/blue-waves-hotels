export const DEFAULT_SECURITY_SETTINGS = {
  minPasswordLength: 8,
  requireSpecialCharacter: true,
  passwordExpiryDays: 90,
  sessionTimeoutMinutes: 30,
  enforceTwoFactor: false,
  ipWhitelist: "192.168.1.10, 10.0.0.45",
  auditRetentionDays: 90,
  piiMasking: true,
  financialShield: true,
  dlpEnforcement: true,
  panicMode: false,
};

export const SECURITY_ALERTS = [
  {
    id: 1,
    time: "2026-03-18 20:14",
    action: "Failed login attempt",
    target: "admin@hotelgroup.com",
    ip: "198.51.100.44",
    result: "Blocked",
    details: "5 failed password attempts in 2 minutes",
  },
  {
    id: 2,
    time: "2026-03-18 19:22",
    action: "System Update",
    target: "Security Policy",
    ip: "10.0.0.45",
    result: "Success",
    details: "Password expiry policy changed",
  },
  {
    id: 3,
    time: "2026-03-18 17:08",
    action: "Login",
    target: "owner@hotelgroup.com",
    ip: "192.168.1.10",
    result: "Success",
    details: "Owner signed in with trusted device",
  },
  {
    id: 4,
    time: "2026-03-17 23:41",
    action: "Banned User",
    target: "attacker@unknown.com",
    ip: "203.0.113.98",
    result: "Blocked",
    details: "IP blocked by anomaly detector",
  },
  {
    id: 5,
    time: "2026-03-17 22:05",
    action: "Login",
    target: "support@hotelgroup.com",
    ip: "10.0.0.81",
    result: "Success",
    details: "Support role authenticated",
  },
];

export const USER_ROLES = [
  {
    role: "Admin",
    capabilities: [
      "Manage users and roles",
      "Access security configuration",
      "View full audit logs",
    ],
  },
  {
    role: "User",
    capabilities: [
      "View dashboard and own bookings",
      "Submit support requests",
      "Update own profile only",
    ],
  },
  {
    role: "Guest",
    capabilities: [
      "Browse hotels and offers",
      "Create bookings",
      "No admin/security access",
    ],
  },
];
