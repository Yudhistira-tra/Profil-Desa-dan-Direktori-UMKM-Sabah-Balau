import { useEffect, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { getUmkmAdmin, updateUmkmAdmin } from '../api/admin.js'
import AdminNavbar from '../components/AdminNavbar'
import styles from './AdminUmkmEdit.module.css'

const MAX_PHOTOS = 5
const MAX_PRODUCTS = 3
const MAX_PHOTO_SIZE = 5 * 1024 * 1024
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Menunggu review' },
  { value: 'aktif', label: 'Aktif (tampil di direktori)' },
  { value: 'ditolak', label: 'Ditolak' },
]

function validate(form) {
  const errors = {}

  if (!form.name.trim()) errors.name = 'Nama usaha wajib diisi.'
  if (!form.owner.trim()) errors.owner = 'Nama pemilik wajib diisi.'
  if (!form.address.trim()) errors.address = 'Alamat wajib diisi.'

  const wa = form.whatsapp.replace(/\D/g, '')
  if (!/^62\d{8,13}$/.test(wa)) {
    errors.whatsapp = 'Nomor harus diawali 62, hanya angka.'
  }

  if (!form.description.trim()) errors.description = 'Deskripsi wajib diisi.'
  else if (form.description.length > 500) errors.description = 'Maksimal 500 karakter.'

  return errors
}

