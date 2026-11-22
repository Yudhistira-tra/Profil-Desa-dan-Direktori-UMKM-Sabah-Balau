// Semua pengaturan dibaca dari file .env (bila ada) atau variabel lingkungan.
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const envFile = path.join(ROOT, '.env');
if (fs.existsSync(envFile)) process.loadEnvFile(envFile);

const PORT = Number(process.env.PORT) || 8000;
const list = (v) => String(v || '').split(',').map((s) => s.trim()).filter(Boolean);

module.exports = {
  ROOT,
  PORT,
  // Alamat publik backend, dipakai untuk membuat URL gambar absolut (lihat kontrak bagian 6).
  PUBLIC_URL: (process.env.PUBLIC_URL || `http://localhost:${PORT}`).replace(/\/+$/, ''),
  // Origin frontend yang boleh memanggil API dari browser.
  CORS_ORIGINS: list(process.env.CORS_ORIGINS || 'http://localhost:5173,http://127.0.0.1:5173'),
  DB_PATH: path.resolve(ROOT, process.env.DB_PATH || 'data/umkm.db'),
  STORAGE_DIR: path.resolve(ROOT, process.env.STORAGE_DIR || 'storage/umkm'),
  PROFIL_PATH: path.join(ROOT, 'content', 'profil.json'),
  // Perubahan profil dari halaman admin disimpan terpisah, di atas isi bawaan content/profil.json.
  PROFIL_ADMIN_PATH: path.resolve(ROOT, process.env.PROFIL_ADMIN_PATH || 'data/profil-admin.json'),
  // Akun admin untuk halaman /admin di frontend (POST /api/login).
  ADMIN_USERNAME: process.env.ADMIN_USERNAME || 'admin',
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || '', // minimal 8 karakter; kosong = login admin nonaktif
  ADMIN_NAME: process.env.ADMIN_NAME || 'Administrator',
  // Token rahasia opsional untuk skrip/otomasi (header Authorization: Bearer ...).
  ADMIN_TOKEN: process.env.ADMIN_TOKEN || '',
  // Isi 1 HANYA bila backend berada di belakang Nginx/Caddy/Cloudflare.
  TRUST_PROXY: process.env.TRUST_PROXY === '1',
  // Maksimal pendaftaran UMKM yang berhasil per IP per jam (anti-spam).
  REGISTER_LIMIT_PER_HOUR: Number(process.env.REGISTER_LIMIT_PER_HOUR) || 5,
};
