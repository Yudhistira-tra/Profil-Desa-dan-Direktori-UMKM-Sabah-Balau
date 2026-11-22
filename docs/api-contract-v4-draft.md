# Kontrak API — Profil Desa & Direktori UMKM

Dokumen ini menjelaskan bentuk data yang dibutuhkan frontend dan cara
data mengalir. **Keputusan 13 November 2026: tidak ada backend dan tidak
ada halaman admin.** Database-nya adalah satu Google Sheet milik desa:

- Formulir pendaftaran menulis ke Sheet lewat Google Apps Script.
- Website membaca Sheet versi publik (hanya baris `status = aktif`).
- Sekdes/staff desa mengelola data langsung di Sheet (review pendaftaran,
  edit, nonaktifkan).

Backend "bebas menentukan cara menyimpan" tetap berlaku — di sini peran
backend dipegang Google Sheet + Apps Script, selama bentuk respons sesuai
kesepakatan di bawah.

## Aturan umum

- Sumber data GET: Google Sheet yang dipublikasikan, dibaca frontend
  melalui satu environment variable `VITE_UMKM_DATA_URL`. Saat
  development, `src/api/umkm.js` masih memakai mock data lokal.
- Target submit form: Google Apps Script web app, URL disimpan sebagai
  `VITE_DAFTAR_UMKM_URL`. Request dikirim sebagai JSON biasa
  (`Content-Type: application/json`).
- Semua respons sukses dibungkus `{ "data": ... }`.
- Semua respons error berbentuk `{ "message": "..." }`
  (khusus validasi ditambah `"errors"`).
- Autentikasi: tidak ada, dan tidak direncanakan — mengelola data dilakukan
  langsung di Google Sheet oleh staff desa, bukan lewat UI web.
- Identitas UMKM memakai `slug` di URL, bukan `id`.
- **Kategori UMKM dihapus total** (keputusan desain, 5 November 2026):
  tidak ada field `category` dan tidak ada badge kategori di kartu.

## 1. GET /api/umkm

Daftar semua UMKM yang sudah disetujui (`status = aktif` di Sheet).
Tanpa query param. Pencarian dilakukan di sisi frontend (nama dan deskripsi).
Pagination dilakukan di frontend: 8 kartu per halaman.
Urutan daftar mengikuti urutan baris di Sheet — staff desa yang mengatur
(dianjurkan nama A–Z).

Respons `200`:

```json
{
  "data": [
    {
      "id": 1,
      "slug": "kopi-sabah-balau",
      "name": "Kopi Sabah Balau",
      "owner": "Ibu Sari",
      "ownerSince": 2012,
      "address": "Jl. Raya Sabah Balau, Dusun 1",
      "mapsUrl": "https://maps.app.goo.gl/xxxx",
      "whatsapp": "6281234567890",
      "priceMin": 5000,
      "openingHours": "Setiap hari, 08.00–22.00 WIB",
      "description": "Kopi robusta hasil kebun warga, digiling manual.",
      "images": [
        "https://lh3.googleusercontent.com/d/1AbCdEfGhIjKlMnOpQrSt=w800",
        "https://lh3.googleusercontent.com/d/1UvWxYzAbCdEfGhIjKlMn=w800"
      ],
      "products": [
        {
          "name": "Kopi Bubuk 250 gram",
          "description": "Robusta giling halus",
          "price": 15000
        }
      ]
    }
  ]
}
```

## 2. GET /api/umkm/:slug

Detail satu UMKM. Bentuk objek sama dengan item pada daftar.

Respons `200`: `{ "data": { ...satu objek UMKM... } }`

Respons `404`:

```json
{ "message": "UMKM tidak ditemukan" }
```

## 3. POST pendaftaran UMKM (Google Apps Script)

Diputuskan 13 November 2026: tidak ada endpoint backend. Formulir Daftar
UMKM mengirim JSON ke web app Google Apps Script (`VITE_DAFTAR_UMKM_URL`)
yang menulis satu baris baru ke Sheet dengan `status = pending`.

**Formulir tidak menerima upload foto.** Foto dikumpulkan kemudian:
staff menghubungi pemilik lewat WhatsApp, foto diunggah staff ke Google
Drive, dan link foto ditaruh di kolom `images` di Sheet.

Request: JSON (`application/json`)

| Field | Tipe | Wajib | Catatan |
|---|---|---|---|
| `name` | string | ya | nama usaha, maks 100 karakter |
| `owner` | string | ya | nama pemilik |
| `address` | string | ya | alamat/dusun |
| `whatsapp` | string | ya | angka saja, diawali `62` |
| `description` | string | ya | maks 500 karakter |
| `priceMin` | integer | tidak | harga mulai |
| `openingHours` | string | tidak | jam buka |
| `consent` | boolean | ya | pemilik setuju datanya dipublikasikan |

Respons sukses (200):

```json
{ "data": { "message": "Pendaftaran diterima dan akan diverifikasi." } }
```

Pendaftaran **tidak langsung tampil** di direktori. Staff desa meninjau
baru `pending` di Sheet lalu mengubah `status` menjadi `aktif`. Produk
unggulan dan foto dilengkapi staff di Sheet (bukan lewat form).

Validasi utama tetap dilakukan di frontend (required, format `whatsapp`,
panjang maksimal); Apps Script menerima apa adanya.

## 4. GET /api/profil

