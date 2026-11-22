// Akses data berita desa (kontrak bagian 8–10).
const { db, transaction } = require('./db');
const { slugify } = require('./umkm');
const { savePhoto, deletePhoto, photoUrl, MAX_PHOTO_BYTES, detectImage } = require('./storage');

const STATUS = ['draf', 'terbit'];
const now = () => new Date().toISOString();

function parseContent(text) {
  try {
    const v = JSON.parse(text);
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

// Bentuk respons. Daftar publik tidak memuat content; admin memuat content + status.
function toApi(row, { lengkap = false, admin = false } = {}) {
  const item = {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    cover: row.cover ? photoUrl(row.cover) : null,
    date: row.date,
    sourceUrl: row.source_url,
  };
  if (lengkap || admin) item.content = parseContent(row.content);
  if (admin) item.status = row.status;
  return item;
}

const URUT = 'ORDER BY date DESC, id DESC';

function listTerbit() {
  return db.prepare(`SELECT * FROM berita WHERE status = 'terbit' ${URUT}`).all().map((r) => toApi(r));
}

function findTerbitBySlug(slug) {
  const row = db.prepare(`SELECT * FROM berita WHERE slug = ? AND status = 'terbit'`).get(slug);
  return row ? toApi(row, { lengkap: true }) : null;
}

function listAdmin() {
  return db.prepare(`SELECT * FROM berita ${URUT}`).all().map((r) => toApi(r, { admin: true }));
}

function getRow(id) {
  return db.prepare('SELECT * FROM berita WHERE id = ?').get(id);
}

function getAdmin(id) {
  const row = getRow(id);
  return row ? toApi(row, { admin: true }) : null;
}

// ---------- Validasi ----------

const teks = (v) => (typeof v === 'string' ? v.trim() : '');

function tanggalValid(s) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const d = new Date(s + 'T00:00:00Z');
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
}

function urlValid(s) {
  try {
    const u = new URL(s);
    return (u.protocol === 'http:' || u.protocol === 'https:') && s.length <= 500;
  } catch {
    return false;
  }
}

// data = objek dari frontend. partial = true untuk PATCH (field yang tidak dikirim tidak dicek).
function validasi(data, partial) {
  const errors = {};
  const nilai = {};
  const ada = (k) => !partial || Object.prototype.hasOwnProperty.call(data, k);
  const salah = (k, msg) => { (errors[k] = errors[k] || []).push(msg); };

  if (ada('title')) {
    const t = teks(data.title);
    if (!t) salah('title', 'Judul wajib diisi');
    else if (t.length > 150) salah('title', 'Judul maksimal 150 karakter');
    else nilai.title = t;
  }
  if (ada('date')) {
    const t = teks(data.date);
    if (!tanggalValid(t)) salah('date', 'Tanggal wajib berformat YYYY-MM-DD');
    else nilai.date = t;
  }
  if (ada('excerpt')) {
    const t = teks(data.excerpt);
    if (!t) salah('excerpt', 'Ringkasan wajib diisi');
    else if (t.length > 220) salah('excerpt', 'Ringkasan maksimal 220 karakter');
    else nilai.excerpt = t;
  }
  if (ada('content')) {
    const c = Array.isArray(data.content) ? data.content : typeof data.content === 'string' ? data.content.split(/\n\s*\n/) : null;
    const paragraf = c ? c.filter((x) => typeof x === 'string').map((x) => x.trim()).filter(Boolean) : [];
    if (!paragraf.length) salah('content', 'Isi berita wajib diisi (minimal 1 paragraf)');
    else if (paragraf.length > 100 || paragraf.join('').length > 50_000) salah('content', 'Isi berita terlalu panjang');
    else nilai.content = paragraf;
  }
  if (ada('sourceUrl')) {
    const t = teks(data.sourceUrl);
    if (!t) nilai.sourceUrl = null;
    else if (!urlValid(t)) salah('sourceUrl', 'Link harus diawali http:// atau https://');
    else nilai.sourceUrl = t;
  }
  if (ada('status')) {
    const t = data.status === undefined ? 'draf' : data.status;
    if (!STATUS.includes(t)) salah('status', 'Status harus draf atau terbit');
    else nilai.status = t;
  }
  return Object.keys(errors).length ? { errors } : { nilai };
}

function validasiCover(files) {
  const lain = files.filter((f) => f.field !== 'cover');
  if (lain.length) return { errors: ['Berkas hanya boleh dikirim lewat field cover'] };
  const cover = files.filter((f) => f.field === 'cover');
  if (cover.length > 1) return { errors: ['Hanya 1 foto utama'] };
  if (!cover.length) return { file: null };
  if (cover[0].data.length > MAX_PHOTO_BYTES) return { errors: ['Foto lebih dari 5 MB'] };
  const ext = detectImage(cover[0].data);
  if (!ext) return { errors: ['Foto harus berformat JPG, PNG, atau WebP'] };
  return { file: { data: cover[0].data, ext } };
}

// ---------- Tulis ----------

function uniqueSlug(base) {
  const dasar = slugify(base).slice(0, 80) || 'berita';
  let slug = dasar;
  for (let n = 2; db.prepare('SELECT 1 FROM berita WHERE slug = ?').get(slug); n++) slug = `${dasar}-${n}`;
  return slug;
}

// coverFile = { data, ext } (upload baru) atau { file } (nama/URL yang sudah ada, dipakai seed).
// slugAwal opsional (dipakai seed agar slug sama dengan data contoh frontend).
const create = transaction((nilai, coverFile, slugAwal) => {
  const cover = coverFile ? (coverFile.file ?? savePhoto(coverFile.data, coverFile.ext)) : null;
  const t = now();
  const r = db.prepare(`INSERT INTO berita (slug, title, excerpt, content, cover, date, source_url, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
    uniqueSlug(slugAwal || nilai.title), nilai.title, nilai.excerpt, JSON.stringify(nilai.content), cover,
    nilai.date, nilai.sourceUrl ?? null, nilai.status ?? 'draf', t, t,
  );
  return getAdmin(Number(r.lastInsertRowid));
});

// hapusCover = true bila body berisi "cover": null. Slug tidak berubah walau judul diedit.
function update(id, nilai, coverFile, hapusCover) {
  const row = getRow(id);
  if (!row) return null;
  let cover = row.cover;
  if (coverFile) cover = savePhoto(coverFile.data, coverFile.ext);
  else if (hapusCover) cover = null;

  const kolom = { title: 'title', excerpt: 'excerpt', date: 'date', sourceUrl: 'source_url', status: 'status' };
  const set = ['cover = ?', 'updated_at = ?'];
  const args = [cover, now()];
  for (const [k, c] of Object.entries(kolom)) if (k in nilai) { set.push(`${c} = ?`); args.push(nilai[k]); }
  if (nilai.content) { set.push('content = ?'); args.push(JSON.stringify(nilai.content)); }
  db.prepare(`UPDATE berita SET ${set.join(', ')} WHERE id = ?`).run(...args, id);
  if (row.cover && row.cover !== cover) deletePhoto(row.cover);
  return getAdmin(id);
}

function remove(id) {
  const row = getRow(id);
  if (!row) return false;
  db.prepare('DELETE FROM berita WHERE id = ?').run(id);
  if (row.cover) deletePhoto(row.cover);
  return true;
}

module.exports = { listTerbit, findTerbitBySlug, listAdmin, getAdmin, validasi, validasiCover, create, update, remove };
