/**
 * Chalk-coloured console logger with four levels.
 *
 * Why a custom logger instead of pino/winston: the pipeline is interactive
 * (a CLI run, not a long-lived service), and we want pretty colours + zero
 * setup. We keep the surface area tiny so swapping in pino later is trivial.
 */
import chalk from "chalk";
import { loadEnv } from "../config/env.js";
import type { LogLevel } from "../config/types.js";

const LEVEL_RANK: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

function currentLevel(): LogLevel {
  try {
    return loadEnv().logLevel;
  } catch {
    // Env not yet validated (e.g. during early CLI parsing); be permissive.
    return "info";
  }
}

function shouldLog(level: LogLevel): boolean {
  return LEVEL_RANK[level] >= LEVEL_RANK[currentLevel()];
}

function stamp(): string {
  return chalk.gray(new Date().toISOString().replace("T", " ").slice(11, 19));
}

function format(prefix: string, scope: string | undefined, msg: string): string {
  const tag = scope ? chalk.gray(`[${scope}]`) + " " : "";
  return `${stamp()} ${prefix} ${tag}${msg}`;
}

function asString(parts: unknown[]): string {
  return parts
    .map((p) => {
      if (typeof p === "string") return p;
      if (p instanceof Error) return p.stack ?? p.message;
      try {
        return JSON.stringify(p, null, 2);
      } catch {
        return String(p);
      }
    })
    .join(" ");
}

export interface Logger {
  debug: (...parts: unknown[]) => void;
  info: (...parts: unknown[]) => void;
  warn: (...parts: unknown[]) => void;
  error: (...parts: unknown[]) => void;
  success: (...parts: unknown[]) => void;
  step: (msg: string) => void;
  /** Returns a child logger that prefixes every message with `[scope]`. */
  scope: (scope: string) => Logger;
}

function makeLogger(scope?: string): Logger {
  return {
    debug: (...parts) => {
      if (shouldLog("debug")) {
        console.log(format(chalk.magenta("DEBUG"), scope, asString(parts)));
      }
    },
    info: (...parts) => {
      if (shouldLog("info")) {
        console.log(format(chalk.blue("INFO "), scope, asString(parts)));
      }
    },
    warn: (...parts) => {
      if (shouldLog("warn")) {
        console.warn(format(chalk.yellow("WARN "), scope, asString(parts)));
      }
    },
    error: (...parts) => {
      if (shouldLog("error")) {
        console.error(format(chalk.red("ERROR"), scope, asString(parts)));
      }
    },
    success: (...parts) => {
      if (shouldLog("info")) {
        console.log(format(chalk.green("OK   "), scope, asString(parts)));
      }
    },
    step: (msg) => {
      if (shouldLog("info")) {
        console.log(
          `\n${chalk.cyan("▸")} ${chalk.bold.cyan(msg)}${scope ? chalk.gray(` (${scope})`) : ""}`,
        );
      }
    },
    scope: (s) => makeLogger(scope ? `${scope}:${s}` : s),
  };
}

export const log: Logger = makeLogger();

/** Re-export chalk so call sites don't need a second import. */
export { chalk };
