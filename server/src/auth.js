import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { getSetting, setSetting } from "./db.js";

const PIN_KEY = "admin_pin_hash";

export async function ensureAdminPin(defaultPin) {
  const existing = await getSetting(PIN_KEY);
  if (!existing) {
    const hash = await bcrypt.hash(defaultPin, 10);
    await setSetting(PIN_KEY, hash);
  }
}

export async function verifyPin(pin) {
  const hash = await getSetting(PIN_KEY);
  if (!hash) return false;
  return bcrypt.compare(pin, hash);
}

export async function changePin(currentPin, newPin) {
  const valid = await verifyPin(currentPin);
  if (!valid) return false;
  const hash = await bcrypt.hash(newPin, 10);
  await setSetting(PIN_KEY, hash);
  return true;
}

export function signToken() {
  return jwt.sign({ role: "admin" }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

export function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  try {
    const token = header.slice(7);
    req.admin = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

export function gatewayMiddleware(req, res, next) {
  const expected = process.env.ADMIN_GATEWAY_SECRET;
  if (!expected) return next();

  const provided = req.headers["x-gateway-key"];
  if (provided !== expected) {
    return res.status(404).json({ error: "Not found" });
  }
  next();
}
