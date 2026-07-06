import { config as loadEnv } from "dotenv";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

const TEST_ENV_FILE = resolve(process.cwd(), ".env.test");
if (existsSync(TEST_ENV_FILE)) {
  loadEnv({ path: TEST_ENV_FILE, override: true });
}

export {};
