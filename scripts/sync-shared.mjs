// صفحه‌ی «اینترنت قطع است» و لوگو را (با آدرس سایت از config.json) در پوسته‌ی موبایل و دسکتاپ می‌گذارد.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const cfg = JSON.parse(fs.readFileSync(path.join(root, "config.json"), "utf8"));

let html = fs.readFileSync(path.join(root, "shared/offline.html"), "utf8");
html = html.replace(/var SITE = "[^"]*";/, `var SITE = ${JSON.stringify(cfg.siteUrl)};`).replace(/var START = SITE \+ "[^"]*";/, `var START = SITE + ${JSON.stringify(cfg.startPath)};`);

for (const dir of ["mobile/www", "desktop/app"]) {
  const out = path.join(root, dir);
  fs.mkdirSync(out, { recursive: true });
  fs.writeFileSync(path.join(out, "offline.html"), html);
  fs.copyFileSync(path.join(root, "shared/logo.png"), path.join(out, "logo.png"));
}
fs.copyFileSync(path.join(root, "config.json"), path.join(root, "desktop/app/config.json"));
// Capacitor لازم دارد webDir یک index.html داشته باشد (با server.url هرگز نمایش داده نمی‌شود، فقط جای خالی نباشد)
fs.copyFileSync(path.join(root, "mobile/www/offline.html"), path.join(root, "mobile/www/index.html"));
// نسخه‌ی پروژه‌های بومی از config.json (versionCode باید با هر انتشار اندروید زیاد شود)
const patch = (file, pairs) => {
  const f = path.join(root, file);
  if (!fs.existsSync(f)) return;
  let s = fs.readFileSync(f, "utf8");
  for (const [re, to] of pairs) s = s.replace(re, to);
  fs.writeFileSync(f, s);
};
patch("mobile/android/app/build.gradle", [[/versionCode \d+/, `versionCode ${cfg.versionCode}`], [/versionName "[^"]*"/, `versionName "${cfg.version}"`]]);
patch("mobile/ios/App/App.xcodeproj/project.pbxproj", [[/MARKETING_VERSION = [^;]+;/g, `MARKETING_VERSION = ${cfg.version};`], [/CURRENT_PROJECT_VERSION = [^;]+;/g, `CURRENT_PROJECT_VERSION = ${cfg.versionCode};`]]);
console.log(`sync-shared: ${cfg.siteUrl}${cfg.startPath} (v${cfg.version})`);
