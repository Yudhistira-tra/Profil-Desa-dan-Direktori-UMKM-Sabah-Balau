// Endpoint publik UMKM (kontrak bagian 1, 2, 3).
const { ok, fail, readBody, parseMultipart, clientIp, HttpError } = require('../http');
const { validateUmkmData, validatePhotos } = require('../validate');
const { createLimiter } = require('../ratelimit');
const { REGISTER_LIMIT_PER_HOUR } = require('../config');
const umkm = require('../umkm');

const MAX_FORM_BYTES = 27 * 1024 * 1024; // 5 foto x 5 MB + isian teks

// Anti-spam: pendaftaran BERHASIL dibatasi per IP per jam, percobaan (termasuk yang gagal) dibatasi lebih longgar.
const berhasil = createLimiter({ windowMs: 60 * 60_000, max: REGISTER_LIMIT_PER_HOUR });
const percobaan = createLimiter({ windowMs: 60 * 60_000, max: 30 });

// GET /api/umkm
function list(req, res) {
  ok(res, umkm.listApproved());
}

// GET /api/umkm/:slug
function detail(req, res, slug) {
  // Slug yang formatnya tidak mungkin ada langsung dijawab 404, tanpa menyentuh database.
  const item = /^[a-z0-9-]{1,100}$/.test(slug) ? umkm.findApprovedBySlug(slug) : null;
  if (!item) return fail(res, 404, 'UMKM tidak ditemukan');
  ok(res, item);
}

// POST /api/umkm  (multipart/form-data) — disimpan berstatus "pending", tampil setelah disetujui admin.
async function create(req, res) {
  const ip = clientIp(req);
  if (!berhasil.allowed(ip) || !percobaan.hit(ip)) {
    return fail(res, 429, 'Terlalu banyak pendaftaran dari perangkat ini. Coba lagi nanti.');
  }
  const ctype = req.headers['content-type'] || '';
  if (!/^multipart\/form-data/i.test(ctype)) throw new HttpError(415, 'Gunakan multipart/form-data');

  const body = await readBody(req, MAX_FORM_BYTES);
  const { fields, files } = parseMultipart(body, ctype);
  // Ambil nilai pertama tiap isian teks, lalu validasi data dan foto.
  const data = Object.fromEntries(Object.entries(fields).map(([k, v]) => [k, v[0]]));
  const { errors: salahData, values, products } = validateUmkmData(data, { wajibSetuju: true });
  const foto = validatePhotos(files);
  if (salahData || foto.errors) {
    return fail(res, 422, 'Data tidak valid', { ...(salahData || {}), ...(foto.errors ? { photos: foto.errors } : {}) });
  }
  const photos = foto.photos;

  const saved = umkm.createUmkm(values, products, photos, 'pending');
  berhasil.record(ip);
  ok(res, saved, 201);
}

module.exports = { list, detail, create };
