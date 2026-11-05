# Kontrak API — Profil Desa & Direktori UMKM

Versi 3, 5 November 2026. Pemilik dokumen: FE B.
Status: **belum dikonfirmasi backend.** Setelah backend setuju (atau minta
revisi), perbarui file ini dan catat di bagian Changelog.

Dokumen ini menjelaskan bentuk data yang dibutuhkan frontend. Backend bebas
menentukan cara menyimpan, selama bentuk respons sesuai kesepakatan di sini.

## Aturan umum

- Base URL saat development: `http://localhost:8000/api` (sesuaikan nanti).
  Di frontend disimpan sebagai `VITE_API_URL`, tidak pernah di-hardcode.
- Format: JSON (`Content-Type: application/json`), kecuali upload foto
  memakai `multipart/form-data`.
- Semua respons sukses dibungkus `{ "data": ... }`.
- Semua respons error berbentuk `{ "message": "..." }`
  (khusus validasi ditambah `"errors"`).
- Autentikasi: belum ada. Semua endpoint publik.
- CORS: harus mengizinkan `http://localhost:5173` dan domain produksi nanti.
- Identitas UMKM memakai `slug` di URL, bukan `id`.
- **Kategori UMKM dihapus total** (keputusan desain, 5 November 2026):
  tidak ada field `category` dan tidak ada badge kategori di kartu.

## 1. GET /api/umkm

Daftar semua UMKM yang sudah disetujui, urut nama A–Z.
Tanpa query param. Pencarian dilakukan di sisi frontend (nama dan deskripsi).
Pagination dilakukan di frontend: 8 kartu per halaman.

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
        "https://api.example.com/storage/umkm/kopi-sabah-balau-1.jpg",
        "https://api.example.com/storage/umkm/kopi-sabah-balau-2.jpg"
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

## 3. POST /api/umkm — pendaftaran UMKM (belum final)

Halaman Daftar UMKM membutuhkan endpoint ini **hanya jika** target submit
diputuskan memakai backend. Jika memakai Google Form, endpoint ini dihapus
dari kontrak. Desain halaman form belum ada, jadi daftar field masih usulan.

Request: `multipart/form-data`

| Field | Tipe | Wajib | Catatan |
|---|---|---|---|
| `name` | string | ya | nama usaha, maks 100 karakter |
| `owner` | string | ya | nama pemilik |
| `address` | string | ya | alamat/dusun |
| `whatsapp` | string | ya | angka saja, diawali `62` |
| `description` | string | ya | maks 500 karakter |
| `priceMin` | integer | tidak | harga mulai |
| `openingHours` | string | tidak | jam buka |
| `photos` | file[] | tidak | maks 5 file, jpg/png/webp, masing-masing maks 5 MB |
| `consent` | boolean | ya | pemilik setuju datanya dipublikasikan |

Respons `201`:

```json
{ "data": { "id": 12, "slug": "warung-bu-ani", "status": "pending" } }
```

Pendaftaran **tidak langsung tampil** di direktori. Backend menyimpan dengan
status `pending` dan admin desa menyetujui secara manual (belum ada UI admin
di versi ini).

Respons `422` (validasi):

```json
{
  "message": "Data tidak valid",
  "errors": {
    "whatsapp": ["Nomor WhatsApp harus diawali 62"],
    "photos": ["Maksimal 5 foto"]
  }
}
```

## 4. GET /api/profil

Isi halaman Profil Desa. Struktur di bawah adalah usulan; sesuaikan dengan
konten yang akhirnya dikumpulkan. Bagian yang belum ada boleh `null`.

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
| `slug` | string | ya | unik, huruf kecil, tanda hubung (`kopi-sabah-balau`). Dibuat backend dari `name` |
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

- Respons API mengembalikan **URL absolut** (lengkap dengan domain).
- Jika backend mengembalikan path relatif (`/uploads/...`), tulis di kontrak
  dan frontend menambahkan `VITE_API_URL` di satu tempat.
- Placeholder data di `src/data/umkm.js` memakai path lokal
  (`/images/...`); ini hanya untuk development.
- Jika `images` kosong, UI wajib punya fallback (bukan ikon gambar rusak).

## 7. Status & error

| Kode | Arti |
|---|---|
| 200 | OK |
| 201 | Berhasil dibuat (POST) |
| 404 | UMKM/slug tidak ditemukan |
| 422 | Validasi gagal (isinya `errors`) |
| 500 | Error server, pesan umum |

## 8. Keputusan terbuka

- [ ] Target submit Daftar UMKM: POST API / Google Form / WhatsApp
- [ ] Base URL API saat production (subdomain? domain yang sama?)
- [ ] Pemilik & jadwal backend
- [ ] Siapa yang menyetujui pendaftaran UMKM (`pending` → tampil)
- [ ] Batas ukuran & format foto
- [ ] Desain halaman Daftar UMKM dan layout mobile (belum ada)
- [ ] Apakah `products` diisi pemilik lewat form atau dilengkapi admin

## 9. Changelog

| Versi | Tanggal | Perubahan |
|---|---|---|
| 0 | 2026-11-03 | Draft awal dari kebutuhan frontend |
| 1 | 2026-11-04 | Tambah harga, perilaku kartu/pencarian/pagination |
| 2 | 2026-11-05 | Hapus kategori total; tambah field detail: `images`, `products`, `priceMin`/`priceMax`, `saleType`, `ownerSince`, `address`, `mapsUrl`, `openingHours` |
| 3 | 2026-11-05 | Hapus `priceMax` dan `saleType` dari desain |
