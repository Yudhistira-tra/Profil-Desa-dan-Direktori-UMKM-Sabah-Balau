// Login admin (kontrak bagian 4).
const { ok, fail, readJson, clientIp } = require('../http');
const { createLimiter } = require('../ratelimit');
const { ADMIN_NAME } = require('../config');
const sesi = require('../session');

// Anti tebak-kata-sandi: maksimal 10 login gagal per IP per 15 menit.
const gagalLogin = createLimiter({ windowMs: 15 * 60_000, max: 10 });

// POST /api/login   body JSON: { "username": "...", "password": "..." }
async function login(req, res) {
  const ip = clientIp(req);
  if (!gagalLogin.allowed(ip)) return fail(res, 429, 'Terlalu banyak percobaan masuk. Coba lagi nanti.');
  const body = await readJson(req, 10 * 1024);
  if (!sesi.loginAktif()) return fail(res, 503, 'Admin belum diaktifkan. Isi ADMIN_PASSWORD (minimal 8 karakter) di backend/.env');
  if (typeof body.username !== 'string' || typeof body.password !== 'string' || !sesi.cekKredensial(body.username.trim(), body.password)) {
    gagalLogin.record(ip);
    return fail(res, 401, 'Username atau password salah');
  }
  const token = sesi.buatToken();
  res.setHeader('Set-Cookie', sesi.cookieSesi(token));
  ok(res, { name: ADMIN_NAME, token });
}

// POST /api/logout
function logout(req, res) {
  res.setHeader('Set-Cookie', sesi.cookieSesi(null));
  ok(res, { ok: true });
}

module.exports = { login, logout };
