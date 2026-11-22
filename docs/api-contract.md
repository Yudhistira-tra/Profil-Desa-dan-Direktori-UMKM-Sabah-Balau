# Kontrak API — Profil Desa & Direktori UMKM


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
| `ownerSince` | integer | tidak | tahun mulai usaha |
| `address` | string | ya | alamat/dusun |
| `whatsapp` | string | ya | angka saja, diawali `62` |
| `description` | string | ya | maks 500 karakter |
| `priceMin` | integer | tidak | harga mulai |
| `openingHours` | string | tidak | jam buka |
| `photos` | file[] | tidak | maks 5 file, jpg/png/webp, masing-masing maks 5 MB |
| `consent` | boolean | ya | pemilik setuju datanya dipublikasikan |

`mapsUrl`, `products`, dan persetujuan akhir dilengkapi/diisi **admin desa**
lewat halaman admin, bukan oleh pemilik lewat form.

Respons `201`:

```json
{ "data": { "id": 12, "slug": "warung-bu-ani", "status": "pending" } }
```

Pendaftaran **tidak langsung tampil** di direktori. Backend menyimpan dengan
status `pending` dan admin desa menyetujui secara manual lewat halaman
admin (lihat bagian 4–6 dan 10–11 di bawah).

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

## 4. POST /api/login — **(USULAN, menunggu keputusan backend)**

Login untuk sekdes/staff desa. Publik tidak butuh akun apa pun; hanya halaman
`/admin` yang terkunci. Password disimpan **hashed** di database, bukan teks
biasa; sesi memakai cookie `HttpOnly`.

Request:

```json
{ "username": "sekdes", "password": "..." }
```

Respons `200`:

```json
{ "data": { "name": "Nama Sekdes", "role": "admin" } }
```

Respons `401`: `{ "message": "Login gagal" }`

Semua endpoint di bagian 5, 6, 10, dan 11 ditolak (`401`) tanpa sesi login yang valid.

## 5. GET /api/admin/pendaftaran — **(USULAN)**

Daftar pendaftaran berstatus `pending`, urut terbaru dulu, untuk ditinjau
admin.

Respons `200`: `{ "data": [ ...objek UMKM + status... ] }`

## 6. PATCH /api/umkm/:slug — **(USULAN)**

Admin menyetujui, menolak, atau memperbaiki data satu UMKM. Request berisi
satu atau beberapa field yang diubah:

| Field | Catatan |
|---|---|
| `status` | `pending` → `aktif` (tampil) atau `ditolak` |
| `mapsUrl` | diisi admin (pemilik tidak mengisi lewat form) |
| `products` | dilengkapi admin |
| `images` | URL hasil upload foto (lihat bagian 13) |
| field UMKM lain | koreksi data |

Respons `200`: `{ "data": { ...objek UMKM terbaru... } }`
Respons `404`: `{ "message": "UMKM tidak ditemukan" }`

## 7. GET /api/profil

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

## 8. GET /api/berita — daftar berita terbit

Dipakai halaman `/berita` dan section "Berita Terbaru" di Beranda (ambil 3
teratas dari respons ini). Hanya berita berstatus `terbit`, urut `date`
terbaru. Tanpa query param; pagination di frontend (6 kartu per halaman).

Respons `200`:

```json
{
  "data": [
    {
      "id": 1,
      "slug": "musyawarah-desa-program-2027",
      "title": "Musyawarah Desa Bahas Program Prioritas 2027",
      "excerpt": "Pemerintah desa bersama BPD ...",
      "cover": null,
      "date": "2026-11-18",
      "sourceUrl": null
    }
  ]
}
```

`content` tidak ikut di daftar; ambil di detail. `cover` berisi URL absolut
atau `null` (UI menampilkan placeholder). `date` berformat `YYYY-MM-DD`.

## 9. GET /api/berita/:slug — detail berita

Respons `200`:

```json
{
  "data": {
    "id": 1,
    "slug": "musyawarah-desa-program-2027",
    "title": "Musyawarah Desa Bahas Program Prioritas 2027",
    "excerpt": "Pemerintah desa bersama BPD ...",
    "content": [
      "Paragraf pertama ...",
      "Paragraf kedua ..."
    ],
    "cover": null,
    "date": "2026-11-18",
    "sourceUrl": null
  }
}
```

