// Penyimpanan dan penyajian foto UMKM di folder storage/umkm.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { STORAGE_DIR, PUBLIC_URL } = require('./config');

fs.mkdirSync(STORAGE_DIR, { recursive: true });

const MAX_PHOTO_BYTES = 5 * 1024 * 1024; // kontrak: maks 5 MB per foto
const MAX_PHOTOS = 5; // kontrak: maks 5 foto
const MIME = { jpg: 'image/jpeg', png: 'image/png', webp: 'image/webp' };

// Jenis gambar ditentukan dari ISI file (magic bytes), bukan dari nama atau tipe kiriman browser,
// supaya file berbahaya (mis. web shell) yang menyamar sebagai gambar ditolak.
function detectImage(buf) {
  if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'jpg';
  if (buf.length >= 8 && buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'png';
  if (buf.length >= 12 && buf.subarray(0, 4).toString('latin1') === 'RIFF' && buf.subarray(8, 12).toString('latin1') === 'WEBP') return 'webp';
  return null;
}

// Simpan buffer gambar dengan nama acak. Mengembalikan nama file.
function savePhoto(buf, ext) {
  const name = crypto.randomBytes(12).toString('hex') + '.' + ext;
  fs.writeFileSync(path.join(STORAGE_DIR, name), buf, { flag: 'wx' });
  return name;
}

const SAFE_NAME = /^[a-f0-9]{24}\.(jpg|png|webp)$/;

function deletePhoto(name) {
  if (!SAFE_NAME.test(name)) return;
  try {
    fs.rmSync(path.join(STORAGE_DIR, name), { force: true });
  } catch (e) {
    console.error(`Gagal menghapus foto ${name}: ${e.message}`);
  }
}

// Kontrak bagian 6: API mengembalikan URL absolut.
// Data contoh dari frontend memakai path lokal ("/images/..."); itu dibiarkan apa adanya.
function photoUrl(file) {
  return /^https?:\/\//i.test(file) || file.startsWith('/') ? file : `${PUBLIC_URL}/storage/umkm/${file}`;
}

// GET /storage/umkm/<nama-file>. Nama file wajib cocok pola acak, jadi path traversal tidak mungkin.
function servePhoto(res, name) {
  if (!SAFE_NAME.test(name)) return false;
  const file = path.join(STORAGE_DIR, name);
  let stat;
  try {
    stat = fs.statSync(file);
  } catch {
    return false;
  }
  res.writeHead(200, {
    'Content-Type': MIME[name.split('.').pop()],
    'Content-Length': stat.size,
    'Cache-Control': 'public, max-age=604800',
    'Cross-Origin-Resource-Policy': 'cross-origin', // agar bisa ditampilkan frontend di domain/port lain
  });
  fs.createReadStream(file).pipe(res);
  return true;
}

module.exports = { MAX_PHOTO_BYTES, MAX_PHOTOS, detectImage, savePhoto, deletePhoto, photoUrl, servePhoto };
