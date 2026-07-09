import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

const fail = (message) => {
  console.error(`release-check: ${message}`);
  process.exitCode = 1;
};

const git = (...args) => execFileSync("git", args, { encoding: "utf8" }).trim();

const trackedDbFiles = git("ls-files")
  .split("\n")
  .filter((file) => /(^|\/).+\.(db|sqlite3?|db-wal|db-shm|sqlite3?-wal|sqlite3?-shm)$/i.test(file));

if (trackedDbFiles.length) {
  fail(`SQLite runtime files are tracked: ${trackedDbFiles.join(", ")}`);
}

const statusLines = git("status", "--short")
  .split("\n")
  .filter(Boolean);
const dbStatus = statusLines.filter((line) => {
  if (!/\.(db|sqlite3?|db-wal|db-shm|sqlite3?-wal|sqlite3?-shm)$/i.test(line)) return false;
  const status = line.slice(0, 2);
  return !status.includes("D");
});

if (dbStatus.length) {
  fail(`SQLite runtime files are dirty/untracked: ${dbStatus.join("; ")}`);
}

const serverPath = "backend/src/server.ts";
if (existsSync(serverPath)) {
  const server = readFileSync(serverPath, "utf8");
  if (!server.includes("require('../index.js')")) {
    fail("backend/src/server.ts must delegate to backend/index.js");
  }
}

const backendPackage = JSON.parse(readFileSync("backend/package.json", "utf8"));
if (backendPackage.main !== "index.js") {
  fail("backend/package.json main must be index.js");
}

const rootPackage = JSON.parse(readFileSync("package.json", "utf8"));
for (const script of ["test", "build", "build:electron", "release:check"]) {
  if (!rootPackage.scripts?.[script]) {
    fail(`missing package script: ${script}`);
  }
}

if (process.exitCode) {
  process.exit(process.exitCode);
}

console.log("release-check: static release guards passed");
