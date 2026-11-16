// Akses data UMKM di database dan pembentukan objek sesuai kontrak (bagian 8).
const { db, transaction } = require('./db');
const { MAX_PHOTOS, photoUrl, savePhoto, deletePhoto } = require('./storage');
const { validateUmkmData } = require('./validate');

const now = () => new Date().toISOString();

// Nama status di API mengikuti kontrak/frontend; di database dipakai nama internal.
const KE_API = { pending: 'pending', approved: 'aktif', rejected: 'ditolak' };
const DARI_API = { pending: 'pending', aktif: 'approved', ditolak: 'rejected', approved: 'approved', rejected: 'rejected' };
const statusKeApi = (s) => KE_API[s] || s;
const statusDariApi = (s) => DARI_API[s] || null;

// "Warung Bu Ani!" -> "warung-bu-ani"
function slugify(name) {
  const s = String(name)
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
    .replace(/-+$/g, '');
  return s || 'umkm';
}

// Slug harus unik: bila sudah dipakai, tambahkan -2, -3, dst.
function uniqueSlug(base) {
  const taken = db.prepare('SELECT 1 FROM umkm WHERE slug = ?');
  if (!taken.get(base)) return base;
  for (let i = 2; ; i++) {
    const s = `${base}-${i}`;
    if (!taken.get(s)) return s;
  }
}

// Ambil foto & produk untuk banyak UMKM sekaligus (2 query, bukan 2 query per UMKM).
function loadChildren(ids) {
  const images = new Map();
  const products = new Map();
  if (!ids.length) return { images, products };
  const marks = ids.map(() => '?').join(',');
  for (const r of db.prepare(`SELECT umkm_id, file FROM umkm_images WHERE umkm_id IN (${marks}) ORDER BY position, id`).all(...ids)) {
    (images.get(r.umkm_id) || images.set(r.umkm_id, []).get(r.umkm_id)).push(r.file);
  }
  for (const r of db.prepare(`SELECT umkm_id, name, description, price FROM umkm_products WHERE umkm_id IN (${marks}) ORDER BY position, id`).all(...ids)) {
    (products.get(r.umkm_id) || products.set(r.umkm_id, []).get(r.umkm_id)).push({ name: r.name, description: r.description, price: r.price });
  }
  return { images, products };
}

// Bentuk objek UMKM persis seperti kontrak.
// hargaAsli: true untuk admin (tampilkan harga yang benar-benar tersimpan, tanpa pengisian otomatis).
function toApi(row, images = [], products = [], hargaAsli = false) {
  const prices = products.map((p) => p.price).filter((p) => Number.isInteger(p));
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    owner: row.owner,
    ownerSince: row.owner_since ?? null,
    address: row.address,
    mapsUrl: row.maps_url ?? null,
    whatsapp: row.whatsapp,
    // Bila harga mulai tidak diisi, pakai harga produk termurah (kalau ada).
    priceMin: row.price_min ?? (!hargaAsli && prices.length ? Math.min(...prices) : null),
    openingHours: row.opening_hours ?? null,
    description: row.description,
    images: images.map(photoUrl),
    products,
  };
}

function withChildren(rows, hargaAsli = false) {
  const { images, products } = loadChildren(rows.map((r) => r.id));
  return rows.map((r) => toApi(r, images.get(r.id), products.get(r.id), hargaAsli));
}

// Kontrak: hanya UMKM yang sudah disetujui, urut nama A–Z.
function listApproved() {
  return withChildren(db.prepare("SELECT * FROM umkm WHERE status = 'approved' ORDER BY name COLLATE NOCASE, id").all());
}

function findApprovedBySlug(slug) {
  const row = db.prepare("SELECT * FROM umkm WHERE slug = ? AND status = 'approved'").get(slug);
  return row ? withChildren([row])[0] : null;
}

// Untuk admin: objek UMKM + status + tanggal daftar.
function adminItems(rows) {
  return withChildren(rows, true).map((it, i) => ({ ...it, status: statusKeApi(rows[i].status), date: rows[i].created_at }));
}

