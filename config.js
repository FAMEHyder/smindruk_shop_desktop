/**
 * ShopHub Shopkeeper Desktop — runtime config
 * Loads LIVE_* URLs from desktop/.env (also bundled into the installer).
 */
const fs = require('fs');
const path = require('path');

function parseEnvFile(filePath) {
  const out = {};
  if (!fs.existsSync(filePath)) return out;
  const text = fs.readFileSync(filePath, 'utf8');
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    out[key] = value;
  }
  return out;
}

function loadEnv() {
  const candidates = [
    path.join(__dirname, '.env'),
    // unpackaged / next to executable
    process.resourcesPath ? path.join(process.resourcesPath, '.env') : null,
    path.join(process.cwd(), '.env'),
  ].filter(Boolean);

  let merged = {};
  for (const file of candidates) {
    merged = { ...merged, ...parseEnvFile(file) };
  }
  return { ...merged, ...process.env };
}

const env = loadEnv();

function stripTrailingSlash(url) {
  return String(url || '').replace(/\/+$/, '');
}

const appUrl = stripTrailingSlash(
  env.LIVE_FRONTEND_URL || env.SHOPHUB_APP_URL || 'http://localhost:3000'
);
const apiUrl = stripTrailingSlash(
  env.LIVE_BACKEND_URL || env.SHOPHUB_API_URL || 'http://localhost:5000'
);

module.exports = {
  appUrl,
  apiUrl,
  startPath: '/login',
  width: 1360,
  height: 860,
  minWidth: 1024,
  minHeight: 700,
};
