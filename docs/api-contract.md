# Kontrak API — Profil Desa & Direktori UMKM

Versi 0 (draft), 3 November 2026. Pemilik dokumen: FE B.
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

## 1. GET /api/umkm

Daftar semua UMKM yang sudah disetujui, urut nama A–Z.
Tanpa pagination dan tanpa query param untuk versi ini (jumlah UMKM < 100).
Pencarian dan filter kategori dilakukan di sisi frontend.

Respons `200`:

```json
{
  "data": [
    {
      "id": 1,
      "slug": "kopi-sabah-balau",
      "name": "Kopi Sabah Balau",
      "category": "Kuliner",
      "owner": "Ibu Sari",
      "dusun": "Dusun 1",
      "whatsapp": "6281234567890",
      "imageUrl": "https://api.example.com/storage/umkm/kopi-sabah-balau.jpg",
      "description": "Kopi robusta hasil kebun warga, digiling manual."
    }
  ]
}
```

## 2. GET /api/umkm/:slug

Detail satu UMKM.

Respons `200`: `{ "data": { ...satu objek UMKM... } }`

Respons `404`:

```json
{ "message": "UMKM tidak ditemukan" }
```

## 3. POST /api/umkm — pendaftaran UMKM (belum final)

Halaman Daftar UMKM membutuhkan endpoint ini **hanya jika** target submit
diputuskan memakai backend. Jika memakai Google Form, endpoint ini dihapus
dari kontrak.

Request: `multipart/form-data`

| Field | Tipe | Wajib | Catatan |
|---|---|---|---|
| `name` | string | ya | nama usaha, maks 100 karakter |
| `owner` | string | ya | nama pemilik |
| `category` | string | ya | salah satu dari daftar kategori |
| `dusun` | string | ya | alamat/dusun |
| `whatsapp` | string | ya | angka saja, diawali `62` |
| `description` | string | ya | maks 500 karakter |
| `photo` | file | tidak | jpg/png/webp, maks 5 MB |
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
    "photo": ["Ukuran foto maksimal 5 MB"]
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
| `category` | string | ya | usulan: `Kuliner`, `Jasa`, `Kerajinan`, `Pertanian`, `Lainnya` |
| `owner` | string | ya | nama pemilik |
| `dusun` | string | ya | alamat singkat/dusun |
| `whatsapp` | string | ya | angka saja, diawali `62`, tanpa `+`, spasi, atau tanda hubung |
| `imageUrl` | string \| null | tidak | URL absolut foto. `null` jika tidak ada foto |
| `description` | string | ya | maks 500 karakter |

Catatan frontend: `whatsapp` dipakai untuk membuat link
`https://wa.me/<nomor>`. Kartu UMKM harus tetap rapi saat `imageUrl` null.

## 6. Gambar

- Respons API sebaiknya mengembalikan **URL absolut** (lengkap dengan domain),
  supaya frontend tidak perlu menebak alamat file.
- Jika backend mengembalikan path relatif (`/uploads/...`), tulis di kontrak
  dan frontend akan menambahkan `VITE_API_URL` di satu tempat.
- Placeholder data di `src/data/umkm.js` memakai path lokal
  (`/images/kopi-sabah-balau.jpg`); ini hanya untuk development.

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
- [ ] Daftar kategori final
- [ ] Batas ukuran & format foto

## 9. Changelog

| Versi | Tanggal | Perubahan |
|---|---|---|
| 0 | 2026-11-03 | Draft awal dari kebutuhan frontend |