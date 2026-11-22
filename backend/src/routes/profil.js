// GET /api/profil (kontrak bagian 7) dan PATCH /api/admin/profil (bagian 11).
//
// Isi bawaan ada di content/profil.json (ikut git, bisa diedit manual).
// Perubahan dari halaman admin disimpan di data/profil-admin.json (tidak ikut git), per bagian,
// lalu ditumpuk di atas isi bawaan. Hapus file itu untuk kembali ke isi bawaan.
const fs = require('fs');
const path = require('path');
const { ok, fail, readJson, HttpError } = require('../http');
const { requireAdmin } = require('../session');
const { PROFIL_PATH, PROFIL_ADMIN_PATH } = require('../config');

const BAGIAN = ['periode', 'ringkasan', 'jargon', 'sejarah', 'visi', 'misi', 'struktur', 'geografis', 'demografi', 'kontak'];

// ---------- Bentuk respons ----------

const s = (v) => (typeof v === 'string' && v.trim() ? v.trim() : null);
const arr = (v) => (Array.isArray(v) ? v : []);
const angka = (v) => (typeof v === 'number' && Number.isFinite(v) && v >= 0 ? v : null);
const obj = (v) => (v && typeof v === 'object' && !Array.isArray(v) ? v : {});

function orang(o, pimpinan) {
  const x = obj(o);
  const hasil = { nama: s(x.nama), jabatan: s(x.jabatan), unit: s(x.unit), deskripsi: s(x.deskripsi) };
  if (pimpinan) hasil.email = s(x.email);
  hasil.photoUrl = s(x.photoUrl);
  return hasil;
}

// Pastikan bentuk respons selalu lengkap; bagian yang belum diisi menjadi null / [].
function normalize(p = {}) {
  const st = obj(p.struktur);
  const g = obj(p.geografis);
  const d = obj(p.demografi);
  const k = obj(p.kontak);
  return {
    nama: s(p.nama),
    kecamatan: s(p.kecamatan),
    periode: s(p.periode),
    ringkasan: s(p.ringkasan),
    jargon: s(p.jargon),
    sejarah: s(p.sejarah),
    visi: s(p.visi),
    misi: arr(p.misi).map(s).filter(Boolean),
    struktur: {
      pimpinan: orang(st.pimpinan, true),
      perangkat: arr(st.perangkat).map((o) => orang(o, false)).filter((o) => o.nama && o.jabatan),
    },
    geografis: {
      luas: s(g.luas),
      jumlahDusun: angka(g.jumlahDusun),
      batasUtara: s(g.batasUtara),
      batasSelatan: s(g.batasSelatan),
      batasTimur: s(g.batasTimur),
      batasBarat: s(g.batasBarat),
    },
    demografi: {
      jumlahPenduduk: angka(d.jumlahPenduduk),
      jumlahKK: angka(d.jumlahKK),
      lakiLaki: angka(d.lakiLaki),
      perempuan: angka(d.perempuan),
      sebaranDusun: arr(d.sebaranDusun).filter((x) => s(x?.nama)).map((x) => ({ nama: s(x.nama), jumlah: angka(x.jumlah) ?? 0 })),
      mataPencaharian: arr(d.mataPencaharian).filter((x) => s(x?.nama)).map((x) => ({ nama: s(x.nama), persen: angka(x.persen) ?? 0 })),
    },
    kontak: { alamat: s(k.alamat), telepon: s(k.telepon), email: s(k.email), jamLayanan: s(k.jamLayanan) },
  };
}

// ---------- Baca file (dibaca ulang hanya bila berubah) ----------

const cache = {};
function bacaJson(file, wajib) {
  let stat;
  try {
    stat = fs.statSync(file);
  } catch {
    if (wajib) throw new Error(`${file} tidak ditemukan`);
    return {};
  }
  const c = cache[file];
  if (c && c.mtime === stat.mtimeMs) return c.data;
  let data;
  try {
    data = JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (e) {
    throw new Error(`${path.basename(file)} tidak valid: ${e.message}`);
  }
  cache[file] = { mtime: stat.mtimeMs, data };
  return data;
}

function load() {
  const bawaan = bacaJson(PROFIL_PATH, true);
  const admin = bacaJson(PROFIL_ADMIN_PATH, false);
  return normalize({ ...bawaan, ...admin });
}

function get(req, res) {
  ok(res, load());
}

// ---------- Validasi PATCH ----------

const EMAIL = /^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,}$/;

