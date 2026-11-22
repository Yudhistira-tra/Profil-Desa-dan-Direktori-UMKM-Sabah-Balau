// Uji otomatis API terhadap kontrak (docs/api-contract.md) + beberapa uji keamanan.
// Cara pakai: jalankan seed (npm run seed:reset) dan server (npm start), lalu di terminal lain: npm test
// Untuk uji admin, ADMIN_PASSWORD di .env harus terisi. Data uji yang dibuat akan dihapus lagi.
const assert = require('assert');
const { PORT, ADMIN_USERNAME, ADMIN_PASSWORD, CORS_ORIGINS } = require('../src/config');

const BASE = process.env.BASE || `http://localhost:${PORT}`;
const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64');
const adaAdmin = ADMIN_PASSWORD.length >= 8;
let admin = {}; // header Authorization, diisi setelah login
const dibuat = [];
let lulus = 0;
let gagal = 0;
let lewat = 0;

class Dibatasi extends Error {}
let kenaLimit = false;

async function uji(nama, fn) {
  try {
    const hasil = await fn();
    if (hasil === 'lewat') { lewat++; console.log(`  LEWAT  ${nama}`); return; }
    lulus++;
    console.log(`  LULUS  ${nama}`);
  } catch (e) {
    if (e instanceof Dibatasi) { kenaLimit = true; lewat++; console.log(`  LEWAT  ${nama} (kena batas anti-spam)`); return; }
    gagal++;
    console.log(`> GAGAL  ${nama}\n         ${e.message}`);
  }
}

async function api(path, opts = {}) {
  const r = await fetch(BASE + path, opts);
  const text = await r.text();
  let body = null;
  try { body = JSON.parse(text); } catch { body = text; }
  return { status: r.status, body, headers: r.headers };
}

const json = (method, body, headers = {}) => ({ method, headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(body) });

function form(fields, photos = []) {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) fd.append(k, v);
  photos.forEach(([buf, name, type]) => fd.append('photos', new Blob([buf], { type }), name));
  return fd;
}

// POST pendaftaran. Jawaban 429 = pembatas anti-spam bekerja; uji tersebut dilewati, bukan gagal.
async function daftarkan(body) {
  const r = await api('/api/umkm', { method: 'POST', body });
  if (r.status === 429) throw new Dibatasi();
  return r;
}

const valid = (extra = {}) => ({
  name: 'Warung Uji Otomatis', owner: 'Ibu Uji', ownerSince: '2019', address: 'Dusun 1A, Sabah Balau', whatsapp: '0812-3456-7890',
  description: 'Data uji otomatis, akan dihapus.', priceMin: '15.000', openingHours: 'Setiap hari, 08.00–17.00 WIB', consent: 'true',
  ...extra,
});

const BENTUK = ['id', 'slug', 'name', 'owner', 'ownerSince', 'address', 'mapsUrl', 'whatsapp', 'priceMin', 'openingHours', 'description', 'images', 'products'];

