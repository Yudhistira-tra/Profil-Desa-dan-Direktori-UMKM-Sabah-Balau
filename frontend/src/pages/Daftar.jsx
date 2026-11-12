import { useState } from "react";
import { Link } from "react-router-dom";
import { submitPendaftaran } from "../api/pendaftaran.js";
import styles from "./Daftar.module.css";

const initialForm = {
  name: "",
  owner: "",
  ownerSince: "",
  address: "",
  whatsapp: "",
  description: "",
  priceMin: "",
  openingHours: "",
  consent: false,
};

function validate(form) {
  const errors = {};

  if (!form.name.trim()) errors.name = "Nama usaha wajib diisi.";
  if (!form.owner.trim()) errors.owner = "Nama pemilik wajib diisi.";
  if (!form.address.trim()) errors.address = "Alamat wajib diisi.";

  const wa = form.whatsapp.replace(/\D/g, "");
  if (!/^62\d{8,13}$/.test(wa)) {
    errors.whatsapp = "Nomor harus diawali 62, hanya angka (contoh: 6281234567890).";
  }

  if (!form.description.trim()) errors.description = "Deskripsi usaha wajib diisi.";
  else if (form.description.length > 500) errors.description = "Maksimal 500 karakter.";

  if (!form.consent) errors.consent = "Persetujuan wajib dicentang.";

  return errors;
}

function Daftar() {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle");

  function handleChange(event) {
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const validationErrors = validate(form);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setStatus("sending");
    try {
      await submitPendaftaran({
        ...form,
        whatsapp: form.whatsapp.replace(/\D/g, ""),
        ownerSince: form.ownerSince === "" ? null : Number(form.ownerSince),
        priceMin: form.priceMin === "" ? null : Number(form.priceMin),
      });
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className={styles.page}>
        <nav className={styles.breadcrumb}>
          <Link to="/">Beranda</Link>
          <span aria-hidden="true">›</span>
          <Link to="/umkm">Direktori UMKM</Link>
          <span aria-hidden="true">›</span>
          <span aria-current="page">Daftarkan UMKM</span>
        </nav>
        <div className={styles.successBox}>
          <h1 className={styles.successTitle}>Pendaftaran Terkirim</h1>
          <p className={styles.successText}>
            Terima kasih. Usaha Anda akan diverifikasi oleh pihak desa terlebih
            dahulu sebelum tampil di Direktori UMKM.
          </p>
          <Link to="/umkm" className={styles.successLink}>Kembali ke Direktori UMKM</Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <nav className={styles.breadcrumb}>
        <Link to="/">Beranda</Link>
        <span aria-hidden="true">›</span>
        <Link to="/umkm">Direktori UMKM</Link>
        <span aria-hidden="true">›</span>
        <span aria-current="page">Daftarkan UMKM</span>
      </nav>

      <h1 className={styles.title}>Daftarkan UMKM</h1>
      <p className={styles.subtitle}>
        Isi data usaha Anda di bawah ini. Data akan diverifikasi oleh desa
        sebelum tampil di direktori.
      </p>

      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <div className={styles.field}>
          <label htmlFor="name" className={styles.label}>Nama Usaha</label>
          <input
            id="name"
            name="name"
            className={styles.input}
            value={form.name}
            onChange={handleChange}
          />
          {errors.name && <p className={styles.error}>{errors.name}</p>}
        </div>

        <div className={styles.fieldRow}>
          <div className={styles.field}>
            <label htmlFor="owner" className={styles.label}>Nama Pemilik</label>
            <input
              id="owner"
              name="owner"
              className={styles.input}
              value={form.owner}
              onChange={handleChange}
            />
            {errors.owner && <p className={styles.error}>{errors.owner}</p>}
          </div>

          <div className={styles.field}>
            <label htmlFor="ownerSince" className={styles.label}>Tahun Mulai Usaha</label>
            <input
              id="ownerSince"
              name="ownerSince"
              type="number"
              min="1900"
              max="2100"
              className={styles.input}
              placeholder="opsional"
              value={form.ownerSince}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className={styles.field}>
          <label htmlFor="address" className={styles.label}>Alamat / Dusun</label>
          <input
            id="address"
            name="address"
            className={styles.input}
            value={form.address}
            onChange={handleChange}
          />
          {errors.address && <p className={styles.error}>{errors.address}</p>}
        </div>

        <div className={styles.field}>
          <label htmlFor="whatsapp" className={styles.label}>Nomor WhatsApp</label>
          <input
            id="whatsapp"
            name="whatsapp"
            className={styles.input}
            placeholder="6281234567890"
            value={form.whatsapp}
            onChange={handleChange}
          />
          {errors.whatsapp && <p className={styles.error}>{errors.whatsapp}</p>}
        </div>

        <div className={styles.field}>
          <label htmlFor="description" className={styles.label}>Deskripsi Usaha</label>
          <textarea
            id="description"
            name="description"
            className={styles.textarea}
            rows={4}
            value={form.description}
            onChange={handleChange}
          />
          {errors.description && <p className={styles.error}>{errors.description}</p>}
        </div>

        <div className={styles.fieldRow}>
          <div className={styles.field}>
            <label htmlFor="priceMin" className={styles.label}>Harga Mulai (Rp)</label>
            <input
              id="priceMin"
              name="priceMin"
              type="number"
              min="0"
              className={styles.input}
              placeholder="opsional"
              value={form.priceMin}
              onChange={handleChange}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="openingHours" className={styles.label}>Jam Buka</label>
            <input
              id="openingHours"
              name="openingHours"
              className={styles.input}
              placeholder="opsional"
              value={form.openingHours}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className={styles.field}>
          <label className={styles.consentLabel}>
            <input
              type="checkbox"
              name="consent"
              className={styles.checkbox}
              checked={form.consent}
              onChange={handleChange}
            />
            Saya menyetujui data usaha saya dipublikasikan di website Direktori
            UMKM Desa Sabah Balau.
          </label>
          {errors.consent && <p className={styles.error}>{errors.consent}</p>}
        </div>

        {status === "error" && (
          <p className={styles.error}>Gagal mengirim. Periksa koneksi dan coba lagi.</p>
        )}

        <button
          type="submit"
          className={styles.submit}
          disabled={status === "sending"}
        >
          {status === "sending" ? "Mengirim..." : "Daftar Sekarang"}
        </button>
      </form>
    </div>
  );
}

export default Daftar;
