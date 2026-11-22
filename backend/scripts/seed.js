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
const os = require('os');
const { createUmkm } = require('../src/umkm');
const berita = require('../src/berita');

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

// Berita contoh dari frontend/src/data/berita.js. File itu meng-import gambar (khusus Vite),
// jadi baris import gambar diganti null sebelum dibaca: berita contoh tampil tanpa foto utama.
async function beritaDariFrontend() {
  const file = path.join(__dirname, '..', '..', 'frontend', 'src', 'data', 'berita.js');
  if (!fs.existsSync(file)) return [];
  const sumber = fs.readFileSync(file, 'utf8').replace(/^import\s+(\w+)\s+from\s+['"][^'"]+\.(jpe?g|png|webp|svg)['"];?\s*$/gim, 'const $1 = null;');
  const tmp = path.join(os.tmpdir(), `berita-contoh-${process.pid}.mjs`);
  try {
    fs.writeFileSync(tmp, sumber);
    const modul = await import(pathToFileURL(tmp).href);
    return Array.isArray(modul.beritaData) ? modul.beritaData : [];
  } catch (e) {
    console.log(`Berita contoh frontend tidak bisa dibaca (${e.message}); berita dilewati.`);
    return [];
  } finally {
    fs.rmSync(tmp, { force: true });
  }
}

async function seedBerita() {
  if (reset) db.exec('DELETE FROM berita');
  else if (db.prepare('SELECT COUNT(*) AS n FROM berita').get().n > 0) return console.log('Tabel berita sudah berisi data, seed berita dilewati.');
  let n = 0;
  for (const b of await beritaDariFrontend()) {
    const v = berita.validasi(b, false);
    if (v.errors) { console.log(`Berita "${b.title}" dilewati: ${JSON.stringify(v.errors)}`); continue; }
    berita.create(v.nilai, typeof b.cover === 'string' && b.cover ? { file: b.cover } : null, b.slug);
    n++;
  }
  console.log(`${n} berita contoh ditambahkan.`);
}

async function main() {
  await seedBerita();
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
