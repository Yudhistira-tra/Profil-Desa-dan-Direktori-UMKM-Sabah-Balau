import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import styles from './NotFound.module.css'

export default function NotFound() {
  useEffect(() => {
    document.title = 'Halaman tidak ditemukan — Desa Sabah Balau'
  }, [])

  return (
    <section className={styles.wrap}>
      <div className={styles.card}>
        <p className={styles.code}>404</p>
        <h1>Halaman tidak ditemukan</h1>
        <p className={styles.desc}>
          Alamat yang Anda buka mungkin sudah dipindahkan atau tidak pernah ada.
          Silakan kembali ke beranda untuk menjelajahi Desa Sabah Balau.
        </p>
        <Link className={styles.button} to="/">
          Kembali ke Beranda
        </Link>
      </div>
    </section>
  )
}
