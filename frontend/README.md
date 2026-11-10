# Profil Desa & Direktori UMKM — Kesepakatan Kerja FE

Dokumen kesepakatan tim frontend. Versi 1, 3 November 2026.
Kalau ada yang berubah, ubah file ini dan kabari yang lain — jangan biarkan
kesepakatan hanya ada di chat.

## 1. Tim & pembagian

| Area | Pemilik | Isi |
|---|---|---|
| Desa & layout | FE A (Radhitya) | Navbar, Footer, Beranda, Profil Desa, style global |
| UMKM | FE B (Naufal) | Direktori, Detail, Daftar UMKM, UmkmCard, data & API |

Aturan: satu file hanya diedit pemiliknya. Butuh perubahan di file orang lain?
Minta lewat PR atau chat, jangan edit langsung.

## 2. Struktur folder

```
frontend/
  public/
    images/              # placeholder foto & logo, nama file = slug
  src/
    main.jsx             # entry, jangan diubah
    App.jsx              # routes + Navbar/Footer (milik FE A)
    index.css            # style global (milik FE A)
    pages/
      Beranda.jsx
      ProfilDesa.jsx
      DirektoriUmkm.jsx
      DetailUmkm.jsx
      DaftarUmkm.jsx
      NotFound.jsx
    components/
      Navbar.jsx
      Footer.jsx
      UmkmCard.jsx
    data/
      umkm.js            # data placeholder (milik FE B)
      profil.js          # teks placeholder (milik FE B)
    api/
      umkm.js            # getUmkmList(), getUmkmBySlug()
      profil.js          # getProfil()
```

## 3. URL map

| URL | Halaman |
|---|---|
| `/` | Beranda |
| `/profil` | Profil Desa |
| `/umkm` | Direktori UMKM |
| `/umkm/:slug` | Detail UMKM |
| `/daftar-umkm` | Form Daftar UMKM |

## 4. Kontrak data (ringkas)

- Semua halaman mengambil data lewat `src/api/`, **bukan** langsung dari `src/data/`.
- Bentuk objek UMKM v1:

```json
{
    id: 2,
    slug: "umkm-2",
    name: "UMKM 2",
    owner: "Owner 2",
    ownerSince: 2021,
    address: "Sabah Balau",
    mapsUrl: "https://www.google.com/maps/place/Sabah+Balau/@-1.234567,103.456789,15z",
    whatsapp: "628123456789",
    priceMin: 15000,
    openingHours: "Senin–Sabtu, 09.00–18.00 WIB",
    description: "Contoh UMKM 2, ini deskripsi dari UMKM 2.",
    images: [],
    products: [
      { name: "Produk 1", description: "Deskripsi produk 4", price: 15000 },
      { name: "Produk 2", description: "Deskripsi produk 5", price: 25000 },
    ],
  }
```

- `slug` unik, huruf kecil, pakai tanda hubung. Contoh: `kopi-sabah-balau`.
- Detail kontrak (endpoint, error, field opsional): `docs/api-contract.md` — draft oleh FE B.

## 5. Konvensi kode

- Nama file komponen & halaman: PascalCase (`UmkmCard.jsx`).
- Style: CSS Modules per komponen (`UmkmCard.module.css`). Jangan pakai nama class global.
- Data placeholder harus realistis (bukan lorem ipsum), termasuk kasus aneh: tanpa foto, nama panjang.
- Gambar di `public/images/`, nama file = slug.
- Jangan install UI kit / Tailwind dulu; tunggu arah desain.

## 6. File bersama (satu pemilik)

| File | Pemilik |
|---|---|
| `App.jsx` (routes) | FE A |
| `index.css` & style global | FE A |
| `src/data/*`, `src/api/*` | FE B |
| `docs/api-contract.md` | FE B (disetujui berdua) |
| `package.json`, `package-lock.json` | siapa pun yang install, setelah kabari |

Menambah/mengubah route: minta FE A.

## 7. Alur git

- Satu branch per tugas: `feat/halaman-beranda`, `feat/direktori-umkm`, dst.
- Commit kecil, pesan bahasa Indonesia huruf kecil. Contoh: `tambah halaman direktori umkm`.
- Push branch → buka PR → dibaca & merge oleh orang lain. Jangan push langsung ke `main`.
- Selalu `git pull` sebelum mulai kerja.
- Jangan commit `node_modules`, `dist`, atau file `.env*`.

## 8. Dependency

- Kabari dulu sebelum `npm install` apa pun.
- Satu orang install, lalu commit `package.json` + `package-lock.json`.
- Yang lain pull, lalu jalankan `npm install` sebelum lanjut kerja.

## 9. Cara menjalankan

```bash
cd frontend
npm install
npm run dev
```

## 10. Keputusan yang belum final

- [ ] Handoff desain Figma 
- [ ] Target submit Daftar UMKM
- [ ] Hosting & domain
- [ ] Data & konten asli

## 11. Urutan pengerjaan

1. Skeleton: 5 route + Navbar/Footer — FE A
2. Data placeholder — FE B
3. Direktori UMKM → Detail UMKM — FE B
4. Beranda — FE A
5. Profil Desa — FE A
6. Daftar UMKM — FE B, setelah target submit diputuskan

## 12. Definisi selesai (ringkas)

- Semua halaman bisa diakses dan tampil rapi di HP.
- Data placeholder sudah diganti data asli.
- Tidak ada error di console browser.
- `npm run build` sukses.
