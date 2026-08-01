# 📱 PANDUAN UPLOAD REPO KE GITHUB (HP-Only)

> Zero Terminal — 100% via Browser HP

---

## STEP 1: Buat Repo Baru di GitHub

1. Buka browser HP → `https://github.com/new`
2. **Repository name**: `kedai-raffa-pos`
3. Pilih **Public** ✅
4. Klik **Create repository**

---

## STEP 2: Upload File Satu per Satu

**Catatan**: GitHub web interface hanya bisa upload 1 file/folder per kali commit. Jadi upload per folder.

### A. Upload Folder `public/`

1. Di repo GitHub → klik **"creating a new file"**
2. Di kolom nama file, ketik: `public/.gitkeep`
3. Isi file: kosong (spasi saja)
4. Klik **Commit new file**
5. Sekarang folder `public/` sudah ada

### B. Upload `index.html`

1. Buka folder `public/` di GitHub
2. Klik **"Add file"** → **"Create new file"**
3. Nama file: `index.html`
4. **Copy SELURUH isi file** `index.html` (120 KB) → Paste ke editor
5. Klik **Commit changes**

### C. Upload `manifest.json`

1. Masih di folder `public/`
2. **Add file** → **Create new file**
3. Nama: `manifest.json`
4. Copy-paste isi file
5. Commit

### D. Upload `sw.js`

1. Sama seperti di atas
2. Nama: `sw.js`
3. Copy-paste → Commit

### E. Upload Gambar Asset

1. Masih di folder `public/`
2. **Add file** → **Upload files**
3. Upload file-file ini (bisa multi-select):
   - `splash.png`
   - `logo-brand.png`
   - `maskot.png`
   - `favicon.png`
4. Klik **Commit changes**

### F. Upload Folder `icons/`

1. Di folder `public/` → **Add file** → **Upload files**
2. Upload SEMUA file di folder `icons/`:
   - `icon-72x72.png`
   - `icon-96x96.png`
   - `icon-128x128.png`
   - `icon-144x144.png`
   - `icon-152x152.png`
   - `icon-192x192.png`
   - `icon-384x384.png`
   - `icon-512x512.png`
3. Klik **Commit changes**

### G. Upload Folder `src/js/`

1. Buat folder: `public/src/js/`
2. Upload file-file JS:
   - `config.js`
   - `supabase-client.js`
   - `bluetooth-printer.js`
   - `push-notification.js`
   - `app.js`
3. Commit

### H. Upload Root Files

1. Kembali ke root repo (klik nama repo di atas)
2. Upload file-file ini satu per satu:
   - `twa-manifest.json`
   - `README.md`
   - `CRON_SETUP.md`
   - `.gitignore`
3. Commit masing-masing

### I. Upload Workflows

1. Buat folder: `.github/workflows/`
2. Upload:
   - `deploy.yml`
   - `build-apk.yml`
3. Commit

### J. Upload Edge Functions

1. Buat folder: `supabase/functions/auto-cancel-pending/`
2. Upload: `index.ts`
3. Buat folder: `supabase/functions/send-push-notification/`
4. Upload: `index.ts`
5. Commit

---

## STEP 3: Verifikasi Struktur Repo

Setelah semua file di-upload, struktur repo harus seperti ini:

```
kedai-raffa-pos/
├── .github/
│   └── workflows/
│       ├── deploy.yml
│       └── build-apk.yml
├── public/
│   ├── index.html
│   ├── manifest.json
│   ├── sw.js
│   ├── splash.png
│   ├── logo-brand.png
│   ├── maskot.png
│   ├── favicon.png
│   ├── icons/
│   │   ├── icon-72x72.png
│   │   ├── icon-96x96.png
│   │   ├── icon-128x128.png
│   │   ├── icon-144x144.png
│   │   ├── icon-152x152.png
│   │   ├── icon-192x192.png
│   │   ├── icon-384x384.png
│   │   └── icon-512x512.png
│   └── src/
│       └── js/
│           ├── config.js
│           ├── supabase-client.js
│           ├── bluetooth-printer.js
│           ├── push-notification.js
│           └── app.js
├── supabase/
│   └── functions/
│       ├── auto-cancel-pending/
│       │   └── index.ts
│       └── send-push-notification/
│           └── index.ts
├── twa-manifest.json
├── README.md
├── CRON_SETUP.md
└── .gitignore
```

---

## STEP 4: Setup Cloudflare Pages

1. Buka `https://dash.cloudflare.com` → Login/Register
2. Klik **Pages** → **Create a project** → **Connect to Git**
3. Pilih repo `kedai-raffa-pos`
4. **Framework preset**: `None`
5. **Build command**: *(kosongkan)*
6. **Output directory**: `public`
7. Klik **Save and Deploy**
8. Tunggu 1 menit → PWA live!
9. **Copy URL Cloudflare Pages** (contoh: `https://kedai-raffa-pos.pages.dev`)

---

## STEP 5: Update `twa-manifest.json`

1. Di GitHub repo → edit `twa-manifest.json`
2. Ganti semua `YOUR-CLOUDFLARE-PAGES-URL.pages.dev` dengan URL asli Anda
3. Commit changes → Deploy otomatis jalan

---

## STEP 6: Setup GitHub Secrets

1. Di GitHub repo → tab **Settings** → **Secrets and variables** → **Actions**
2. Klik **New repository secret**:
   - `CLOUDFLARE_API_TOKEN` → dari Cloudflare (My Profile → API Tokens → Create Token)
   - `CLOUDFLARE_ACCOUNT_ID` → dari Cloudflare dashboard sidebar
3. Klik **Add secret**

---

## STEP 7: Build APK

1. Di GitHub repo → tab **Actions**
2. Klik workflow **"Build APK (TWA) via Bubblewrap"**
3. Klik **Run workflow** → **Run workflow**
4. Tunggu 3-5 menit
5. Kembali ke tab **Actions** → klik run terbaru
6. Scroll ke bawah → bagian **Artifacts** → Klik `kedai-raffa-apk`
7. APK siap di-download!

---

## ⚠️ CATATAN PENTING

| Item | Status | Arahan |
|------|--------|--------|
| **VAPID Private Key** | 🔒 Jangan di-commit | Simpan di GitHub Secret saja |
| **Hash bcrypt** | ⚠️ Masih placeholder | Ganti sebelum production |
| **Cloudflare URL** | ⏳ Perlu update | Ganti di `twa-manifest.json` |
| **Cron auto-cancel** | ⏳ Setup manual | Ikuti `CRON_SETUP.md` |
| **Storage bucket** | ⚠️ Buat manual | Di Supabase Storage → bucket `bukti-qris` |

---

**Selamat! Repo KEDAI RAFFA v1.5.0 siap digunakan.** 🎉
