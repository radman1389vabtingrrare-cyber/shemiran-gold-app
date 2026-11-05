// آیکون و اسپلش اندروید/iOS را از shared/logo.png می‌سازد (سپس: npx capacitor-assets generate)
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sharp = createRequire(path.join(root, "mobile/")) ("sharp");
const logo = path.join(root, "shared/logo.png");
const out = path.join(root, "mobile/assets");
const BG = { r: 11, g: 9, b: 6, alpha: 1 };
const sq = (n) => ({ width: n, height: n, channels: 4, background: BG });

// آیکون کامل (iOS و اندرویدهای قدیمی): لوگو روی پس‌زمینه‌ی تیره
await sharp({ create: sq(1024) }).composite([{ input: await sharp(logo).resize(820, 820).toBuffer(), gravity: "center" }]).png().toFile(path.join(out, "icon-only.png"));
// آیکون تطبیقی اندروید: پیش‌زمینه (ناحیه‌ی امن ~۶۶٪) + پس‌زمینه‌ی تیره
await sharp({ create: { ...sq(1024), background: { r: 0, g: 0, b: 0, alpha: 0 } } }).composite([{ input: await sharp(logo).resize(640, 640).toBuffer(), gravity: "center" }]).png().toFile(path.join(out, "icon-foreground.png"));
await sharp({ create: sq(1024) }).png().toFile(path.join(out, "icon-background.png"));
// اسپلش
for (const f of ["splash.png", "splash-dark.png"]) await sharp({ create: sq(2732) }).composite([{ input: await sharp(logo).resize(560, 560).toBuffer(), gravity: "center" }]).png().toFile(path.join(out, f));
console.log("assets ok");
