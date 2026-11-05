# محیط ابزارهای ساخت (JDK + Android SDK) که scripts/setup-toolchain.sh در .toolchain نصب می‌کند: source scripts/env.sh
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
export JAVA_HOME="$ROOT/.toolchain/jdk"
export ANDROID_HOME="$ROOT/.toolchain/sdk"
export ANDROID_SDK_ROOT="$ANDROID_HOME"
export PATH="$JAVA_HOME/bin:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools:$PATH"
