# 🕐 Setup Cron Job Auto-Cancel (BR-022)

> Auto cancel pesanan pending yang melebihi 10 menit
> Dijalankan setiap 5 menit via cron-job.org (GRATIS)

---

## URL Endpoint

```
https://obcijbiyxqrvrhlzqjqb.supabase.co/functions/v1/auto-cancel-pending
```

## Cara Setup (via HP Browser)

### 1. Buka cron-job.org
- Buka https://cron-job.org di browser HP
- Klik **"Sign Up"** → daftar dengan email (gratis)
- Verifikasi email

### 2. Buat Cron Job Baru
1. Login → Dashboard
2. Klik **"CREATE CRONJOB"** (tombol hijau)
3. Isi form:

| Field | Value |
|-------|-------|
| **Title** | `Kedai Raffa - Auto Cancel Pending` |
| **URL** | `https://obcijbiyxqrvrhlzqjqb.supabase.co/functions/v1/auto-cancel-pending` |
| **Schedule** | `Every 5 minutes` |
| **HTTP Method** | `POST` |

4. Expand **"Advanced"** (klik panah bawah)
5. Di bagian **Headers**, tambah:
   - Key: `Authorization`
   - Value: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9iY2lqYml5eHFydnJobHpxanFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU1MDczNjYsImV4cCI6MjEwMTA4MzM2Nn0.eowHPYIMTWqBjTxEivZAX7BtzrWkS-efw983g9aSryU`

6. Klik **"CREATE"**

### 3. Test Cron Job
1. Di dashboard cron-job.org, klik job yang baru dibuat
2. Klik **"RUN NOW"** (tombol play)
3. Cek status: harus **"Success (200)"**
4. Cek log: harus ada `"cancelled_count": 0` (atau angka lain kalau ada pending)

### 4. Verifikasi di Supabase
1. Buka Supabase Dashboard → **Logs** → **Edge Functions**
2. Cari log `auto-cancel-pending`
3. Pastikan ada log setiap 5 menit

---

## Troubleshooting

| Masalah | Solusi |
|---------|--------|
| 401 Unauthorized | Bearer token salah. Copy ulang dari anon key Supabase |
| 404 Not Found | Function belum deploy. Cek di Supabase Edge Functions |
| 500 Error | Cek log Supabase untuk detail error |
| Tidak jalan | Pastikan cron-job.org status "Active" (bukan "Paused") |

---

## Alternatif: Manual Trigger dari App

Kalau tidak mau pakai cron-job.org, app bisa panggil function ini saat:
- Kasir buka halaman monitoring
- Setiap kali transaksi baru dibuat
- Tombol "Cek Pending" di dashboard

Tapi cron lebih reliable karena jalan otomatis meski app tertutup.
