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
| `js/supabase-client.js` | Koneksi Supabase + Realtime |
| `js/bluetooth-printer.js` | **Printer Thermal Bluetooth ESC/POS** |
| `js/push-notification.js` | Web Push Notification |
| `js/app.js` | Logic utama aplikasi |
| `twa-manifest.json` | Config Bubblewrap (build APK) |
| `.github/workflows/deploy.yml` | Auto-deploy ke Cloudflare Pages |
| `.github/workflows/build-apk.yml` | Auto-build APK via Bubblewrap |
| `supabase/functions/send-push-notification/` | Edge Function kirim push |
| `supabase/functions/auto-cancel-pending/` | Edge Function auto-cancel BR-022 |

---

## 🚀 STEP-BY-STEP SETUP (100% Browser, Tanpa Terminal)

### LANGKAH 1: Siapkan Supabase

1. Buka [supabase.com](https://supabase.com) → Login/Register (gratis)
2. Klik "New Project" → Isi nama `kedai-raffa`
3. Tunggu project jadi (1-2 menit)
4. Buka **SQL Editor** (kiri sidebar)
5. Copy-paste isi file `99_kedai_raffa_FINAL_v1.5.0.sql` → Klik **Run**
6. Database siap! 🎉

### LANGKAH 2: Dapatkan API Keys

1. Di Supabase Dashboard → **Project Settings** (icon roda gigi)
2. Tab **API** → Copy:
   - `URL` → paste ke `index.html` bagian `supabaseUrl`
   - `anon public` key → paste ke `index.html` bagian `supabaseKey`
3. Tab **Edge Functions** → Enable (jika belum)

### LANGKAH 3: Generate VAPID Keys (Untuk Push Notification)

1. Buka [vapidkeys.com](https://vapidkeys.com) di browser HP/laptop
2. Klik **Generate**
3. Copy **Public Key** → paste ke `index.html` bagian `vapidPublicKey`
4. Copy **Private Key** → simpan untuk Langkah 5 (Edge Function)

### LANGKAH 4: Buat GitHub Repo

1. Buka [github.com/new](https://github.com/new)
2. Isi nama repo: `kedai-raffa-pos`
3. Pilih **Public** → Klik **Create repository**
4. Klik **"creating a new file"**
5. Buat file satu per satu (copy-paste dari file di atas):
   - `index.html`
   - `manifest.json`
   - `sw.js`
   - Buat folder `js/` lalu file-file di dalamnya
   - Buat folder `.github/workflows/` lalu file `.yml`
   - Buat folder `supabase/functions/...`
6. Klik **Commit changes** setiap file

### LANGKAH 5: Deploy Edge Functions (Supabase)

1. Di Supabase Dashboard → **Edge Functions** → **New Function**
2. Nama: `send-push-notification`
3. Copy-paste kode dari `supabase/functions/send-push-notification/index.ts`
4. Tambah **Secrets**:
   - `VAPID_PRIVATE_KEY` = private key dari Langkah 3
   - `VAPID_PUBLIC_KEY` = public key dari Langkah 3
5. Deploy
6. Ulangi untuk function `auto-cancel-pending`

### LANGKAH 6: Setup Cloudflare Pages

1. Buka [dash.cloudflare.com](https://dash.cloudflare.com) → Login/Register
2. Klik **Pages** → **Create a project** → **Connect to Git**
3. Pilih repo `kedai-raffa-pos`
4. Framework preset: **None**
5. Build command: *(kosongkan)*
6. Output directory: *(kosongkan)*
7. Klik **Save and Deploy**
8. Tunggu 1 menit → PWA live! 🚀

### LANGKAH 7: Update URL di Config

1. Copy URL Cloudflare Pages (contoh: `https://kedai-raffa-pos.pages.dev`)
2. Edit `index.html` → ganti `YOUR_PROJECT_ID` dengan ID Supabase Anda
3. Edit `twa-manifest.json` → ganti semua URL dengan URL Cloudflare Pages Anda
4. Commit changes → Deploy otomatis jalan

### LANGKAH 8: Build APK (Otomatis via GitHub Actions)

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
| **TOTAL** | | **$0** |

---

## 📝 CATATAN PENTING

1. **Ganti hash bcrypt** di seed data sebelum production
2. **Regenerate VAPID keys** untuk production (jangan pakai yang dari web tool)
3. **Auto-cancel pending** butuh Supabase Cron job atau schedule Edge Function
4. **Signing APK** saat ini unsigned. Untuk Play Store, butuh keystore (bisa via GitHub Actions juga)
5. **Icons** belum ada — buat folder `icons/` dan upload icon PNG 512x512, 192x192, 72x72

---

**Dibuat untuk KEDAI RAFFA v1.5.0** | Zero Cost | Zero Terminal | Full Native
