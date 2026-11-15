const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Data tiruan. Nanti diganti fetch ke GET /api/admin/pendaftaran.
let pendaftaran = [
  { id: 1, name: "Warung Bu Ani", owner: "Ibu Ani", date: "2026-11-14" },
  { id: 2, name: "Keripik Singkong Mak Ijah", owner: "Mak Ijah", date: "2026-11-14" },
  { id: 3, name: "Laundry Bersih Wangi", owner: "Pak Dedi", date: "2026-11-13" },
  { id: 4, name: "Bakso Pak Slamet", owner: "Pak Slamet", date: "2026-11-13" },
  { id: 5, name: "Toko Bangunan Barokah", owner: "Pak Hadi", date: "2026-11-12" },
  { id: 6, name: "Jahit Pakaian Bu Rina", owner: "Ibu Rina", date: "2026-11-12" },
  { id: 7, name: "Katering Dapur Desa", owner: "Ibu Wati", date: "2026-11-11" },
  { id: 8, name: "Bengkel Motor Mas Budi", owner: "Mas Budi", date: "2026-11-11" },
];

// Sementara menerima kredensial apa pun yang terisi. Nanti diganti
// fetch ke POST /api/login sesuai kontrak.
export async function loginAdmin({ username, password }) {
  await delay(500);
  if (!username.trim() || !password.trim()) {
    throw new Error("Username dan password wajib diisi.");
  }
  return { data: { name: "Administrator" } };
}

export async function getPendaftaran() {
  await delay(400);
  return pendaftaran;
}

// Sementara langsung menghapus dari daftar pending. Di backend nanti
// ini PATCH /api/umkm/:slug dengan field status.
export async function setStatusPendaftaran(id, status) {
  await delay(300);
  pendaftaran = pendaftaran.filter((item) => item.id !== id);
  return { data: { id, status } };
}
