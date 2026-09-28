import crypto from "crypto";

const KEY_LENGTH = 64;

export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = crypto
    .scryptSync(password, salt, KEY_LENGTH)
    .toString("hex");
  return `${salt}:${derivedKey}`;
}

export function verifyPassword(password, storedHash = "") {
  const [salt, originalKey] = String(storedHash).split(":");
  if (!salt || !originalKey) {
    return false;
  }

  const derivedKey = crypto
    .scryptSync(password, salt, KEY_LENGTH)
    .toString("hex");

  const originalBuffer = Buffer.from(originalKey, "hex");
  const derivedBuffer = Buffer.from(derivedKey, "hex");

  if (originalBuffer.length !== derivedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(originalBuffer, derivedBuffer);
}