// Semua status (atau satu status), terbaru dulu.
function listForAdmin(statusApi) {
  const status = statusApi ? statusDariApi(statusApi) : null;
  const rows = status
    ? db.prepare('SELECT * FROM umkm WHERE status = ? ORDER BY created_at DESC, id DESC').all(status)
    : db.prepare('SELECT * FROM umkm ORDER BY created_at DESC, id DESC').all();
  return adminItems(rows);
}

function getForAdmin(id) {
  const row = db.prepare('SELECT * FROM umkm WHERE id = ?').get(id);
  return row ? adminItems([row])[0] : null;
}

function idBySlug(slug) {
  const row = db.prepare('SELECT id FROM umkm WHERE slug = ?').get(slug);
  return row ? row.id : null;
}

const insertTx = transaction((values, products, files, status) => {
  const t = now();
  const slug = uniqueSlug(slugify(values.slug || values.name));
  const id = Number(
    db
      .prepare(
        `INSERT INTO umkm (slug, name, owner, owner_since, address, maps_url, whatsapp, price_min, opening_hours, description, status, consent_at, created_at, updated_at, approved_at)
         VALUES (:slug, :name, :owner, :ownerSince, :address, :mapsUrl, :whatsapp, :priceMin, :openingHours, :description, :status, :t, :t, :t, :approvedAt)`
      )
      .run({
        slug, name: values.name, owner: values.owner, ownerSince: values.ownerSince ?? null, address: values.address,
        mapsUrl: values.mapsUrl ?? null, whatsapp: values.whatsapp, priceMin: values.priceMin ?? null,
        openingHours: values.openingHours ?? null, description: values.description,
        status, t, approvedAt: status === 'approved' ? t : null,
      }).lastInsertRowid
  );
  const img = db.prepare('INSERT INTO umkm_images (umkm_id, file, position) VALUES (?, ?, ?)');
  files.forEach((f, i) => img.run(id, f, i));
  const prod = db.prepare('INSERT INTO umkm_products (umkm_id, name, description, price, position) VALUES (?, ?, ?, ?, ?)');
  products.forEach((p, i) => prod.run(id, p.name, p.description ?? null, p.price ?? null, i));
  return { id, slug, status: statusKeApi(status) };
});

// Simpan UMKM baru. Foto ditulis ke disk dulu; bila database gagal, foto dihapus lagi.
// photos: [{ data, ext }] untuk unggahan, atau [{ file }] untuk nama file/URL yang sudah ada (seed).
function createUmkm(values, products, photos, status = 'pending') {
  const baru = [];
  try {
    const files = photos.map((p) => {
      if (p.file) return p.file;
      const f = savePhoto(p.data, p.ext);
      baru.push(f);
      return f;
    });
    return insertTx(values, products, files, status);
  } catch (e) {
    baru.forEach(deletePhoto);
    throw e;
  }
}

function setStatus(id, status) {
  const t = now();
  const r = db
    .prepare("UPDATE umkm SET status = ?, updated_at = ?, approved_at = CASE WHEN ? = 'approved' THEN COALESCE(approved_at, ?) ELSE NULL END WHERE id = ?")
    .run(status, t, status, t, id);
  if (!r.changes) return null;
  const row = db.prepare('SELECT id, slug, status FROM umkm WHERE id = ?').get(id);
  return { id: row.id, slug: row.slug, status: statusKeApi(row.status) };
}

