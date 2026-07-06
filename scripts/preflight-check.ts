import { existsSync, readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { execSync } from "node:child_process";

type EnvMap = Record<string, string>;

const envFiles = [".env", ".env.local"];
const defaults = new Set(["change-me-in-production", "replace-with-a-long-random-secret", "replace-with-a-long-random-secret-at-least-32-characters"]);

function parseEnvFile(path: string): EnvMap {
  if (!existsSync(path)) return {};
  const entries: EnvMap = {};
  const lines = readFileSync(path, "utf8").split(/\r?\n/);

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const separatorIndex = line.indexOf("=");
    if (separatorIndex === -1) continue;
    const key = line.slice(0, separatorIndex).trim();
    let value = line.slice(separatorIndex + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    entries[key] = value;
  }

  return entries;
}

function loadEnv(): EnvMap {
  const fileEnv = envFiles.reduce<EnvMap>((acc, file) => ({ ...acc, ...parseEnvFile(resolve(process.cwd(), file)) }), {});
  return { ...fileEnv, ...process.env } as EnvMap;
}

function isMissing(value: string | undefined) {
  return !value || value.trim().length === 0;
}

function maskedStatus(key: string, exists: boolean) {
  console.log(`${exists ? "OK" : "MISSING"} ${key}`);
}

const env = loadEnv();
const required = [
  "DATABASE_URL",
  "ADMIN_EMAIL",
  "ADMIN_PASSWORD",
  "ADMIN_SESSION_SECRET",
  "NEXT_PUBLIC_APP_URL",
  "NEXT_PUBLIC_WHATSAPP_NUMBER",
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
  "NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME"
];

let hasError = false;
const warnings: string[] = [];

const optionalWithWarning = [
  "SENTRY_ORG",
  "SENTRY_PROJECT",
  "SENTRY_AUTH_TOKEN",
  "UPSTASH_REDIS_REST_URL",
  "UPSTASH_REDIS_REST_TOKEN",
  "NEXT_PUBLIC_GA_ID"
];

for (const key of optionalWithWarning) {
  if (isMissing(env[key])) {
    warnings.push(`${key} is not set — optional but recommended for production.`);
  }
}

for (const key of required) {
  const exists = !isMissing(env[key]);
  maskedStatus(key, exists);
  if (!exists) hasError = true;
}

const adminSessionSecret = env.ADMIN_SESSION_SECRET;
if (!isMissing(adminSessionSecret) && adminSessionSecret!.length < 32) {
  hasError = true;
  warnings.push("ADMIN_SESSION_SECRET should be at least 32 characters.");
}

const adminPassword = env.ADMIN_PASSWORD;
if (!isMissing(adminPassword) && defaults.has(adminPassword!)) {
  warnings.push("ADMIN_PASSWORD appears to be a default setup value. Use a strong client-specific value before seeding.");
}

const publicAppUrl = env.NEXT_PUBLIC_APP_URL;
if (!isMissing(publicAppUrl) && !/^https?:\/\//.test(publicAppUrl!)) {
  hasError = true;
  warnings.push("NEXT_PUBLIC_APP_URL should start with http:// or https://.");
}

const whatsappNumber = env.NEXT_PUBLIC_WHATSAPP_NUMBER;
if (!isMissing(whatsappNumber) && !/^\d{8,15}$/.test(whatsappNumber!)) {
  hasError = true;
  warnings.push("NEXT_PUBLIC_WHATSAPP_NUMBER should contain digits only, usually 8-15 digits.");
}

if (env.CLOUDINARY_API_SECRET && env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_SECRET === env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME) {
  hasError = true;
  warnings.push("Cloudinary secret and public cloud name look identical. Check Cloudinary env mapping.");
}

const rootFiles = readdirSync(process.cwd());
const suspiciousExts = new Set([".txt", ".csv"]);
const knownSafeConfig = new Set([
  "package-lock.json", "tsconfig.json", "tsconfig.test.json",
  "eslint.config.mjs", ".lintstagedrc.json", "opencode.jsonc"
]);
for (const file of rootFiles) {
  const ext = file.slice(file.lastIndexOf(".")).toLowerCase();
  if (!suspiciousExts.has(ext)) continue;
  if (knownSafeConfig.has(file)) continue;
  try {
    execSync(`git check-ignore ${JSON.stringify(file)}`, { cwd: process.cwd(), stdio: "pipe" });
  } catch {
    hasError = true;
    warnings.push(`Untracked credential-risk file detected: "${file}". Move contents to .env and delete.`);
  }
}

for (const warning of warnings) {
  console.warn(`WARN ${warning}`);
}

if (hasError) {
  console.error("Preflight failed. Fix missing or invalid environment values before launch.");
  process.exit(1);
}

console.log("Preflight passed. No secret values were printed and no database connection was attempted.");
