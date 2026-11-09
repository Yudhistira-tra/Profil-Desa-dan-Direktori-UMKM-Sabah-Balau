import { Link } from 'react-router-dom'
import styles from './UMKMCard.module.css'

const rupiah = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
})

function UMKMCard({ umkm }) {
  const cover = umkm.images[0]

  return (
    <article className={styles.card}>
      <div className={styles.cover}>
        {cover ? (
          <img src={cover} alt={umkm.name} className={styles.image} />
        ) : (
          <span className={styles.coverEmpty}>Belum ada foto</span>
        )}
      </div>

      <div className={styles.body}>
        <h3 className={styles.name}>{umkm.name}</h3>
        <p className={styles.description}>{umkm.description}</p>

        <div className={styles.priceRow}>
          <span className={styles.priceLabel}>Harga Mulai</span>
          <span className={styles.price}>
            {umkm.priceMin === null ? 'Hubungi Penjual' : rupiah.format(umkm.priceMin)}
          </span>
        </div>

        <a
          className={styles.whatsapp}
          href={`https://wa.me/${umkm.whatsapp}`}
          target="_blank"
          rel="noreferrer"
        >
          WhatsApp
        </a>
      </div>

      <Link to={`/umkm/${umkm.slug}`} className={styles.overlay}>
        Lihat detail {umkm.name}
      </Link>
    </article>
  )
}

export default UMKMCard