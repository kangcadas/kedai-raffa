# 🍽️ KEDAI RAFFA POS v1.5.0

> Sistem POS PWA → TWA (APK Android Native) untuk Kedai Raffa
> Zero Cost | Zero Terminal | Full Native Design

---

## 📋 DAFTAR FILE

| File | Fungsi |
|------|--------|
| `index.html` | Halaman utama PWA |
| `manifest.json` | PWA manifest (icon, theme, display) |
| `sw.js` | Service Worker (cache, push, background sync) |
| `js/config.js` | **Config terpusat** (Supabase URL, VAPID, dll) |
| `js/supabase-client.js` | Koneksi Supabase + Realtime |
| `js/bluetooth-printer.js` | **Printer Thermal Bluetooth ESC/POS** |
| `js/push-notification.js` | Web Push Notification |
| `js/app.js` | Logic utama aplikasi |
| `twa-manifest.json` | Config Bubblewrap (build APK) |
| `.github/workflows/deploy.yml` | Auto-deploy ke Cloudflare Pages |
| `.github/workflows/build-apk.yml` | Auto-build APK via Bubblewrap |
| `CRON_SETUP.md` | Panduan setup cron auto-cancel |

---

## 🚀 STEP-BY-STEP SETUP (100% Browser, Tanpa Terminal)

### ✅ LANGKAH 0: Deploy SQL ke Supabase (WAJIB PERTAMA)