`content` adalah array paragraf (satu item = satu `<p>`). Jika `sourceUrl`
berisi tautan (misalnya post Instagram atau situs berita lain), detail
menampilkan tautan "Sumber" yang membuka tab baru.

Respons `404` jika slug tidak ada **atau** beritanya masih `draf`.

## 10. Admin: kelola berita — **(USULAN, menunggu keputusan backend)**

Butuh sesi login (Bearer token) seperti bagian 5–6. Bentuk objek berita sama
dengan bagian 8–9.

| Method & path | Kegunaan |
|---|---|
| `GET /api/admin/berita` | semua berita (`terbit` + `draf`), urut `date` terbaru |
| `GET /api/admin/berita/:id` | ambil satu berita untuk form edit (termasuk draf) |
| `POST /api/admin/berita` | buat berita baru |
| `PATCH /api/admin/berita/:id` | ubah berita |
| `DELETE /api/admin/berita/:id` | hapus berita |

`POST`/`PATCH` memakai `multipart/form-data` bila menyertakan foto utama
(field `cover` bertipe file), dengan `data` berisi JSON objek berita. Tanpa
foto, body boleh JSON biasa. Kirim `"cover": null` di `data` untuk
menghapus foto saat edit.

Respons `POST` → `201`, `PATCH`/`DELETE` → `200`, semuanya dibungkus
`{ "data": ... }` (DELETE cukup `{ "data": { "id": 1 } }`). `404` bila id
tidak ada, `422` bila validasi gagal.

Field berita:

| Field | Tipe | Wajib | Catatan |
|---|---|---|---|
| `slug` | string | — | dibuat backend dari `title`, unik; tidak berubah saat judul diedit |
| `title` | string | ya | maks 150 karakter |
| `date` | string | ya | `YYYY-MM-DD` |
| `excerpt` | string | ya | ringkasan untuk kartu, maks 220 karakter |
| `content` | string[] | ya | minimal 1 paragraf |
| `cover` | string \| null | tidak | URL hasil upload (lihat bagian 13) |
| `sourceUrl` | string \| null | tidak | diawali `http://`/`https://`; dipakai untuk berita kutipan IG/situs lain |
| `status` | `draf` \| `terbit` | ya | default `draf`; hanya `terbit` tampil di publik |

Catatan frontend: sementara ini halaman berita memakai data tiruan di
`src/data/berita.js` + `src/api/berita.js`; setelah endpoint tersedia,
modul API itu yang diganti `fetch` (halaman tidak perlu diubah).

## 11. PATCH /api/admin/profil — **(USULAN, menunggu keputusan backend)**

Butuh sesi login. Mengganti bagian profil desa yang dikirim. Bagian yang
tidak dikirim tetap seperti sebelumnya, jadi frontend boleh mengirim semua
bagian setiap kali menyimpan.

Body (JSON) mengikuti bentuk GET /api/profil, ditambah field yang sudah
dipakai frontend saat ini:

```json
{
  "periode": "2020 – 2026",
  "ringkasan": "Mengenal lebih dekat ...",
  "jargon": "Pemerintah Desa Sabah Balau ...",
  "sejarah": "Desa Sabah Balau berada di ...",
  "visi": "Mewujudkan Desa Sabah Balau ...",
  "misi": ["Meningkatkan ...", "Mengembangkan ..."],
  "struktur": {
    "pimpinan": {
      "nama": "Pujianto, S.E.",
      "jabatan": "Kepala Desa",
      "unit": "Pimpinan Desa",
      "deskripsi": "Memimpin penyelenggaraan ...",
      "email": null,
      "photoUrl": null
    },
    "perangkat": [
      {
        "nama": "Erpandi, S.Ag.",
        "jabatan": "Sekretaris Desa",
        "unit": "Sekretariat",
        "deskripsi": "Mengelola administrasi ...",
        "photoUrl": null
      }
    ]
  },
  "geografis": {
    "luas": "12,5 km2",
    "jumlahDusun": 3,
    "batasUtara": "...",
    "batasSelatan": "...",
    "batasTimur": "...",
    "batasBarat": "..."
  },
  "demografi": {
    "jumlahPenduduk": 5200,
    "jumlahKK": 1400,
    "lakiLaki": 2650,
    "perempuan": 2550,
    "sebaranDusun": [
      { "nama": "Dusun 1", "jumlah": 1800 }
    ],
    "mataPencaharian": [
      { "nama": "Petani", "persen": 45 }
    ]
  },
  "kontak": {
    "alamat": "...",
    "telepon": "...",
    "email": "...",
    "jamLayanan": "Senin – Jumat, 08.00 – 15.00 WIB"
  }
}
```

