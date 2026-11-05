#!/usr/bin/env bash
# ساخت برنامه‌ی ویندوز (تک‌فایل portable، بدون نیاز به نصب) از روی لینوکس → dist/desktop/shemiran-gold.exe
# نصب‌کننده‌ی NSIS روی لینوکس برای ساخت uninstaller به wine نیاز دارد؛ اگر wine دارید می‌توانید در desktop/package.json هدف را به "nsis" برگردانید.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT/desktop"
[ -d node_modules ] || npm install --no-audit --no-fund
node "$ROOT/scripts/sync-shared.mjs"
npx electron-builder --win portable --x64
ls -lh "$ROOT/dist/desktop/shemiran-gold.exe"
