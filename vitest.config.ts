import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
      "server-only": path.resolve(__dirname, "tests/__mocks__/server-only.ts"),
    },
  },
  test: {
    environment: "node",
    include: ["lib/**/*.test.ts", "lib/**/*.test.tsx"],
    typecheck: {
      enabled: true,
      tsconfig: path.resolve(__dirname, "tsconfig.test.json"),
    },
    coverage: {
      provider: "v8",
      include: ["lib/**"],
      reporter: ["text", "lcov"],
    },
  },
});
