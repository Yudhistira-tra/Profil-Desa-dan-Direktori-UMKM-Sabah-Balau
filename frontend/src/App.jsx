import { lazy, Suspense, useEffect } from 'react'
import { BrowserRouter, Link, Route, Routes, useLocation } from 'react-router-dom'
import Footer from './components/Footer'
import Navbar from './components/Navbar'
import Beranda from './pages/Beranda'
import NotFound from './pages/NotFound'
import ProfilDesa from './pages/ProfilDesa'
import styles from './App.module.css'

/**
 * Halaman milik FE B (Direktori, Detail, Daftar UMKM).
 *
 * File-nya sengaja tidak disentuh. Route memakai import dinamis supaya:
 * - sebelum FE B mengisi halamannya, tampil placeholder yang rapi;
 * - begitu file tersebut punya `export default`, halaman langsung dipakai
 *   tanpa perlu mengubah App.jsx lagi.
 */
function HalamanBelumSiap() {
  return (
    <section className={styles.placeholder}>
      <div className={styles.placeholderCard}>
        <span className={styles.placeholderBadge}>Direktori UMKM</span>
        <h1>Halaman ini sedang disiapkan</h1>
        <p>
          Bagian direktori UMKM dikerjakan terpisah dari halaman profil desa.
          Sementara menunggu, Anda bisa menjelajahi profil Desa Sabah Balau
          terlebih dahulu.
        </p>
        <div className={styles.placeholderActions}>
          <Link className={styles.placeholderPrimary} to="/">
            Kembali ke Beranda
          </Link>
          <Link className={styles.placeholderSecondary} to="/profil">
            Lihat Profil Desa
          </Link>
        </div>
      </div>
    </section>
  )
}

const halamanFeB = (muat) =>
  lazy(() =>
    muat().then((modul) => ({
      default: modul.default ?? HalamanBelumSiap,
    })),
  )

const Direktori = halamanFeB(() => import('./pages/Direktori.jsx'))
const DetailUmkm = halamanFeB(() => import('./pages/DetailUMKM.jsx'))
const DaftarUmkm = halamanFeB(() => import('./pages/Daftar.jsx'))

function HalamanMemuat() {
  return (
    <div className={styles.loading} role="status">
      Memuat halaman…
    </div>
  )
}

function ScrollToTop() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (hash) {
      const target = document.querySelector(hash)

      if (target) {
        target.scrollIntoView()
        return
      }
    }

    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [pathname, hash])

  return null
}

export default function App() {
  return (
    <BrowserRouter>
      <a className={styles.skipLink} href="#konten">
        Langsung ke konten
      </a>
      <ScrollToTop />
      <Navbar />
      <main id="konten" tabIndex={-1}>
        <Suspense fallback={<HalamanMemuat />}>
          <Routes>
            <Route path="/" element={<Beranda />} />
            <Route path="/profil" element={<ProfilDesa />} />
            <Route path="/umkm" element={<Direktori />} />
            <Route path="/umkm/:slug" element={<DetailUmkm />} />
            <Route path="/daftar-umkm" element={<DaftarUmkm />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </BrowserRouter>
  )
}