function validasi(body) {
  const errors = {};
  const salah = (k, msg) => { (errors[k] = errors[k] || []).push(msg); };

  const teks = (k, v, max, wajib = false) => {
    if (v === null || v === undefined || v === '') {
      if (wajib) salah(k, 'Wajib diisi');
      return null;
    }
    if (typeof v !== 'string') return salah(k, 'Harus berupa teks'), null;
    const t = v.trim();
    if (!t && wajib) salah(k, 'Wajib diisi');
    if (t.length > max) salah(k, `Maksimal ${max} karakter`);
    return t || null;
  };
  const bil = (k, v, { desimal = false, max = 10_000_000 } = {}) => {
    if (v === null || v === undefined || v === '') return null;
    const n = typeof v === 'string' ? Number(v.replace(',', '.')) : v;
    if (typeof n !== 'number' || !Number.isFinite(n)) return salah(k, 'Harus berupa angka'), null;
    if (n < 0) return salah(k, 'Tidak boleh negatif'), null;
    if (!desimal && !Number.isInteger(n)) return salah(k, 'Harus bilangan bulat'), null;
    if (n > max) return salah(k, `Maksimal ${max}`), null;
    return n;
  };
  const email = (k, v) => {
    const t = teks(k, v, 254);
    if (t && !EMAIL.test(t)) salah(k, 'Format email tidak valid');
    return t;
  };
  const foto = (k, v) => {
    const t = teks(k, v, 500);
    if (!t) return null;
    if (/^https?:\/\//i.test(t) || (t.startsWith('/') && !t.startsWith('//'))) return t;
    salah(k, 'Harus link http(s) atau path gambar');
    return null;
  };
  const daftar = (k, v, max) => {
    if (v === null || v === undefined) return [];
    if (!Array.isArray(v)) return salah(k, 'Harus berupa daftar'), [];
    if (v.length > max) return salah(k, `Maksimal ${max} butir`), [];
    return v;
  };
  const objek = (k, v) => {
    if (!v || typeof v !== 'object' || Array.isArray(v)) return salah(k, 'Harus berupa objek'), null;
    return v;
  };

  const nilai = {};
  if ('periode' in body) nilai.periode = teks('periode', body.periode, 50);
  if ('ringkasan' in body) nilai.ringkasan = teks('ringkasan', body.ringkasan, 500);
  if ('jargon' in body) nilai.jargon = teks('jargon', body.jargon, 500);
  if ('sejarah' in body) nilai.sejarah = teks('sejarah', body.sejarah, 10_000);
  if ('visi' in body) nilai.visi = teks('visi', body.visi, 2000);
  if ('misi' in body) {
    nilai.misi = daftar('misi', body.misi, 20).map((m, i) => teks(`misi.${i}`, m, 500)).filter(Boolean);
  }

  if ('struktur' in body) {
    const st = objek('struktur', body.struktur);
    if (st) {
      const p = objek('struktur.pimpinan', st.pimpinan) || {};
      const pimpinan = {
        nama: teks('struktur.pimpinan.nama', p.nama, 100, true),
        jabatan: teks('struktur.pimpinan.jabatan', p.jabatan, 100, true),
        unit: teks('struktur.pimpinan.unit', p.unit, 100),
        deskripsi: teks('struktur.pimpinan.deskripsi', p.deskripsi, 500),
        email: email('struktur.pimpinan.email', p.email),
        photoUrl: foto('struktur.pimpinan.photoUrl', p.photoUrl),
      };
      const perangkat = daftar('struktur.perangkat', st.perangkat, 50).map((o, i) => {
        const x = objek(`struktur.perangkat.${i}`, o) || {};
        return {
          nama: teks(`struktur.perangkat.${i}.nama`, x.nama, 100, true),
          jabatan: teks(`struktur.perangkat.${i}.jabatan`, x.jabatan, 100, true),
          unit: teks(`struktur.perangkat.${i}.unit`, x.unit, 100),
          deskripsi: teks(`struktur.perangkat.${i}.deskripsi`, x.deskripsi, 500),
          photoUrl: foto(`struktur.perangkat.${i}.photoUrl`, x.photoUrl),
        };
      });
      nilai.struktur = { pimpinan, perangkat };
    }
  }

  if ('geografis' in body) {
    const g = objek('geografis', body.geografis);
    if (g) {
      nilai.geografis = {
        luas: teks('geografis.luas', typeof g.luas === 'number' ? String(g.luas) : g.luas, 100),
        jumlahDusun: bil('geografis.jumlahDusun', g.jumlahDusun, { max: 1000 }),
      };
      for (const arah of ['Utara', 'Selatan', 'Timur', 'Barat']) nilai.geografis[`batas${arah}`] = teks(`geografis.batas${arah}`, g[`batas${arah}`], 200);
    }
  }

  if ('demografi' in body) {
    const d = objek('demografi', body.demografi);
    if (d) {
      const sebaranDusun = daftar('demografi.sebaranDusun', d.sebaranDusun, 50).map((x, i) => ({
        nama: teks(`demografi.sebaranDusun.${i}.nama`, x?.nama, 100, true),
        jumlah: bil(`demografi.sebaranDusun.${i}.jumlah`, x?.jumlah) ?? 0,
      }));
      const mataPencaharian = daftar('demografi.mataPencaharian', d.mataPencaharian, 30).map((x, i) => ({
        nama: teks(`demografi.mataPencaharian.${i}.nama`, x?.nama, 100, true),
        persen: bil(`demografi.mataPencaharian.${i}.persen`, x?.persen, { desimal: true, max: 100 }) ?? 0,
      }));
      const total = mataPencaharian.reduce((a, x) => a + x.persen, 0);
      if (total > 100.0001) salah('demografi.mataPencaharian', `Total persentase ${Math.round(total * 10) / 10}% melebihi 100%`);
      nilai.demografi = {
        jumlahPenduduk: bil('demografi.jumlahPenduduk', d.jumlahPenduduk),
        jumlahKK: bil('demografi.jumlahKK', d.jumlahKK),
        lakiLaki: bil('demografi.lakiLaki', d.lakiLaki),
        perempuan: bil('demografi.perempuan', d.perempuan),
        sebaranDusun,
        mataPencaharian,
      };
    }
  }

  if ('kontak' in body) {
    const k = objek('kontak', body.kontak);
    if (k) {
      nilai.kontak = {
        alamat: teks('kontak.alamat', k.alamat, 300),
        telepon: teks('kontak.telepon', k.telepon, 50),
        email: email('kontak.email', k.email),
        jamLayanan: teks('kontak.jamLayanan', k.jamLayanan, 100),
      };
    }
  }

  return Object.keys(errors).length ? { errors } : { nilai };
}

// Tulis ke file sementara lalu rename, supaya file tidak pernah setengah tertulis.
function tulisAtomik(file, data) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const tmp = `${file}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2));
  fs.renameSync(tmp, file);
}

// PATCH /api/admin/profil — hanya bagian yang dikirim yang diganti (utuh per bagian).
async function update(req, res) {
  requireAdmin(req);
  const body = await readJson(req, 200 * 1024);
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw new HttpError(400, 'Format data tidak valid');
  if (!BAGIAN.some((k) => k in body)) return fail(res, 422, 'Data tidak valid', { _: [`Kirim minimal satu bagian: ${BAGIAN.join(', ')}`] });

  const v = validasi(body);
  if (v.errors) return fail(res, 422, 'Data tidak valid', v.errors);

  tulisAtomik(PROFIL_ADMIN_PATH, { ...bacaJson(PROFIL_ADMIN_PATH, false), ...v.nilai });
  delete cache[PROFIL_ADMIN_PATH];
  ok(res, load());
}

module.exports = { get, update, normalize };
