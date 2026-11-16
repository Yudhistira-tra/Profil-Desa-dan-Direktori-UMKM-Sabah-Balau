// Pembatas jumlah permintaan per IP (disimpan di memori; ter-reset saat server dijalankan ulang).
function createLimiter({ windowMs, max }) {
  const hits = new Map(); // ip -> [timestamp, ...]

  setInterval(() => {
    const batas = Date.now() - windowMs;
    for (const [ip, list] of hits) {
      const sisa = list.filter((t) => t > batas);
      if (sisa.length) hits.set(ip, sisa); else hits.delete(ip);
    }
  }, 60_000).unref();

  return {
    // true bila IP masih di bawah batas (tidak mencatat).
    allowed(ip) {
      const batas = Date.now() - windowMs;
      return (hits.get(ip) || []).filter((t) => t > batas).length < max;
    },
    record(ip) {
      const list = hits.get(ip) || [];
      list.push(Date.now());
      hits.set(ip, list);
    },
    // Catat sekaligus cek; true bila masih diizinkan.
    hit(ip) {
      if (!this.allowed(ip)) return false;
      this.record(ip);
      return true;
    },
  };
}

module.exports = { createLimiter };
