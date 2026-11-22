import { Link, NavLink, useNavigate } from 'react-router-dom'
import styles from './AdminNavbar.module.css'

const menu = [
  { label: 'Dashboard', to: '/admin/dashboard' },
  { label: 'Berita', to: '/admin/berita' },
  { label: 'Profil Desa', to: '/admin/profil' },
]

function AdminNavbar({ adminName }) {
  const navigate = useNavigate()

  function handleLogout() {
    sessionStorage.removeItem('adminName')
    sessionStorage.removeItem('adminToken')
    navigate('/admin')
  }

  return (
    <header className={styles.navbar}>
      <div className={styles.inner}>
        <Link to="/admin/dashboard" className={styles.brand}>Desa Sabah Balau</Link>
        <nav className={styles.links}>
          {menu.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => (isActive ? styles.active : styles.link)}
            >
              {item.label}
            </NavLink>
          ))}
          <Link to="/umkm" className={styles.link}>Direktori UMKM</Link>
        </nav>
        <div className={styles.right}>
          <span className={styles.adminName}>{adminName}</span>
          <button type="button" className={styles.logout} onClick={handleLogout}>
            Keluar
          </button>
        </div>
      </div>
    </header>
  )
}

export default AdminNavbar
