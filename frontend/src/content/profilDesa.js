/**
 * Konten sementara untuk halaman milik FE A (Beranda & Profil Desa).
 *
 * Catatan pembagian kerja: `src/data/profil.js` dan `src/api/profil.js`
 * adalah milik FE B dan belum diisi. Supaya halaman FE A bisa jalan tanpa
 * menyentuh file FE B, konten placeholder ditaruh di sini dengan bentuk
 * sedekat mungkin dengan `docs/api-contract.md` bagian GET /api/profil.
 *
 * Nanti, setelah `getProfil()` tersedia, halaman cukup mengganti sumber data
 * dari modul ini ke `src/api/profil.js`.
 */

export const profilDesa = {
  nama: 'Desa Sabah Balau',
  kecamatan: 'Kecamatan Tanjung Bintang, Lampung Selatan',
  periode: '2020 – 2026',

  ringkasan:
    'Mengenal lebih dekat tata kelola desa, arah visi pembangunan desa serta pemberdayaan UMKM masyarakat di Desa Sabah Balau.',

  jargon:
    'Pemerintah Desa Sabah Balau berkomitmen mewujudkan transparansi data, peningkatan kesejahteraan masyarakat berbasis digitalisasi, dan pelayanan publik yang inklusif.',

  sejarah:
    'Desa Sabah Balau berada di Kecamatan Tanjung Bintang, Kabupaten Lampung Selatan. Wilayahnya didominasi lahan pertanian dan perkebunan yang menjadi sumber penghidupan utama warga, dengan UMKM rumahan yang tumbuh di setiap dusun.',

  visi:
    'Mewujudkan Desa Sabah Balau yang maju, mandiri, dan sejahtera melalui tata kelola pemerintahan yang transparan, pelayanan publik yang inklusif, serta penguatan ekonomi masyarakat berbasis potensi lokal dan digitalisasi.',

  misi: [
    'Meningkatkan kualitas tata kelola pemerintahan desa yang transparan, akuntabel, dan berbasis data.',
    'Mengembangkan potensi pertanian, perkebunan, dan UMKM warga agar mampu bersaing di pasar yang lebih luas.',
    'Meningkatkan pelayanan publik yang cepat, ramah, dan inklusif bagi seluruh warga desa.',
    'Memperkuat pembangunan infrastruktur dasar serta kualitas sumber daya manusia dan lingkungan hidup.',
  ],

  // Sumber: papan Struktur Kepemerintahan Desa Sabah Balau di kantor desa (difoto 15 November 2026).
  // Foto perangkat belum dipakai: menunggu izin dari pihak desa.
  struktur: {
    pimpinan: {
      nama: 'Pujianto, S.E.',
      jabatan: 'Kepala Desa',
      unit: 'Pimpinan Desa',
      deskripsi:
        'Memimpin penyelenggaraan pemerintahan, pembangunan, dan pemberdayaan masyarakat Desa Sabah Balau.',
      email: null,
      photoUrl: null,
    },
    perangkat: [
      {
        nama: 'Erpandi, S.Ag.',
        jabatan: 'Sekretaris Desa',
        unit: 'Sekretariat',
        deskripsi:
          'Mengelola administrasi, perencanaan, dan keuangan desa bersama seluruh perangkat.',
        photoUrl: null,
      },
      {
        nama: 'Yunita Nurul Septiana',
        jabatan: 'Kaur Umum',
        unit: 'Sekretariat',
        deskripsi:
          'Mengelola surat-menyurat, arsip, inventaris, dan administrasi umum desa.',
        photoUrl: null,
      },
      {
        nama: 'Muhamad Jamal Aripin',
        jabatan: 'Kaur Perencanaan',
        unit: 'Sekretariat',
        deskripsi:
          'Menyusun rencana kerja dan anggaran desa serta evaluasi program.',
        photoUrl: null,
      },
      {
        nama: 'Ois Widyawati',
        jabatan: 'Kaur Keuangan',
        unit: 'Sekretariat',
        deskripsi:
          'Menatausahakan anggaran, laporan keuangan, dan pertanggungjawaban APBDes.',
        photoUrl: null,
      },
      {
        nama: 'Heriansyah, A.Md.',
        jabatan: 'Kasi Kepemerintahan',
        unit: 'Pelaksana Teknis',
        deskripsi:
          'Membina administrasi kewilayahan, ketenteraman, dan ketertiban masyarakat.',
        photoUrl: null,
      },
      {
        nama: 'Agus Setiawan',
        jabatan: 'Kasi Kesra',
        unit: 'Pelaksana Teknis',
        deskripsi:
          'Menangani pembangunan, pemberdayaan, dan program kesejahteraan warga.',
        photoUrl: null,
      },
      {
        nama: 'Putri Endriana',
        jabatan: 'Kasi Pelayanan',
        unit: 'Pelaksana Teknis',
        deskripsi:
          'Memberikan layanan administrasi dan pendampingan kepada warga.',
        photoUrl: null,
      },
      {
        nama: 'Bambang Priyanto',
        jabatan: 'Kepala Dusun 1A',
        unit: 'Kewilayahan',
        deskripsi:
          'Penghubung pemerintah desa dengan warga Dusun 1A.',
        photoUrl: null,
      },
      {
        nama: 'Sunardi',
        jabatan: 'Kepala Dusun 1B',
        unit: 'Kewilayahan',
        deskripsi:
          'Penghubung pemerintah desa dengan warga Dusun 1B.',
        photoUrl: null,
      },
      {
        nama: 'Hanapi Maolanasyah',
        jabatan: 'Kepala Dusun 1C',
        unit: 'Kewilayahan',
        deskripsi:
          'Penghubung pemerintah desa dengan warga Dusun 1C.',
        photoUrl: null,
      },
      {
        nama: 'Febri Yusanto',
        jabatan: 'Kepala Dusun 2A',
        unit: 'Kewilayahan',
        deskripsi:
          'Penghubung pemerintah desa dengan warga Dusun 2A.',
        photoUrl: null,
      },
      {
        nama: 'Basuki Santoso',
        jabatan: 'Kepala Dusun 2B',
        unit: 'Kewilayahan',
        deskripsi:
          'Penghubung pemerintah desa dengan warga Dusun 2B.',
        photoUrl: null,
      },
      {
        nama: 'Supandi',
        jabatan: 'Kepala Dusun 3A',
        unit: 'Kewilayahan',
        deskripsi:
          'Penghubung pemerintah desa dengan warga Dusun 3A.',
        photoUrl: null,
      },
      {
        nama: 'Anton Andriansyah',
        jabatan: 'Kepala Dusun 3B',
        unit: 'Kewilayahan',
        deskripsi:
          'Penghubung pemerintah desa dengan warga Dusun 3B.',
        photoUrl: null,
      },
    ],
  },

  geografis: {
    luas: '12,5 km²',
    jumlahDusun: 4,
    batasUtara: 'Desa Jati Baru',
    batasSelatan: 'Desa Tanjung Bintang',
    batasTimur: 'Desa Sukanegara',
    batasBarat: 'Desa Budi Lestari',
  },

  demografi: {
    jumlahPenduduk: 5200,
    jumlahKK: 1400,
    lakiLaki: 2650,
    perempuan: 2550,
    sebaranDusun: [
      { nama: 'Dusun I', jumlah: 1380 },
      { nama: 'Dusun II', jumlah: 1290 },
      { nama: 'Dusun III', jumlah: 1310 },
      { nama: 'Dusun IV', jumlah: 1220 },
    ],
    mataPencaharian: [
      { nama: 'Petani/Pekebun', persen: 45 },
      { nama: 'Pelaku UMKM', persen: 25 },
      { nama: 'Karyawan/Swasta', persen: 20 },
      { nama: 'ASN', persen: 10 },
    ],
  },

  kontak: {
    alamat:
      'Kantor Kepala Desa Sabah Balau, Jl. Raya Sabah Balau, Kec. Tanjung Bintang, Kab. Lampung Selatan, Lampung',
    telepon: '+62 812-0000-0000',
    email: 'pemdes@sabahbalau.desa.id',
    jamLayanan: 'Senin – Jumat, 08.00 – 15.00 WIB',
  },
}
