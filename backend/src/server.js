// Titik masuk server. Menjalankan HTTP server bawaan Node.js di PORT (default 8000).
const http = require('http');
const { PORT, PUBLIC_URL, CORS_ORIGINS, ADMIN_PASSWORD } = require('./config');
const { fail, ok, applyCors, securityHeaders, clientIp, HttpError } = require('./http');
const { createLimiter } = require('./ratelimit');
const { servePhoto } = require('./storage');
const umkm = require('./routes/umkm');
const profil = require('./routes/profil');
const admin = require('./routes/admin');
const auth = require('./routes/auth');

// Daftar route: [method, pola URL, handler]. Bagian dalam kurung pada pola dikirim ke handler.
const routes = [
  ['GET', /^\/api\/health$/, (req, res) => ok(res, { status: 'ok' })],
  ['GET', /^\/api\/umkm$/, umkm.list],
  ['POST', /^\/api\/umkm$/, umkm.create],
  ['GET', /^\/api\/umkm\/([^/]{1,200})$/, umkm.detail],
  ['GET', /^\/api\/profil$/, profil.get],
  ['PATCH', /^\/api\/umkm\/([^/]{1,200})$/, admin.updateBySlug],
  ['POST', /^\/api\/login$/, auth.login],
  ['POST', /^\/api\/logout$/, auth.logout],
  ['GET', /^\/api\/admin\/pendaftaran$/, admin.pendaftaran],
  ['GET', /^\/api\/admin\/umkm$/, admin.list],
  ['GET', /^\/api\/admin\/umkm\/(\d{1,10})$/, admin.detail],
  ['PATCH', /^\/api\/admin\/umkm\/(\d{1,10})$/, admin.update],
  ['DELETE', /^\/api\/admin\/umkm\/(\d{1,10})$/, admin.remove],
];

// Batas umum per IP agar server tidak dibanjiri permintaan.
const umum = createLimiter({ windowMs: 60_000, max: 300 });

async function handle(req, res) {
  securityHeaders(res);
  if (applyCors(req, res)) return; // preflight OPTIONS sudah dijawab

  if (!umum.hit(clientIp(req))) return fail(res, 429, 'Terlalu banyak permintaan. Coba lagi sebentar lagi.');

  const url = new URL(req.url, 'http://localhost');
  const pathname = url.pathname.length > 1 ? url.pathname.replace(/\/+$/, '') : url.pathname;

  // Foto UMKM: GET /storage/umkm/<nama-file>
  const foto = /^\/storage\/umkm\/([^/]+)$/.exec(pathname);
  if (foto && (req.method === 'GET' || req.method === 'HEAD')) {
    if (servePhoto(res, foto[1])) return;
    return fail(res, 404, 'Gambar tidak ditemukan');
  }

  let pathMatched = false;
  for (const [method, pattern, handler] of routes) {
    const m = pattern.exec(pathname);
    if (!m) continue;
    pathMatched = true;
    if (method !== req.method) continue;
    return handler(req, res, m[1], url);
  }
  if (pathMatched) return fail(res, 405, 'Metode tidak diizinkan');
  fail(res, 404, 'Endpoint tidak ditemukan');
}

const server = http.createServer(async (req, res) => {
  try {
    await handle(req, res);
  } catch (e) {
    if (res.headersSent) return res.destroy();
    if (e instanceof HttpError) return fail(res, e.status, e.message, e.errors);
    console.error(`[${new Date().toISOString()}] ${req.method} ${req.url}`, e);
    fail(res, 500, 'Terjadi kesalahan pada server');
  }
});

server.requestTimeout = 60_000;
server.headersTimeout = 20_000;

server.listen(PORT, () => {
  console.log(`Backend berjalan di http://localhost:${PORT}/api`);
  console.log(`URL gambar memakai: ${PUBLIC_URL}`);
  console.log(`CORS diizinkan untuk: ${CORS_ORIGINS.join(', ')}`);
  if (ADMIN_PASSWORD.length < 8) console.log('Catatan: ADMIN_PASSWORD belum diisi di .env, login admin nonaktif.');
});