Isi halaman Profil Desa. Sumber data: Sheet/file konten terpisah yang sama
dipublikasikan dan dibaca frontend (detail deployment menyusul). Struktur di
bawah adalah usulan; sesuaikan dengan konten yang akhirnya dikumpulkan.
Bagian yang belum ada boleh `null`.

Respons `200`:

```json
{
  "data": {
    "sejarah": "Desa Sabah Balau ...",
    "visi": "Mewujudkan desa ...",
    "misi": ["Meningkatkan ...", "Mengembangkan ..."],
    "struktur": [
      { "name": "Nama Kepala Desa", "position": "Kepala Desa", "photoUrl": null }
    ],
    "geografis": {
      "luas": "12,5 km2",
      "batasUtara": "...",
      "batasSelatan": "...",
      "batasTimur": "...",
      "batasBarat": "..."
    },
    "demografi": { "jumlahPenduduk": 5200, "jumlahKK": 1400 },
    "kontak": {
      "alamat": "...",
      "telepon": "...",
      "email": "...",
      "jamLayanan": "Senin–Jumat, 08.00–15.00"
    }
  }
}
```

## 5. Definisi field UMKM

| Field | Tipe | Wajib | Catatan |
|---|---|---|---|
| `id` | integer | ya | identitas internal, tidak dipakai di URL |
| `slug` | string | ya | unik, huruf kecil, tanda hubung (`kopi-sabah-balau`). Dibuat saat pendaftaran oleh Apps Script dari `name` |
| `name` | string | ya | maks 100 karakter |
| `owner` | string | ya | nama pemilik/pengelola |
| `ownerSince` | integer \| null | tidak | tahun mulai usaha, untuk teks "Sejak 2012" |
| `address` | string | ya | alamat lengkap yang ditampilkan |
| `mapsUrl` | string \| null | tidak | link Google Maps. `null` = alamat tidak bisa diklik |
| `whatsapp` | string | ya | angka saja, diawali `62`, tanpa `+`, spasi, atau tanda hubung |
| `priceMin` | integer \| null | tidak | harga mulai, dipakai di kartu dan detail |
| `openingHours` | string \| null | tidak | contoh: `Setiap hari, 08.00–22.00 WIB` |
| `description` | string | ya | maks 500 karakter |
| `images` | string[] | tidak | 0–5 URL absolut. Item pertama = foto utama kartu |
| `products` | object[] | tidak | 0–3 produk unggulan: `{ name, description, price }` |

Catatan frontend:

- `whatsapp` dipakai untuk membuat link `https://wa.me/<nomor>`.
- Kartu menampilkan `images[0]`; jika `images` kosong, tampilkan placeholder.
- Detail menampilkan galeri `images`, daftar `products`, `address` yang bisa
  diklik ke `mapsUrl`, dan `priceMin` sebagai "Harga Mulai".
- Harga diformat `Intl.NumberFormat('id-ID')` → `Rp 15.000`.
- Tombol "Bagikan" memakai Web Share API; tidak perlu field baru.

## 6. Gambar

- URL foto produksi mengarah ke **Google Drive** milik desa, format link
  langsung: `https://lh3.googleusercontent.com/d/<FILE_ID>=w800`
  (staff mengatur "anyone with the link can view" saat mengunggah).
- Placeholder data di `src/data/umkm.js` memakai path lokal
  (`/images/...`); ini hanya untuk development.
- Jika `images` kosong, UI menampilkan placeholder bawaan
  `/images/placeholder-umkm.svg` (dibuat FE A), bukan kotak kosong.

## 7. Status & error

| Kode | Arti |
|---|---|
| 200 | OK (termasuk POST pendaftaran ke Apps Script) |
| 404 | UMKM/slug tidak ditemukan |

Tidak ada kode 201/422: pendaftaran diterima apa adanya oleh Apps Script
(validasi di frontend), lalu diverifikasi manual staff di Sheet.

## 8. Keputusan terbuka

- [x] Target submit Daftar UMKM → **Google Apps Script ke Google Sheet**
      (13 November 2026). Tidak ada backend, tidak ada halaman admin.
- [x] Siapa menyetujui pendaftaran → sekdes/staff desa, lewat kolom
      `status` di Sheet.
- [x] Foto → tidak lewat form; owner kirim via WhatsApp, staff unggah ke
      Google Drive dan paste link ke Sheet.
- [ ] Sheet produksi: siapa pemiliknya (akun Google desa) dan deployment
      Apps Script web app + publikasi Sheet
- [ ] Desain halaman Daftar UMKM dan layout mobile (belum ada)
- [ ] Struktur kolom Sheet (nama kolom harus selaras dengan kontrak ini)

## 9. Changelog

| Versi | Tanggal | Perubahan |
|---|---|---|
| 0 | 2026-11-03 | Draft awal dari kebutuhan frontend |
| 1 | 2026-11-04 | Tambah harga, perilaku kartu/pencarian/pagination |
| 2 | 2026-11-05 | Hapus kategori total; tambah field detail: `images`, `products`, `priceMin`/`priceMax`, `saleType`, `ownerSince`, `address`, `mapsUrl`, `openingHours` |
| 3 | 2026-11-05 | Hapus `priceMax` dan `saleType` dari desain |
| 4 | 2026-11-13 | Backend dihapus: Sheet + Apps Script sebagai database dan "admin"; POST pendaftaran final; foto via WhatsApp + Google Drive; placeholder SVG saat `images` kosong |
