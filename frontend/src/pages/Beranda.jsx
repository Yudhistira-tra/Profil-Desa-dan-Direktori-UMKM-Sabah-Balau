import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getUmkmList } from '../api/umkm'
import Icon from '../components/Icon'
import { profilDesa } from '../content/profilDesa'
import styles from './Beranda.module.css'

const formatRupiah = (value) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value)

const formatAngka = (value) => new Intl.NumberFormat('id-ID').format(value)

function UmkmPreviewCard({ umkm }) {
  const foto = umkm.images?.[0]
  const nomorWhatsapp = umkm.whatsapp?.replace(/\D/g, '')
  const tautanDetail = `/umkm/${umkm.slug}`

  return (
    <article className={styles.card}>
      <div className={styles.cardMedia}>
        <span className={styles.cardPlaceholder}>
          <Icon name="store" size={44} strokeWidth={1.4} />
        </span>
        {foto && (
          <img
            className={styles.cardImage}
            src={foto}
            alt=""
            loading="lazy"
            onError={(event) => {
              event.currentTarget.style.display = 'none'
            }}
          />
        )}
      </div>

      <div className={styles.cardBody}>
        <h3 className={styles.cardTitle}>
          <Link to={tautanDetail}>{umkm.name}</Link>
        </h3>
        <p className={styles.cardDesc}>{umkm.description}</p>

        {umkm.priceMin != null && (
          <p className={styles.cardPrice}>
            <span>Harga Mulai:</span>
            <span className={styles.cardPriceValue}>
              {formatRupiah(umkm.priceMin)}
            </span>
          </p>
        )}

        <div className={styles.cardActions}>
          <Link className={styles.detailButton} to={tautanDetail}>
            <Icon name="eye" size={16} />
            Detail Usaha
          </Link>
          <a
            className={styles.whatsappButton}
            href={`https://wa.me/${nomorWhatsapp}`}
            target="_blank"
            rel="noreferrer noopener"
          >
            <Icon name="whatsapp" size={16} />
            WhatsApp
          </a>
        </div>
      </div>
    </article>
  )
}

function AjakanUmkmCard() {
  return (
    <article className={`${styles.card} ${styles.promoCard}`}>
      <div className={styles.promoInner}>
        <span className={styles.promoIcon}>
          <Icon name="store" size={24} />
        </span>
        <h3>Punya usaha di Sabah Balau?</h3>
        <p>
          Daftarkan UMKM Anda agar muncul di direktori desa dan mudah ditemukan
          warga.
        </p>
        <Link className={styles.promoButton} to="/daftar-umkm">
          Daftarkan UMKM
          <Icon name="arrowRight" size={16} />
        </Link>
      </div>
    </article>
  )
}

function SkeletonCard() {
  return (
    <div className={styles.skeletonCard}>
      <div className={styles.skeletonImage} />
      <div className={styles.skeletonBody}>
        <span className={styles.skeletonLine} />
        <span className={`${styles.skeletonLine} ${styles.skeletonLineShort}`} />
        <span className={styles.skeletonButton} />
      </div>
    </div>
  )
}

