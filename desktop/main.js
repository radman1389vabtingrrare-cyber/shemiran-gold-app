"use strict";
// برنامه‌ی ویندوز شمیران گلد: همان سایت زنده (فقط داشبورد) در یک پنجره‌ی امن. اگر اینترنت نباشد app/offline.html (ذره‌های قرمز) نمایش داده می‌شود.
const { app, BrowserWindow, Menu, shell } = require("electron");
const path = require("node:path");
const cfg = require("./app/config.json");

const ORIGIN = new URL(cfg.siteUrl).origin;
const START = ORIGIN + cfg.startPath;
const OFFLINE = path.join(__dirname, "app", "offline.html");
// مسیرهای مجاز داخل برنامه (همان فهرست lib/native-app.ts در سایت)؛ هر چیز دیگر در مرورگر سیستم باز می‌شود
const ALLOWED = /^\/(?:(?:en|tr|ar)\/)?(?:dashboard|login|verify|impersonate|admin|dashboard-preview|uploads|_next|api)(?:[/?#]|$)/;

if (!app.requestSingleInstanceLock()) app.quit();

// User-Agent: سایت با «ShemiranGoldApp» می‌فهمد داخل برنامه است
app.userAgentFallback = `${app.userAgentFallback.replace(/\s(Electron|shemiran-gold-desktop)\/\S+/g, "")} ShemiranGoldApp/${cfg.version} (windows)`;

let win = null;

function inApp(url) {
  try {
    const u = new URL(url);
    return u.origin === ORIGIN && ALLOWED.test(u.pathname);
  } catch {
    return false;
  }
}

function openExternal(url) {
  if (/^https?:\/\//i.test(url)) void shell.openExternal(url);
}

function create() {
  win = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 380,
    minHeight: 600,
    show: false,
    backgroundColor: "#0b0906",
    title: cfg.name,
    icon: path.join(__dirname, "app", "logo.png"),
    autoHideMenuBar: true,
    webPreferences: { contextIsolation: true, nodeIntegration: false, sandbox: true, devTools: false, spellcheck: false },
  });
  Menu.setApplicationMenu(null);
  win.once("ready-to-show", () => win.show());

  const wc = win.webContents;
  // نشدن بارگذاری سایت (اینترنت قطع، DNS، فیلتر…): صفحه‌ی آفلاین؛ -3 (لغوِ خودِ ناوبری) خطا نیست
  wc.on("did-fail-load", (_e, code, _desc, url, isMainFrame) => {
    if (!isMainFrame || code === -3 || url.startsWith("file:")) return;
    void win.loadFile(OFFLINE);
  });
  wc.on("will-navigate", (e, url) => {
    if (url.startsWith("file:") || inApp(url)) return;
    e.preventDefault();
    openExternal(url);
  });
  wc.setWindowOpenHandler(({ url }) => {
    if (inApp(url)) return { action: "allow" };
    openExternal(url);
    return { action: "deny" };
  });
  // دسترسی‌های حساس (دوربین، میکروفون، موقعیت…) بسته است؛ فقط کلیپ‌بورد
  wc.session.setPermissionRequestHandler((_wc, permission, cb) => cb(permission === "clipboard-sanitized-write"));
  // میان‌برها بدون منو: F5/Ctrl+R بارگذاری، Alt+← بازگشت، F11 تمام‌صفحه، Ctrl +/−/0 بزرگ‌نمایی
  wc.on("before-input-event", (e, i) => {
    if (i.type !== "keyDown") return;
    const k = i.key;
    if (k === "F5" || (i.control && k.toLowerCase() === "r")) { wc.reload(); e.preventDefault(); }
    else if (i.alt && k === "ArrowLeft") { if (wc.navigationHistory.canGoBack()) wc.navigationHistory.goBack(); e.preventDefault(); }
    else if (k === "F11") { win.setFullScreen(!win.isFullScreen()); e.preventDefault(); }
    else if (i.control && (k === "+" || k === "=")) { wc.setZoomLevel(wc.getZoomLevel() + 0.5); e.preventDefault(); }
    else if (i.control && k === "-") { wc.setZoomLevel(wc.getZoomLevel() - 0.5); e.preventDefault(); }
    else if (i.control && k === "0") { wc.setZoomLevel(0); e.preventDefault(); }
  });
  void win.loadURL(START);
}

app.on("second-instance", () => {
  if (!win) return;
  if (win.isMinimized()) win.restore();
  win.focus();
});
app.whenReady().then(create);
app.on("window-all-closed", () => app.quit());
