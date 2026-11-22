// Endpoint berita (kontrak bagian 8–10).
const { ok, fail, sendJson, readJson, readBody, parseMultipart, HttpError } = require('../http');
const { requireAdmin } = require('../session');
const berita = require('../berita');

const MAX_FORM_BYTES = 6 * 1024 * 1024; // 1 foto (5 MB) + teks

// GET /api/berita — hanya yang terbit, terbaru dulu, tanpa content.
function list(req, res) {
  ok(res, berita.listTerbit());
}

// GET /api/berita/:slug — 404 bila tidak ada atau masih draf.
function detail(req, res, slug) {
  const item = /^[a-z0-9-]{1,100}$/.test(slug) ? berita.findTerbitBySlug(slug) : null;
  if (!item) return fail(res, 404, 'Berita tidak ditemukan');
  ok(res, item);
}

// ---------- Admin ----------

function adminList(req, res) {
  requireAdmin(req);
  ok(res, berita.listAdmin());
}

function adminDetail(req, res, id) {
  requireAdmin(req);
  const item = berita.getAdmin(Number(id));
  if (!item) return fail(res, 404, 'Berita tidak ditemukan');
  ok(res, item);
}

// Body: JSON objek berita, atau multipart dengan field "data" (JSON) + field "cover" (file).
async function bacaBody(req) {
  const ctype = req.headers['content-type'] || '';
  let data;
  let files = [];
  if (/^multipart\/form-data/i.test(ctype)) {
    const parsed = parseMultipart(await readBody(req, MAX_FORM_BYTES), ctype);
    files = parsed.files;
    try {
      data = parsed.fields.data ? JSON.parse(parsed.fields.data[0]) : {};
    } catch {
      throw new HttpError(400, 'Field "data" harus berisi JSON yang valid');
    }
  } else {
    data = await readJson(req, 200 * 1024);
  }
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new HttpError(400, 'Format data tidak valid');
  return { data, files };
}

async function simpan(req, res, id) {
  requireAdmin(req);
  const { data, files } = await bacaBody(req);
  const v = berita.validasi(data, id !== null);
  const c = berita.validasiCover(files);
  if (v.errors || c.errors) return fail(res, 422, 'Data tidak valid', { ...(v.errors || {}), ...(c.errors ? { cover: c.errors } : {}) });

  if (id === null) return sendJson(res, 201, { data: berita.create(v.nilai, c.file) });

  const item = berita.update(id, v.nilai, c.file, data.cover === null);
  if (!item) return fail(res, 404, 'Berita tidak ditemukan');
  ok(res, item);
}

const create = (req, res) => simpan(req, res, null);
const update = (req, res, id) => simpan(req, res, Number(id));

function remove(req, res, id) {
  requireAdmin(req);
  if (!berita.remove(Number(id))) return fail(res, 404, 'Berita tidak ditemukan');
  ok(res, { id: Number(id) });
}

module.exports = { list, detail, adminList, adminDetail, create, update, remove };
