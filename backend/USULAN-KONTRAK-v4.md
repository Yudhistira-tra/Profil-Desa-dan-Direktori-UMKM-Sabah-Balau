# Catatan backend terhadap kontrak API v4

Semua endpoint di `docs/api-contract.md` v4 sudah diimplementasikan dan diuji (`npm test`, 35 uji).
Beberapa hal yang perlu masuk ke kontrak (pemilik dokumen: FE B):

1. **Login** (`POST /api/login`): respons `{ "data": { "name": "...", "token": "..." } }`. Frontend mengirim
   token di header `Authorization: Bearer <token>`; backend juga memasang cookie HttpOnly.
2. **Antrean** (`GET /api/admin/pendaftaran`): tiap item = objek UMKM + `status` + `date` (waktu daftar, ISO).
3. **Edit admin**: selain `PATCH /api/umkm/:slug`, tersedia `GET` dan `PATCH /api/admin/umkm/:id`
   karena halaman admin memakai `id`. Foto baru dikirim multipart (`data` + `photos`).
4. **Status**: `pending`, `aktif`, `ditolak`.
5. **`whatsapp`**: backend menerima `08...`/`+62...` dan menyimpan `62...`.
6. **`priceMin`** kosong → respons publik memakai harga produk termurah (atau `null`).
7. **`mapsUrl`** hanya link Google Maps. **Foto**: maks 5 file, jpg/png/webp, maks 5 MB.
8. Status tambahan: `401`, `413`, `415`, `429`.
9. Base URL development: `http://localhost:8000/api`.

Keputusan terbuka (bagian 11) yang terjawab oleh implementasi: target submit = POST API;
yang menyetujui pendaftaran = admin lewat halaman `/admin`; batas foto seperti butir 7.
