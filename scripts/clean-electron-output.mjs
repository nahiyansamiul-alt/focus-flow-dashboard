import { spawn } from "node:child_process";
import { existsSync, readdirSync, renameSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const projectDir = fileURLToPath(new URL("../", import.meta.url));
const outputName = "dist_electron";
const trashPrefix = `${outputName}-trash-`;
const outputDir = join(projectDir, outputName);

function containsFuseHiddenFile(directory) {
  const pending = [directory];

  while (pending.length > 0) {
    const current = pending.pop();
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      if (entry.name.startsWith(".fuse_hidden")) return true;
      if (entry.isDirectory()) pending.push(join(current, entry.name));
    }
  }

  return false;
}

function removeTrashDir(trashDir) {
  // FUSE keeps deleted-but-open files under this prefix. Retrying a recursive
  // delete against them can block indefinitely, so leave that small locked
  // remainder for the owning process/filesystem to release later.
  if (containsFuseHiddenFile(trashDir)) {
    console.warn(
      `clean-electron-output: WARNING: skipped locked FUSE trash ${trashDir}. ` +
        "Close any running packaged app and remove this directory later."
    );
    return Promise.resolve();
  }

  return new Promise((resolveRemoval) => {
    const removeScript = [
      "const { rmSync } = require('node:fs');",
      "rmSync(process.argv[1], { recursive: true, force: true, maxRetries: 3, retryDelay: 200 });",
    ].join(" ");
    const child = spawn(process.execPath, ["-e", removeScript, trashDir], {
      stdio: ["ignore", "ignore", "pipe"],
      windowsHide: true,
    });
    let stderr = "";
    let timedOut = false;
    let settled = false;

    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    const timeout = setTimeout(() => {
      timedOut = true;
      child.kill("SIGKILL");
    }, 30_000);

    child.on("error", (error) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      console.warn(
        `clean-electron-output: WARNING: could not start cleanup for ${trashDir}: ${error.message}`
      );
      resolveRemoval();
    });

    child.on("close", (code) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      if (code === 0) {
        console.log(`clean-electron-output: removed ${trashDir}`);
      } else {
        const reason = timedOut ? "cleanup timed out on a locked file" : stderr.trim() || `exit ${code}`;
        console.warn(
          `clean-electron-output: WARNING: could not fully remove ${trashDir}: ${reason}. ` +
            "Close any running packaged app and remove this directory manually to reclaim disk space."
        );
      }
      resolveRemoval();
    });
  });
}

if (!existsSync(outputDir)) {
  console.log(`clean-electron-output: ${outputDir} does not exist`);
} else {
  const timestamp = Date.now();
  let trashDir = join(projectDir, `${trashPrefix}${timestamp}`);
  let suffix = 0;
  while (existsSync(trashDir)) {
    suffix += 1;
    trashDir = join(projectDir, `${trashPrefix}${timestamp}-${suffix}`);
  }

  renameSync(outputDir, trashDir);
  console.log(`clean-electron-output: moved ${outputDir} to ${trashDir}`);
}

// Renaming first frees the output path even when Windows still has a packaged file open.
// Remove the renamed output and any older trash directories on a best-effort basis.
for (const entry of readdirSync(projectDir, { withFileTypes: true })) {
  if (entry.isDirectory() && entry.name.startsWith(trashPrefix)) {
    await removeTrashDir(join(projectDir, entry.name));
  }
}
