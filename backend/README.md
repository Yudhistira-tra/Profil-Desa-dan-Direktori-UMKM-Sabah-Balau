# Backend — Profil Desa & Direktori UMKM Sabah Balau

API untuk frontend di `frontend/`, mengikuti `docs/api-contract.md` (v4).

- **Tanpa paket tambahan.** Hanya memakai fitur bawaan Node.js (server HTTP dan SQLite bawaan),
  jadi **tidak perlu `npm install`**.
- Butuh **Node.js 22.13 atau lebih baru** (cek dengan `node -v`).
- Database: SQLite di `data/umkm.db` (dibuat otomatis). Foto: `storage/umkm/`.

## Menjalankan

```bash
cd backend
copy .env.example .env      # sekali saja; lalu isi ADMIN_PASSWORD (minimal 8 karakter)
npm run seed:reset          # isi data contoh (sama dengan data contoh frontend) + 2 pendaftaran pending
npm run dev                 # http://localhost:8000/api
```

Frontend (terminal lain): `cd frontend`, lalu `npm run dev` (http://localhost:5173).
Frontend otomatis memanggil `http://localhost:8000/api`. Untuk alamat lain, buat
`frontend/.env.local` berisi `VITE_API_URL=https://alamat-backend/api`.

Bila backend tidak dijalankan saat development, frontend otomatis memakai data contoh
(lihat `frontend/src/api/http.js`), jadi halaman tetap bisa dibuka.

## Endpoint

| Method | URL | Keterangan |
|---|---|---|
| GET | `/api/umkm` | Daftar UMKM berstatus **aktif**, urut nama A–Z |
| GET | `/api/umkm/:slug` | Detail satu UMKM; `404 { "message": "UMKM tidak ditemukan" }` |
| POST | `/api/umkm` | Pendaftaran (`multipart/form-data`), disimpan berstatus `pending` |
| GET | `/api/profil` | Isi Profil Desa (dari `content/profil.json`) |
| POST | `/api/login` | Login admin `{ username, password }` → `{ data: { name, token } }` + cookie HttpOnly |
| POST | `/api/logout` | Menghapus cookie sesi |
| GET | `/api/admin/pendaftaran` | **Admin**: antrean pendaftaran `pending`, terbaru dulu |
| GET | `/api/admin/umkm?status=` | **Admin**: semua UMKM (`pending`, `aktif`, `ditolak`) |
| GET | `/api/admin/umkm/:id` | **Admin**: satu UMKM untuk halaman edit |
| PATCH | `/api/admin/umkm/:id` atau `/api/umkm/:slug` | **Admin**: setujui/tolak/lengkapi data |
| DELETE | `/api/admin/umkm/:id` | **Admin**: hapus UMKM beserta fotonya |
| GET | `/storage/umkm/<file>` | Foto UMKM |

Format: sukses `{ "data": ... }`, error `{ "message": "..." }`, validasi `422` dengan `errors`.
Status lain: `401` belum login, `413` data terlalu besar, `415` format kiriman salah, `429` terlalu banyak permintaan.

Endpoint admin memakai header `Authorization: Bearer <token dari login>` (atau cookie sesi). Sesi berlaku 8 jam.

### PATCH (admin)

Body JSON berisi field yang diubah saja, misalnya `{ "status": "aktif" }`. Untuk menambah foto, kirim
`multipart/form-data`: field `data` (JSON) + field `photos` (file, boleh diulang).

| Field | Catatan |
|---|---|
| `status` | `pending`, `aktif` (tampil di direktori), atau `ditolak` |
| `mapsUrl` | hanya link Google Maps |
| `products` | maks 3: `{ name, description, price }` |
| `images` | daftar URL foto lama yang **dipertahankan**; yang tidak tercantum dihapus |
| field lain | `name`, `owner`, `ownerSince`, `address`, `whatsapp`, `description`, `priceMin`, `openingHours` |

Slug tidak berubah walau nama diedit, supaya tautan lama tetap berlaku.

## Admin lewat terminal (cadangan)

```bash
npm run admin -- daftar pending
npm run admin -- setujui <slug>
npm run admin -- tolak <slug>
npm run admin -- hapus <slug>
```

## Mengisi Profil Desa

Edit `content/profil.json`. Bagian yang belum ada datanya biarkan `null`. Perubahan langsung terbaca.

## Uji otomatis

```bash
npm run seed:reset
npm start                   # terminal 1
npm test                    # terminal 2 — 35 uji kontrak & keamanan
```

`ADMIN_PASSWORD` di `.env` harus terisi agar uji admin berjalan. Data uji dihapus otomatis.
Bila dijalankan berkali-kali, sebagian uji pendaftaran "dilewati" karena pembatas anti-spam;
jalankan ulang server untuk mereset hitungannya.

## Keamanan

- Hanya UMKM `aktif` yang tampil; pendaftaran baru selalu `pending`.
- Foto diperiksa dari **isi file**, nama file diacak, maks 5 × 5 MB.
- `mapsUrl` hanya menerima link Google Maps, juga saat diisi admin.
- Anti-spam: maks 5 pendaftaran berhasil dan 30 percobaan per IP per jam; 300 permintaan/menit per IP.
- Login admin: maks 10 percobaan gagal per IP per 15 menit; kata sandi dibandingkan waktu-konstan;
  token sesi bertanda tangan (HMAC) dan gugur otomatis bila kata sandi diganti.
- CORS hanya untuk origin di `CORS_ORIGINS`. Semua query database memakai parameter.
- Persetujuan pemilik (`consent`) wajib dan waktunya dicatat.

## Saat deploy

- `PUBLIC_URL` = alamat https backend. `CORS_ORIGINS` = domain frontend. `TRUST_PROXY=1` bila di belakang proxy.
- Ganti `ADMIN_PASSWORD` dengan kata sandi kuat. Cadangkan `data/` dan `storage/` secara rutin.
