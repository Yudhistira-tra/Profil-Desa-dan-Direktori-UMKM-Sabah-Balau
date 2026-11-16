// Login admin dan pemeriksaan sesi.
// Sesi berupa token bertanda tangan (HMAC) yang berlaku 8 jam; tidak perlu tabel sesi,
// dan tetap berlaku walau server dijalankan ulang.
const crypto = require('crypto');
const { ADMIN_USERNAME, ADMIN_PASSWORD, ADMIN_TOKEN, PUBLIC_URL } = require('./config');
const { HttpError, readCookie } = require('./http');

const MASA_BERLAKU_MS = 8 * 60 * 60 * 1000;
const NAMA_COOKIE = 'sesi_admin';

const loginAktif = () => ADMIN_PASSWORD.length >= 8;
const sha = (s) => crypto.createHash('sha256').update(String(s)).digest();
// Perbandingan waktu-konstan (lewat hash agar panjangnya selalu sama).
const sama = (a, b) => crypto.timingSafeEqual(sha(a), sha(b));
// Kunci tanda tangan diturunkan dari akun admin: ganti kata sandi = semua sesi lama gugur.
const tandaTangan = (isi) => crypto.createHmac('sha256', sha(`sesi:${ADMIN_USERNAME}:${ADMIN_PASSWORD}`)).update(isi).digest('hex');

function buatToken() {
  const kedaluwarsa = String(Date.now() + MASA_BERLAKU_MS);
  return `${kedaluwarsa}.${tandaTangan(kedaluwarsa)}`;
}

function tokenSah(token) {
  const [kedaluwarsa, ttd] = String(token || '').split('.');
  if (!/^\d{10,16}$/.test(kedaluwarsa || '') || !ttd) return false;
  if (Number(kedaluwarsa) < Date.now()) return false;
  return sama(ttd, tandaTangan(kedaluwarsa));
}

function cekKredensial(username, password) {
  if (!loginAktif()) return false;
  const u = sama(username, ADMIN_USERNAME);
  const p = sama(password, ADMIN_PASSWORD);
  return u && p;
}

function cookieSesi(token) {
  const aman = PUBLIC_URL.startsWith('https://') ? '; Secure' : '';
  return token
    ? `${NAMA_COOKIE}=${token}; HttpOnly; SameSite=Lax; Path=/api; Max-Age=${MASA_BERLAKU_MS / 1000}${aman}`
    : `${NAMA_COOKIE}=; HttpOnly; SameSite=Lax; Path=/api; Max-Age=0${aman}`;
}

// Dipanggil di awal setiap endpoint admin. Menerima:
//  - token sesi hasil login, lewat header "Authorization: Bearer ..." atau cookie HttpOnly
//  - ADMIN_TOKEN dari .env (opsional, untuk skrip/otomasi)
function requireAdmin(req) {
  const h = String(req.headers.authorization || '');
  const bearer = h.startsWith('Bearer ') ? h.slice(7) : '';
  if (loginAktif() && (tokenSah(bearer) || tokenSah(readCookie(req, NAMA_COOKIE)))) return;
  if (ADMIN_TOKEN.length >= 24 && bearer && sama(bearer, ADMIN_TOKEN)) return;
  if (!loginAktif() && ADMIN_TOKEN.length < 24) {
    throw new HttpError(503, 'Admin belum diaktifkan. Isi ADMIN_PASSWORD (minimal 8 karakter) di backend/.env');
  }
  throw new HttpError(401, 'Sesi admin tidak valid. Silakan masuk lagi.');
}

module.exports = { loginAktif, cekKredensial, buatToken, cookieSesi, requireAdmin };
