// Alat admin dari terminal (selama belum ada halaman admin di frontend).
//   npm run admin -- daftar [pending|approved|rejected]
//   npm run admin -- setujui <slug>
//   npm run admin -- tolak <slug>
//   npm run admin -- hapus <slug>
const { db } = require('../src/db');
const { setStatus, removeUmkm } = require('../src/umkm');

const [cmd, arg] = process.argv.slice(2);
const bySlug = (slug) => db.prepare('SELECT id, slug, name, status FROM umkm WHERE slug = ?').get(slug);

function butuhSlug() {
  if (!arg) {
    console.error('Sebutkan slug UMKM. Lihat daftarnya dengan: npm run admin -- daftar pending');
    process.exit(1);
  }
  const row = bySlug(arg);
  if (!row) {
    console.error(`UMKM dengan slug "${arg}" tidak ditemukan.`);
    process.exit(1);
  }
  return row;
}

if (cmd === 'daftar') {
  const rows = arg
    ? db.prepare('SELECT slug, name, owner, whatsapp, status, created_at FROM umkm WHERE status = ? ORDER BY created_at DESC').all(arg)
    : db.prepare('SELECT slug, name, owner, whatsapp, status, created_at FROM umkm ORDER BY status, created_at DESC').all();
  if (!rows.length) console.log('Tidak ada data.');
  else console.table(rows.map((r) => ({ ...r })));
} else if (cmd === 'setujui' || cmd === 'tolak') {
  const row = butuhSlug();
  setStatus(row.id, cmd === 'setujui' ? 'approved' : 'rejected');
  console.log(`"${row.name}" sekarang berstatus ${cmd === 'setujui' ? 'approved (tampil di direktori)' : 'rejected'}.`);
} else if (cmd === 'hapus') {
  const row = butuhSlug();
  removeUmkm(row.id);
  console.log(`"${row.name}" beserta fotonya dihapus.`);
} else {
  console.log('Perintah: daftar [status] | setujui <slug> | tolak <slug> | hapus <slug>');
  console.log('Contoh : npm run admin -- daftar pending');
  console.log('         npm run admin -- setujui warung-bu-ani');
}