1. Buka [supabase.com](https://supabase.com) → Login
2. Buka project `kedai-raffa`
3. Buka **SQL Editor** (kiri sidebar)
4. Copy-paste isi file `99_kedai_raffa_FINAL_v1.5.0.sql`
5. Klik **Run**
6. Database siap! 🎉

### ✅ LANGKAH 1: Deploy Edge Functions

#### Function 1: `send-push-notification`
1. Supabase Dashboard → **Edge Functions** → **New Function**
2. Name: `send-push-notification`
3. Hapus semua kode default → Paste kode dari `supabase/functions/send-push-notification/index.ts`
4. Tab **Secrets** → Add secrets:
   - `SB_URL` → `https://obcijbiyxqrvrhlzqjqb.supabase.co`
   - `SERVICE_ROLE_KEY` → *(dari Project Settings → API → service_role secret)*
   - `VAPID_PRIVATE_KEY` → `63-AnObYp85Njg64F4yEKoSV2f2Ou5iCaKZbZhUmJSw`
   - `VAPID_PUBLIC_KEY` → `BCrjorU7wTJOi1pp9EyRy4clWgNoBW6wrxUM025MdHIhRG50eFlZ25pggfSWGD54mz1r0Wx47etU3oUHayJKI3s`
5. Klik **Deploy function**

#### Function 2: `auto-cancel-pending`
1. **New Function** → Name: `auto-cancel-pending`
2. Paste kode dari `supabase/functions/auto-cancel-pending/index.ts`
3. Tab **Secrets** → Add:
   - `SB_URL` → `https://obcijbiyxqrvrhlzqjqb.supabase.co`
   - `SERVICE_ROLE_KEY` → *(sama seperti di atas)*
4. **Deploy**

### ✅ LANGKAH 2: Setup Cron Job Auto-Cancel

Ikuti panduan lengkap di file **`CRON_SETUP.md`**

Ringkasnya:
1. Buka [cron-job.org](https://cron-job.org) → Sign Up (gratis)
2. Create Cronjob:
   - URL: `https://obcijbiyxqrvrhlzqjqb.supabase.co/functions/v1/auto-cancel-pending`
   - Schedule: Every 5 minutes
   - Header: `Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9iY2lqYml5eHFydnJobHpxanFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU1MDczNjYsImV4cCI6MjEwMTA4MzM2Nn0.eowHPYIMTWqBjTxEivZAX7BtzrWkS-efw983g9aSryU`
3. Klik **CREATE** → **RUN NOW** untuk test

### ✅ LANGKAH 3: Buat GitHub Repo

1. Buka [github.com/new](https://github.com/new)
2. Nama repo: `kedai-raffa-pos`
3. Pilih **Public** → **Create repository**
4. Klik **"creating a new file"**
5. Buat file satu per satu (copy-paste dari ZIP ini):
   - `index.html`
   - `manifest.json`
   - `sw.js`
   - `js/config.js`
   - `js/supabase-client.js`
   - `js/bluetooth-printer.js`
   - `js/push-notification.js`
   - `js/app.js`
   - `.github/workflows/deploy.yml`
   - `.github/workflows/build-apk.yml`
   - `twa-manifest.json`
6. Klik **Commit changes** setiap file

### ✅ LANGKAH 4: Setup Cloudflare Pages

1. Buka [dash.cloudflare.com](https://dash.cloudflare.com) → Login/Register
2. Klik **Pages** → **Create a project** → **Connect to Git**
3. Pilih repo `kedai-raffa-pos`
4. Framework preset: **None**
5. Build command: *(kosongkan)*
6. Output directory: *(kosongkan)*
7. Klik **Save and Deploy**
8. Tunggu 1 menit → PWA live! 🚀
9. **Copy URL Cloudflare Pages** (contoh: `https://kedai-raffa-pos.pages.dev`)

### ✅ LANGKAH 5: Update Config

1. Edit `js/config.js` di GitHub → ganti tidak perlu (sudah benar)
2. Edit `twa-manifest.json` → ganti `YOUR-CLOUDFLARE-PAGES-URL` dengan URL asli Anda
3. Commit changes → Deploy otomatis jalan

### ✅ LANGKAH 6: Setup GitHub Secrets (untuk Deploy & APK)

1. Di GitHub repo → tab **Settings** → **Secrets and variables** → **Actions**
2. Klik **New repository secret**:
   - `CLOUDFLARE_API_TOKEN` → *(dari Cloudflare → My Profile → API Tokens → Create Token → Custom token → Zone:Read, Page:Edit)*
   - `CLOUDFLARE_ACCOUNT_ID` → *(dari Cloudflare dashboard sidebar)*
3. Klik **Add secret**

### ✅ LANGKAH 7: Build APK (Otomatis)

1. Di GitHub repo → tab **Actions**
2. Klik workflow **"Build APK (TWA) via Bubblewrap"**
3. Klik **Run workflow** → **Run workflow**
4. Tunggu 3-5 menit
5. Kembali ke tab **Actions** → klik run terbaru
6. Scroll ke bawah → bagian **Artifacts** → Klik `kedai-raffa-apk`
7. APK siap di-download! 📱

---

## 🖨️ CARA PAIR PRINTER BLUETOOTH

1. Pastikan printer thermal Bluetooth sudah **nyala**
2. Buka app KEDAI RAFFA di Android
3. Klik **"🔗 Pair Printer"**
4. Pilih printer dari daftar yang muncul
5. Printer terhubung! 🎉
6. Klik **"🧪 Test Print"** untuk coba print

**Catatan:**
- Printer harus support **ESC/POS**
- Profile UUID: `000018f0-0000-1000-8000-00805f9b34fb`
- Jika printer tidak muncul, pastikan Bluetooth HP **ON** dan printer dalam mode **pairing**

---

## 📱 CARA INSTALL APK

1. Download APK dari GitHub Actions artifact
2. Buka file APK di Android
3. Izinkan **"Install from unknown sources"**
4. Install → Buka app
5. App muncul di home screen seperti app native! 🎉

---

## 🔔 CARA AKTIFKAN PUSH NOTIFICATION

1. Buka app KEDAI RAFFA
2. Login sebagai Owner atau Kasir
3. Klik **"🔔 Aktifkan Notifikasi"**
4. Izinkan notifikasi di browser
5. Selesai! Notifikasi akan muncul saat:
   - Pesanan baru masuk
   - Status pesanan berubah
   - Stok hampir habis

---

## 🔧 TROUBLESHOOTING

| Masalah | Solusi |
|---------|--------|
| Printer tidak muncul | Pastikan Bluetooth ON, printer dalam mode pairing |
| Push tidak muncul | Cek VAPID keys, pastikan Edge Function deployed |
| APK build gagal | Cek `twa-manifest.json` URL sudah benar |
| Deploy Cloudflare gagal | Cek API token di GitHub Secrets |
| Realtime tidak jalan | Cek Supabase Realtime enabled di Project Settings |
| Cron tidak jalan | Cek cron-job.org status "Active", cek Authorization header |

---

## 📦 STACK

| Komponen | Platform | Biaya |
|----------|----------|-------|
| Database | Supabase PostgreSQL | $0 |
| Hosting PWA | Cloudflare Pages | $0 |
| CI/CD | GitHub Actions | $0 |
| TWA Builder | Bubblewrap (Google) | $0 |
| Push | Web Push API | $0 |
| Bluetooth | Web Bluetooth API | $0 |
| Cron | cron-job.org | $0 |
| **TOTAL** | | **$0** |

---

## 📝 CATATAN PENTING

1. **Ganti hash bcrypt** di seed data sebelum production
2. **Regenerate VAPID keys** untuk production (jangan pakai yang dari web tool)
3. **Icons** belum ada — buat folder `icons/` dan upload icon PNG 512x512, 192x192, 72x72
4. **Signing APK** saat ini unsigned. Untuk Play Store, butuh keystore (bisa via GitHub Actions juga)
5. **Config terpusat** ada di `js/config.js` — ganti di sini saja kalau ada perubahan URL/key

---

**Dibuat untuk KEDAI RAFFA v1.5.0** | Zero Cost | Zero Terminal | Full Native
