# 🚀 PANDUAN SETUP CLOUDFLARE PAGES + GITHUB SECRETS
# KEDAI RAFFA v1.5.0 — Zero Terminal (HP-Only)

> **Estimasi waktu:** 10-15 menit
> **Biaya:** $0 (gratis)
> **Perangkat:** HP Android/iOS dengan browser Chrome/Safari

---

## 📋 DAFTAR ISI

1. [Daftar Cloudflare (jika belum)](#step-1-daftar-cloudflare)
2. [Dapatkan Account ID](#step-2-dapatkan-account-id)
3. [Buat API Token](#step-3-buat-api-token)
4. [Setup GitHub Secrets](#step-4-setup-github-secrets)
5. [Buat Project Cloudflare Pages](#step-5-buat-project-cloudflare-pages)
6. [Deploy Pertama](#step-6-deploy-pertama)
7. [Update twa-manifest.json](#step-7-update-twa-manifestjson)
8. [Verifikasi & Troubleshooting](#step-8-verifikasi--troubleshooting)

---

## STEP 1: Daftar Cloudflare

**Jika sudah punya akun Cloudflare, skip ke Step 2.**

1. Buka browser HP → `https://dash.cloudflare.com/sign-up`
2. Masukkan **email** dan **password**
3. Klik **"Create Account"**
4. Verifikasi email (cek inbox/spam)
5. Login ke `https://dash.cloudflare.com`
6. Saat ditanya "Add a website", pilih **"Continue to dashboard"** (tidak perlu add domain)

---

## STEP 2: Dapatkan Account ID

Account ID dibutuhkan untuk GitHub Secret `CLOUDFLARE_ACCOUNT_ID`.

1. Login ke `https://dash.cloudflare.com`
2. Di **sidebar kiri**, scroll ke bawah
3. Lihat bagian bawah sidebar → ada tulisan:
   ```
   Account ID:
   abc123def456ghi789
   ```
4. **Tap & hold** → **Copy** Account ID tersebut
5. **Simpan di notes HP** (butuh nanti di Step 4)

> **Contoh format:** `1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p`

---

## STEP 3: Buat API Token

API Token dibutuhkan untuk GitHub Secret `CLOUDFLARE_API_TOKEN`.

### 3.1 Buka Halaman API Tokens

1. Di dashboard Cloudflare, tap **ikon profil** (kanan atas)
2. Pilih **"My Profile"**
3. Tab **"API Tokens"**
4. Klik **"Create Token"**

### 3.2 Pilih Template

1. Scroll ke bawah ke bagian **"Custom token"**
2. Klik **"Get started"**

### 3.3 Isi Form Token

| Field | Value |
|-------|-------|
| **Token name** | `GitHub Actions Deploy KEDAI RAFFA` |
| **Permissions** | Klik **"Add permission"** 2x |
| Permission 1 | `Zone` → `Read` |
| Permission 2 | `Page` → `Edit` |
| **Account Resources** | `Include` → Pilih akun Anda |
| **Zone Resources** | `Include` → `All zones` |

### 3.4 Create Token

1. Scroll ke bawah → Klik **"Continue to summary"**
2. Klik **"Create Token"**
3. **COPY TOKEN SEKARANG** (hanya ditampilkan 1x!)
4. **Simpan di notes HP** bersama Account ID

> ⚠️ **PENTING:** Token hanya ditampilkan sekali. Jika hilang, buat token baru.

---

## STEP 4: Setup GitHub Secrets

### 4.1 Buka Repo Settings

1. Buka browser HP → `https://github.com/USERNAME/kedai-raffa-pos`
2. (Ganti `USERNAME` dengan username GitHub Anda)
3. Tap tab **"Settings"** (ikon gear, di sebelah tab Insights)
4. Di sidebar kiri, scroll ke bawah → tap **"Secrets and variables"** → **"Actions"**

### 4.2 Tambah Secret 1: CLOUDFLARE_API_TOKEN

1. Klik **"New repository secret"** (tombol hijau)
2. **Name:** `CLOUDFLARE_API_TOKEN`
3. **Secret:** Paste token dari Step 3
4. Klik **"Add secret"**

### 4.3 Tambah Secret 2: CLOUDFLARE_ACCOUNT_ID

1. Klik **"New repository secret"** lagi
2. **Name:** `CLOUDFLARE_ACCOUNT_ID`
3. **Secret:** Paste Account ID dari Step 2
4. Klik **"Add secret"**

### 4.4 Verifikasi

Di halaman Secrets, harus ada 2 secret:
- ✅ `CLOUDFLARE_API_TOKEN`
- ✅ `CLOUDFLARE_ACCOUNT_ID`

---

## STEP 5: Buat Project Cloudflare Pages

### 5.1 Buka Pages Dashboard

1. Di Cloudflare dashboard, sidebar kiri → tap **"Pages"**
2. Klik **"Create a project"**
3. Klik **"Connect to Git"**

### 5.2 Connect GitHub

1. Klik **"Connect GitHub"**
2. Akan muncul popup autorisasi GitHub
3. Tap **"Authorize Cloudflare"**
4. Pilih akun GitHub Anda
5. Cari dan pilih repo **`kedai-raffa-pos`**
6. Klik **"Begin setup"**

### 5.3 Build Settings

Isi form seperti ini:

| Field | Value |
|-------|-------|
| **Project name** | `kedai-raffa-pos` (bisa diganti) |
| **Production branch** | `main` |
| **Framework preset** | `None` |
| **Build command** | *(kosongkan / biarkan kosong)* |
| **Build output directory** | `public` |

> ⚠️ **PENTING:** Build output directory WAJIB `public` karena file HTML/asset ada di folder `public/`.

### 5.4 Save and Deploy

1. Klik **"Save and Deploy"**
2. Tunggu 30-60 detik
3. Jika sukses, akan muncul:
   ```
   🎉 Your site was deployed!
   https://kedai-raffa-pos.pages.dev
   ```
4. **COPY URL INI** → Simpan di notes HP

---

## STEP 6: Deploy Pertama (Via GitHub Actions)

Setelah Cloudflare Pages terhubung, setiap push ke branch `main` akan auto-deploy. Tapi untuk deploy pertama, kita trigger manual.

### 6.1 Trigger Deploy Manual

1. Buka repo GitHub → tab **"Actions"**
2. Klik workflow **"Deploy to Cloudflare Pages"**
3. Klik **"Run workflow"** (dropdown)
4. Pilih branch `main`
5. Klik **"Run workflow"**
6. Tunggu 1-2 menit
7. Refresh halaman Actions → klik run terbaru
8. Harusnya ada ✅ hijau

### 6.2 Atau: Push Commit Baru

Cara alternatif (lebih natural):
1. Edit file apa saja di repo (misal: `README.md`)
2. Tambah 1 baris kosong di bawah
3. Commit dengan message: `chore: trigger deploy`
4. Actions akan jalan otomatis

---

## STEP 7: Update twa-manifest.json

Setelah dapat URL Cloudflare Pages, update file `twa-manifest.json`.

### 7.1 Edit di GitHub

1. Buka repo GitHub → cari file `twa-manifest.json`
2. Klik file → klik **ikon pensil** (✏️ Edit)
3. Ganti SEMUA kemunculan:
   ```
   kedai-raffa-pos.pages.dev
   ```
   Menjadi URL asli Anda, contoh:
   ```
   kedai-raffa-pos.pages.dev
   ```

### 7.2 Contoh Perubahan

**Sebelum:**
```json
{
  "host": "kedai-raffa-pos.pages.dev",
  "iconUrl": "https://kedai-raffa-pos.pages.dev/icons/icon-512x512.png",
  "webManifestUrl": "https://kedai-raffa-pos.pages.dev/manifest.json",
  "fullScopeUrl": "https://kedai-raffa-pos.pages.dev/"
}
```

**Sesudah:**
```json
{
  "host": "kedai-raffa-pos.pages.dev",
  "iconUrl": "https://kedai-raffa-pos.pages.dev/icons/icon-512x512.png",
  "webManifestUrl": "https://kedai-raffa-pos.pages.dev/manifest.json",
  "fullScopeUrl": "https://kedai-raffa-pos.pages.dev/"
}
```

### 7.3 Commit

1. Scroll ke bawah → isi commit message:
   ```
   chore: update cloudflare pages url
   ```
2. Klik **"Commit changes"**
3. Actions deploy akan jalan otomatis

---

## STEP 8: Verifikasi & Troubleshooting

### 8.1 Cek Deploy Status

1. Buka URL: `https://kedai-raffa-pos.pages.dev` (ganti dengan URL Anda)
2. Harusnya muncul halaman login KEDAI RAFFA
3. Jika muncul error 404, tunggu 1-2 menit lalu refresh

### 8.2 Cek di Cloudflare Pages

1. Dashboard Cloudflare → Pages → `kedai-raffa-pos`
2. Tab **"Deployments"**
3. Harusnya ada deployment hijau ✅
4. Klik deployment → **"Visit site"**

### 8.3 Troubleshooting

| Masalah | Penyebab | Solusi |
|---------|----------|--------|
| **Build failed** | Output directory salah | Pastikan `public`, bukan `/public` atau `./public` |
| **404 Not Found** | File tidak ter-upload | Cek apakah `index.html` ada di folder `public/` |
| **Actions failed** | Secret salah | Cek ulang `CLOUDFLARE_API_TOKEN` dan `CLOUDFLARE_ACCOUNT_ID` |
| **Token invalid** | Token expired/salah | Buat token baru di Cloudflare |
| **No repo found** | Repo belum di-upload | Pastikan repo `kedai-raffa-pos` sudah ada di GitHub |
| **CSS tidak load** | Path icon/asset salah | Cek `manifest.json` dan `index.html` path relatif |

### 8.4 Cek Log GitHub Actions

Jika Actions gagal:
1. GitHub repo → tab **Actions**
2. Klik workflow run yang merah ❌
3. Klik job **"deploy"**
4. Baca log error (scroll ke bawah)
5. Biasanya errornya jelas: token salah, repo tidak ditemukan, dll.

---

## ✅ CHECKLIST SETUP SELESAI

- [ ] Akun Cloudflare dibuat
- [ ] Account ID dicopy
- [ ] API Token dibuat & dicopy
- [ ] GitHub Secret `CLOUDFLARE_API_TOKEN` ditambah
- [ ] GitHub Secret `CLOUDFLARE_ACCOUNT_ID` ditambah
- [ ] Project Cloudflare Pages dibuat
- [ ] Repo GitHub terhubung ke Pages
- [ ] Build output directory = `public`
- [ ] Deploy pertama sukses ✅
- [ ] URL Pages dicopy
- [ ] `twa-manifest.json` di-update dengan URL asli
- [ ] Commit & deploy ulang
- [ ] Buka URL → halaman login muncul

---

## 🔗 URL PENTING

| Platform | URL |
|----------|-----|
| Cloudflare Dashboard | `https://dash.cloudflare.com` |
| GitHub Repo | `https://github.com/USERNAME/kedai-raffa-pos` |
| GitHub Actions | `https://github.com/USERNAME/kedai-raffa-pos/actions` |
| Cloudflare Pages | `https://dash.cloudflare.com/ACCOUNT_ID/pages` |
| PWA Live | `https://kedai-raffa-pos.pages.dev` (ganti dengan URL Anda) |

---

## 🎯 LANGKAH BERIKUTNYA

Setelah setup Cloudflare + GitHub Secrets selesai:

1. **Setup cron-job.org** → Ikuti `CRON_SETUP.md`
2. **Buat bucket `bukti-qris`** di Supabase Storage
3. **Test login** di PWA live
4. **Build APK** via GitHub Actions
5. **Test end-to-end** (buka gerai → transaksi → audit tutup)

---

**Dibuat untuk KEDAI RAFFA v1.5.0** | Zero Cost | Zero Terminal
