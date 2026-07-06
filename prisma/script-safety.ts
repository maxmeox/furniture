type DbScriptSafetyOptions = {
  allowFlag: string;
  action: string;
};

function hasLocalMarker(value: string) {
  return value.includes("localhost") || value.includes("127.0.0.1") || value.includes("[::1]");
}

export function assertDbScriptAllowed(scriptName: string, options: DbScriptSafetyOptions) {
  const databaseUrl = process.env.DATABASE_URL ?? "";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
  const nodeEnv = process.env.NODE_ENV ?? "";
  const vercelEnv = process.env.VERCEL_ENV ?? "";

  const isLocalDatabase = databaseUrl.trim().length === 0 || hasLocalMarker(databaseUrl);
  const isLocalApp = appUrl.trim().length === 0 || hasLocalMarker(appUrl);
  const isProductionLike = nodeEnv === "production" || vercelEnv === "production" || !isLocalApp;
  const needsExplicitAllow = !isLocalDatabase || isProductionLike;

  if (!needsExplicitAllow || process.env[options.allowFlag] === "true") {
    return;
  }

  throw new Error(
    `${scriptName} refused to ${options.action} on a non-local or production-like database. ` +
      `Confirm the target database, take a backup when applicable, then set ${options.allowFlag}=true for this run.`
  );
}
