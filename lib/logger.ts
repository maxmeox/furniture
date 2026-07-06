type LogLevel = "debug" | "info" | "warn" | "error";

type LogEntry = {
  timestamp: string;
  level: LogLevel;
  scope: string;
  message: string;
  data?: unknown;
};

function formatEntry(level: LogLevel, scope: string, message: string, data?: unknown): LogEntry {
  return {
    timestamp: new Date().toISOString(),
    level,
    scope,
    message,
    data
  };
}

function isProduction() {
  return process.env.NODE_ENV === "production";
}

function write(level: LogLevel, scope: string, message: string, data?: unknown) {
  const entry = formatEntry(level, scope, message, data);

  if (isProduction()) {
    const output = JSON.stringify(entry);
    if (level === "error") process.stderr.write(`${output}\n`);
    else process.stdout.write(`${output}\n`);
    return;
  }

  const label = { debug: "DBG", info: "INF", warn: "WRN", error: "ERR" }[level];
  const prefix = `[${label}] [${scope}]`;
  const consoleMethod = console[level] ?? console.log;

  if (data instanceof Error) {
    consoleMethod(`${prefix} ${message}\n`, data);
  } else if (data !== undefined) {
    consoleMethod(`${prefix} ${message}`, data);
  } else {
    consoleMethod(`${prefix} ${message}`);
  }
}

export function createLogger(scope: string) {
  return {
    debug: (message: string, data?: unknown) => write("debug", scope, message, data),
    info: (message: string, data?: unknown) => write("info", scope, message, data),
    warn: (message: string, data?: unknown) => write("warn", scope, message, data),
    error: (message: string, data?: unknown) => write("error", scope, message, data)
  };
}

export const log = createLogger("app");
