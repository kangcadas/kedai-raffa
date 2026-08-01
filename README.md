# LOGIN NUMERIK v1.5.0 — Tanpa Bcrypt, Tanpa Edge Function

## Perubahan Total
| Sebelum | Sesudah |
|---------|---------|
| Hash bcrypt di database | Angka plaintext (123456, 654321) |
| Edge Function `login` verify bcrypt | RPC PostgreSQL `login_by_code` |
| Frontend panggil Edge Function | Frontend panggil `supabase.rpc('login_by_code', ...)` |

## Kode Akses Default
| Peran | Nama | Kode |
|-------|------|------|
| Owner | Endro | `123456` |
| Kasir | Gilang | `654321` |

## Langkah Deploy

### 1. Jalankan SQL Patch
Supabase Dashboard → SQL Editor → New query → copy-paste `RESET-LOGIN-NUMERIK.sql` → **Run**

Hasil yang benar:
```
 nama  |  role  | kode_numerik
-------+--------+--------------
 Endro | owner  | 123456
 Gilang| kasir  | 654321
```

### 2. Upload index.html
GitHub repo → `public/index.html` → Edit → hapus isi lama → paste file dari ZIP ini → Commit

### 3. Test Login
Buka URL PWA → masukkan kode:
- Tab **Kasir** → `654321` → Enter
- Tab **Owner** → `123456` → Enter

## Keunggulan
- ✅ Tidak perlu Edge Function `login`
- ✅ Tidak perlu bcrypt
- ✅ Tidak perlu secret SB_URL / SERVICE_ROLE_KEY untuk login
- ✅ Cepat & tidak crash
- ✅ Bisa ganti kode akses langsung di database (tabel users)

## Cara Ganti Kode Akses
Supabase → SQL Editor:
```sql
UPDATE users SET kode_akses = '999999' WHERE nama = 'Endro';
UPDATE users SET kode_akses = '888888' WHERE nama = 'Gilang';
```

## Keamanan
⚠️ Kode akses disimpan sebagai **plaintext** di database. Ini sengaja untuk simpel & zero-maintenance. Kalau butuh keamanan lebih tinggi nanti, bisa upgrade ke bcrypt lagi.
