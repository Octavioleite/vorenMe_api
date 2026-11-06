import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scryptAsync = promisify(scrypt);

// Formato salvo: "scrypt:<salt hex>:<hash hex>". Stdlib, sem dependência nativa (bcrypt não builda em exFAT/alpine sem toolchain).
export const hashPassword = async (password) => {
  const salt = randomBytes(16);
  const hash = await scryptAsync(password, salt, 64);
  return `scrypt:${salt.toString("hex")}:${hash.toString("hex")}`;
};

export const verifyPassword = async (password, stored) => {
  const [scheme, salt, hash] = String(stored).split(":");
  if (scheme !== "scrypt" || !salt || !hash) return false;
  const expected = Buffer.from(hash, "hex");
  const actual = await scryptAsync(password, Buffer.from(salt, "hex"), expected.length);
  return timingSafeEqual(actual, expected);
};