Perlu dikonfirmasi ke backend: `periode`, `ringkasan`, `jargon`,
`geografis.jumlahDusun`, `demografi.lakiLaki`/`perempuan`/`sebaranDusun`/
`mataPencaharian`, dan bentuk `struktur` di atas belum ada di contoh
GET /api/profil (bagian 7). Usulnya GET ikut mengembalikan bentuk yang sama
supaya satu sumber data.

Respons `200`: `{ "data": { ...profil terbaru... } }`. `422` bila validasi
gagal (`email` tidak valid, angka negatif, total `persen` > 100).

Catatan frontend: sementara memakai `src/api/profil.js` (konten bawaan +
simpanan `localStorage`) agar halaman Profil Desa dan Beranda ikut berubah
setelah admin menyimpan.

## 12. Definisi field UMKM

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

## 13. Gambar

- Respons API mengembalikan **URL absolut** (lengkap dengan domain).
- Jika backend mengembalikan path relatif (`/uploads/...`), tulis di kontrak
  dan frontend menambahkan `VITE_API_URL` di satu tempat.
- Placeholder data di `src/data/umkm.js` memakai path lokal
  (`/images/...`); ini hanya untuk development.
- Jika `images` kosong, UI wajib punya fallback (bukan ikon gambar rusak).

## 14. Status & error

| Kode | Arti |
|---|---|
| 200 | OK |
| 201 | Berhasil dibuat (POST) |
| 404 | UMKM/slug tidak ditemukan |
| 422 | Validasi gagal (isinya `errors`) |
| 500 | Error server, pesan umum |

## 15. Keputusan terbuka

- [ ] Target submit Daftar UMKM: POST API / Google Form / WhatsApp
- [ ] Base URL API saat production (subdomain? domain yang sama?)
- [ ] Pemilik & jadwal backend
- [ ] Siapa yang menyetujui pendaftaran UMKM (`pending` → tampil)
- [ ] Batas ukuran & format foto
- [ ] Desain halaman Daftar UMKM dan layout mobile (belum ada)
- [x] Apakah `products` diisi pemilik lewat form atau dilengkapi admin →
      **dilengkapi admin** (13 November 2026); `mapsUrl` juga diisi admin
- [ ] Endpoint admin (bagian 4–6, 10, dan 11): siapa mengerjakan dan
      kapan target selesainya
- [ ] Field profil tambahan (bagian 11: `periode`, `ringkasan`, `jargon`,
      `jumlahDusun`, `sebaranDusun`, `mataPencaharian`, `lakiLaki`/`perempuan`,
      bentuk `struktur`) disepakati untuk GET dan PATCH
- [ ] Format tanggal berita: cukup `YYYY-MM-DD` atau perlu jam (`ISO 8601`)?
- [ ] Foto utama berita: wajib atau opsional (frontend sekarang opsional)

## 16. Changelog

| Versi | Tanggal | Perubahan |
|---|---|---|
| 0 | 2026-11-03 | Draft awal dari kebutuhan frontend |
| 1 | 2026-11-04 | Tambah harga, perilaku kartu/pencarian/pagination |
| 2 | 2026-11-05 | Hapus kategori total; tambah field detail: `images`, `products`, `priceMin`/`priceMax`, `saleType`, `ownerSince`, `address`, `mapsUrl`, `openingHours` |
| 3 | 2026-11-05 | Hapus `priceMax` dan `saleType` dari desain |
| 4 | 2026-11-13 | POST pendaftaran tambah `ownerSince`; `mapsUrl`/`products` diputuskan diisi admin; tambah usulan endpoint admin: login, daftar pending, approve/edit (bagian 4–6, menunggu keputusan backend) |
| 5 | 2026-11-22 | Tambah portal berita: GET /api/berita, GET /api/berita/:slug (bagian 8–9), usulan admin CRUD berita (bagian 10), dan usulan PATCH /api/admin/profil (bagian 11). Nomor bagian 8–12 digeser menjadi 12–16 |
