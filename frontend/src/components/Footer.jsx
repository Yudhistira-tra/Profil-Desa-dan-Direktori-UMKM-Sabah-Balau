import { Link } from 'react-router-dom'
import { profilDesa } from '../content/profilDesa'
import Icon from './Icon'
import styles from './Footer.module.css'

const menu = [
  { label: 'Beranda', to: '/' },
  { label: 'Profil Desa', to: '/profil' },
  { label: 'Direktori UMKM', to: '/umkm' },
]

const { kontak } = profilDesa
const nomorTelepon = kontak.telepon.replace(/[^\d+]/g, '')

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <p className={styles.brandName}>Desa Sabah Balau</p>
          <p className={styles.brandMeta}>Pemerintah Kabupaten Lampung Selatan</p>
          <address className={styles.address}>
            Kantor Kepala Desa Sabah Balau
            <br />
            Jl. Raya Sabah Balau, Kec. Tanjung Bintang
            <br />
            Kab. Lampung Selatan, Lampung
          </address>
        </div>

        <nav className={styles.column} aria-labelledby="footer-menu">
          <h2 className={styles.heading} id="footer-menu">
            Menu Cepat
          </h2>
          <ul className={styles.menu}>
            {menu.map((item) => (
              <li key={item.to}>
                <Link className={styles.menuLink} to={item.to}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.column}>
          <h2 className={styles.heading}>Kontak &amp; Layanan</h2>
          <ul className={styles.contact}>
            <li>
              <Icon name="mail" size={16} />
              <a className={styles.contactLink} href={`mailto:${kontak.email}`}>
                {kontak.email}
              </a>
            </li>
            <li>
              <Icon name="phone" size={16} />
              <a className={styles.contactLink} href={`tel:${nomorTelepon}`}>
                {kontak.telepon}
              </a>
            </li>
            <li className={styles.hours}>
              <Icon name="clock" size={16} />
              <span>
                <span className={styles.hoursLabel}>Jam Operasional:</span>
                {kontak.jamLayanan}
              </span>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  )
}
