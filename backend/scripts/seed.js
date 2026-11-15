// Mengisi database dengan data contoh untuk development.
//   npm run seed         isi data contoh bila tabel masih kosong
//   npm run seed:reset   HAPUS semua UMKM, lalu isi ulang data contoh
//
// Data contoh diambil dari frontend (frontend/src/data/umkm.js), supaya tampilan situs sama persis
// baik saat memakai data contoh frontend maupun data dari backend.
const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');
const { db } = require('../src/db');
const { createUmkm } = require('../src/umkm');

const reset = process.argv.includes('--reset');

async function contohDariFrontend() {
  const file = path.join(__dirname, '..', '..', 'frontend', 'src', 'data', 'umkm.js');
  if (!fs.existsSync(file)) return null;
  try {
    const modul = await import(pathToFileURL(file).href);
    return Array.isArray(modul.umkmData) && modul.umkmData.length ? modul.umkmData : null;
  } catch (e) {
    console.log(`Data contoh frontend tidak bisa dibaca (${e.message}); memakai data contoh bawaan.`);
    return null;
  }
}

// Dipakai bila folder frontend tidak ada di samping backend.
const bawaan = [1, 2, 3].map((i) => ({
  slug: `umkm-${i}`, name: `UMKM ${i}`, owner: `Owner ${i}`, ownerSince: 2019 + i, address: 'Sabah Balau', mapsUrl: null,
  whatsapp: '628123456789', priceMin: 10000 * i, openingHours: 'Setiap hari, 08.00–17.00 WIB',
  description: `Contoh UMKM ${i}, ini deskripsi dari UMKM ${i}.`, images: [],
  products: [{ name: `Produk ${i}`, description: `Deskripsi produk ${i}`, price: 10000 * i }],
}));

// Pendaftaran yang masih menunggu review admin: TIDAK boleh muncul di GET /api/umkm.
const menunggu = [
  { name: 'UMKM Menunggu Persetujuan', owner: 'Owner Baru', ownerSince: 2024, address: 'Dusun 1A, Sabah Balau', whatsapp: '628129999999', priceMin: 5000, openingHours: 'Setiap hari, 07.00–21.00 WIB', description: 'Contoh pendaftaran baru yang belum ditinjau admin.' },
  { name: 'Contoh Pendaftaran Kedua', owner: 'Owner Kedua', ownerSince: null, address: 'Dusun 2B, Sabah Balau', whatsapp: '628128888888', priceMin: null, openingHours: null, description: 'Contoh pendaftaran tanpa harga dan jam buka, untuk dilengkapi admin.' },
];

async function main() {
  if (reset) {
    db.exec('DELETE FROM umkm');
    console.log('Semua data UMKM dihapus.');
  } else if (db.prepare('SELECT COUNT(*) AS n FROM umkm').get().n > 0) {
    console.log('Tabel UMKM sudah berisi data, seed dilewati. Pakai "npm run seed:reset" untuk mengisi ulang.');
    return;
  }

  const dariFrontend = await contohDariFrontend();
  const contoh = dariFrontend || bawaan;
  for (const c of contoh) {
    createUmkm(c, Array.isArray(c.products) ? c.products : [], (c.images || []).map((file) => ({ file })), 'approved');
  }
  for (const c of menunggu) createUmkm(c, [], [], 'pending');
  console.log(`${contoh.length} UMKM contoh (${dariFrontend ? 'dari data frontend' : 'bawaan'}, berstatus aktif) + ${menunggu.length} pendaftaran pending ditambahkan.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
