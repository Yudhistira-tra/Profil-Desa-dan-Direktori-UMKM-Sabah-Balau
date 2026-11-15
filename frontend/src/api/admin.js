const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Data tiruan. Nanti diganti fetch ke endpoint admin yang disepakati.
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

export async function getUmkmAdmin(id) {
  await delay(300);
  return pendaftaran.find((item) => item.id === id) ?? null;
}

// Sementara mengubah data di memori. Di backend nanti ini
// PATCH /api/umkm/:slug.
export async function updateUmkmAdmin(id, changes) {
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

// Sementara langsung menghapus dari daftar pending. Di backend nanti
// ini PATCH /api/umkm/:slug dengan field status.
export async function setStatusPendaftaran(id, status) {
  await delay(300);
  pendaftaran = pendaftaran.filter((item) => item.id !== id);
  return { data: { id, status } };
}
