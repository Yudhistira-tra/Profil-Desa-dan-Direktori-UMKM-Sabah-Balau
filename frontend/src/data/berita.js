import fotoKantor from '../assets/gambar-halaman-utama.jpg'

// Data contoh berita desa. Nanti diganti hasil GET /api/berita.
export const beritaData = [
  {
    id: 1,
    slug: 'musyawarah-desa-program-2027',
    title: 'Musyawarah Desa Bahas Program Prioritas 2027',
    excerpt:
      'Pemerintah desa bersama BPD dan perwakilan dusun menyusun rencana program prioritas untuk tahun anggaran 2027.',
    content: [
      'Musyawarah Desa (Musdes) digelar di balai desa pada Selasa, 18 November 2026. Kegiatan dihadiri perangkat desa, Badan Permusyawaratan Desa (BPD), kepala dusun, dan perwakilan warga.',
      'Agenda utama musyawarah adalah menyepakati prioritas pembangunan untuk tahun anggaran 2027, mulai dari perbaikan jalan lingkungan, penambahan penerangan, hingga penguatan program UMKM desa.',
      'Hasil musyawarah akan menjadi dasar penyusunan Rencana Kerja Pemerintah Desa (RKPDes) sebelum dibahas bersama masyarakat.',
    ],
    cover: fotoKantor,
    date: '2026-11-18',
    sourceUrl: null,
    status: 'terbit',
  },
  {
    id: 2,
    slug: 'pelatihan-digital-marketing-umkm',
    title: 'Pelatihan Digital Marketing untuk Pelaku UMKM Desa',
    excerpt:
      'Puluhan pelaku UMKM mengikuti pelatihan pemasaran digital, mulai dari foto produk hingga mengelola media sosial.',
    content: [
      'Sebanyak 35 pelaku UMKM dari berbagai dusun mengikuti pelatihan digital marketing di balai desa pada Sabtu, 15 November 2026.',
      'Materi yang diberikan mencakup cara memotret produk dengan ponsel, menulis deskripsi yang menarik, serta mengelola akun media sosial untuk usaha.',
      'Pemerintah desa berharap pelatihan ini membantu produk warga lebih dikenal dan memperluas pasar di luar desa.',
    ],
    cover: null,
    date: '2026-11-15',
    sourceUrl: null,
    status: 'terbit',
  },
  {
    id: 3,
    slug: 'pemeriksaan-kesehatan-gratis',
    title: 'Pemeriksaan Kesehatan Gratis di Balai Desa',
    excerpt:
      'Layanan pemeriksaan tekanan darah, gula darah, dan konsultasi gizi dibuka gratis untuk warga pada 10 November.',
    content: [
      'Puskesmas Kecamatan Tanjung Bintang menggelar pemeriksaan kesehatan gratis di balai desa, Senin, 10 November 2026.',
      'Warga dapat memeriksa tekanan darah, kadar gula darah, serta berkonsultasi langsung dengan petugas kesehatan.',
      'Kegiatan ini dilaksanakan setiap bulan sebagai bagian dari program kesehatan masyarakat desa.',
    ],
    cover: null,
    date: '2026-11-10',
    sourceUrl: null,
    status: 'terbit',
  },
  {
    id: 4,
    slug: 'panen-raya-padi-dusun-2',
    title: 'Panen Raya Padi di Dusun 2 Berjalan Baik',
    excerpt:
      'Hasil panen padi di Dusun 2 tahun ini stabil berkat saluran irigasi yang diperbaiki tahun lalu.',
    content: [
      'Petani di Dusun 2 melaksanakan panen raya padi pada akhir Oktober hingga awal November 2026.',
      'Menurut kelompok tani setempat, hasil panen tahun ini stabil berkat perbaikan saluran irigasi yang dilakukan tahun lalu.',
      'Pemerintah desa akan terus mendukung kebutuhan petani, termasuk akses bibit dan pendampingan penyuluh.',
    ],
    cover: null,
    date: '2026-11-05',
    sourceUrl: null,
    status: 'terbit',
  },
  {
    id: 5,
    slug: 'perbaikan-jalan-dusun-3-tahap-2',
    title: 'Perbaikan Jalan Lingkungan Dusun 3 Tahap II Dimulai',
    excerpt:
      'Pekerjaan perbaikan jalan lingkungan Dusun 3 tahap II mulai dilakukan pekan ini.',
    content: [
      'Perbaikan jalan lingkungan Dusun 3 tahap II resmi dimulai pekan ini. Pekerjaan mencakup pengaspalan dan pembuatan saluran air di sepanjang ruas jalan.',
      'Warga diminta berhati-hati saat melintas dan mengikuti petunjuk petugas selama pekerjaan berlangsung.',
      'Pekerjaan ditargetkan selesai dalam waktu satu bulan.',
    ],
    cover: null,
    date: '2026-10-28',
    sourceUrl: null,
    status: 'terbit',
  },
  {
    id: 6,
    slug: 'pendaftaran-umkm-baru-dibuka',
    title: 'Pendaftaran UMKM Baru Dibuka',
    excerpt:
      'Pelaku usaha di Desa Sabah Balau dapat mendaftarkan usahanya secara online melalui situs desa.',
    content: [
      'Pemerintah desa membuka pendaftaran UMKM baru untuk seluruh pelaku usaha di Desa Sabah Balau.',
      'Pendaftaran dilakukan melalui halaman Daftarkan UMKM pada situs desa. Data akan diverifikasi oleh admin sebelum tampil di direktori.',
      'Pelaku usaha cukup menyiapkan data usaha, nomor WhatsApp aktif, dan foto produk atau tempat usaha.',
    ],
    cover: null,
    date: '2026-10-20',
    sourceUrl: 'https://www.instagram.com/',
    status: 'terbit',
  },
  {
    id: 7,
    slug: 'rencana-posyandu-desember',
    title: 'Rencana Kegiatan Posyandu Bulan Desember',
    excerpt:
      'Jadwal posyandu bulan Desember sedang disusun bersama kader kesehatan desa.',
    content: [
      'Kader posyandu desa sedang menyusun jadwal kegiatan bulan Desember 2026 untuk setiap dusun.',
      'Jadwal final akan diumumkan melalui papan informasi desa dan situs ini.',
    ],
    cover: null,
    date: '2026-11-20',
    sourceUrl: null,
    status: 'draf',
  },
]
