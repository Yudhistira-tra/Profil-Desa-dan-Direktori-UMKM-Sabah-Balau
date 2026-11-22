import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getBeritaBySlug } from '../api/berita.js'
import Icon from '../components/Icon.jsx'
import styles from './BeritaDetail.module.css'

const formatTanggal = new Intl.DateTimeFormat('id-ID', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

function BeritaDetail() {
  const { slug } = useParams()
  const [hasil, setHasil] = useState({ slug: null, berita: undefined })
  const berita = hasil.slug === slug ? hasil.berita : undefined

  useEffect(() => {
    let masihAktif = true

    getBeritaBySlug(slug).then((data) => {
      if (!masihAktif) return
      setHasil({ slug, berita: data })
      document.title = data
        ? `${data.title} — Berita Desa Sabah Balau`
        : 'Berita — Desa Sabah Balau'
    })

    return () => {
      masihAktif = false
    }
  }, [slug])

  if (berita === undefined) {
    return <p className={styles.status}>Memuat berita...</p>
  }

  if (berita === null) {
    return (
      <div className={styles.page}>
        <nav className={styles.breadcrumb} aria-label="Remah roti">
          <Link to="/">Beranda</Link>
          <span aria-hidden="true">›</span>
          <Link to="/berita">Berita</Link>
        </nav>
        <div className={styles.empty}>
          <p>Berita tidak ditemukan atau belum diterbitkan.</p>
          <Link to="/berita" className={styles.backLink}>
            Kembali ke Berita
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <nav className={styles.breadcrumb} aria-label="Remah roti">
        <Link to="/">Beranda</Link>
        <span aria-hidden="true">›</span>
        <Link to="/berita">Berita</Link>
        <span aria-hidden="true">›</span>
        <span aria-current="page">{berita.title}</span>
      </nav>

      <article className={styles.article}>
        <header className={styles.header}>
          <p className={styles.meta}>
            <span>{formatTanggal.format(new Date(berita.date))}</span>
            {berita.sourceUrl && (
              <a href={berita.sourceUrl} target="_blank" rel="noreferrer noopener">
                Sumber
                <Icon name="arrowRight" size={13} />
              </a>
            )}
          </p>
          <h1 className={styles.title}>{berita.title}</h1>
          <p className={styles.excerpt}>{berita.excerpt}</p>
        </header>

        {berita.cover && (
          <img className={styles.cover} src={berita.cover} alt="" />
        )}

        <div className={styles.content}>
          {berita.content.map((paragraf) => (
            <p key={paragraf}>{paragraf}</p>
          ))}
        </div>

        <footer className={styles.footer}>
          <Link to="/berita" className={styles.backLink}>
            <Icon name="arrowRight" size={15} />
            Kembali ke daftar berita
          </Link>
        </footer>
      </article>
    </div>
  )
}

export default BeritaDetail
