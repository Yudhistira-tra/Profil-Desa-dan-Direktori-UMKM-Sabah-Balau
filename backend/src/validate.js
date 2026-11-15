// Validasi data UMKM: dipakai pendaftaran publik (POST /api/umkm) dan edit oleh admin (PATCH).
// errors berbentuk { field: [pesan, ...] } sesuai kontrak (422).
const { MAX_PHOTO_BYTES, MAX_PHOTOS, detectImage } = require('./storage');

const MAPS_HOSTS = ['maps.app.goo.gl', 'goo.gl', 'maps.google.com', 'www.google.com', 'google.com', 'www.google.co.id', 'google.co.id'];

const text = (v) => (v === undefined || v === null ? '' : String(v).replace(/\r\n/g, '\n').trim());

// Nomor WA dibuat seragam: hanya angka, diawali 62. "0812-3456-789" atau "+62 812..." diterima.
function normalizeWhatsapp(v) {
  let d = text(v).replace(/\D/g, '');
  if (d.startsWith('0')) d = '62' + d.slice(1);
  else if (d.startsWith('8')) d = '62' + d;
  return d;
}

// Angka bulat. Teks "15.000" diterima sebagai 15000. Hasil null bila kosong, NaN bila tidak valid.
function toInt(v) {
  if (typeof v === 'number') return Number.isInteger(v) && v >= 0 && v <= 9999999999 ? v : NaN;
  const s = text(v).replace(/\./g, '');
  if (s === '') return null;
  return /^\d{1,10}$/.test(s) ? Number(s) : NaN;
}

// Hanya tautan Google Maps (mencegah tautan ke situs lain, mis. situs judi, disisipkan di halaman UMKM).
function isMapsUrl(v) {
  let u;
  try {
    u = new URL(v);
  } catch {
    return false;
  }
  if (u.protocol !== 'https:' && u.protocol !== 'http:') return false;
  const host = u.hostname.toLowerCase();
  if (!MAPS_HOSTS.includes(host)) return false;
  if (host === 'goo.gl') return u.pathname.startsWith('/maps');
  if (host.includes('google.')) return host.startsWith('maps.') || u.pathname.startsWith('/maps');
  return true;
}

// data: objek isian mentah (teks dari form atau nilai dari JSON).
// wajibSetuju: true untuk pendaftaran publik (pemilik harus mencentang persetujuan).
function validateUmkmData(data, { wajibSetuju = false } = {}) {
  const errors = {};
  const add = (k, msg) => (errors[k] ||= []).push(msg);
  const tahunIni = new Date().getFullYear();

  const name = text(data.name);
  if (!name) add('name', 'Nama usaha wajib diisi');
  else if (name.length > 100) add('name', 'Nama usaha maksimal 100 karakter');

  const owner = text(data.owner);
  if (!owner) add('owner', 'Nama pemilik wajib diisi');
  else if (owner.length > 100) add('owner', 'Nama pemilik maksimal 100 karakter');

  const ownerSince = toInt(data.ownerSince);
  if (Number.isNaN(ownerSince) || (ownerSince !== null && (ownerSince < 1900 || ownerSince > tahunIni))) {
    add('ownerSince', `Tahun mulai usaha harus antara 1900 dan ${tahunIni}`);
  }

  const address = text(data.address);
  if (!address) add('address', 'Alamat wajib diisi');
  else if (address.length > 200) add('address', 'Alamat maksimal 200 karakter');

  const whatsapp = normalizeWhatsapp(data.whatsapp);
  if (!text(data.whatsapp)) add('whatsapp', 'Nomor WhatsApp wajib diisi');
  else if (!/^62\d{8,13}$/.test(whatsapp)) add('whatsapp', 'Nomor WhatsApp harus diawali 62 dan berisi 10–15 angka');

  const description = text(data.description);
  if (!description) add('description', 'Deskripsi wajib diisi');
  else if (description.length > 500) add('description', 'Deskripsi maksimal 500 karakter');

  const priceMin = toInt(data.priceMin);
  if (Number.isNaN(priceMin)) add('priceMin', 'Harga mulai harus berupa angka bulat');

  const openingHours = text(data.openingHours);
  if (openingHours.length > 100) add('openingHours', 'Jam buka maksimal 100 karakter');

  const mapsUrl = text(data.mapsUrl);
  if (mapsUrl && (mapsUrl.length > 500 || !isMapsUrl(mapsUrl))) add('mapsUrl', 'Link lokasi harus berupa link Google Maps');

  if (wajibSetuju) {
    const consent = data.consent === true || ['true', '1', 'on', 'yes'].includes(text(data.consent).toLowerCase());
    if (!consent) add('consent', 'Pemilik harus menyetujui datanya dipublikasikan');
  }

  // products: array, atau teks JSON: [{"name":"...","description":"...","price":15000}]
  const products = [];
  let raw = data.products;
  if (typeof raw === 'string') {
    try {
      raw = raw.trim() ? JSON.parse(raw) : [];
    } catch {
      raw = 'rusak';
    }
  }
  if (raw !== undefined && raw !== null) {
    if (!Array.isArray(raw)) add('products', 'Format produk tidak valid');
    else if (raw.length > 3) add('products', 'Maksimal 3 produk unggulan');
    else {
      raw.forEach((p, i) => {
        const pn = text(p && p.name);
        const pd = text(p && p.description);
        const pp = p && p.price !== undefined && p.price !== null && p.price !== '' ? toInt(p.price) : null;
        if (!pn) add('products', `Produk ${i + 1}: nama wajib diisi`);
        else if (pn.length > 100) add('products', `Produk ${i + 1}: nama maksimal 100 karakter`);
        if (pd.length > 200) add('products', `Produk ${i + 1}: deskripsi maksimal 200 karakter`);
        if (Number.isNaN(pp)) add('products', `Produk ${i + 1}: harga harus berupa angka bulat`);
        products.push({ name: pn, description: pd || null, price: Number.isNaN(pp) ? null : pp });
      });
    }
  }

  return {
    errors: Object.keys(errors).length ? errors : null,
    values: { name, owner, ownerSince, address, mapsUrl: mapsUrl || null, whatsapp, priceMin, openingHours: openingHours || null, description },
    products,
  };
}

// Foto: field "photos" (boleh diulang) atau "photos[]". sisaSlot = berapa foto lagi yang masih boleh ditambah.
function validatePhotos(files, sisaSlot = MAX_PHOTOS) {
  const errors = [];
  const photos = [];
  const photoFiles = files.filter((x) => x.field === 'photos' || x.field === 'photos[]');
  if (files.length !== photoFiles.length) errors.push('Berkas hanya boleh dikirim lewat field photos');
  if (photoFiles.length > sisaSlot) errors.push(`Maksimal ${MAX_PHOTOS} foto`);
  else {
    photoFiles.forEach((x, i) => {
      if (x.data.length > MAX_PHOTO_BYTES) return errors.push(`Foto ${i + 1} lebih dari 5 MB`);
      const ext = detectImage(x.data);
      if (!ext) return errors.push(`Foto ${i + 1} harus berformat JPG, PNG, atau WebP`);
      photos.push({ data: x.data, ext });
    });
  }
  return { errors: errors.length ? errors : null, photos };
}

module.exports = { validateUmkmData, validatePhotos, normalizeWhatsapp, isMapsUrl };
