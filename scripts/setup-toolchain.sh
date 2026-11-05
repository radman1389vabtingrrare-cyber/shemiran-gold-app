#!/usr/bin/env bash
# نصب ابزارهای ساخت اندروید در ~/projects/app/.toolchain (بدون sudo): JDK 21 + Android SDK (platform 35، build-tools 35)
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
T="$ROOT/.toolchain"; mkdir -p "$T"
if [ ! -x "$T/jdk/bin/java" ]; then
  curl -fL -o "$T/jdk.tgz" "https://api.adoptium.net/v3/binary/latest/21/ga/linux/x64/jdk/hotspot/normal/eclipse"
  mkdir -p "$T/jdk" && tar xzf "$T/jdk.tgz" -C "$T/jdk" --strip-components=1 && rm "$T/jdk.tgz"
fi
if [ ! -x "$T/sdk/cmdline-tools/latest/bin/sdkmanager" ]; then
  curl -fL -o "$T/cmd.zip" "https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip"
  mkdir -p "$T/sdk/cmdline-tools" && unzip -q -o "$T/cmd.zip" -d "$T/sdk/cmdline-tools" && mv "$T/sdk/cmdline-tools/cmdline-tools" "$T/sdk/cmdline-tools/latest" && rm "$T/cmd.zip"
fi
if [ ! -x "$T/gradle/bin/gradle" ]; then
  mkdir -p "$T/dl"
  # با قطع‌شدن اینترنت از ادامه‌ی فایل نیمه‌دانلودشده ادامه می‌دهد
  until curl -fL -C - --retry 3 -o "$T/dl/gradle.zip" "https://services.gradle.org/distributions/gradle-8.11.1-bin.zip"; do sleep 2; done
  unzip -q -o "$T/dl/gradle.zip" -d "$T" && mv "$T/gradle-8.11.1" "$T/gradle"
fi
source "$ROOT/scripts/env.sh"
yes | sdkmanager --licenses >/dev/null || true
sdkmanager "platform-tools" "platforms;android-35" "build-tools;35.0.0"
echo "OK: $(java -version 2>&1 | head -1)"
