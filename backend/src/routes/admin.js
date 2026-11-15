// Endpoint admin (kontrak bagian 5 dan 6): meninjau, menyetujui, menolak, dan melengkapi data UMKM.
// Semua endpoint di sini wajib login (lihat src/session.js).
const { ok, fail, readJson, readBody, parseMultipart, HttpError } = require('../http');
const { requireAdmin } = require('../session');
const { validatePhotos } = require('../validate');
const umkm = require('../umkm');

const MAX_FORM_BYTES = 27 * 1024 * 1024;

// GET /api/admin/pendaftaran — pendaftaran berstatus pending, terbaru dulu.
function pendaftaran(req, res) {
  requireAdmin(req);
  ok(res, umkm.listForAdmin('pending'));
}

// GET /api/admin/umkm?status=pending|aktif|ditolak — semua UMKM untuk admin.
function list(req, res, _p, url) {
  requireAdmin(req);
  const status = url.searchParams.get('status');
  if (status && !umkm.statusDariApi(status)) return fail(res, 422, 'Data tidak valid', { status: ['Status harus pending, aktif, atau ditolak'] });
  ok(res, umkm.listForAdmin(status));
}

// GET /api/admin/umkm/:id — satu UMKM (status apa pun) untuk halaman edit.
function detail(req, res, id) {
  requireAdmin(req);
  const item = umkm.getForAdmin(Number(id));
  if (!item) return fail(res, 404, 'UMKM tidak ditemukan');
  ok(res, item);
}

// Body PATCH boleh:
//  - application/json: { status, mapsUrl, products, images, ...field lain }
//  - multipart/form-data: field "data" berisi JSON di atas + field "photos" (file foto baru)
async function bacaPerubahan(req) {
  const ctype = req.headers['content-type'] || '';
  let patch;
  let files = [];
  if (/^multipart\/form-data/i.test(ctype)) {
    const parsed = parseMultipart(await readBody(req, MAX_FORM_BYTES), ctype);
    files = parsed.files;
    try {
      patch = parsed.fields.data ? JSON.parse(parsed.fields.data[0]) : {};
    } catch {
      throw new HttpError(400, 'Field "data" harus berisi JSON yang valid');
    }
  } else {
    patch = await readJson(req);
  }
  if (!patch || typeof patch !== 'object' || Array.isArray(patch)) throw new HttpError(400, 'Format data tidak valid');
  return { patch, files };
}

async function simpan(req, res, id) {
  const { patch, files } = await bacaPerubahan(req);
  const foto = validatePhotos(files);
  if (foto.errors) return fail(res, 422, 'Data tidak valid', { photos: foto.errors });
  const hasil = umkm.updateUmkm(id, patch, foto.photos);
  if (!hasil) return fail(res, 404, 'UMKM tidak ditemukan');
  if (hasil.errors) return fail(res, 422, 'Data tidak valid', hasil.errors);
  ok(res, hasil.item);
}

// PATCH /api/admin/umkm/:id
async function update(req, res, id) {
  requireAdmin(req);
  await simpan(req, res, Number(id));
}

// PATCH /api/umkm/:slug  (bentuk URL di kontrak bagian 6)
async function updateBySlug(req, res, slug) {
  requireAdmin(req);
  const id = /^[a-z0-9-]{1,100}$/.test(slug) ? umkm.idBySlug(slug) : null;
  if (!id) return fail(res, 404, 'UMKM tidak ditemukan');
  await simpan(req, res, id);
}

// DELETE /api/admin/umkm/:id   (ikut menghapus foto-fotonya)
function remove(req, res, id) {
  requireAdmin(req);
  if (!umkm.removeUmkm(Number(id))) return fail(res, 404, 'UMKM tidak ditemukan');
  ok(res, { id: Number(id) });
}

module.exports = { pendaftaran, list, detail, update, updateBySlug, remove };
