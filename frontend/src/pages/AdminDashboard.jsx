import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { getPendaftaran, setStatusPendaftaran } from "../api/admin.js";
import { getUmkmList } from "../api/umkm.js";
import AdminNavbar from "../components/AdminNavbar";
import Icon from "../components/Icon.jsx";
import styles from "./AdminDashboard.module.css";

const PER_PAGE = 5;

const formatTanggal = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

function AdminDashboard() {
  const [adminName] = useState(() => sessionStorage.getItem("adminName"));
  const [pendaftaran, setPendaftaran] = useState([]);
  const [totalAktif, setTotalAktif] = useState(0);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    Promise.all([getPendaftaran(), getUmkmList()]).then(([antrian, umkmList]) => {
      setPendaftaran(antrian);
      setTotalAktif(umkmList.length);
      setLoading(false);
    });
  }, []);

  if (!adminName) return <Navigate to="/admin" replace />;

  const keyword = query.trim().toLowerCase();
  const filtered = pendaftaran.filter((item) =>
    `${item.name} ${item.owner}`.toLowerCase().includes(keyword),
  );

  const pageCount = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const safePage = Math.min(page, pageCount);
  const visible = filtered.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);
  const first = filtered.length === 0 ? 0 : (safePage - 1) * PER_PAGE + 1;
  const last = Math.min(safePage * PER_PAGE, filtered.length);

  async function handleReview(id, status) {
    setProcessingId(id);
    await setStatusPendaftaran(id, status);
    setPendaftaran((prev) => prev.filter((item) => item.id !== id));
    if (status === "aktif") setTotalAktif((prev) => prev + 1);
    setProcessingId(null);
  }

  return (
    <div className={styles.page}>
      <AdminNavbar adminName={adminName} />

      <main className={styles.main}>
        <div className={styles.head}>
          <div>
            <h1 className={styles.title}>Dashboard Admin</h1>
            <p className={styles.subtitle}>Tinjau pengajuan UMKM sebelum tampil di direktori desa.</p>
          </div>
          <span className={styles.dateChip}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="3" y="5" width="18" height="16" rx="2" />
              <path d="M8 3v4M16 3v4M3 10h18" />
            </svg>
            {formatTanggal.format(new Date())}
          </span>
        </div>

        <div className={styles.stats}>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Total UMKM</span>
            <strong className={styles.statValue}>{loading ? "—" : totalAktif}</strong>
            <span className={styles.statNote}>UMKM terdaftar dan aktif di direktori</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Total UMKM Menunggu Review</span>
            <strong className={styles.statValue}>{loading ? "—" : pendaftaran.length}</strong>
            <span className={styles.statNote}>Pengajuan baru siap untuk ditinjau</span>
          </div>
        </div>

        <section className={styles.tableCard}>
          <div className={styles.tableHead}>
            <div>
              <h2 className={styles.tableTitle}>
                Daftar UMKM Pending
                <span className={styles.countBadge}>{pendaftaran.length} UMKM</span>
              </h2>
              <p className={styles.tableSub}>Tinjau pengajuan usaha sebelum ditampilkan di direktori desa.</p>
            </div>
            <div className={styles.searchWrap}>
              <Icon name="search" size={18} className={styles.searchIcon} />
              <input
                className={styles.search}
                placeholder="Cari nama UMKM..."
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setPage(1);
                }}
              />
            </div>
          </div>

          {loading ? (
            <p className={styles.status}>Memuat pengajuan...</p>
          ) : filtered.length === 0 ? (
            <p className={styles.status}>Tidak ada pengajuan yang menunggu review.</p>
          ) : (
            <>
              <div className={styles.tableScroll}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Nama UMKM</th>
                      <th>Tanggal Pengajuan</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visible.map((item) => (
                      <tr key={item.id}>
                        <td>
                          <span className={styles.itemName}>{item.name}</span>
                          <span className={styles.itemOwner}>{item.owner}</span>
                          <span className={styles.pendingPill}>Menunggu review</span>
                        </td>
                        <td className={styles.dateCell}>{formatTanggal.format(new Date(item.date))}</td>
                        <td>
                          <div className={styles.actions}>
                            <Link
                              to={`/admin/umkm/${item.id}`}
                              className={styles.view}
                            >
                              Lihat
                            </Link>
                            <button
                              type="button"
                              className={styles.approve}
                              disabled={processingId === item.id}
                              onClick={() => handleReview(item.id, "aktif")}
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <path d="m4 12.5 5 5L20 6.5" />
                              </svg>
                              Disetujui
                            </button>
                            <button
                              type="button"
                              className={styles.reject}
                              disabled={processingId === item.id}
                              onClick={() => handleReview(item.id, "ditolak")}
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <path d="m6 6 12 12M18 6 6 18" />
                              </svg>
                              Ditolak
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className={styles.tableFoot}>
                <span className={styles.footInfo}>
                  Menampilkan {first}–{last} dari {filtered.length} pengajuan
                </span>
                <div className={styles.pagination}>
                  <button
                    type="button"
                    className={styles.pageButton}
                    disabled={safePage === 1}
                    onClick={() => setPage((prev) => prev - 1)}
                  >
                    Sebelumnya
                  </button>
                  {Array.from({ length: pageCount }, (_, index) => index + 1).map((number) => (
                    <button
                      key={number}
                      type="button"
                      className={`${styles.pageNumber} ${number === safePage ? styles.pageActive : ""}`}
                      onClick={() => setPage(number)}
                    >
                      {number}
                    </button>
                  ))}
                  <button
                    type="button"
                    className={styles.pageButton}
                    disabled={safePage === pageCount}
                    onClick={() => setPage((prev) => prev + 1)}
                  >
                    Selanjutnya
                  </button>
                </div>
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  );
}

export default AdminDashboard;