export default function Beranda() {
  const navigate = useNavigate()
  const [kataKunci, setKataKunci] = useState('')
  const [daftarUmkm, setDaftarUmkm] = useState([])
  const [status, setStatus] = useState('memuat')
  const [percobaan, setPercobaan] = useState(0)

  useEffect(() => {
    document.title = 'Desa Sabah Balau — Profil Desa & Direktori UMKM'
  }, [])

  useEffect(() => {
    let masihAktif = true

    getUmkmList()
      .then((data) => {
        if (!masihAktif) return
        setDaftarUmkm(Array.isArray(data) ? data : [])
        setStatus('siap')
      })
      .catch(() => {
        if (!masihAktif) return
        setStatus('gagal')
      })

    return () => {
      masihAktif = false
    }
  }, [percobaan])

  const cariUmkm = (event) => {
    event.preventDefault()
    const kueri = kataKunci.trim()
    navigate(kueri ? `/umkm?q=${encodeURIComponent(kueri)}` : '/umkm')
  }

  const muatUlang = () => {
    setStatus('memuat')
    setPercobaan((nilai) => nilai + 1)
  }

  const umkmUnggulan = daftarUmkm.slice(0, 3)
  const jumlahUmkm = String(daftarUmkm.length).padStart(2, '0')
  const jumlahPenduduk = formatAngka(profilDesa.demografi.jumlahPenduduk)

  return (
    <>
      {/* ============ HERO ============ */}
      <section className={styles.hero}>
        <div className={styles.container}>
          <div className={styles.heroGrid}>
            <div className={styles.heroCopy}>
              <h1>Sistem Informasi &amp; Direktori UMKM Desa Sabah Balau</h1>
              <p className={styles.heroLead}>
                Pusat integrasi data potensi lokal, layanan administrasi
                kependudukan, serta etalase digital produk unggulan UMKM warga
                Sabah Balau, Lampung Selatan.
              </p>

              <form className={styles.search} role="search" onSubmit={cariUmkm}>
                <Icon
                  className={styles.searchIcon}
                  name="search"
                  size={20}
                  strokeWidth={2}
                />
                <label className={styles.srOnly} htmlFor="pencarian-beranda">
                  Cari UMKM, produk, atau info desa
                </label>
                <input
                  id="pencarian-beranda"
                  className={styles.searchInput}
                  type="search"
                  placeholder="Cari UMKM, produk, warung makan, jasa..."
                  value={kataKunci}
                  onChange={(event) => setKataKunci(event.target.value)}
                />
                <button className={styles.searchButton} type="submit">
                  <Icon name="search" size={18} strokeWidth={2.2} />
                  Cari Sekarang
                </button>
              </form>

              <ul className={styles.stats}>
                <li className={styles.stat}>
                  <span className={`${styles.statIcon} ${styles.statIconPurple}`}>
                    <Icon name="store" size={23} />
                  </span>
                  <div>
                    <p className={styles.statValue}>{jumlahUmkm}</p>
                    <p className={styles.statLabel}>UMKM Terdaftar</p>
                  </div>
                </li>
                <li className={styles.stat}>
                  <span className={`${styles.statIcon} ${styles.statIconMint}`}>
                    <Icon name="users" size={23} />
                  </span>
                  <div>
                    <p className={styles.statValue}>{jumlahPenduduk}</p>
                    <p className={styles.statLabel}>Jumlah Penduduk</p>
                  </div>
                </li>
              </ul>
            </div>

            <figure className={styles.heroMap}>
              <figcaption className={styles.heroMapCaption}>
                Foto letak desa di maps
              </figcaption>
              <div className={styles.heroMapFrame}>
                <img
                  src="/images/peta-desa.svg"
                  alt="Ilustrasi peta letak Desa Sabah Balau, Kecamatan Tanjung Bintang"
                />
                <span className={styles.heroPin}>
                  <Icon name="mapPin" size={15} />
                  Desa Sabah Balau
                </span>
              </div>
            </figure>
          </div>
        </div>
      </section>

      {/* ============ DIREKTORI UMKM ============ */}
      <section className={styles.umkmSection} aria-labelledby="judul-umkm">
        <div className={styles.container}>
          <div className={styles.sectionHead}>
            <div>
              <p className={styles.eyebrow}>Potensi Ekonomi Desa</p>
              <h2 id="judul-umkm">Direktori UMKM &amp; Potensi Lokal</h2>
              <p className={styles.sectionDesc}>
                Deskripsi dari UMKM yang ada di daerah
              </p>
            </div>
            <Link className={styles.sectionAction} to="/umkm">
              Lihat Semua UMKM
              <Icon name="arrowRight" size={17} />
            </Link>
          </div>

          {status === 'memuat' && (
            <>
              <p className={styles.srOnly} role="status">
                Memuat daftar UMKM…
              </p>
              <div className={styles.cardGrid} aria-hidden="true">
                {[1, 2, 3].map((nomor) => (
                  <SkeletonCard key={nomor} />
                ))}
              </div>
            </>
          )}

          {status === 'gagal' && (
            <div className={styles.stateCard}>
              <Icon name="store" size={30} />
              <p className={styles.stateTitle}>Daftar UMKM belum bisa dimuat</p>
              <p className={styles.stateDesc}>
                Periksa koneksi lalu coba muat ulang halaman ini.
              </p>
              <button className={styles.stateButton} type="button" onClick={muatUlang}>
                Coba lagi
              </button>
            </div>
          )}

          {status === 'siap' && umkmUnggulan.length === 0 && (
            <div className={styles.stateCard}>
              <Icon name="store" size={30} />
              <p className={styles.stateTitle}>Belum ada UMKM terdaftar</p>
              <p className={styles.stateDesc}>
                Jadilah pelaku usaha pertama yang tampil di direktori desa.
              </p>
              <Link className={styles.stateButton} to="/daftar-umkm">
                Daftarkan UMKM
              </Link>
            </div>
          )}

          {status === 'siap' && umkmUnggulan.length > 0 && (
            <div className={styles.cardGrid}>
              {umkmUnggulan.map((umkm) => (
                <UmkmPreviewCard key={umkm.id ?? umkm.slug} umkm={umkm} />
              ))}
              {umkmUnggulan.length < 3 && <AjakanUmkmCard />}
            </div>
          )}
        </div>
      </section>

      {/* ============ JARGON DESA ============ */}
      <section className={styles.jargon} aria-labelledby="judul-jargon">
        <div className={styles.container}>
          <div className={styles.centerHead}>
            <p className={styles.eyebrow}>Profil &amp; Tata Kelola Pemerintahan</p>
            <h2 id="judul-jargon">Jargon Desa</h2>
            <p className={styles.centerLead}>{profilDesa.jargon}</p>
          </div>

          <div className={styles.jargonGrid}>
            <div className={styles.jargonCards}>
              <article className={styles.infoCard}>
                <span className={`${styles.infoIcon} ${styles.infoIconLavender}`}>
                  <Icon name="compass" size={23} />
                </span>
                <div>
                  <h3>Visi &amp; Misi Desa</h3>
                  <p>{profilDesa.visi}</p>
                </div>
              </article>

              <article className={styles.infoCard}>
                <span className={`${styles.infoIcon} ${styles.infoIconMint}`}>
                  <Icon name="layers" size={23} />
                </span>
                <div>
                  <h3>Tentang Desa</h3>
                  <p>{profilDesa.sejarah}</p>
                </div>
              </article>

              <article className={styles.infoCard}>
                <span className={`${styles.infoIcon} ${styles.infoIconBlue}`}>
                  <Icon name="user" size={23} />
                </span>
                <div>
                  <h3>Struktur</h3>
                  <p>
                    Dipimpin oleh Kepala Desa bersama jajaran Badan
                    Permusyawaratan Desa (BPD) dan perangkat rukun warga yang
                    responsif, transparan, dan melayani kebutuhan warga sepenuh
                    hati.
                  </p>
                </div>
              </article>
            </div>

            <div className={styles.mapCard}>
              <div className={styles.mapStat}>
                <span className={styles.mapStatIcon}>
                  <Icon name="layers" size={18} />
                </span>
                <div>
                  <p className={styles.mapStatLabel}>Luas Wilayah</p>
                  <p className={styles.mapStatValue}>{profilDesa.geografis.luas}</p>
                </div>
              </div>
              <img
                className={styles.mapImage}
                src="/images/peta-desa.svg"
                alt="Ilustrasi peta Kecamatan Tanjung Bintang, Lampung Selatan"
                loading="lazy"
              />
              <span className={styles.mapLocation}>
                <Icon name="mapPin" size={15} />
                Kec. Tanjung Bintang, Lampung Selatan
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ============ CTA PENDAFTARAN ============ */}
      <section className={styles.ctaSection}>
        <div className={styles.container}>
          <div className={styles.ctaCard}>
            <div className={styles.ctaCopy}>
              <span className={styles.ctaBadge}>
                Bantuan &amp; Pendaftaran UMKM
              </span>
              <h2>
                Pelaku Usaha di Sabah Balau
                <br />
                Belum Terdaftar?
              </h2>
            </div>
            <div className={styles.ctaActions}>
              <Link className={styles.ctaPrimary} to="/daftar-umkm">
                Daftarkan UMKM
                <br />
                Sekarang
              </Link>
              <Link className={styles.ctaSecondary} to="/daftar-umkm#persyaratan">
                Panduan
                <br />
                Persyaratan
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
