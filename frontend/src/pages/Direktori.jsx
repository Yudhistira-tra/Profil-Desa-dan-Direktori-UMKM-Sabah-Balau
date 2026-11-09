import {useState, useEffect} from "react";
import { getUmkmList } from "../api/umkm.js";
import UMKMCard  from "../components/UMKMCard.jsx";
import styles from "./Direktori.module.css";

function Direktori() {

    const [umkmList, setUmkmList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState('');

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
                    onChange={(event) => setQuery(event.target.value)}
                    aria-label="Cari UMKM"
                />
            </div>

            {filtered.length === 0 ? (
                <p className={styles.empty}>Tidak ada UMKM yang cocok dengan "{query}".</p>
            ) : (
                <ul className={styles.grid}>
                    {filtered.map((umkm) => (
                        <li key={umkm.id} className={styles.gridItem}>
                            <UMKMCard umkm={umkm} />
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}

export default Direktori;