const updateTx = transaction((id, values, status, products, files) => {
  const t = now();
  db.prepare(
    `UPDATE umkm SET name = :name, owner = :owner, owner_since = :ownerSince, address = :address, maps_url = :mapsUrl,
       whatsapp = :whatsapp, price_min = :priceMin, opening_hours = :openingHours, description = :description,
       status = :status, updated_at = :t,
       approved_at = CASE WHEN :status = 'approved' THEN COALESCE(approved_at, :t) ELSE NULL END
     WHERE id = :id`
  ).run({ ...values, status, t, id });
  if (products) {
    db.prepare('DELETE FROM umkm_products WHERE umkm_id = ?').run(id);
    const prod = db.prepare('INSERT INTO umkm_products (umkm_id, name, description, price, position) VALUES (?, ?, ?, ?, ?)');
    products.forEach((p, i) => prod.run(id, p.name, p.description ?? null, p.price ?? null, i));
  }
  if (files) {
    db.prepare('DELETE FROM umkm_images WHERE umkm_id = ?').run(id);
    const img = db.prepare('INSERT INTO umkm_images (umkm_id, file, position) VALUES (?, ?, ?)');
    files.forEach((f, i) => img.run(id, f, i));
  }
});

// Admin mengubah sebagian atau seluruh data satu UMKM (kontrak bagian 6).
// patch: field yang diubah. patch.images = daftar URL foto lama yang DIPERTAHANKAN (urutannya dipakai).
// fotoBaru: [{ data, ext }] foto unggahan baru, ditaruh setelah foto lama.
// Hasil: null (tidak ada) | { errors } | { item }.
function updateUmkm(id, patch, fotoBaru = []) {
  const row = db.prepare('SELECT * FROM umkm WHERE id = ?').get(id);
  if (!row) return null;

  const sekarang = {
    name: row.name, owner: row.owner, ownerSince: row.owner_since, address: row.address, mapsUrl: row.maps_url,
    whatsapp: row.whatsapp, priceMin: row.price_min, openingHours: row.opening_hours, description: row.description,
  };
  const gabung = { ...sekarang };
  for (const k of Object.keys(sekarang)) if (k in patch) gabung[k] = patch[k];
  if ('products' in patch) gabung.products = patch.products;

  const { errors: salah, values, products } = validateUmkmData(gabung);
  const errors = salah || {};

  let status = row.status;
  if ('status' in patch) {
    status = statusDariApi(patch.status);
    if (!status) errors.status = ['Status harus pending, aktif, atau ditolak'];
  }

  const lama = db.prepare('SELECT file FROM umkm_images WHERE umkm_id = ? ORDER BY position, id').all(id).map((r) => r.file);
  let simpan = lama;
  if ('images' in patch) {
    if (!Array.isArray(patch.images)) errors.images = ['Format daftar foto tidak valid'];
    else {
      // Hanya foto milik UMKM ini yang bisa dipertahankan; URL asing diabaikan.
      simpan = [];
      for (const url of patch.images) {
        const f = lama.find((x) => photoUrl(x) === url);
        if (f && !simpan.includes(f)) simpan.push(f);
      }
    }
  }
  if (simpan.length + fotoBaru.length > MAX_PHOTOS) errors.photos = [`Maksimal ${MAX_PHOTOS} foto`];
  if (Object.keys(errors).length) return { errors };

  const baru = [];
  try {
    for (const p of fotoBaru) baru.push(savePhoto(p.data, p.ext));
    const ubahFoto = 'images' in patch || baru.length > 0;
    updateTx(id, values, status, 'products' in patch ? products : null, ubahFoto ? [...simpan, ...baru] : null);
  } catch (e) {
    baru.forEach(deletePhoto);
    throw e;
  }
  lama.filter((f) => !simpan.includes(f)).forEach(deletePhoto);
  return { item: getForAdmin(id) };
}

function removeUmkm(id) {
  const files = db.prepare('SELECT file FROM umkm_images WHERE umkm_id = ?').all(id).map((r) => r.file);
  const r = db.prepare('DELETE FROM umkm WHERE id = ?').run(id);
  if (!r.changes) return false;
  files.forEach(deletePhoto);
  return true;
}

module.exports = { slugify, statusDariApi, listApproved, findApprovedBySlug, listForAdmin, getForAdmin, idBySlug, createUmkm, setStatus, updateUmkm, removeUmkm };