async function main() {
  console.log(`\nUji API ${BASE}\n${'-'.repeat(60)}`);
  try { await fetch(BASE + '/api/health'); } catch { console.error('Server tidak merespons. Jalankan "npm start" dulu.'); process.exit(1); }

  console.log('\n[Kontrak 1-2] Daftar & detail UMKM');
  let daftar = [];
  await uji('GET /api/umkm -> 200 { data: [...] }', async () => {
    const r = await api('/api/umkm');
    assert.equal(r.status, 200);
    assert.ok(Array.isArray(r.body.data), 'data harus array');
    daftar = r.body.data;
    assert.ok(daftar.length > 0, 'daftar kosong — jalankan npm run seed:reset');
  });
  await uji('Setiap item punya semua field kontrak (termasuk ownerSince, tanpa category)', async () => {
    for (const it of daftar) {
      assert.deepEqual(Object.keys(it).sort(), [...BENTUK].sort(), `field ${it.slug} tidak sesuai`);
      assert.ok(Array.isArray(it.images) && Array.isArray(it.products));
      assert.ok(it.products.length <= 3 && it.images.length <= 5);
    }
  });
  await uji('Urut nama A–Z', async () => {
    const nama = daftar.map((d) => d.name.toLowerCase());
    assert.deepEqual(nama, [...nama].sort((a, b) => a.localeCompare(b, 'en')));
  });
  await uji('UMKM pending tidak ikut tampil', async () => {
    assert.ok(!daftar.some((d) => d.name === 'UMKM Menunggu Persetujuan'));
  });
  await uji('GET /api/umkm/:slug -> 200, bentuk sama dengan item daftar', async () => {
    const r = await api('/api/umkm/' + daftar[0].slug);
    assert.equal(r.status, 200);
    assert.deepEqual(r.body.data, daftar[0]);
  });
  await uji('Slug tidak ada -> 404 { message: "UMKM tidak ditemukan" }', async () => {
    for (const s of ['tidak-ada-sama-sekali', 'HURUF-BESAR', '..%2F..%2Fetc']) {
      const r = await api('/api/umkm/' + s);
      assert.equal(r.status, 404);
      assert.deepEqual(r.body, { message: 'UMKM tidak ditemukan' });
    }
  });

  console.log('\n[Kontrak 7] Profil');
  await uji('GET /api/profil -> 200 dengan semua bagian', async () => {
    const r = await api('/api/profil');
    assert.equal(r.status, 200);
    const d = r.body.data;
    for (const k of ['periode', 'ringkasan', 'jargon', 'sejarah', 'visi', 'misi', 'struktur', 'geografis', 'demografi', 'kontak']) assert.ok(k in d, `bagian ${k} tidak ada`);
    assert.ok(Array.isArray(d.misi) && Array.isArray(d.struktur.perangkat) && d.struktur.pimpinan);
    assert.ok(Array.isArray(d.demografi.sebaranDusun) && Array.isArray(d.demografi.mataPencaharian));
    assert.ok(!Object.keys(d).some((k) => k.startsWith('_')), 'kunci petunjuk ikut terkirim');
  });

  console.log('\n[Kontrak 8-9] Berita publik');
  await uji('GET /api/berita -> hanya terbit, urut tanggal terbaru, tanpa content', async () => {
    const r = await api('/api/berita');
    assert.equal(r.status, 200);
    const d = r.body.data;
    assert.ok(Array.isArray(d));
    for (let i = 1; i < d.length; i++) assert.ok(d[i - 1].date >= d[i].date, 'urutan tanggal salah');
    for (const b of d) {
      assert.deepEqual(Object.keys(b).sort(), ['cover', 'date', 'excerpt', 'id', 'slug', 'sourceUrl', 'title']);
      assert.match(b.date, /^\d{4}-\d{2}-\d{2}$/);
    }
  });
  await uji('GET /api/berita/:slug -> content berupa daftar paragraf; slug asing -> 404', async () => {
    const daftar = (await api('/api/berita')).body.data;
    if (!daftar.length) return 'lewat';
    const r = await api('/api/berita/' + daftar[0].slug);
    assert.equal(r.status, 200);
    assert.ok(Array.isArray(r.body.data.content) && r.body.data.content.length > 0);
    assert.ok(!('status' in r.body.data));
    const x = await api('/api/berita/tidak-ada-berita-ini');
    assert.equal(x.status, 404);
    assert.deepEqual(x.body, { message: 'Berita tidak ditemukan' });
  });

  console.log('\n[Aturan umum] CORS & format error');
  await uji('Preflight dari frontend (5173) diizinkan, termasuk PATCH', async () => {
    const r = await fetch(BASE + '/api/umkm', { method: 'OPTIONS', headers: { Origin: CORS_ORIGINS[0], 'Access-Control-Request-Method': 'PATCH' } });
    assert.equal(r.status, 204);
    assert.equal(r.headers.get('access-control-allow-origin'), CORS_ORIGINS[0]);
    assert.match(r.headers.get('access-control-allow-methods'), /PATCH/);
    assert.match(r.headers.get('access-control-allow-headers'), /Authorization/);
  });
  await uji('Origin asing tidak diberi izin CORS', async () => {
    const r = await fetch(BASE + '/api/umkm', { headers: { Origin: 'https://situs-asing.example' } });
    assert.equal(r.headers.get('access-control-allow-origin'), null);
  });
  await uji('Endpoint tak dikenal -> 404 { message }', async () => {
    const r = await api('/api/tidak-ada');
    assert.equal(r.status, 404);
    assert.ok(typeof r.body.message === 'string');
  });

  console.log('\n[Kontrak 3] Pendaftaran UMKM');
  let baru = null;
  await uji('POST valid + 1 foto -> 201 { data: { id, slug, status: "pending" } }', async () => {
    const r = await daftarkan(form(valid(), [[PNG, 'foto.png', 'image/png']]));
    assert.equal(r.status, 201, JSON.stringify(r.body));
    assert.deepEqual(Object.keys(r.body.data).sort(), ['id', 'slug', 'status']);
    assert.equal(r.body.data.status, 'pending');
    assert.equal(r.body.data.slug, 'warung-uji-otomatis');
    baru = r.body.data;
    dibuat.push(baru.id);
  });
  await uji('Pendaftaran baru belum tampil sebelum disetujui', async () => {
    if (!baru) return 'lewat';
    assert.equal((await api('/api/umkm/' + baru.slug)).status, 404);
  });
  let kedua = null;
  await uji('Nama sama -> slug unik (warung-uji-otomatis-2)', async () => {
    const r = await daftarkan(form(valid({ priceMin: '', ownerSince: '' })));
    assert.equal(r.status, 201);
    assert.equal(r.body.data.slug, 'warung-uji-otomatis-2');
    kedua = r.body.data;
    dibuat.push(kedua.id);
  });
  await uji('Data kosong -> 422 dengan errors per field', async () => {
    const r = await daftarkan(form({ name: '' }));
    assert.equal(r.status, 422);
    assert.equal(r.body.message, 'Data tidak valid');
    for (const k of ['name', 'owner', 'address', 'whatsapp', 'description', 'consent']) assert.ok(Array.isArray(r.body.errors[k]), `errors.${k} tidak ada`);
  });
  await uji('WhatsApp / tahun mulai tidak valid -> 422', async () => {
    const r = await daftarkan(form(valid({ whatsapp: '12345', ownerSince: '1800' })));
    assert.equal(r.status, 422);
    assert.ok(r.body.errors.whatsapp && r.body.errors.ownerSince);
  });
  await uji('Web shell PHP menyamar jadi .jpg -> 422 errors.photos', async () => {
    const r = await daftarkan(form(valid(), [[Buffer.from('<?php system($_GET["c"]); ?>'), 'foto.jpg', 'image/jpeg']]));
    assert.equal(r.status, 422);
    assert.ok(r.body.errors.photos);
  });
  await uji('Lebih dari 5 foto -> 422 "Maksimal 5 foto"', async () => {
    const enam = Array.from({ length: 6 }, (_, i) => [PNG, `f${i}.png`, 'image/png']);
    const r = await daftarkan(form(valid(), enam));
    assert.equal(r.status, 422);
    assert.deepEqual(r.body.errors.photos, ['Maksimal 5 foto']);
  });
  await uji('Foto lebih dari 5 MB -> 422', async () => {
    const besar = Buffer.concat([PNG, Buffer.alloc(5 * 1024 * 1024)]);
    const r = await daftarkan(form(valid(), [[besar, 'besar.png', 'image/png']]));
    assert.equal(r.status, 422);
    assert.ok(r.body.errors.photos);
  });
  await uji('Bukan multipart -> 415', async () => {
    const r = await api('/api/umkm', json('POST', valid()));
    if (r.status === 429) throw new Dibatasi();
    assert.equal(r.status, 415);
  });
  await uji('Body raksasa (>27 MB) -> 413', async () => {
    const r = await api('/api/umkm', { method: 'POST', headers: { 'Content-Type': 'multipart/form-data; boundary=x' }, body: Buffer.alloc(28 * 1024 * 1024) });
    if (r.status === 429) throw new Dibatasi();
    assert.equal(r.status, 413);
  });

  console.log('\n[Kontrak 4] Login admin');
  await uji('Endpoint admin tanpa login -> ditolak', async () => {
    for (const p of ['/api/admin/pendaftaran', '/api/admin/umkm', '/api/admin/umkm/1']) {
      assert.ok([401, 503].includes((await api(p)).status), p);
    }
    assert.ok([401, 503].includes((await api('/api/umkm/umkm-1', json('PATCH', { status: 'ditolak' }))).status));
  });
  await uji('Token palsu -> 401', async () => {
    if (!adaAdmin) return 'lewat';
    for (const t of ['abc', `${Date.now() + 99999}.deadbeef`, '9999999999999.' + 'a'.repeat(64)]) {
      assert.equal((await api('/api/admin/pendaftaran', { headers: { Authorization: 'Bearer ' + t } })).status, 401);
    }
  });
  await uji('Login dengan kata sandi salah -> 401', async () => {
    if (!adaAdmin) return 'lewat';
    const r = await api('/api/login', json('POST', { username: ADMIN_USERNAME, password: ADMIN_PASSWORD + 'x' }));
    assert.equal(r.status, 401);
    assert.equal(r.body.message, 'Username atau password salah');
  });
  await uji('Login benar -> 200 { data: { name, token } } + cookie HttpOnly', async () => {
    if (!adaAdmin) return 'lewat';
    const r = await api('/api/login', json('POST', { username: ADMIN_USERNAME, password: ADMIN_PASSWORD }));
    assert.equal(r.status, 200, JSON.stringify(r.body));
    assert.ok(r.body.data.name && r.body.data.token);
    assert.match(r.headers.get('set-cookie') || '', /sesi_admin=.+HttpOnly/);
    admin = { Authorization: 'Bearer ' + r.body.data.token };
    // cookie saja (tanpa header Authorization) juga diterima
    const cookie = r.headers.get('set-cookie').split(';')[0];
    assert.equal((await api('/api/admin/pendaftaran', { headers: { Cookie: cookie } })).status, 200);
  });

  console.log('\n[Kontrak 5-6] Admin: tinjau, setujui, lengkapi');
  const siap = () => adaAdmin && admin.Authorization;
  await uji('GET /api/admin/pendaftaran -> hanya pending, ada status & date', async () => {
    if (!siap() || !baru) return 'lewat';
    const r = await api('/api/admin/pendaftaran', { headers: admin });
    assert.equal(r.status, 200);
    assert.ok(r.body.data.length > 0 && r.body.data.every((d) => d.status === 'pending' && !Number.isNaN(Date.parse(d.date))));
    assert.ok(r.body.data.some((d) => d.id === baru.id));
  });
  await uji('GET /api/admin/umkm/:id -> data lengkap untuk halaman edit', async () => {
    if (!siap() || !baru) return 'lewat';
    const r = await api(`/api/admin/umkm/${baru.id}`, { headers: admin });
    assert.equal(r.status, 200);
    const d = r.body.data;
    assert.equal(d.status, 'pending');
    assert.equal(d.whatsapp, '6281234567890');
    assert.equal(d.priceMin, 15000);
    assert.equal(d.ownerSince, 2019);
    assert.equal(d.images.length, 1);
    assert.equal((await api('/api/admin/umkm/99999999', { headers: admin })).status, 404);
  });
  let gambar = null;
  await uji('Setujui (status "aktif") -> tampil di direktori publik', async () => {
    if (!siap() || !baru) return 'lewat';
    const p = await api(`/api/admin/umkm/${baru.id}`, json('PATCH', { status: 'aktif' }, admin));
    assert.equal(p.status, 200, JSON.stringify(p.body));
    assert.equal(p.body.data.status, 'aktif');
    const r = await api('/api/umkm/' + baru.slug);
    assert.equal(r.status, 200);
    assert.match(r.body.data.images[0], /^https?:\/\/.+\/storage\/umkm\/[a-f0-9]{24}\.png$/, 'URL gambar harus absolut');
    gambar = r.body.data.images[0];
    assert.ok(!(await api('/api/admin/pendaftaran', { headers: admin })).body.data.some((d) => d.id === baru.id), 'masih ada di antrean pending');
  });
  await uji('Admin melengkapi mapsUrl + produk + foto baru (multipart) -> tersimpan', async () => {
    if (!siap() || !gambar) return 'lewat';
    const fd = new FormData();
    fd.append('data', JSON.stringify({
      name: 'Warung Uji (Diedit Admin)', mapsUrl: 'https://maps.app.goo.gl/abc123', priceMin: null,
      products: [{ name: 'Nasi Uduk', description: 'Porsi kecil', price: 12000 }, { name: 'Gorengan', description: '', price: 2000 }],
      images: [gambar],
    }));
    fd.append('photos', new Blob([PNG], { type: 'image/png' }), 'baru.png');
    const p = await api(`/api/admin/umkm/${baru.id}`, { method: 'PATCH', headers: admin, body: fd });
    assert.equal(p.status, 200, JSON.stringify(p.body));
    const d = (await api('/api/umkm/' + baru.slug)).body.data;
    assert.equal(d.name, 'Warung Uji (Diedit Admin)');
    assert.equal(d.slug, 'warung-uji-otomatis', 'slug harus tetap walau nama diubah');
    assert.equal(d.mapsUrl, 'https://maps.app.goo.gl/abc123');
    assert.equal(d.products.length, 2);
    assert.equal(d.priceMin, 2000, 'harga mulai kosong -> otomatis produk termurah');
    assert.equal(d.images.length, 2);
    assert.equal(d.images[0], gambar);
    assert.equal(d.ownerSince, 2019, 'field yang tidak dikirim harus tetap');
  });
  await uji('Admin menghapus satu foto -> file ikut terhapus', async () => {
    if (!siap() || !gambar) return 'lewat';
    const sebelum = (await api('/api/umkm/' + baru.slug)).body.data.images;
    const p = await api(`/api/admin/umkm/${baru.id}`, json('PATCH', { images: [sebelum[1]] }, admin));
    assert.equal(p.status, 200);
    assert.deepEqual(p.body.data.images, [sebelum[1]]);
    assert.equal((await fetch(BASE + new URL(sebelum[0]).pathname)).status, 404);
    assert.equal((await fetch(BASE + new URL(sebelum[1]).pathname)).status, 200);
    gambar = sebelum[1];
  });
  await uji('Admin mengisi link judi / status asing / URL foto asing -> ditolak atau diabaikan', async () => {
    if (!siap() || !baru) return 'lewat';
    const a = await api(`/api/admin/umkm/${baru.id}`, json('PATCH', { mapsUrl: 'https://situs-slot.example/daftar' }, admin));
    assert.equal(a.status, 422);
    assert.ok(a.body.errors.mapsUrl);
    const b = await api(`/api/admin/umkm/${baru.id}`, json('PATCH', { status: 'tayang' }, admin));
    assert.equal(b.status, 422);
    assert.ok(b.body.errors.status);
    const c = await api(`/api/admin/umkm/${baru.id}`, json('PATCH', { images: [gambar, 'https://situs-slot.example/x.png', '/storage/umkm/../../.env'] }, admin));
    assert.equal(c.status, 200);
    assert.deepEqual(c.body.data.images, [gambar]);
  });
  await uji('Lebih dari 5 foto lewat admin -> 422', async () => {
    if (!siap() || !baru) return 'lewat';
    const fd = new FormData();
    fd.append('data', '{}');
    for (let i = 0; i < 5; i++) fd.append('photos', new Blob([PNG], { type: 'image/png' }), `x${i}.png`);
    const p = await api(`/api/admin/umkm/${baru.id}`, { method: 'PATCH', headers: admin, body: fd });
    assert.equal(p.status, 422);
    assert.deepEqual(p.body.errors.photos, ['Maksimal 5 foto']);
  });
  await uji('Foto bisa dibuka sebagai image/png + nosniff', async () => {
    if (!gambar) return 'lewat';
    const r = await fetch(BASE + new URL(gambar).pathname);
    assert.equal(r.status, 200);
    assert.equal(r.headers.get('content-type'), 'image/png');
    assert.equal(r.headers.get('x-content-type-options'), 'nosniff');
  });
  await uji('PATCH /api/umkm/:slug (URL kontrak) status "ditolak" -> hilang dari publik', async () => {
    if (!siap() || !kedua) return 'lewat';
    const a = await api('/api/umkm/' + kedua.slug, json('PATCH', { status: 'aktif' }, admin));
    assert.equal(a.status, 200);
    assert.equal((await api('/api/umkm/' + kedua.slug)).status, 200);
    const b = await api('/api/umkm/' + kedua.slug, json('PATCH', { status: 'ditolak' }, admin));
    assert.equal(b.body.data.status, 'ditolak');
    assert.equal((await api('/api/umkm/' + kedua.slug)).status, 404);
    assert.equal((await api('/api/umkm/slug-tidak-ada', json('PATCH', { status: 'aktif' }, admin))).status, 404);
  });
  await uji('Path traversal di /storage -> 404', async () => {
    for (const p of ['/storage/umkm/..%2F..%2F.env', '/storage/umkm/..%2F..%2Fdata%2Fumkm.db', '/storage/umkm/x.php']) {
      assert.equal((await fetch(BASE + p)).status, 404, p);
    }
  });
  await uji('Hapus UMKM -> 200, foto ikut terhapus', async () => {
    if (!siap() || !baru) return 'lewat';
    const r = await api(`/api/admin/umkm/${baru.id}`, { method: 'DELETE', headers: admin });
    assert.equal(r.status, 200);
    dibuat.splice(dibuat.indexOf(baru.id), 1);
    if (gambar) assert.equal((await fetch(BASE + new URL(gambar).pathname)).status, 404);
  });

  console.log('\n[Kontrak 10] Admin berita');
  let beritaUji = null;
  await uji('Admin berita tanpa login -> 401', async () => {
    assert.equal((await api('/api/admin/berita')).status, 401);
    assert.equal((await api('/api/admin/berita', json('POST', { title: 'x' }))).status, 401);
    assert.equal((await api('/api/admin/profil', json('PATCH', { visi: 'x' }))).status, 401);
  });
  await uji('POST berita tidak lengkap -> 422 per field', async () => {
    if (!siap()) return 'lewat';
    const r = await api('/api/admin/berita', json('POST', { title: '', date: '2026-02-30', content: [], sourceUrl: 'javascript:alert(1)', status: 'tayang' }, admin));
    assert.equal(r.status, 422);
    for (const k of ['title', 'date', 'excerpt', 'content', 'sourceUrl', 'status']) assert.ok(r.body.errors[k], `errors.${k} tidak ada`);
  });
  await uji('POST berita draf + cover (multipart) -> 201, tidak tampil di publik', async () => {
    if (!siap()) return 'lewat';
    const fd = new FormData();
    fd.append('data', JSON.stringify({ title: 'Berita Uji Otomatis', date: '2026-11-01', excerpt: 'Ringkasan uji.', content: ['Paragraf satu.', 'Paragraf dua.'], sourceUrl: null }));
    fd.append('cover', new Blob([PNG], { type: 'image/png' }), 'cover.png');
    const r = await api('/api/admin/berita', { method: 'POST', headers: admin, body: fd });
    assert.equal(r.status, 201);
    beritaUji = r.body.data;
    assert.equal(beritaUji.status, 'draf');
    assert.equal(beritaUji.slug, 'berita-uji-otomatis');
    assert.match(beritaUji.cover, /^https?:\/\/.+\/storage\/umkm\/[a-f0-9]{24}\.png$/);
    assert.equal((await api('/api/berita/' + beritaUji.slug)).status, 404);
    assert.ok((await api('/api/admin/berita', { headers: admin })).body.data.some((b) => b.id === beritaUji.id));
  });
  await uji('Cover palsu (bukan gambar) -> 422', async () => {
    if (!siap() || !beritaUji) return 'lewat';
    const fd = new FormData();
    fd.append('data', '{}');
    fd.append('cover', new Blob(['<?php system($_GET[1]); ?>'], { type: 'image/png' }), 'shell.php.png');
    const r = await api(`/api/admin/berita/${beritaUji.id}`, { method: 'PATCH', headers: admin, body: fd });
    assert.equal(r.status, 422);
    assert.ok(r.body.errors.cover);
  });
  await uji('PATCH terbit + ganti judul -> tampil di publik, slug tetap', async () => {
    if (!siap() || !beritaUji) return 'lewat';
    const r = await api(`/api/admin/berita/${beritaUji.id}`, json('PATCH', { status: 'terbit', title: 'Judul Baru Uji' }, admin));
    assert.equal(r.status, 200);
    assert.equal(r.body.data.slug, beritaUji.slug);
    assert.equal(r.body.data.cover, beritaUji.cover, 'cover lama harus tetap');
    const p = await api('/api/berita/' + beritaUji.slug);
    assert.equal(p.status, 200);
    assert.equal(p.body.data.title, 'Judul Baru Uji');
    assert.deepEqual(p.body.data.content, ['Paragraf satu.', 'Paragraf dua.']);
  });
  await uji('PATCH "cover": null -> cover dihapus beserta filenya', async () => {
    if (!siap() || !beritaUji) return 'lewat';
    const r = await api(`/api/admin/berita/${beritaUji.id}`, json('PATCH', { cover: null }, admin));
    assert.equal(r.status, 200);
    assert.equal(r.body.data.cover, null);
    assert.equal((await fetch(BASE + new URL(beritaUji.cover).pathname)).status, 404);
  });
  await uji('DELETE berita -> { data: { id } }, lalu 404', async () => {
    if (!siap() || !beritaUji) return 'lewat';
    const r = await api(`/api/admin/berita/${beritaUji.id}`, { method: 'DELETE', headers: admin });
    assert.equal(r.status, 200);
    assert.deepEqual(r.body, { data: { id: beritaUji.id } });
    assert.equal((await api(`/api/admin/berita/${beritaUji.id}`, { headers: admin })).status, 404);
    beritaUji = null;
  });

  console.log('\n[Kontrak 11] Admin profil');
  const fileProfil = require('../src/config').PROFIL_ADMIN_PATH;
  const fs = require('fs');
  const profilSemula = fs.existsSync(fileProfil) ? fs.readFileSync(fileProfil) : null;
  await uji('PATCH profil tidak valid -> 422 (email, angka negatif, persen > 100)', async () => {
    if (!siap()) return 'lewat';
    const r = await api('/api/admin/profil', json('PATCH', {
      kontak: { email: 'bukan-email' },
      demografi: { jumlahPenduduk: -5, mataPencaharian: [{ nama: 'Petani', persen: 70 }, { nama: 'Pedagang', persen: 40 }] },
    }, admin));
    assert.equal(r.status, 422);
    assert.ok(r.body.errors['kontak.email']);
    assert.ok(r.body.errors['demografi.jumlahPenduduk']);
    assert.ok(r.body.errors['demografi.mataPencaharian']);
  });
  await uji('PATCH profil sebagian -> bagian lain tidak berubah, langsung tampil di GET', async () => {
    if (!siap()) return 'lewat';
    const sebelum = (await api('/api/profil')).body.data;
    const r = await api('/api/admin/profil', json('PATCH', {
      visi: 'Visi uji otomatis',
      demografi: { jumlahPenduduk: 1234, jumlahKK: 400, lakiLaki: 600, perempuan: 634, sebaranDusun: [{ nama: 'Dusun 1A', jumlah: 300 }], mataPencaharian: [{ nama: 'Petani', persen: 62.5 }] },
    }, admin));
    assert.equal(r.status, 200);
    assert.equal(r.body.data.visi, 'Visi uji otomatis');
    assert.equal(r.body.data.demografi.jumlahPenduduk, 1234);
    assert.deepEqual(r.body.data.struktur, sebelum.struktur);
    assert.deepEqual(r.body.data.misi, sebelum.misi);
    assert.equal((await api('/api/profil')).body.data.visi, 'Visi uji otomatis');
  });
  if (profilSemula) fs.writeFileSync(fileProfil, profilSemula);
  else fs.rmSync(fileProfil, { force: true });

  // Bersihkan sisa data uji.
  if (siap()) for (const id of dibuat) await api(`/api/admin/umkm/${id}`, { method: 'DELETE', headers: admin });

  console.log('-'.repeat(60));
  console.log(`Hasil: ${lulus} lulus, ${gagal} gagal, ${lewat} dilewati.`);
  if (kenaLimit) console.log('Sebagian uji dilewati karena batas pendaftaran per jam. Jalankan ulang server, lalu uji lagi.');
  if (!adaAdmin) console.log('Uji admin dilewati: isi ADMIN_PASSWORD di .env (minimal 8 karakter) lalu jalankan ulang server.');
  if (!siap() && dibuat.length) console.log('Data uji tertinggal (berstatus pending). Hapus dengan: npm run admin -- hapus warung-uji-otomatis');
  process.exit(gagal ? 1 : 0);
}

main().catch((e) => { console.error(e); process.exit(1); });
