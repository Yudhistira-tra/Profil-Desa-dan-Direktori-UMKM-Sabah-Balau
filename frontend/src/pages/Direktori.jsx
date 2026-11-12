import {useState, useEffect} from "react";
import { getUmkmList } from "../api/umkm.js";
import UMKMCard  from "../components/UMKMCard.jsx";
import styles from "./Direktori.module.css";
const PER_PAGE = 8

function Direktori() {

    const [umkmList, setUmkmList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState('');
    const [page, setPage] = useState(1);


    useEffect(() => {
        getUmkmList().then((data) => {
            setUmkmList(data);
            setLoading(false);
        })
    }, [])

    if (loading) return <p className={styles.status}>Memuat data UMKM...</p>
    const keyword = query.trim().toLowerCase();

    const filtered = umkmList.filter((umkm) => 
        `${umkm.name} ${umkm.owner} ${umkm.description}`
        .toLowerCase()
        .includes(keyword)
    )

    const pageCount = Math.max(1, Math.ceil(filtered.length / PER_PAGE))
    const safePage = Math.min(page, pageCount)          // guard, see below
    const visible = filtered.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE)

    const first = filtered.length === 0 ? 0 : (safePage - 1) * PER_PAGE + 1
    const last = Math.min(safePage * PER_PAGE, filtered.length)

    return (
        <div className={styles.page}>
            <h1 className={styles.title}>Direktori UMKM Desa Sabah Balau</h1>
            <p className={styles.subtitle}>Temukan aneka produk sabah balau</p>

            <div className={styles.searchBar}>
                <svg
                    className={styles.searchIcon}
                    viewBox="0 0 24 24"
                    width="18"
                    height="18"
                    aria-hidden="true"
                >
                    <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="2" />
                    <line
                    x1="16.5"
                    y1="16.5"
                    x2="21"
                    y2="21"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    />
                </svg>
                <input
                    type="search"
                    className={styles.searchInput}
                    placeholder="Cari nama produk, UMKM dan lain-lain..."
                    value={query}
                    onChange={(event) => {
                        setQuery(event.target.value)
                        setPage(1)
                    }}
                    aria-label="Cari UMKM"
                />
            </div>

            <ul className={styles.grid}>
                {visible.map((umkm) => (
                    <li key={umkm.id} className={styles.gridItem}>
                        <UMKMCard umkm={umkm} />
                    </li>
                ))}
            </ul>

             {filtered.length > 0 && (
                <div className={styles.pagination}>
                    <p className={styles.paginationInfo}>
                    Menampilkan {first} - {last} dari {filtered.length} UMKM Desa Sabah Balau
                    </p>

                <div className={styles.paginationControls}>
                <button
                    className={styles.pageButton}
                    onClick={() => setPage(page - 1)}
                    disabled={safePage === 1}
                >
                    ‹ Sebelumnya
                </button>

                {Array.from({ length: pageCount }, (_, i) => i + 1).map((n) => (
                    <button
                    key={n}
                    className={`${styles.pageButton} ${n === safePage ? styles.active : ''}`}
                    onClick={() => setPage(n)}
                    aria-current={n === safePage ? 'page' : undefined}
                    >
                    {n}
                    </button>
                ))}

                <button
                    className={styles.pageButton}
                    onClick={() => setPage(page + 1)}
                    disabled={safePage === pageCount}
                >
                    Selanjutnya ›
                </button>
                </div>
            </div>
            )}   

        </div>
    )
}

export default Direktori;