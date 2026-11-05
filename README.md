# برنامه‌ی شمیران گلد (اندروید / ویندوز / iOS)

برنامه همان سایت زنده (`https://shemirangold.ir`) را **فقط از `/dashboard`** در یک پوسته‌ی بومی باز می‌کند:

- اولین بار: ورود یا ثبت‌نام (همان صفحه‌ی `/login` سایت)، بعد داشبورد دقیقاً مثل سایت.
- سایت از User-Agent (`ShemiranGoldApp/نسخه (android|windows|ios)`) می‌فهمد داخل برنامه است؛ نوبار، فوتر، صفحه‌ی اصلی، فروشگاه و لینک «بازگشت به سایت» نشان داده نمی‌شود و هر آدرسی جز ورود/داشبورد به `/dashboard` می‌رود (`frontend/src/lib/native-app.ts` و `root-shell.tsx`).
- برنامه اینترنت لازم دارد. بدون اینترنت: صفحه‌ی `shared/offline.html` با ذره‌های قرمز؛ به‌محض وصل شدن خودکار به داشبورد برمی‌گردد. در حین کار هم داشبورد خودش هشدار قطعی و ذره‌های قرمز تم AITC را نشان می‌دهد.
- چون برنامه سایت زنده را باز می‌کند، **تغییرات سایت بدون انتشار نسخه‌ی تازه‌ی برنامه** به کاربران می‌رسد؛ فقط تغییر خودِ پوسته (آیکون، نام، دسترسی‌ها) نسخه‌ی جدید می‌خواهد.

## ساختار

| پوشه | کار |
|---|---|
| `config.json` | نام، شناسه‌ی بسته (`ir.shemirangold.app`)، نسخه، آدرس سایت |
| `shared/` | صفحه‌ی آفلاین و لوگو (بین موبایل و دسکتاپ مشترک؛ `scripts/sync-shared.mjs` کپی می‌کند) |
| `mobile/` | Capacitor 7 — پروژه‌ی `android/` و `ios/` |
| `desktop/` | Electron — برنامه‌ی ویندوز (portable) |
| `scripts/` | نصب ابزار و ساخت |
| `.github/workflows/build-apps.yml` | ساخت iOS روی macOS گیت‌هاب |
| `dist/` | خروجی‌ها (داخل گیت نمی‌رود) |

## ساخت

یک‌بار (بدون sudo؛ JDK 21 و Android SDK داخل `.toolchain`):

```bash
scripts/setup-toolchain.sh
```

اندروید → `dist/shemiran-gold.apk`:

```bash
scripts/build-android.sh
```

ویندوز → `dist/desktop/shemiran-gold.exe` (تک‌فایل portable؛ نصب لازم ندارد):

```bash
scripts/build-windows.sh
```

> **اندروید از ایران:** Google Maven (`dl.google.com/dl/android/maven2`) از ایران ۴۰۴ می‌دهد و Gradle نمی‌تواند وابستگی‌ها را بگیرد. ساخت لوکال فقط با VPN/پروکسی کار می‌کند؛ راه بدون VPN: ساخت روی گیت‌هاب با `.github/workflows/build-apps.yml` (job های `android` و `windows` و `ios`). اگر خواستید می‌توانید آینه‌ی Maven (مثل Aliyun) را به‌عنوان مخزن اضافه کنید، ولی آن‌وقت وابستگی‌های ساخت از یک سرور ثالث می‌آید.

iOS: روی لینوکس ممکن نیست (Xcode لازم است). پروژه‌ی `mobile/ios` آماده است و `.github/workflows/build-apps.yml` روی macOS گیت‌هاب IPA می‌سازد (بدون امضا برای آزمایش؛ با سکرت‌ها امضاشده). بعد `node scripts/ios-manifest.mjs` فایل `manifest.plist` را می‌سازد.

## انتشار روی سایت

سایت دکمه‌ی «دانلود» را بر اساس سیستم‌عامل کاربر می‌سازد و این فایل‌ها را از `/downloads/` می‌گیرد. روی سرور (`/var/www/shemiran-gold/downloads/`):

| فایل | سیستم‌عامل |
|---|---|
| `shemiran-gold.apk` | اندروید |
| `shemiran-gold.exe` | ویندوز |
| `ios/manifest.plist` + `ios/shemiran-gold.ipa` | iOS (نصب با itms-services؛ نیاز به امضای Ad Hoc/Enterprise و HTTPS) |

```bash
scp dist/shemiran-gold.apk dist/desktop/shemiran-gold.exe USER@SERVER:/var/www/shemiran-gold/downloads/
```

بعد روی سرور `docker compose -f docker-compose.prod.yml up -d --force-recreate frontend` و Purge کش CDN. فایلی که نباشد در سایت «به‌زودی» نشان داده می‌شود.

## نکته‌های مهم

- **کلید امضای اندروید** (`secrets/shemiran-gold.keystore` + `secrets/keystore.env`) را همین الان پشتیبان بگیرید و گم نکنید؛ با کلید دیگر، کاربران نمی‌توانند روی نسخه‌ی قبلی به‌روزرسانی کنند. این پوشه داخل گیت نیست.
- ویندوز بدون گواهی امضای کد (Code Signing) نصب می‌شود ولی SmartScreen هشدار «ناشناس» می‌دهد.
- iOS بیرون از App Store فقط با گواهی Enterprise یا Ad Hoc (حداکثر ۱۰۰ دستگاه ثبت‌شده) نصب می‌شود؛ برای عموم کاربران، مسیر درست App Store/TestFlight با حساب Apple Developer است.
