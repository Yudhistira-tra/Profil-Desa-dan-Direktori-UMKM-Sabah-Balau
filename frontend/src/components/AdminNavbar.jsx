import { Link, useNavigate } from 'react-router-dom'
import styles from './AdminNavbar.module.css'

function AdminNavbar({ adminName }) {
  const navigate = useNavigate()

  function handleLogout() {
    sessionStorage.removeItem('adminName')
    navigate('/admin')
  }

  return (
    <header className={styles.navbar}>
      <div className={styles.inner}>
        <Link to="/admin/dashboard" className={styles.brand}>Desa Sabah Balau</Link>
        <nav className={styles.links}>
          <Link to="/admin/dashboard" className={styles.active}>Dashboard</Link>
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
