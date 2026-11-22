import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { getProfil, updateProfil } from '../api/profil.js'
import AdminNavbar from '../components/AdminNavbar'
import styles from './AdminProfil.module.css'

const teks = (nilai) => nilai ?? ''
const angka = (nilai) => (nilai == null ? '' : String(nilai))
const angkaAtauNull = (nilai) => {
  const bersih = String(nilai).trim()
  return bersih === '' ? null : Number(bersih)
}

function keForm(profil) {
  return {
    periode: teks(profil.periode),
    ringkasan: teks(profil.ringkasan),
    jargon: teks(profil.jargon),
    sejarah: teks(profil.sejarah),
    visi: teks(profil.visi),
    misi: [...profil.misi],
    struktur: {
      pimpinan: {
        ...profil.struktur.pimpinan,
        nama: teks(profil.struktur.pimpinan.nama),
        jabatan: teks(profil.struktur.pimpinan.jabatan),
        deskripsi: teks(profil.struktur.pimpinan.deskripsi),
      },
      perangkat: profil.struktur.perangkat.map((orang) => ({
        ...orang,
        nama: teks(orang.nama),
        jabatan: teks(orang.jabatan),
        unit: teks(orang.unit),
        deskripsi: teks(orang.deskripsi),
      })),
    },
    geografis: {
      luas: teks(profil.geografis.luas),
      jumlahDusun: angka(profil.geografis.jumlahDusun),
      batasUtara: teks(profil.geografis.batasUtara),
      batasSelatan: teks(profil.geografis.batasSelatan),
      batasTimur: teks(profil.geografis.batasTimur),
      batasBarat: teks(profil.geografis.batasBarat),
    },
    demografi: {
      jumlahPenduduk: angka(profil.demografi.jumlahPenduduk),
      jumlahKK: angka(profil.demografi.jumlahKK),
      lakiLaki: angka(profil.demografi.lakiLaki),
      perempuan: angka(profil.demografi.perempuan),
      sebaranDusun: profil.demografi.sebaranDusun.map((dusun) => ({
        nama: teks(dusun.nama),
        jumlah: angka(dusun.jumlah),
      })),
      mataPencaharian: profil.demografi.mataPencaharian.map((pekerjaan) => ({
        nama: teks(pekerjaan.nama),
        persen: angka(pekerjaan.persen),
      })),
    },
    kontak: {
      alamat: teks(profil.kontak.alamat),
      telepon: teks(profil.kontak.telepon),
      email: teks(profil.kontak.email),
      jamLayanan: teks(profil.kontak.jamLayanan),
    },
  }
}

function validate(form) {
  const errors = {}

  if (!form.visi.trim()) errors.visi = 'Visi wajib diisi.'
  if (!form.kontak.alamat.trim()) errors.alamat = 'Alamat kantor wajib diisi.'

  const email = form.kontak.email.trim()
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = 'Format email tidak valid.'
  }

  const daftarAngka = [
    form.geografis.jumlahDusun,
    form.demografi.jumlahPenduduk,
    form.demografi.jumlahKK,
    form.demografi.lakiLaki,
    form.demografi.perempuan,
  ]
  if (daftarAngka.some((nilai) => nilai !== '' && Number(nilai) < 0)) {
    errors.angka = 'Angka tidak boleh negatif.'
  }

  const totalPersen = form.demografi.mataPencaharian.reduce(
    (jumlah, pekerjaan) => jumlah + (Number(pekerjaan.persen) || 0),
    0,
  )
  if (totalPersen > 100) {
    errors.pekerjaan = 'Total persen mata pencaharian tidak boleh lebih dari 100%.'
  }

  return errors
}

