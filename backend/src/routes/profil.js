// GET /api/profil (kontrak bagian 4). Isi diambil dari content/profil.json agar mudah diedit tanpa database.
const fs = require('fs');
const { ok } = require('../http');
const { PROFIL_PATH } = require('../config');

const n = (v) => (v === undefined || v === '' ? null : v);
const arr = (v) => (Array.isArray(v) ? v : []);

// Pastikan bentuk respons selalu lengkap; bagian yang belum diisi menjadi null.
function normalize(p = {}) {
  const g = p.geografis || {};
  const d = p.demografi || {};
  const k = p.kontak || {};
  return {
    sejarah: n(p.sejarah),
    visi: n(p.visi),
    misi: arr(p.misi).filter((x) => typeof x === 'string' && x.trim()),
    struktur: arr(p.struktur)
      .filter((s) => s && s.name && s.position)
      .map((s) => ({ name: s.name, position: s.position, photoUrl: n(s.photoUrl) })),
    geografis: {
      luas: n(g.luas),
      batasUtara: n(g.batasUtara),
      batasSelatan: n(g.batasSelatan),
      batasTimur: n(g.batasTimur),
      batasBarat: n(g.batasBarat),
    },
    demografi: {
      jumlahPenduduk: Number.isFinite(d.jumlahPenduduk) ? d.jumlahPenduduk : null,
      jumlahKK: Number.isFinite(d.jumlahKK) ? d.jumlahKK : null,
    },
    kontak: { alamat: n(k.alamat), telepon: n(k.telepon), email: n(k.email), jamLayanan: n(k.jamLayanan) },
  };
}

// Dibaca ulang hanya bila file berubah.
let cache = { mtime: 0, data: null };
function load() {
  const stat = fs.statSync(PROFIL_PATH);
  if (stat.mtimeMs !== cache.mtime) {
    let raw;
    try {
      raw = JSON.parse(fs.readFileSync(PROFIL_PATH, 'utf8'));
    } catch (e) {
      throw new Error(`content/profil.json tidak valid: ${e.message}`);
    }
    cache = { mtime: stat.mtimeMs, data: normalize(raw) };
  }
  return cache.data;
}

function get(req, res) {
  ok(res, load());
}

module.exports = { get };
