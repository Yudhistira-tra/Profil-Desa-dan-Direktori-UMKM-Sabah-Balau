// Fungsi bantu HTTP: format respons sesuai kontrak, membaca body, multipart, CORS, IP klien.
const { CORS_ORIGINS, TRUST_PROXY } = require('./config');

// Error yang sengaja dilempar handler; diubah menjadi respons { message, errors? }.
class HttpError extends Error {
  constructor(status, message, errors) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

function sendJson(res, status, body) {
  const text = JSON.stringify(body);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(text),
    'Cache-Control': 'no-store',
  });
  res.end(text);
}

// Kontrak: semua respons sukses dibungkus { data }, semua error { message } (+ errors untuk 422).
const ok = (res, data, status = 200) => sendJson(res, status, { data });
const fail = (res, status, message, errors) => sendJson(res, status, errors ? { message, errors } : { message });

// Membaca seluruh body dengan batas ukuran. Melempar 413 bila terlalu besar.
function readBody(req, limitBytes) {
  return new Promise((resolve, reject) => {
    const declared = Number(req.headers['content-length']);
    if (declared > limitBytes) {
      req.resume();
      return reject(new HttpError(413, 'Ukuran data terlalu besar'));
    }
    const chunks = [];
    let size = 0;
    let done = false;
    req.on('data', (c) => {
      if (done) return;
      size += c.length;
      if (size > limitBytes) {
        done = true;
        req.resume();
        return reject(new HttpError(413, 'Ukuran data terlalu besar'));
      }
      chunks.push(c);
    });
    req.on('end', () => { if (!done) { done = true; resolve(Buffer.concat(chunks)); } });
    req.on('error', (e) => { if (!done) { done = true; reject(e); } });
  });
}

async function readJson(req, limitBytes = 100 * 1024) {
  if (!/^application\/json\b/i.test(req.headers['content-type'] || '')) {
    throw new HttpError(415, 'Gunakan Content-Type: application/json');
  }
  const buf = await readBody(req, limitBytes);
  try {
    return buf.length ? JSON.parse(buf.toString('utf8')) : {};
  } catch {
    throw new HttpError(400, 'JSON tidak valid');
  }
}

// Pengurai multipart/form-data sederhana (untuk unggah foto tanpa paket tambahan).
// Hasil: { fields: { nama: [nilai, ...] }, files: [{ field, filename, contentType, data }] }
function parseMultipart(buf, contentType) {
  const m = /boundary=(?:"([^"]+)"|([^;\s]+))/i.exec(contentType || '');
  if (!m) throw new HttpError(400, 'Format multipart/form-data tidak valid');
  const boundary = Buffer.from('--' + (m[1] || m[2]));
  const separator = Buffer.concat([Buffer.from('\r\n'), boundary]);
  const bad = () => new HttpError(400, 'Format multipart/form-data tidak valid');

  const fields = {};
  const files = [];
  let pos = buf.indexOf(boundary);
  if (pos === -1) throw bad();
  let parts = 0;

  for (;;) {
    pos += boundary.length;
    if (buf[pos] === 0x2d && buf[pos + 1] === 0x2d) break; // "--" = akhir
    if (buf[pos] !== 0x0d || buf[pos + 1] !== 0x0a) throw bad();
    pos += 2;
    const headEnd = buf.indexOf('\r\n\r\n', pos);
    if (headEnd === -1) throw bad();
    const next = buf.indexOf(separator, headEnd + 4);
    if (next === -1) throw bad();
    if (++parts > 50) throw new HttpError(400, 'Terlalu banyak isian formulir');

    const headers = buf.subarray(pos, headEnd).toString('utf8');
    const body = buf.subarray(headEnd + 4, next);
    const disp = /content-disposition:\s*form-data;([^\r\n]*)/i.exec(headers);
    if (disp) {
      const name = /\bname="([^"]*)"/i.exec(disp[1]);
      const filename = /\bfilename="([^"]*)"/i.exec(disp[1]);
      const ctype = /content-type:\s*([^\r\n;]+)/i.exec(headers);
      if (name && filename) {
        // Input file yang dibiarkan kosong oleh browser dikirim tanpa nama dan isi: abaikan.
        if (filename[1] !== '' || body.length > 0) {
          files.push({ field: name[1], filename: filename[1], contentType: ctype ? ctype[1].trim().toLowerCase() : '', data: body });
        }
      } else if (name) {
        (fields[name[1]] ||= []).push(body.toString('utf8'));
      }
    }
    pos = next + 2; // posisi awal boundary berikutnya
  }
  return { fields, files };
}

// CORS: hanya origin di CORS_ORIGINS yang boleh memanggil API dari browser.
// Mengembalikan true bila request adalah preflight (OPTIONS) dan sudah dijawab.
function applyCors(req, res) {
  const origin = req.headers.origin;
  if (origin && CORS_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Vary', 'Origin');
  }
  if (req.method === 'OPTIONS') {
    if (origin && CORS_ORIGINS.includes(origin)) {
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      res.setHeader('Access-Control-Max-Age', '600');
    }
    res.writeHead(204);
    res.end();
    return true;
  }
  return false;
}

// Header keamanan dasar untuk semua respons.
function securityHeaders(res) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Content-Security-Policy', "default-src 'none'; frame-ancestors 'none'");
}

function clientIp(req) {
  if (TRUST_PROXY) {
    const fwd = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim();
    if (fwd) return fwd;
  }
  return req.socket.remoteAddress || 'unknown';
}

// Ambil satu nilai cookie dari header Cookie.
function readCookie(req, name) {
  for (const part of String(req.headers.cookie || '').split(';')) {
    const i = part.indexOf('=');
    if (i > 0 && part.slice(0, i).trim() === name) return part.slice(i + 1).trim();
  }
  return '';
}

module.exports = { readCookie, HttpError, sendJson, ok, fail, readBody, readJson, parseMultipart, applyCors, securityHeaders, clientIp };
