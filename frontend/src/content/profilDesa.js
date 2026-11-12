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

  struktur: {
    pimpinan: {
      nama: 'Nama Kepala Desa',
      jabatan: 'Kepala Desa',
      unit: 'Pimpinan Desa',
      deskripsi:
        'Memimpin penyelenggaraan pemerintahan, pembangunan, dan pemberdayaan masyarakat Desa Sabah Balau.',
      email: 'kepaladesa@sabahbalau.desa.id',
      photoUrl: null,
    },
    perangkat: [
      {
        nama: 'Nama Sekretaris Desa',
        jabatan: 'Sekretaris Desa',
        unit: 'Sekretariat',
        deskripsi:
          'Mengelola administrasi, perencanaan, dan keuangan desa bersama seluruh perangkat.',
        photoUrl: null,
      },
      {
        nama: 'Nama Kaur Keuangan',
        jabatan: 'Kepala Urusan Keuangan',
        unit: 'Keuangan',
        deskripsi:
          'Menatausahakan anggaran, laporan keuangan, dan pertanggungjawaban APBDes.',
        photoUrl: null,
      },
      {
        nama: 'Nama Kasi Pemerintahan',
        jabatan: 'Kasi Pemerintahan',
        unit: 'Pemerintahan',
        deskripsi:
          'Membina administrasi kewilayahan, ketenteraman, dan ketertiban masyarakat.',
        photoUrl: null,
      },
      {
        nama: 'Nama Kasi Kesejahteraan',
        jabatan: 'Kasi Kesejahteraan',
        unit: 'Kesejahteraan',
        deskripsi:
          'Menangani program sosial, kesehatan, pendidikan, dan pemberdayaan warga.',
        photoUrl: null,
      },
      {
        nama: 'Nama Kasi Pelayanan',
        jabatan: 'Kasi Pelayanan',
        unit: 'Pelayanan',
        deskripsi:
          'Memberikan layanan surat-menyurat serta pendampingan administrasi warga.',
        photoUrl: null,
      },
      {
        nama: 'Nama Kepala Dusun I',
        jabatan: 'Kepala Dusun I',
        unit: 'Kewilayahan',
        deskripsi:
          'Menjadi penghubung antara pemerintah desa dan warga di wilayah dusun.',
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
