#!/usr/bin/env node
/**
 * Ensures VITE_ADMIN_GATEWAY_SECRET matches ADMIN_GATEWAY_SECRET for production builds.
 * Render generates these separately unless synced — this script copies server secret into client build.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const secret = process.env.ADMIN_GATEWAY_SECRET || process.env.VITE_ADMIN_GATEWAY_SECRET || "";
const gatewayPath = process.env.ADMIN_GATEWAY_PATH || process.env.VITE_ADMIN_GATEWAY_PATH || "balotech-vault-x9k2";

const envContent = `VITE_ADMIN_GATEWAY_PATH=${gatewayPath}
VITE_ADMIN_GATEWAY_SECRET=${secret}
`;

fs.writeFileSync(path.join(root, "client", ".env.production.local"), envContent);
console.log("Wrote client/.env.production.local for build");
