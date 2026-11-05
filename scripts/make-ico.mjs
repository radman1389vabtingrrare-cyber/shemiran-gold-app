// desktop/build/icon.ico (PNG داخل ICO، ۱۶…۲۵۶) را از shared/logo.png می‌سازد
import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sharp = createRequire(path.join(root, "mobile/"))("sharp");
const sizes = [16, 24, 32, 48, 64, 128, 256];
const pngs = await Promise.all(sizes.map((s) => sharp(path.join(root, "shared/logo.png")).resize(s, s).png().toBuffer()));
const head = Buffer.alloc(6); head.writeUInt16LE(1, 2); head.writeUInt16LE(sizes.length, 4);
let off = 6 + 16 * sizes.length;
const dir = sizes.map((s, i) => {
  const e = Buffer.alloc(16);
  e[0] = s === 256 ? 0 : s; e[1] = s === 256 ? 0 : s; e.writeUInt16LE(1, 4); e.writeUInt16LE(32, 6); e.writeUInt32LE(pngs[i].length, 8); e.writeUInt32LE(off, 12);
  off += pngs[i].length; return e;
});
fs.writeFileSync(path.join(root, "desktop/build/icon.ico"), Buffer.concat([head, ...dir, ...pngs]));
console.log("icon.ico ok");
