import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getUmkmBySlug } from "../api/umkm.js";
import styles from "./DetailUMKM.module.css";

const rupiah = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
});

function DetailUMKM() {
    const { slug } = useParams();
    const [umkm, setUmkm] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getUmkmBySlug(slug).then((data) => {
            setUmkm(data);
            setLoading(false);
        });
    }, [slug]);

    if (loading) return <p className={styles.status}>Memuat data UMKM...</p>;

    if (!umkm) {
        return (
            <div className={styles.page}>
                <p className={styles.empty}>UMKM tidak ditemukan.</p>
                <Link to="/umkm" className={styles.backLink}>Kembali ke Direktori UMKM</Link>
            </div>
        );
    }

    const cover = umkm.images[0];

    return (
        <div className={styles.page}>
            <nav className={styles.breadcrumb}>
                <Link to="/">Beranda</Link>
                <span aria-hidden="true">›</span>
                <Link to="/umkm">Direktori UMKM</Link>
                <span aria-hidden="true">›</span>
                <span>{umkm.name}</span>
            </nav>

            <div className={styles.layout}>
                <div className={styles.left}>
                    <div className={styles.mainImage}>
                        {cover ? (
                            <img src={cover} alt={umkm.name} />
                        ) : (
                            <span>Belum ada foto</span>
                        )}
                    </div>

                    {umkm.images.length > 1 && (
                        <div className={styles.thumbs}>
                            {umkm.images.slice(1).map((image) => (
                                <img key={image} src={image} alt="" />
                            ))}
                        </div>
                    )}
                </div>

                <div className={styles.right}>
                    <div className={styles.shopInfo}>
                        <h1 className={styles.name}>{umkm.name}</h1>
                        <p className={styles.description}>{umkm.description}</p>
                    </div>

                    {umkm.priceMin !== null && (
                        <div className={styles.priceRange}>
                            <span className={styles.priceLabel}>Harga Mulai</span>
                            <span className={styles.price}>{rupiah.format(umkm.priceMin)}</span>
                        </div>
                    )}

                    <div className={styles.profileData}>
                        <div className={styles.profileTop}>
                            <p className={styles.namaPemilik}>{umkm.owner}</p>
                            {umkm.ownerSince !== null && (
                                <p className={styles.subtitle}>Sejak {umkm.ownerSince}</p>
                            )}
                        </div>

                        <div className={styles.profileBottom}>
                            {umkm.mapsUrl !== null ? (
                                <a
                                    className={styles.alamat}
                                    href={umkm.mapsUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    {umkm.address}
                                </a>
                            ) : (
                                <span className={styles.alamat}>{umkm.address}</span>
                            )}
                            {umkm.openingHours !== null && (
                                <span className={styles.jamBuka}>{umkm.openingHours}</span>
                            )}
                        </div>
                    </div>

                    <div className={styles.produkUnggulan}>
                        <h2 className={styles.produkTitle}>Produk Unggulan</h2>
                        <ul className={styles.produkList}>
                            {umkm.products.map((product) => (
                                <li key={product.name} className={styles.produkItem}>
                                    <div>
                                        <p className={styles.productName}>{product.name}</p>
                                        <p className={styles.productDesc}>{product.description}</p>
                                    </div>
                                    <span className={styles.productPrice}>
                                        {rupiah.format(product.price)}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <a
                        className={styles.waCta}
                        href={`https://wa.me/${umkm.whatsapp}`}
                        target="_blank"
                        rel="noreferrer"
                    >
                        Hubungi Penjual via WhatsApp
                    </a>
                </div>
            </div>

            <section className={styles.banner}>
                <h2 className={styles.bannerTitle}>
                    Punya usaha di Sabah Balau dan ingin terdaftar di direktori resmi?
                </h2>
                <Link to="/daftar-umkm" className={styles.bannerLink}>
                    Daftarkan usahamu sekarang
                </Link>
            </section>
        </div>
    );
}

export default DetailUMKM;
