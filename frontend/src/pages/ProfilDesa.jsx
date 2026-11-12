import { useEffect } from 'react'
import Icon from '../components/Icon'
import { profilDesa } from '../content/profilDesa'
import styles from './ProfilDesa.module.css'

const formatAngka = (value) => new Intl.NumberFormat('id-ID').format(value)

const hitungPersen = (bagian, total) =>
  total > 0 ? Math.round((bagian / total) * 100) : 0

function FotoOrang({ orang, besar = false }) {
  if (orang.photoUrl) {
    return (
      <img
        className={besar ? styles.fotoBesar : styles.foto}
        src={orang.photoUrl}
        alt={`Foto ${orang.nama}`}
        loading="lazy"
      />
    )
  }

  return (
    <span
      className={besar ? styles.fotoKosongBesar : styles.fotoKosong}
      aria-hidden="true"
    >
      <Icon name="user" size={besar ? 38 : 30} strokeWidth={1.5} />
    </span>
  )
}

export default function ProfilDesa() {
  useEffect(() => {
    document.title = 'Profil Desa — Desa Sabah Balau'
  }, [])

  const { demografi, geografis } = profilDesa
  const { pimpinan, perangkat } = profilDesa.struktur

  const totalDusun = demografi.sebaranDusun.reduce(
    (jumlah, dusun) => jumlah + dusun.jumlah,
    0,
  )
  const totalPenduduk = totalDusun || demografi.jumlahPenduduk
  const persenLakiLaki = hitungPersen(demografi.lakiLaki, totalPenduduk)
  const persenPerempuan = hitungPersen(demografi.perempuan, totalPenduduk)

  return (
    <>
      {/* ============ KEPALA HALAMAN ============ */}
      <section className={styles.head}>
        <div className={styles.container}>
          <h1>Profil Desa Sabah Balau</h1>
          <p className={styles.headLead}>{profilDesa.ringkasan}</p>

          <ul className={styles.headStats}>
            <li className={styles.headStat}>
              <span className={styles.headStatIcon}>
                <Icon name="layers" size={22} />
              </span>
              <div>
                <p className={styles.headStatLabel}>Luas Wilayah</p>
                <p className={styles.headStatValue}>{geografis.luas}</p>
              </div>
            </li>
            <li className={styles.headStat}>
              <span className={styles.headStatIcon}>
                <Icon name="users" size={22} />
              </span>
              <div>
                <p className={styles.headStatLabel}>Jumlah Penduduk</p>
                <p className={styles.headStatValue}>
                  {formatAngka(demografi.jumlahPenduduk)} Jiwa
                </p>
              </div>
            </li>
            <li className={styles.headStat}>
              <span className={styles.headStatIcon}>
                <Icon name="mapPin" size={22} />
              </span>
              <div>
                <p className={styles.headStatLabel}>Dusun</p>
                <p className={styles.headStatValue}>
                  {geografis.jumlahDusun} Dusun
                </p>
              </div>
            </li>
          </ul>
        </div>
      </section>

      {/* ============ VISI & MISI ============ */}
      <section
        className={styles.visiMisi}
        id="visi-misi"
        aria-labelledby="judul-visi"
      >
        <div className={styles.container}>
          <h2 className={styles.centerTitle} id="judul-visi">
            Visi &amp; Misi Desa Sabah Balau {profilDesa.periode}
          </h2>

          <div className={styles.visiGrid}>
            <article className={`${styles.pilarCard} ${styles.visiCard}`}>
              <div className={styles.pilarHead}>
                <span className={`${styles.pilarIcon} ${styles.pilarIconVisi}`}>
                  <Icon name="compass" size={22} />
                </span>
                <span className={styles.pilarBadge}>Visi</span>
              </div>

              <div>
                <p className={styles.pilarLabel}>Pernyataan Visi:</p>
                <p className={styles.visiText}>{profilDesa.visi}</p>
              </div>

              <p className={styles.periodeBarVisi}>Periode {profilDesa.periode}</p>
            </article>

            <article className={`${styles.pilarCard} ${styles.misiCard}`}>
              <div className={styles.pilarHead}>
                <span className={`${styles.pilarIcon} ${styles.pilarIconMisi}`}>
                  <Icon name="flag" size={22} />
                </span>
                <span className={`${styles.pilarBadge} ${styles.badgeMisi}`}>
                  Misi
                </span>
              </div>

              <ol className={styles.misiList}>
                {profilDesa.misi.map((butir, indeks) => (
                  <li className={styles.misiItem} key={butir}>
                    <span className={styles.misiNomor}>
                      {String(indeks + 1).padStart(2, '0')}
                    </span>
                    <p>{butir}</p>
                  </li>
                ))}
              </ol>

              <p className={styles.periodeBarMisi}>Periode {profilDesa.periode}</p>
            </article>
          </div>
        </div>
      </section>

      {/* ============ STRUKTUR ORGANISASI ============ */}
      <section
        className={styles.struktur}
        id="struktur"
        aria-labelledby="judul-struktur"
      >
        <div className={styles.container}>
          <div className={styles.sectionHead}>
            <h2 id="judul-struktur">
              Struktur Organisasi Pemerintahan Desa Sabah Balau
            </h2>
            <p className={styles.masaBakti}>
              Masa Bakti :<span>Periode {profilDesa.periode}</span>
            </p>
          </div>

          <div className={styles.pimpinanGrid}>
            <article className={`${styles.personCard} ${styles.leadCard}`}>
              <div className={styles.leadProfile}>
                <FotoOrang orang={pimpinan} besar />
                <div>
                  <span className={styles.unitBadge}>{pimpinan.unit}</span>
                  <h3>{pimpinan.nama}</h3>
                  <p className={styles.personRole}>{pimpinan.jabatan}</p>
                  <p className={styles.leadDesc}>{pimpinan.deskripsi}</p>
                </div>
              </div>

              {pimpinan.email && (
                <a
                  className={styles.emailBar}
                  href={`mailto:${pimpinan.email}`}
                >
                  <Icon name="mail" size={15} />
                  {pimpinan.email}
                </a>
              )}
            </article>

            {perangkat.slice(0, 2).map((orang) => (
              <article className={styles.personCard} key={orang.jabatan}>
                <div className={styles.photoWrap}>
                  <FotoOrang orang={orang} />
                  <span className={styles.unitTag}>{orang.unit}</span>
                </div>
                <h3>{orang.nama}</h3>
                <p className={styles.personRole}>{orang.jabatan}</p>
                <p className={styles.personDesc}>{orang.deskripsi}</p>
              </article>
            ))}
          </div>

          <div className={styles.staffGrid}>
            {perangkat.slice(2).map((orang) => (
              <article className={styles.personCard} key={orang.jabatan}>
                <div className={styles.photoWrap}>
                  <FotoOrang orang={orang} />
                  <span className={styles.unitTag}>{orang.unit}</span>
                </div>
                <h3>{orang.nama}</h3>
                <p className={styles.personRole}>{orang.jabatan}</p>
                <p className={styles.personDesc}>{orang.deskripsi}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ============ PETA & DEMOGRAFI ============ */}
      <section
        className={styles.peta}
        id="peta"
        aria-labelledby="judul-peta"
      >
        <div className={styles.container}>
          <h2 className={styles.petaTitle} id="judul-peta">
            Peta Wilayah Desa Sabah Balau
          </h2>

          <div className={styles.petaGrid}>
            <a
              className={styles.mapCard}
              href="https://www.google.com/maps/search/?api=1&query=Sabah+Balau+Tanjung+Bintang+Lampung+Selatan"
              target="_blank"
              rel="noreferrer noopener"
              aria-label="Buka peta wilayah Desa Sabah Balau di Google Maps"
            >
              <img
                src="/images/peta-desa.svg"
                alt=""
                loading="lazy"
              />
              <span className={styles.mapTag}>
                <Icon name="mapPin" size={15} />
                Kec. Tanjung Bintang (35.01.07.2001)
              </span>
              <span className={styles.mapAction}>
                <Icon name="search" size={14} />
                Interaktif
              </span>
            </a>

            <div className={styles.demografiCard}>
              <div className={styles.demografiHead}>
                <h3>Jumlah Penduduk</h3>
                <span className={styles.kkPill}>
                  {formatAngka(demografi.jumlahKK)} Kepala Keluarga
                </span>
              </div>

              <div className={styles.genderGrid}>
                <div className={styles.genderCard}>
                  <p className={styles.genderLabel}>
                    <Icon name="male" size={15} />
                    Laki-laki
                  </p>
                  <p className={styles.genderValue}>
                    {formatAngka(demografi.lakiLaki)}
                  </p>
                  <p className={styles.genderPercent}>{persenLakiLaki}%</p>
                </div>
                <div className={styles.genderCard}>
                  <p className={styles.genderLabel}>
                    <Icon name="female" size={15} />
                    Perempuan
                  </p>
                  <p className={styles.genderValue}>
                    {formatAngka(demografi.perempuan)}
                  </p>
                  <p className={styles.genderPercent}>{persenPerempuan}%</p>
                </div>
              </div>

              <div className={styles.sebaran}>
                <h4>Sebaran Penduduk per Dusun:</h4>
                <ul>
                  {demografi.sebaranDusun.map((dusun, indeks) => {
                    const persen = hitungPersen(dusun.jumlah, totalPenduduk)

                    return (
                      <li key={dusun.nama}>
                        <p className={styles.sebaranRow}>
                          <span>{dusun.nama}</span>
                          <span>
                            {formatAngka(dusun.jumlah)} Jiwa ({persen}%)
                          </span>
                        </p>
                        <span className={styles.bar}>
                          <span
                            className={
                              indeks % 2 === 0
                                ? styles.barUngu
                                : styles.barHijau
                            }
                            style={{ width: `${persen}%` }}
                          />
                        </span>
                      </li>
                    )
                  })}
                </ul>
              </div>
            </div>

            <div className={styles.jobCard}>
              <h3>Mata Pencaharian Warga</h3>
              <ul className={styles.jobGrid}>
                {demografi.mataPencaharian.map((pekerjaan) => (
                  <li className={styles.jobItem} key={pekerjaan.nama}>
                    <p className={styles.jobPercent}>{pekerjaan.persen}%</p>
                    <p className={styles.jobName}>{pekerjaan.nama}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
