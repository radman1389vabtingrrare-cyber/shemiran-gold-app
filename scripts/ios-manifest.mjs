// manifest.plist برای نصب مستقیم iOS از سایت (itms-services): node scripts/ios-manifest.mjs  →  dist/ios/manifest.plist
// کنار آن shemiran-gold.ipa (امضاشده‌ی Ad Hoc/Enterprise از .github/workflows/build-apps.yml) را در همان پوشه بگذارید.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const cfg = JSON.parse(fs.readFileSync(path.join(root, "config.json"), "utf8"));
const out = path.join(root, "dist/ios");
fs.mkdirSync(out, { recursive: true });
fs.writeFileSync(
  path.join(out, "manifest.plist"),
  `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict><key>items</key><array><dict>
  <key>assets</key><array><dict><key>kind</key><string>software-package</string><key>url</key><string>${cfg.siteUrl}/downloads/ios/shemiran-gold.ipa</string></dict></array>
  <key>metadata</key><dict><key>bundle-identifier</key><string>${cfg.appId}</string><key>bundle-version</key><string>${cfg.version}</string><key>kind</key><string>software</string><key>title</key><string>${cfg.productName}</string></dict>
</dict></array></dict></plist>
`,
);
console.log("dist/ios/manifest.plist");