function AdminUmkmEdit() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [adminName] = useState(() => sessionStorage.getItem('adminName'))
  const [form, setForm] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})
  const [photoError, setPhotoError] = useState('')

  useEffect(() => {
    getUmkmAdmin(Number(id)).then((data) => {
      setForm(data)
      setLoading(false)
    })
  }, [id])

  if (!adminName) return <Navigate to="/admin" replace />

  if (loading) {
    return (
      <div className={styles.page}>
        <AdminNavbar adminName={adminName} />
        <p className={styles.status}>Memuat data UMKM...</p>
      </div>
    )
  }

  if (!form) {
    return (
      <div className={styles.page}>
        <AdminNavbar adminName={adminName} />
        <div className={styles.status}>
          <p>UMKM tidak ditemukan atau sudah ditinjau.</p>
          <Link to="/admin/dashboard" className={styles.backLink}>Kembali ke Dashboard</Link>
        </div>
      </div>
    )
  }

  function handleChange(event) {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: undefined }))
  }

  function changeProduct(index, field, value) {
    setForm((prev) => ({
      ...prev,
      products: prev.products.map((product, productIndex) =>
        productIndex === index ? { ...product, [field]: value } : product,
      ),
    }))
  }

  function addProduct() {
    setForm((prev) => ({
      ...prev,
      products: [...prev.products, { name: '', description: '', price: '' }],
    }))
  }

  function removeProduct(index) {
    setForm((prev) => ({
      ...prev,
      products: prev.products.filter((_, productIndex) => productIndex !== index),
    }))
  }

  function handlePhotoChange(event) {
    const files = Array.from(event.target.files ?? [])
    event.target.value = ''

    const problems = []
    const accepted = []
    files.forEach((file) => {
      if (!ALLOWED_TYPES.includes(file.type)) {
        problems.push(`${file.name}: format harus JPG, PNG, atau WebP.`)
      } else if (file.size > MAX_PHOTO_SIZE) {
        problems.push(`${file.name}: ukuran maksimal 5 MB.`)
      } else {
        accepted.push(URL.createObjectURL(file))
      }
    })

    const room = MAX_PHOTOS - form.images.length
    if (accepted.length > room) {
      problems.push(`Maksimal ${MAX_PHOTOS} foto.`)
    }
    setForm((prev) => ({ ...prev, images: [...prev.images, ...accepted.slice(0, room)] }))
    setPhotoError(problems[0] ?? '')
  }

  function removeImage(index) {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, imageIndex) => imageIndex !== index),
    }))
    setPhotoError('')
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const validationErrors = validate(form)
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0) return

    setSaving(true)
    try {
      await updateUmkmAdmin(form.id, {
        ...form,
        whatsapp: form.whatsapp.replace(/\D/g, ''),
        ownerSince: form.ownerSince === '' ? null : Number(form.ownerSince),
        priceMin: form.priceMin === '' ? null : Number(form.priceMin),
        products: form.products
          .filter((product) => product.name.trim())
          .map((product) => ({
            name: product.name,
            description: product.description,
            price: product.price === '' ? null : Number(product.price),
          })),
      })
      navigate('/admin/dashboard')
    } catch {
      setErrors({ submit: 'Gagal menyimpan. Coba lagi.' })
      setSaving(false)
    }
  }

  return (
    <div className={styles.page}>
      <AdminNavbar adminName={adminName} />

      <main className={styles.main}>
        <Link to="/admin/dashboard" className={styles.back}>← Kembali ke Dashboard</Link>

        <div className={styles.head}>
          <div>
            <h1 className={styles.title}>Edit UMKM</h1>
            <p className={styles.subtitle}>
              Tinjau dan lengkapi data sebelum UMKM tampil di direktori desa.
            </p>
          </div>
          <span className={styles.slugChip}>/{form.slug}</span>
        </div>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Data Usaha</h2>

            <div className={styles.field}>
              <label htmlFor="name" className={styles.label}>Nama Usaha</label>
              <input id="name" name="name" className={styles.input} value={form.name} onChange={handleChange} />
              {errors.name && <p className={styles.error}>{errors.name}</p>}
            </div>

            <div className={styles.row}>
              <div className={styles.field}>
                <label htmlFor="owner" className={styles.label}>Nama Pemilik</label>
                <input id="owner" name="owner" className={styles.input} value={form.owner} onChange={handleChange} />
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
                  value={form.ownerSince ?? ''}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className={styles.field}>
              <label htmlFor="address" className={styles.label}>Alamat / Dusun</label>
              <input id="address" name="address" className={styles.input} value={form.address} onChange={handleChange} />
              {errors.address && <p className={styles.error}>{errors.address}</p>}
            </div>

            <div className={styles.field}>
              <label htmlFor="mapsUrl" className={styles.label}>Link Google Maps</label>
              <input
                id="mapsUrl"
                name="mapsUrl"
                className={styles.input}
                placeholder="https://maps.app.goo.gl/..."
                value={form.mapsUrl ?? ''}
                onChange={handleChange}
              />
              <p className={styles.hint}>Kosongkan jika lokasi belum diketahui.</p>
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
                rows={4}
                className={styles.textarea}
                value={form.description}
                onChange={handleChange}
              />
              {errors.description && <p className={styles.error}>{errors.description}</p>}
            </div>

            <div className={styles.row}>
              <div className={styles.field}>
                <label htmlFor="priceMin" className={styles.label}>Harga Mulai (Rp)</label>
                <input
                  id="priceMin"
                  name="priceMin"
                  type="number"
                  min="0"
                  className={styles.input}
                  value={form.priceMin ?? ''}
                  onChange={handleChange}
                />
              </div>
              <div className={styles.field}>
                <label htmlFor="openingHours" className={styles.label}>Jam Buka</label>
                <input
                  id="openingHours"
                  name="openingHours"
                  className={styles.input}
                  value={form.openingHours ?? ''}
                  onChange={handleChange}
                />
              </div>
            </div>
          </section>

          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Status</h2>
            <div className={styles.field}>
              <label htmlFor="status" className={styles.label}>Status Pendaftaran</label>
              <select
                id="status"
                name="status"
                className={styles.select}
                value={form.status}
                onChange={handleChange}
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
          </section>

          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Produk Unggulan <span className={styles.optional}>(opsional, maks 3)</span></h2>

            {form.products.map((product, index) => (
              <div key={index} className={styles.productRow}>
                <div className={styles.field}>
                  <label className={styles.label}>Nama Produk</label>
                  <input
                    className={styles.input}
                    value={product.name}
                    onChange={(event) => changeProduct(index, 'name', event.target.value)}
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Deskripsi</label>
                  <input
                    className={styles.input}
                    value={product.description}
                    onChange={(event) => changeProduct(index, 'description', event.target.value)}
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Harga (Rp)</label>
                  <input
                    type="number"
                    min="0"
                    className={styles.input}
                    value={product.price ?? ''}
                    onChange={(event) => changeProduct(index, 'price', event.target.value)}
                  />
                </div>
                <button
                  type="button"
                  className={styles.productRemove}
                  onClick={() => removeProduct(index)}
                  aria-label={`Hapus produk ${index + 1}`}
                >
                  ×
                </button>
              </div>
            ))}

            {form.products.length < MAX_PRODUCTS && (
              <button type="button" className={styles.addButton} onClick={addProduct}>
                + Tambah Produk
              </button>
            )}
          </section>

          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Foto <span className={styles.optional}>(opsional, maks 5)</span></h2>
            <p className={styles.hint}>JPG, PNG, atau WebP — maksimal 5 MB per foto.</p>

            <div className={styles.photoGrid}>
              {form.images.map((image, index) => (
                <div key={`${image}-${index}`} className={styles.photoItem}>
                  <img src={image} alt={`Foto ${index + 1}`} className={styles.photoThumb} />
                  <button
                    type="button"
                    className={styles.photoRemove}
                    onClick={() => removeImage(index)}
                    aria-label={`Hapus foto ${index + 1}`}
                  >
                    ×
                  </button>
                </div>
              ))}
              {form.images.length < MAX_PHOTOS && (
                <label className={styles.photoAdd}>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    className={styles.photoInput}
                    onChange={handlePhotoChange}
                  />
                  <span aria-hidden="true">+</span>
                  Tambah Foto
                </label>
              )}
            </div>
            {photoError && <p className={styles.error}>{photoError}</p>}
          </section>

          {errors.submit && <p className={styles.error}>{errors.submit}</p>}

          <div className={styles.actions}>
            <button type="submit" className={styles.save} disabled={saving}>
              {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
            <Link to="/admin/dashboard" className={styles.cancel}>Batal</Link>
          </div>
        </form>
      </main>
    </div>
  )
}

export default AdminUmkmEdit
