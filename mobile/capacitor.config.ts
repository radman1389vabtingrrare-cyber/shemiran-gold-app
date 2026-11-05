import type { CapacitorConfig } from "@capacitor/cli";
import cfg from "../config.json";

// برنامه همان سایت زنده را (فقط داشبورد) داخل یک پوسته‌ی بومی باز می‌کند؛ سایت از User-Agent «ShemiranGoldApp» می‌فهمد داخل برنامه است
// و صفحه‌ی اصلی/نوبار/فوتر را نشان نمی‌دهد. اگر اینترنت نباشد، www/offline.html (ذره‌های قرمز) نمایش داده می‌شود.
const config: CapacitorConfig = {
  appId: cfg.appId,
  appName: cfg.name,
  webDir: "www",
  backgroundColor: "#0b0906",
  server: {
    url: `${cfg.siteUrl}${cfg.startPath}`,
    cleartext: false,
    errorPath: "offline.html",
    allowNavigation: [new URL(cfg.siteUrl).hostname, `*.${new URL(cfg.siteUrl).hostname}`],
  },
  android: {
    allowMixedContent: false,
    appendUserAgent: `ShemiranGoldApp/${cfg.version} (android)`,
    webContentsDebuggingEnabled: false,
  },
  ios: {
    appendUserAgent: `ShemiranGoldApp/${cfg.version} (ios)`,
    contentInset: "never",
    backgroundColor: "#0b0906",
  },
};

export default config;
