import { request, BOLEH_TIRUAN } from "./http.js";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Data tiruan. Hanya dipakai saat development bila backend tidak aktif (lihat http.js).
let pendaftaran = [
  {
    id: 1,
    slug: "warung-bu-ani",
    name: "Warung Bu Ani",
    owner: "Ibu Ani",
    ownerSince: 2015,
    address: "Dusun 1, dekat balai desa",
    mapsUrl: null,
    whatsapp: "6281211110001",
    priceMin: 5000,
    openingHours: "Setiap hari, 07.00–21.00 WIB",
    description: "Warung kelontong dan makanan ringan untuk kebutuhan sehari-hari.",
    images: [],
    products: [],
    date: "2026-11-14",
    status: "pending",
  },
  {
    id: 2,
    slug: "keripik-singkong-mak-ijah",
    name: "Keripik Singkong Mak Ijah",
    owner: "Mak Ijah",
    ownerSince: 2010,
    address: "Dusun 2",
    mapsUrl: null,
    whatsapp: "6281211110002",
    priceMin: 10000,
    openingHours: null,
    description: "Keripik singkong aneka rasa, dibuat sendiri setiap hari.",
    images: [],
    products: [{ name: "Keripik Original", description: "Rasa gurih klasik", price: 10000 }],
    date: "2026-11-14",
    status: "pending",
  },
  {
    id: 3,
    slug: "laundry-bersih-wangi",
    name: "Laundry Bersih Wangi",
    owner: "Pak Dedi",
    ownerSince: 2022,
    address: "Dusun 3, Jl. Raya Sabah Balau",
    mapsUrl: null,
    whatsapp: "6281211110003",
    priceMin: 6000,
    openingHours: "Senin–Sabtu, 08.00–18.00 WIB",
    description: "Laundry kiloan dan satuan dengan layanan antar jemput.",
    images: [],
    products: [],
    date: "2026-11-13",
    status: "pending",
  },
  {
    id: 4,
    slug: "bakso-pak-slamet",
    name: "Bakso Pak Slamet",
    owner: "Pak Slamet",
    ownerSince: 2018,
    address: "Pasar Sabah Balau",
    mapsUrl: null,
    whatsapp: "6281211110004",
    priceMin: 15000,
    openingHours: "Setiap hari, 10.00–20.00 WIB",
    description: "Bakso sapi dan mie ayam, resep turun-temurun.",
    images: [],
    products: [],
    date: "2026-11-13",
    status: "pending",
  },
  {
    id: 5,
    slug: "toko-bangunan-barokah",
    name: "Toko Bangunan Barokah",
    owner: "Pak Hadi",
    ownerSince: 2000,
    address: "Dusun 1, Jl. Raya Sabah Balau",
    mapsUrl: null,
    whatsapp: "6281211110005",
    priceMin: null,
    openingHours: "Setiap hari, 07.00–18.00 WIB",
    description: "Material bangunan, cat, dan alat pertukangan.",
    images: [],
    products: [],
    date: "2026-11-12",
    status: "pending",
  },
  {
    id: 6,
    slug: "jahit-pakaian-bu-rina",
    name: "Jahit Pakaian Bu Rina",
    owner: "Ibu Rina",
    ownerSince: 2012,
    address: "Dusun 4",
    mapsUrl: null,
    whatsapp: "6281211110006",
    priceMin: null,
    openingHours: "Senin–Sabtu, 09.00–17.00 WIB",
    description: "Jahit dan permak pakaian, seragam sekolah, dan kebaya.",
    images: [],
    products: [],
    date: "2026-11-12",
    status: "pending",
  },
  {
    id: 7,
    slug: "katering-dapur-desa",
    name: "Katering Dapur Desa",
    owner: "Ibu Wati",
    ownerSince: 2019,
    address: "Dusun 2",
    mapsUrl: null,
    whatsapp: "6281211110007",
    priceMin: 20000,
    openingHours: null,
    description: "Katering harian dan pesanan acara desa.",
    images: [],
    products: [],
    date: "2026-11-11",
    status: "pending",
  },
  {
    id: 8,
    slug: "bengkel-motor-mas-budi",
    name: "Bengkel Motor Mas Budi",
    owner: "Mas Budi",
    ownerSince: 2016,
    address: "Jl. Raya Sabah Balau, depan pasar",
    mapsUrl: null,
    whatsapp: "6281211110008",
    priceMin: null,
    openingHours: "Setiap hari, 08.00–20.00 WIB",
    description: "Servis motor, ganti oli, dan jual sparepart.",
    images: [],
    products: [],
    date: "2026-11-11",
    status: "pending",
  },
];

// ---------------------------------------------------------------------------
// Sesi admin. Token dari POST /api/login disimpan di sessionStorage (hilang saat
// tab ditutup) dan dikirim di header Authorization pada setiap permintaan admin.
// ---------------------------------------------------------------------------
const KUNCI_TOKEN = "adminToken";
const KUNCI_TIRUAN = "adminTiruan";

