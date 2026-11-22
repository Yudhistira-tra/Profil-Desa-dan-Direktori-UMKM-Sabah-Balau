import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getBeritaList } from '../api/berita.js'
import Icon from '../components/Icon.jsx'
import styles from './Berita.module.css'

const PER_PAGE = 6

const formatTanggal = new Intl.DateTimeFormat('id-ID', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

function Berita() {
  const [daftar, setDaftar] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)

  useEffect(() => {
    document.title = 'Berita — Desa Sabah Balau'
    getBeritaList().then((data) => {
      setDaftar(data)
      setLoading(false)
    })
  }, [])

  if (loading) return <p className={styles.status}>Memuat berita...</p>

  const pageCount = Math.max(1, Math.ceil(daftar.length / PER_PAGE))
  const safePage = Math.min(page, pageCount)
  const visible = daftar.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE)

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Berita Desa Sabah Balau</h1>
      <p className={styles.subtitle}>
        Kabar terbaru kegiatan, program, dan informasi dari pemerintah desa.
      </p>

      {daftar.length === 0 ? (
        <p className={styles.empty}>Belum ada berita yang diterbitkan.</p>
      ) : (
        <ul className={styles.grid}>
          {visible.map((berita) => (
            <li key={berita.id}>
              <article className={styles.card}>
                <Link to={`/berita/${berita.slug}`} className={styles.media}>
                  {berita.cover ? (
                    <img src={berita.cover} alt="" loading="lazy" />
                  ) : (
                    <span className={styles.mediaPlaceholder}>
                      <Icon name="flag" size={40} strokeWidth={1.4} />
                    </span>
                  )}
                </Link>

                <div className={styles.body}>
                  <p className={styles.date}>{formatTanggal.format(new Date(berita.date))}</p>
                  <h2 className={styles.cardTitle}>
                    <Link to={`/berita/${berita.slug}`}>{berita.title}</Link>
                  </h2>
                  <p className={styles.excerpt}>{berita.excerpt}</p>
                  <Link to={`/berita/${berita.slug}`} className={styles.more}>
                    Baca selengkapnya
                    <Icon name="arrowRight" size={15} />
                  </Link>
                </div>
              </article>
            </li>
          ))}
        </ul>
      )}

      {daftar.length > PER_PAGE && (
        <div className={styles.pagination}>
          <button
            type="button"
            className={styles.pageButton}
            onClick={() => setPage(safePage - 1)}
            disabled={safePage === 1}
          >
            ‹ Sebelumnya
          </button>

          {Array.from({ length: pageCount }, (_, i) => i + 1).map((nomor) => (
            <button
              key={nomor}
              type="button"
              className={`${styles.pageButton} ${nomor === safePage ? styles.active : ''}`}
              onClick={() => setPage(nomor)}
              aria-current={nomor === safePage ? 'page' : undefined}
            >
              {nomor}
            </button>
          ))}

          <button
            type="button"
            className={styles.pageButton}
            onClick={() => setPage(safePage + 1)}
            disabled={safePage === pageCount}
          >
            Selanjutnya ›
          </button>
        </div>
      )}
    </div>
  )
}

export default Berita
