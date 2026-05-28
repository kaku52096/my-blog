import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = path.join(root, "posts", "figures");
const target = path.join(root, "public", "figures");

if (!fs.existsSync(source)) {
  console.log("No posts/figures directory, skipping sync.");
  process.exit(0);
}

fs.rmSync(target, { recursive: true, force: true });
fs.mkdirSync(target, { recursive: true });
fs.cpSync(source, target, { recursive: true });

console.log("Synced posts/figures -> public/figures");
