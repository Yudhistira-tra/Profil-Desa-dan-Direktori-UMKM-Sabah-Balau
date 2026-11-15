import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginAdmin } from "../api/admin.js";
import Icon from "../components/Icon.jsx";
import styles from "./AdminLogin.module.css";

function AdminLogin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSending(true);
    try {
      const result = await loginAdmin({ username, password });
      sessionStorage.setItem("adminName", result.data.name);
      navigate("/admin/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className={styles.page}>
      <aside className={styles.side}>
        <div className={styles.sideLogo}>
          <strong>Desa Sabah Balau</strong>
          <span>Kecamatan Tanjung Bintang, Lampung Selatan</span>
        </div>
        <div className={styles.sideCircleLarge} aria-hidden="true" />
        <div className={styles.sideCircleSmall} aria-hidden="true" />
        <div className={styles.sideDots} aria-hidden="true" />
      </aside>

      <main className={styles.main}>
        <span className={styles.portalLabel}>Portal Administrator</span>

        <form className={styles.card} onSubmit={handleSubmit} noValidate>
          <h1 className={styles.title}>Admin Login – UMKM Sabah Balau</h1>
          <p className={styles.subtitle}>Silakan masuk untuk mengelola direktori desa</p>

          <div className={styles.field}>
            <label htmlFor="username" className={styles.label}>Username</label>
            <div className={styles.inputWrap}>
              <Icon name="user" size={18} className={styles.inputIcon} />
              <input
                id="username"
                className={styles.input}
                placeholder="Masukkan username Anda"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                autoComplete="username"
              />
            </div>
          </div>

          <div className={styles.field}>
            <label htmlFor="password" className={styles.label}>Password</label>
            <div className={styles.inputWrap}>
              <svg className={styles.inputIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="4" y="10" width="16" height="11" rx="2" />
                <path d="M8 10V7a4 4 0 0 1 8 0v3" />
              </svg>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                className={styles.input}
                placeholder="Masukkan password Anda"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
              />
              <button
                type="button"
                className={styles.eyeButton}
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
              >
                <Icon name="eye" size={18} />
              </button>
            </div>
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <button type="submit" className={styles.submit} disabled={sending}>
            {sending ? "Memproses..." : "Masuk"}
          </button>

          <p className={styles.note}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="4" y="10" width="16" height="11" rx="2" />
              <path d="M8 10V7a4 4 0 0 1 8 0v3" />
            </svg>
            Hanya untuk akun administrator terdaftar
          </p>
        </form>

        <p className={styles.help}>Butuh akses? Hubungi administrator desa.</p>
      </main>
    </div>
  );
}

export default AdminLogin;
