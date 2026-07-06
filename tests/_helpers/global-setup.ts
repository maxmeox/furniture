import { config as loadEnv } from "dotenv";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

const TEST_ENV_FILE = resolve(process.cwd(), ".env.test");
if (existsSync(TEST_ENV_FILE)) {
  loadEnv({ path: TEST_ENV_FILE, override: true });
  console.log("[playwright globalSetup] Loaded .env.test — DATABASE_URL:", process.env.DATABASE_URL);
}

export default async function globalSetup() {
  // No-op; the side effect (loading env) above is what matters.
}
