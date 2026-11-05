#!/usr/bin/env bash
# ساخت APK امضاشده → dist/shemiran-gold.apk   (نیاز: scripts/setup-toolchain.sh یک‌بار اجرا شده باشد)
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
source "$ROOT/scripts/env.sh"
KS="$ROOT/secrets/shemiran-gold.keystore"
PROPS="$ROOT/secrets/keystore.env"

# کلید امضا: یک‌بار ساخته می‌شود و باید برای همیشه نگه داشته (و پشتیبان‌گیری) شود؛ اگر گم شود، کاربران نمی‌توانند برنامه را «به‌روزرسانی» کنند
if [ ! -f "$KS" ]; then
  mkdir -p "$ROOT/secrets"
  PASS="$(head -c 24 /dev/urandom | base64 | tr -dc 'A-Za-z0-9' | head -c 24)"
  keytool -genkeypair -v -keystore "$KS" -alias shemirangold -keyalg RSA -keysize 4096 -validity 10000 \
    -storepass "$PASS" -keypass "$PASS" -dname "CN=Shemiran Gold, O=Shemiran Gold, C=IR" >/dev/null
  printf 'KS_PASS=%s\n' "$PASS" > "$PROPS"; chmod 600 "$KS" "$PROPS"
  echo "کلید امضای جدید ساخته شد: $KS  (پشتیبان بگیرید!)"
fi
source "$PROPS"

cd "$ROOT/mobile"
node ../scripts/sync-shared.mjs
npx cap sync android
cd android
# Gradle محلی (.toolchain/gradle) ترجیح دارد: دانلود wrapper روی اینترنت ناپایدار بارها قطع می‌شود
if [ -x "$ROOT/.toolchain/gradle/bin/gradle" ]; then "$ROOT/.toolchain/gradle/bin/gradle" --no-daemon assembleRelease; else ./gradlew --no-daemon assembleRelease; fi

BT="$ANDROID_HOME/build-tools/35.0.0"
OUT="$ROOT/dist"; mkdir -p "$OUT"
RAW="app/build/outputs/apk/release/app-release-unsigned.apk"
"$BT/zipalign" -f -p 4 "$RAW" "$OUT/aligned.apk"
"$BT/apksigner" sign --ks "$KS" --ks-key-alias shemirangold --ks-pass "pass:$KS_PASS" --key-pass "pass:$KS_PASS" --out "$OUT/shemiran-gold.apk" "$OUT/aligned.apk"
rm -f "$OUT/aligned.apk" "$OUT/shemiran-gold.apk.idsig"
"$BT/apksigner" verify --print-certs "$OUT/shemiran-gold.apk" | head -3
ls -lh "$OUT/shemiran-gold.apk"
