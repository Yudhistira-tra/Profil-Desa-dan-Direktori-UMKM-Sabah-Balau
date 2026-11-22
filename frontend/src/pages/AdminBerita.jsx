import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { deleteBerita, getBeritaAdmin, updateBerita } from '../api/berita.js'
import AdminNavbar from '../components/AdminNavbar'
import styles from './AdminBerita.module.css'

const formatTanggal = new Intl.DateTimeFormat('id-ID', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

function AdminBerita() {
  const [adminName] = useState(() => sessionStorage.getItem('adminName'))
  const [daftar, setDaftar] = useState([])
  const [loading, setLoading] = useState(true)
  const [prosesId, setProsesId] = useState(null)
  const [pesan, setPesan] = useState('')

  useEffect(() => {
    getBeritaAdmin().then((data) => {
      setDaftar(data)
      setLoading(false)
    })
  }, [])

  if (!adminName) return <Navigate to="/admin" replace />

  const jumlahTerbit = daftar.filter((item) => item.status === 'terbit').length
  const jumlahDraf = daftar.length - jumlahTerbit

  async function handleToggle(item) {
    const status = item.status === 'terbit' ? 'draf' : 'terbit'
    setPesan('')
    setProsesId(item.id)
    try {
      const { data } = await updateBerita(item.id, { status })
      setDaftar((prev) => prev.map((row) => (row.id === item.id ? data : row)))
      setPesan(
        status === 'terbit'
          ? `"${item.title}" sekarang tampil di halaman Berita.`
          : `"${item.title}" disembunyikan dari halaman Berita.`,
      )
    } catch {
      setPesan('Gagal mengubah status berita. Coba lagi.')
    } finally {
      setProsesId(null)
    }
  }

  async function handleDelete(item) {
    const setuju = window.confirm(`Hapus berita "${item.title}"? Tindakan ini tidak bisa dibatalkan.`)
    if (!setuju) return

    setPesan('')
    setProsesId(item.id)
    try {
      await deleteBerita(item.id)
      setDaftar((prev) => prev.filter((row) => row.id !== item.id))
      setPesan(`"${item.title}" sudah dihapus.`)
    } catch {
      setPesan('Gagal menghapus berita. Coba lagi.')
    } finally {
      setProsesId(null)
    }
  }

  return (
    <div className={styles.page}>
      <AdminNavbar adminName={adminName} />

      <main className={styles.main}>
        <div className={styles.head}>
          <div>
            <h1 className={styles.title}>Kelola Berita</h1>
            <p className={styles.subtitle}>
              Tulis berita desa atau tautkan berita dari Instagram / situs lain.
            </p>
          </div>
          <Link to="/admin/berita/baru" className={styles.primary}>+ Tulis Berita</Link>
        </div>

        <div className={styles.stats}>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Berita Terbit</span>
            <strong className={styles.statValue}>{loading ? '—' : jumlahTerbit}</strong>
            <span className={styles.statNote}>Tampil di halaman Berita dan Beranda</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Draf</span>
            <strong className={styles.statValue}>{loading ? '—' : jumlahDraf}</strong>
            <span className={styles.statNote}>Disimpan, belum tampil di situs</span>
          </div>
        </div>

        {pesan && (
          <p className={styles.notice} role="status">{pesan}</p>
        )}

        <section className={styles.tableCard}>
          <div className={styles.tableScroll}>
            {loading ? (
              <p className={styles.status}>Memuat berita...</p>
            ) : daftar.length === 0 ? (
              <p className={styles.status}>
                Belum ada berita. Mulai dengan tombol “Tulis Berita”.
              </p>
            ) : (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Judul</th>
                    <th>Tanggal</th>
                    <th>Status</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {daftar.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <span className={styles.itemTitle}>{item.title}</span>
                        <span className={styles.itemSlug}>/{item.slug}</span>
                      </td>
                      <td className={styles.dateCell}>
                        {formatTanggal.format(new Date(item.date))}
                      </td>
                      <td>
                        <span
                          className={`${styles.pill} ${
                            item.status === 'terbit' ? styles.pillTerbit : styles.pillDraf
                          }`}
                        >
                          {item.status === 'terbit' ? 'Terbit' : 'Draf'}
                        </span>
                      </td>
                      <td>
                        <div className={styles.actions}>
                          <Link to={`/admin/berita/${item.id}`} className={styles.action}>
                            Edit
                          </Link>
                          <button
                            type="button"
                            className={styles.action}
                            disabled={prosesId === item.id}
                            onClick={() => handleToggle(item)}
                          >
                            {item.status === 'terbit' ? 'Turunkan' : 'Terbitkan'}
                          </button>
                          <button
                            type="button"
                            className={`${styles.action} ${styles.danger}`}
                            disabled={prosesId === item.id}
                            onClick={() => handleDelete(item)}
                          >
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </main>
    </div>
  )
}

export default AdminBerita