function AdminProfil() {
  const [adminName] = useState(() => sessionStorage.getItem('adminName'))
  const [form, setForm] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})
  const [pesan, setPesan] = useState('')

  useEffect(() => {
    getProfil().then((profil) => {
      setForm(keForm(profil))
      setLoading(false)
    })
  }, [])

  if (!adminName) return <Navigate to="/admin" replace />

  if (loading) {
    return (
      <div className={styles.page}>
        <AdminNavbar adminName={adminName} />
        <p className={styles.status}>Memuat profil desa...</p>
      </div>
    )
  }

  function ubah(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: undefined }))
    setPesan('')
  }

  function ubahGeografis(field, value) {
    setForm((prev) => ({
      ...prev,
      geografis: { ...prev.geografis, [field]: value },
    }))
    setErrors((prev) => ({ ...prev, angka: undefined }))
  }

  function ubahDemografi(field, value) {
    setForm((prev) => ({
      ...prev,
      demografi: { ...prev.demografi, [field]: value },
    }))
    setErrors((prev) => ({ ...prev, angka: undefined }))
  }

  function ubahKontak(field, value) {
    setForm((prev) => ({
      ...prev,
      kontak: { ...prev.kontak, [field]: value },
    }))
    setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  function ubahMisi(index, value) {
    setForm((prev) => ({
      ...prev,
      misi: prev.misi.map((butir, i) => (i === index ? value : butir)),
    }))
  }

  function tambahMisi() {
    setForm((prev) => ({ ...prev, misi: [...prev.misi, ''] }))
  }

  function hapusMisi(index) {
    setForm((prev) => ({ ...prev, misi: prev.misi.filter((_, i) => i !== index) }))
  }

  function ubahPimpinan(field, value) {
    setForm((prev) => ({
      ...prev,
      struktur: {
        ...prev.struktur,
        pimpinan: { ...prev.struktur.pimpinan, [field]: value },
      },
    }))
  }

  function ubahPerangkat(index, field, value) {
    setForm((prev) => ({
      ...prev,
      struktur: {
        ...prev.struktur,
        perangkat: prev.struktur.perangkat.map((orang, i) =>
          i === index ? { ...orang, [field]: value } : orang,
        ),
      },
    }))
  }

  function tambahPerangkat() {
    setForm((prev) => ({
      ...prev,
      struktur: {
        ...prev.struktur,
        perangkat: [
          ...prev.struktur.perangkat,
          { nama: '', jabatan: '', unit: '', deskripsi: '', photoUrl: null },
        ],
      },
    }))
  }

  function hapusPerangkat(index) {
    setForm((prev) => ({
      ...prev,
      struktur: {
        ...prev.struktur,
        perangkat: prev.struktur.perangkat.filter((_, i) => i !== index),
      },
    }))
  }

  function ubahSebaran(index, field, value) {
    setForm((prev) => ({
      ...prev,
      demografi: {
        ...prev.demografi,
        sebaranDusun: prev.demografi.sebaranDusun.map((dusun, i) =>
          i === index ? { ...dusun, [field]: value } : dusun,
        ),
      },
    }))
    setErrors((prev) => ({ ...prev, angka: undefined }))
  }

  function tambahSebaran() {
    setForm((prev) => ({
      ...prev,
      demografi: {
        ...prev.demografi,
        sebaranDusun: [...prev.demografi.sebaranDusun, { nama: '', jumlah: '' }],
      },
    }))
  }

  function hapusSebaran(index) {
    setForm((prev) => ({
      ...prev,
      demografi: {
        ...prev.demografi,
        sebaranDusun: prev.demografi.sebaranDusun.filter((_, i) => i !== index),
      },
    }))
  }

  function ubahPekerjaan(index, field, value) {
    setForm((prev) => ({
      ...prev,
      demografi: {
        ...prev.demografi,
        mataPencaharian: prev.demografi.mataPencaharian.map((pekerjaan, i) =>
          i === index ? { ...pekerjaan, [field]: value } : pekerjaan,
        ),
      },
    }))
    setErrors((prev) => ({ ...prev, pekerjaan: undefined }))
  }

  function tambahPekerjaan() {
    setForm((prev) => ({
      ...prev,
      demografi: {
        ...prev.demografi,
        mataPencaharian: [...prev.demografi.mataPencaharian, { nama: '', persen: '' }],
      },
    }))
  }

  function hapusPekerjaan(index) {
    setForm((prev) => ({
      ...prev,
      demografi: {
        ...prev.demografi,
        mataPencaharian: prev.demografi.mataPencaharian.filter((_, i) => i !== index),
      },
    }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const validationErrors = validate(form)
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0) return

    const data = {
      periode: form.periode.trim(),
      ringkasan: form.ringkasan.trim(),
      jargon: form.jargon.trim(),
      sejarah: form.sejarah.trim(),
      visi: form.visi.trim(),
      misi: form.misi.map((butir) => butir.trim()).filter(Boolean),
      struktur: {
        pimpinan: {
          ...form.struktur.pimpinan,
          nama: form.struktur.pimpinan.nama.trim(),
          jabatan: form.struktur.pimpinan.jabatan.trim(),
          deskripsi: form.struktur.pimpinan.deskripsi.trim(),
        },
        perangkat: form.struktur.perangkat
          .filter((orang) => orang.nama.trim() || orang.jabatan.trim())
          .map((orang) => ({
            ...orang,
            nama: orang.nama.trim(),
            jabatan: orang.jabatan.trim(),
            unit: orang.unit.trim(),
            deskripsi: orang.deskripsi.trim(),
          })),
      },
      geografis: {
        luas: form.geografis.luas.trim() || null,
        jumlahDusun: angkaAtauNull(form.geografis.jumlahDusun),
        batasUtara: form.geografis.batasUtara.trim() || null,
        batasSelatan: form.geografis.batasSelatan.trim() || null,
        batasTimur: form.geografis.batasTimur.trim() || null,
        batasBarat: form.geografis.batasBarat.trim() || null,
      },
      demografi: {
        jumlahPenduduk: angkaAtauNull(form.demografi.jumlahPenduduk),
        jumlahKK: angkaAtauNull(form.demografi.jumlahKK),
        lakiLaki: angkaAtauNull(form.demografi.lakiLaki),
        perempuan: angkaAtauNull(form.demografi.perempuan),
        sebaranDusun: form.demografi.sebaranDusun
          .filter((dusun) => dusun.nama.trim())
          .map((dusun) => ({
            nama: dusun.nama.trim(),
            jumlah: Number(dusun.jumlah) || 0,
          })),
        mataPencaharian: form.demografi.mataPencaharian
          .filter((pekerjaan) => pekerjaan.nama.trim())
          .map((pekerjaan) => ({
            nama: pekerjaan.nama.trim(),
            persen: Number(pekerjaan.persen) || 0,
          })),
      },
      kontak: {
        alamat: form.kontak.alamat.trim(),
        telepon: form.kontak.telepon.trim(),
        email: form.kontak.email.trim(),
        jamLayanan: form.kontak.jamLayanan.trim(),
      },
    }

    setSaving(true)
    try {
      await updateProfil(data)
      setPesan('Data profil desa tersimpan dan langsung tampil di halaman publik.')
    } catch {
      setErrors({ submit: 'Gagal menyimpan. Coba lagi.' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className={styles.page}>
      <AdminNavbar adminName={adminName} />

      <main className={styles.main}>
        <Link to="/admin/dashboard" className={styles.back}>← Kembali ke Dashboard</Link>

        <div className={styles.head}>
          <div>
            <h1 className={styles.title}>Kelola Profil Desa</h1>
            <p className={styles.subtitle}>
              Perbarui narasi, struktur pemerintahan, data wilayah, dan kontak desa.
            </p>
          </div>
          <Link to="/profil" className={styles.preview}>Lihat Halaman Profil</Link>
        </div>

        {pesan && <p className={styles.notice} role="status">{pesan}</p>}

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Narasi Desa</h2>

            <div className={styles.row}>
              <div className={styles.field}>
                <label htmlFor="periode" className={styles.label}>Periode Kepemimpinan</label>
                <input
                  id="periode"
                  className={styles.input}
                  value={form.periode}
                  onChange={(event) => ubah('periode', event.target.value)}
                />
              </div>
            </div>

            <div className={styles.field}>
              <label htmlFor="ringkasan" className={styles.label}>Ringkasan Profil</label>
              <textarea
                id="ringkasan"
                rows={3}
                className={styles.textarea}
                value={form.ringkasan}
                onChange={(event) => ubah('ringkasan', event.target.value)}
              />
              <p className={styles.hint}>Tampil di bawah judul halaman Profil Desa.</p>
            </div>

            <div className={styles.field}>
              <label htmlFor="jargon" className={styles.label}>Jargon / Komitmen Desa</label>
              <textarea
                id="jargon"
                rows={3}
                className={styles.textarea}
                value={form.jargon}
                onChange={(event) => ubah('jargon', event.target.value)}
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="sejarah" className={styles.label}>Sejarah Singkat</label>
              <textarea
                id="sejarah"
                rows={4}
                className={styles.textarea}
                value={form.sejarah}
                onChange={(event) => ubah('sejarah', event.target.value)}
              />
              <p className={styles.hint}>Tampil di bagian “Tentang Desa” pada Beranda.</p>
            </div>

            <div className={styles.field}>
              <label htmlFor="visi" className={styles.label}>Visi</label>
              <textarea
                id="visi"
                rows={4}
                className={styles.textarea}
                value={form.visi}
                onChange={(event) => ubah('visi', event.target.value)}
              />
              {errors.visi && <p className={styles.error}>{errors.visi}</p>}
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Misi</label>
              {form.misi.map((butir, index) => (
                <div key={index} className={styles.misiRow}>
                  <input
                    className={styles.input}
                    value={butir}
                    aria-label={`Misi ${index + 1}`}
                    onChange={(event) => ubahMisi(index, event.target.value)}
                  />
                  <button
                    type="button"
                    className={styles.remove}
                    onClick={() => hapusMisi(index)}
                    aria-label={`Hapus misi ${index + 1}`}
                  >
                    ×
                  </button>
                </div>
              ))}
              <button type="button" className={styles.add} onClick={tambahMisi}>
                + Tambah Misi
              </button>
            </div>
          </section>

          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Struktur Pemerintahan</h2>

            <h3 className={styles.subTitle}>Pimpinan Desa</h3>
            <div className={styles.row}>
              <div className={styles.field}>
                <label htmlFor="pimpinanNama" className={styles.label}>Nama</label>
                <input
                  id="pimpinanNama"
                  className={styles.input}
                  value={form.struktur.pimpinan.nama}
                  onChange={(event) => ubahPimpinan('nama', event.target.value)}
                />
              </div>
              <div className={styles.field}>
                <label htmlFor="pimpinanJabatan" className={styles.label}>Jabatan</label>
                <input
                  id="pimpinanJabatan"
                  className={styles.input}
                  value={form.struktur.pimpinan.jabatan}
                  onChange={(event) => ubahPimpinan('jabatan', event.target.value)}
                />
              </div>
            </div>
            <div className={styles.field}>
              <label htmlFor="pimpinanDeskripsi" className={styles.label}>Deskripsi Tugas</label>
              <textarea
                id="pimpinanDeskripsi"
                rows={2}
                className={styles.textarea}
                value={form.struktur.pimpinan.deskripsi}
                onChange={(event) => ubahPimpinan('deskripsi', event.target.value)}
              />
            </div>

            <h3 className={styles.subTitle}>Perangkat Desa</h3>
            {form.struktur.perangkat.map((orang, index) => (
              <div key={index} className={styles.personRow}>
                <input
                  className={styles.input}
                  placeholder="Nama"
                  aria-label={`Nama perangkat ${index + 1}`}
                  value={orang.nama}
                  onChange={(event) => ubahPerangkat(index, 'nama', event.target.value)}
                />
                <input
                  className={styles.input}
                  placeholder="Jabatan"
                  aria-label={`Jabatan perangkat ${index + 1}`}
                  value={orang.jabatan}
                  onChange={(event) => ubahPerangkat(index, 'jabatan', event.target.value)}
                />
                <input
                  className={styles.input}
                  placeholder="Unit"
                  aria-label={`Unit perangkat ${index + 1}`}
                  value={orang.unit}
                  onChange={(event) => ubahPerangkat(index, 'unit', event.target.value)}
                />
                <button
                  type="button"
                  className={styles.remove}
                  onClick={() => hapusPerangkat(index)}
                  aria-label={`Hapus perangkat ${index + 1}`}
                >
                  ×
                </button>
                <div className={styles.wide}>
                  <textarea
                    rows={2}
                    className={styles.textarea}
                    placeholder="Deskripsi singkat tugas"
                    aria-label={`Deskripsi perangkat ${index + 1}`}
                    value={orang.deskripsi}
                    onChange={(event) => ubahPerangkat(index, 'deskripsi', event.target.value)}
                  />
                </div>
              </div>
            ))}
            <button type="button" className={styles.add} onClick={tambahPerangkat}>
              + Tambah Perangkat
            </button>
          </section>

          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Data Geografis</h2>

            <div className={styles.row}>
              <div className={styles.field}>
                <label htmlFor="luas" className={styles.label}>Luas Wilayah</label>
                <input
                  id="luas"
                  className={styles.input}
                  placeholder="Contoh: 12,5 km2"
                  value={form.geografis.luas}
                  onChange={(event) => ubahGeografis('luas', event.target.value)}
                />
              </div>
              <div className={styles.field}>
                <label htmlFor="jumlahDusun" className={styles.label}>Jumlah Dusun</label>
                <input
                  id="jumlahDusun"
                  type="number"
                  min="0"
                  className={styles.input}
                  value={form.geografis.jumlahDusun}
                  onChange={(event) => ubahGeografis('jumlahDusun', event.target.value)}
                />
              </div>
            </div>

            <div className={styles.row}>
              <div className={styles.field}>
                <label htmlFor="batasUtara" className={styles.label}>Batas Utara</label>
                <input
                  id="batasUtara"
                  className={styles.input}
                  value={form.geografis.batasUtara}
                  onChange={(event) => ubahGeografis('batasUtara', event.target.value)}
                />
              </div>
              <div className={styles.field}>
                <label htmlFor="batasSelatan" className={styles.label}>Batas Selatan</label>
                <input
                  id="batasSelatan"
                  className={styles.input}
                  value={form.geografis.batasSelatan}
                  onChange={(event) => ubahGeografis('batasSelatan', event.target.value)}
                />
              </div>
            </div>

            <div className={styles.row}>
              <div className={styles.field}>
                <label htmlFor="batasTimur" className={styles.label}>Batas Timur</label>
                <input
                  id="batasTimur"
                  className={styles.input}
                  value={form.geografis.batasTimur}
                  onChange={(event) => ubahGeografis('batasTimur', event.target.value)}
                />
              </div>
              <div className={styles.field}>
                <label htmlFor="batasBarat" className={styles.label}>Batas Barat</label>
                <input
                  id="batasBarat"
                  className={styles.input}
                  value={form.geografis.batasBarat}
                  onChange={(event) => ubahGeografis('batasBarat', event.target.value)}
                />
              </div>
            </div>
          </section>

          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Data Demografi</h2>

            <div className={styles.row}>
              <div className={styles.field}>
                <label htmlFor="jumlahPenduduk" className={styles.label}>Jumlah Penduduk</label>
                <input
                  id="jumlahPenduduk"
                  type="number"
                  min="0"
                  className={styles.input}
                  value={form.demografi.jumlahPenduduk}
                  onChange={(event) => ubahDemografi('jumlahPenduduk', event.target.value)}
                />
              </div>
              <div className={styles.field}>
                <label htmlFor="jumlahKK" className={styles.label}>Jumlah Kepala Keluarga</label>
                <input
                  id="jumlahKK"
                  type="number"
                  min="0"
                  className={styles.input}
                  value={form.demografi.jumlahKK}
                  onChange={(event) => ubahDemografi('jumlahKK', event.target.value)}
                />
              </div>
            </div>

            <div className={styles.row}>
              <div className={styles.field}>
                <label htmlFor="lakiLaki" className={styles.label}>Penduduk Laki-laki</label>
                <input
                  id="lakiLaki"
                  type="number"
                  min="0"
                  className={styles.input}
                  value={form.demografi.lakiLaki}
                  onChange={(event) => ubahDemografi('lakiLaki', event.target.value)}
                />
              </div>
              <div className={styles.field}>
                <label htmlFor="perempuan" className={styles.label}>Penduduk Perempuan</label>
                <input
                  id="perempuan"
                  type="number"
                  min="0"
                  className={styles.input}
                  value={form.demografi.perempuan}
                  onChange={(event) => ubahDemografi('perempuan', event.target.value)}
                />
              </div>
            </div>

            <h3 className={styles.subTitle}>Sebaran Penduduk per Dusun</h3>
            {form.demografi.sebaranDusun.map((dusun, index) => (
              <div key={index} className={styles.twoRow}>
                <input
                  className={styles.input}
                  placeholder="Nama dusun"
                  aria-label={`Nama dusun ${index + 1}`}
                  value={dusun.nama}
                  onChange={(event) => ubahSebaran(index, 'nama', event.target.value)}
                />
                <input
                  type="number"
                  min="0"
                  className={styles.input}
                  placeholder="Jumlah jiwa"
                  aria-label={`Jumlah jiwa dusun ${index + 1}`}
                  value={dusun.jumlah}
                  onChange={(event) => ubahSebaran(index, 'jumlah', event.target.value)}
                />
                <button
                  type="button"
                  className={styles.remove}
                  onClick={() => hapusSebaran(index)}
                  aria-label={`Hapus dusun ${index + 1}`}
                >
                  ×
                </button>
              </div>
            ))}
            <button type="button" className={styles.add} onClick={tambahSebaran}>
              + Tambah Dusun
            </button>

            <h3 className={styles.subTitle}>Mata Pencaharian</h3>
            {form.demografi.mataPencaharian.map((pekerjaan, index) => (
              <div key={index} className={styles.twoRow}>
                <input
                  className={styles.input}
                  placeholder="Contoh: Petani"
                  aria-label={`Mata pencaharian ${index + 1}`}
                  value={pekerjaan.nama}
                  onChange={(event) => ubahPekerjaan(index, 'nama', event.target.value)}
                />
                <input
                  type="number"
                  min="0"
                  max="100"
                  className={styles.input}
                  placeholder="Persen (%)"
                  aria-label={`Persen mata pencaharian ${index + 1}`}
                  value={pekerjaan.persen}
                  onChange={(event) => ubahPekerjaan(index, 'persen', event.target.value)}
                />
                <button
                  type="button"
                  className={styles.remove}
                  onClick={() => hapusPekerjaan(index)}
                  aria-label={`Hapus mata pencaharian ${index + 1}`}
                >
                  ×
                </button>
              </div>
            ))}
            <button type="button" className={styles.add} onClick={tambahPekerjaan}>
              + Tambah Mata Pencaharian
            </button>

            {errors.angka && <p className={styles.error}>{errors.angka}</p>}
            {errors.pekerjaan && <p className={styles.error}>{errors.pekerjaan}</p>}
          </section>

          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Kontak Kantor Desa</h2>

            <div className={styles.field}>
              <label htmlFor="alamat" className={styles.label}>Alamat</label>
              <textarea
                id="alamat"
                rows={3}
                className={styles.textarea}
                value={form.kontak.alamat}
                onChange={(event) => ubahKontak('alamat', event.target.value)}
              />
              {errors.alamat && <p className={styles.error}>{errors.alamat}</p>}
            </div>

            <div className={styles.row}>
              <div className={styles.field}>
                <label htmlFor="telepon" className={styles.label}>Telepon</label>
                <input
                  id="telepon"
                  className={styles.input}
                  value={form.kontak.telepon}
                  onChange={(event) => ubahKontak('telepon', event.target.value)}
                />
              </div>
              <div className={styles.field}>
                <label htmlFor="email" className={styles.label}>Email</label>
                <input
                  id="email"
                  type="email"
                  className={styles.input}
                  value={form.kontak.email}
                  onChange={(event) => ubahKontak('email', event.target.value)}
                />
                {errors.email && <p className={styles.error}>{errors.email}</p>}
              </div>
            </div>

            <div className={styles.field}>
              <label htmlFor="jamLayanan" className={styles.label}>Jam Layanan</label>
              <input
                id="jamLayanan"
                className={styles.input}
                placeholder="Senin – Jumat, 08.00 – 15.00 WIB"
                value={form.kontak.jamLayanan}
                onChange={(event) => ubahKontak('jamLayanan', event.target.value)}
              />
            </div>
          </section>

          {errors.submit && <p className={styles.error}>{errors.submit}</p>}

          <div className={styles.actions}>
            <button type="submit" className={styles.save} disabled={saving}>
              {saving ? 'Menyimpan...' : 'Simpan Profil Desa'}
            </button>
            <Link to="/admin/dashboard" className={styles.cancel}>Batal</Link>
          </div>
        </form>
      </main>
    </div>
  )
}

export default AdminProfil