// Diekspor juga untuk api/berita.js dan api/profil.js (endpoint admin berita & profil).
export const modeTiruan = () => sessionStorage.getItem(KUNCI_TIRUAN) === "1";

// Token ditolak backend (kedaluwarsa atau belum login): kembali ke halaman login.
function sesiHabis() {
  sessionStorage.removeItem(KUNCI_TOKEN);
  sessionStorage.removeItem("adminName");
  window.location.assign("/admin");
}

export async function panggil(path, opsi = {}) {
  try {
    return await request(path, { ...opsi, token: sessionStorage.getItem(KUNCI_TOKEN) });
  } catch (error) {
    if (error.status === 401) sesiHabis();
    throw error;
  }
}

// POST /api/login. Pesan error dari backend ("Username atau password salah")
// ditampilkan apa adanya oleh halaman login.
export async function loginAdmin({ username, password }) {
  if (!username.trim() || !password.trim()) {
    throw new Error("Username dan password wajib diisi.");
  }
  try {
    const data = await request("/login", {
      method: "POST",
      json: { username: username.trim(), password },
    });
    sessionStorage.setItem(KUNCI_TOKEN, data.token);
    sessionStorage.removeItem(KUNCI_TIRUAN);
    return { data: { name: data.name } };
  } catch (error) {
    if (error.luring && BOLEH_TIRUAN) {
      // Backend tidak aktif (development): masuk dengan data tiruan, seperti sebelumnya.
      console.warn("[API] Backend tidak aktif, halaman admin memakai data contoh.");
      await delay(500);
      sessionStorage.setItem(KUNCI_TIRUAN, "1");
      sessionStorage.removeItem(KUNCI_TOKEN);
      return { data: { name: "Administrator (data contoh)" } };
    }
    throw error;
  }
}

// GET /api/admin/pendaftaran — pendaftaran berstatus pending, terbaru dulu.
export async function getPendaftaran() {
  if (modeTiruan()) {
    await delay(400);
    return pendaftaran;
  }
  return panggil("/admin/pendaftaran");
}

// GET /api/admin/umkm/:id — null bila tidak ditemukan.
export async function getUmkmAdmin(id) {
  if (modeTiruan()) {
    await delay(300);
    return pendaftaran.find((item) => item.id === id) ?? null;
  }
  try {
    return await panggil(`/admin/umkm/${id}`);
  } catch (error) {
    if (error.status === 404) return null;
    throw error;
  }
}

// PATCH /api/admin/umkm/:id (sama dengan PATCH /api/umkm/:slug di kontrak).
// Dikirim sebagai multipart: field "data" berisi JSON, field "photos" berisi foto baru.
export async function updateUmkmAdmin(id, changes) {
  if (modeTiruan()) {
    await delay(400);
    pendaftaran = pendaftaran.map((item) =>
      item.id === id ? { ...item, ...changes } : item,
    );
    const updated = pendaftaran.find((item) => item.id === id);

    if (updated && updated.status !== "pending") {
      pendaftaran = pendaftaran.filter((item) => item.id !== id);
    }
    return { data: updated };
  }

  const images = changes.images ?? [];
  // Foto yang baru dipilih di halaman edit masih berupa URL sementara "blob:".
  const fotoBaru = images.filter((url) => url.startsWith("blob:"));

  const body = new FormData();
  body.append(
    "data",
    JSON.stringify({
      name: changes.name,
      owner: changes.owner,
      ownerSince: changes.ownerSince ?? null,
      address: changes.address,
      mapsUrl: changes.mapsUrl || null,
      whatsapp: changes.whatsapp,
      description: changes.description,
      priceMin: changes.priceMin ?? null,
      openingHours: changes.openingHours || null,
      status: changes.status,
      products: changes.products ?? [],
      // Foto lama yang dipertahankan; yang tidak tercantum dihapus backend.
      images: images.filter((url) => !url.startsWith("blob:")),
    }),
  );
  for (const url of fotoBaru) {
    const blob = await fetch(url).then((res) => res.blob());
    body.append("photos", blob, "foto");
  }

  const updated = await panggil(`/admin/umkm/${id}`, { method: "PATCH", body, timeoutMs: 60000 });
  return { data: updated };
}

// PATCH status saja: "aktif" (tampil di direktori) atau "ditolak".
export async function setStatusPendaftaran(id, status) {
  if (modeTiruan()) {
    await delay(300);
    pendaftaran = pendaftaran.filter((item) => item.id !== id);
    return { data: { id, status } };
  }
  const updated = await panggil(`/admin/umkm/${id}`, { method: "PATCH", json: { status } });
  return { data: { id, status: updated.status } };
}
