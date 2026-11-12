import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import Icon from './Icon'
import styles from './Navbar.module.css'

const menu = [
  { label: 'Beranda', to: '/' },
  { label: 'Profil Desa', to: '/profil' },
  { label: 'Direktori UMKM', to: '/umkm' },
]

function navLinkClass({ isActive }) {
  return isActive ? `${styles.link} ${styles.active}` : styles.link
}

export default function Navbar() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return undefined

    const onKeyDown = (event) => {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open])

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link
          className={styles.brand}
          to="/"
          aria-label="Desa Sabah Balau, ke beranda"
          onClick={() => setOpen(false)}
        >
          <span className={styles.brandName}>Desa Sabah Balau</span>
          <span className={styles.brandMeta}>
            Kecamatan Tanjung Bintang, Lampung Selatan
          </span>
        </Link>

        <nav className={styles.nav} aria-label="Navigasi utama">
          <ul className={styles.links}>
            {menu.map((item) => (
              <li key={item.to}>
                <NavLink className={navLinkClass} to={item.to} end={item.to === '/'}>
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <button
          type="button"
          className={styles.toggle}
          aria-expanded={open}
          aria-controls="menu-utama"
          onClick={() => setOpen((value) => !value)}
        >
          <Icon name={open ? 'close' : 'menu'} size={22} />
          <span className={styles.srOnly}>
            {open ? 'Tutup menu navigasi' : 'Buka menu navigasi'}
          </span>
        </button>
      </div>

      {open && (
        <nav
          id="menu-utama"
          className={styles.mobileNav}
          aria-label="Navigasi utama (seluler)"
        >
          <ul className={styles.mobileLinks}>
            {menu.map((item) => (
              <li key={item.to}>
                <NavLink
                  className={({ isActive }) =>
                    isActive
                      ? `${styles.mobileLink} ${styles.mobileActive}`
                      : styles.mobileLink
                  }
                  to={item.to}
                  end={item.to === '/'}
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                  <Icon name="arrowRight" size={18} />
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  )
}
