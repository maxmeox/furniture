import { defineConfig } from "@playwright/test";
import { config as loadEnv } from "dotenv";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

const TEST_ENV_FILE = resolve(process.cwd(), ".env.test");
if (existsSync(TEST_ENV_FILE)) {
  loadEnv({ path: TEST_ENV_FILE, override: true });
}

export default defineConfig({
  testDir: "./tests",
  globalSetup: "./tests/_helpers/global-setup.ts",
  timeout: 60000,
  retries: 0,
  use: {
    baseURL: "http://localhost:3000",
    channel: "chrome",
    headless: true,
    viewport: { width: 390, height: 844 },
    ignoreHTTPSErrors: true,
  },
  webServer: {
    command: "npm run start",
    port: 3000,
    reuseExistingServer: true,
    timeout: 60000,
    env: {
      DATABASE_URL: process.env.DATABASE_URL ?? "",
      ADMIN_EMAIL: process.env.ADMIN_EMAIL ?? "admin@example.com",
      ADMIN_PASSWORD: process.env.ADMIN_PASSWORD ?? "change-me-in-production",
      ADMIN_SESSION_SECRET: process.env.ADMIN_SESSION_SECRET ?? "",
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
      NEXT_PUBLIC_WHATSAPP_NUMBER: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "970599123456",
      CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME ?? "",
      CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY ?? "",
      CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET ?? "",
      NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? "",
      NODE_ENV: "production"
    }
  },
});
