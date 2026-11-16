// Koneksi database SQLite bawaan Node.js (node:sqlite) dan pembuatan tabel.
const fs = require('fs');
const path = require('path');
const { DB_PATH } = require('./config');

let DatabaseSync;
try {
  ({ DatabaseSync } = require('node:sqlite'));
} catch {
  console.error(`Node.js ${process.version} belum punya SQLite bawaan. Pasang Node.js 22.13 atau lebih baru (disarankan versi LTS terbaru).`);
  process.exit(1);
}

fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
const db = new DatabaseSync(DB_PATH);

db.exec(`
PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;
PRAGMA busy_timeout = 5000;

CREATE TABLE IF NOT EXISTS umkm (
  id            INTEGER PRIMARY KEY,
  slug          TEXT NOT NULL UNIQUE,
  name          TEXT NOT NULL,
  owner         TEXT NOT NULL,
  owner_since   INTEGER,
  address       TEXT NOT NULL,
  maps_url      TEXT,
  whatsapp      TEXT NOT NULL,
  price_min     INTEGER,
  opening_hours TEXT,
  description   TEXT NOT NULL,
  status        TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  consent_at    TEXT NOT NULL,   -- kapan pemilik menyetujui datanya dipublikasikan
  created_at    TEXT NOT NULL,
  updated_at    TEXT NOT NULL,
  approved_at   TEXT
);
CREATE INDEX IF NOT EXISTS idx_umkm_status_name ON umkm (status, name COLLATE NOCASE);

CREATE TABLE IF NOT EXISTS umkm_images (
  id       INTEGER PRIMARY KEY,
  umkm_id  INTEGER NOT NULL REFERENCES umkm (id) ON DELETE CASCADE,
  file     TEXT NOT NULL,        -- nama file di storage/umkm, atau URL absolut
  position INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_images_umkm ON umkm_images (umkm_id, position);

CREATE TABLE IF NOT EXISTS umkm_products (
  id          INTEGER PRIMARY KEY,
  umkm_id     INTEGER NOT NULL REFERENCES umkm (id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  description TEXT,
  price       INTEGER,
  position    INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_products_umkm ON umkm_products (umkm_id, position);
`);

// Migrasi ringan untuk database lama: tambah kolom bila belum ada (aman dijalankan berulang).
function addColumn(table, col, def) {
  const ada = db.prepare(`PRAGMA table_info(${table})`).all().some((c) => c.name === col);
  if (!ada) db.exec(`ALTER TABLE ${table} ADD COLUMN ${col} ${def}`);
}
addColumn('umkm', 'owner_since', 'INTEGER');

// Jalankan fn di dalam satu transaksi: berhasil semua atau batal semua.
function transaction(fn) {
  return (...args) => {
    db.exec('BEGIN');
    try {
      const result = fn(...args);
      db.exec('COMMIT');
      return result;
    } catch (e) {
      db.exec('ROLLBACK');
      throw e;
    }
  };
}

module.exports = { db, transaction };
