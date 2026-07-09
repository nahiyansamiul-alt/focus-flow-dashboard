import { existsSync, renameSync } from "node:fs";
import { resolve } from "node:path";

const outputDir = resolve("dist_electron");

if (!existsSync(outputDir)) {
  console.log(`clean-electron-output: ${outputDir} does not exist`);
} else {
  const trashDir = resolve(`dist_electron-trash-${Date.now()}`);
  renameSync(outputDir, trashDir);
  console.log(`clean-electron-output: moved ${outputDir} to ${trashDir}`);
}
