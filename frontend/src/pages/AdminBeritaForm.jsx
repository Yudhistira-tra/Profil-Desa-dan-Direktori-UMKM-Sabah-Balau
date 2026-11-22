import { useEffect, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { createBerita, getBeritaAdminById, updateBerita } from '../api/berita.js'
import AdminNavbar from '../components/AdminNavbar'
import styles from './AdminBeritaForm.module.css'

const MAX_COVER_SIZE = 5 * 1024 * 1024
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const HARI_INI = new Date().toISOString().slice(0, 10)

function formKosong() {
  return {
    title: '',
    date: HARI_INI,
    excerpt: '',
    content: '',
    sourceUrl: '',
    status: 'draf',
    cover: null,
  }
}

function keForm(berita) {
  return {
    ...berita,
    content: berita.content.join('\n\n'),
    sourceUrl: berita.sourceUrl ?? '',
  }
}

function validate(form) {
  const errors = {}

  if (!form.title.trim()) errors.title = 'Judul berita wajib diisi.'
  if (!form.date) errors.date = 'Tanggal wajib diisi.'

  if (!form.excerpt.trim()) errors.excerpt = 'Ringkasan wajib diisi.'
  else if (form.excerpt.trim().length > 220) errors.excerpt = 'Ringkasan maksimal 220 karakter.'

  if (!form.content.trim()) errors.content = 'Isi berita wajib diisi.'

  const sumber = form.sourceUrl.trim()
  if (sumber && !/^https?:\/\/\S+$/i.test(sumber)) {
    errors.sourceUrl = 'Link harus diawali http:// atau https://.'
  }

  return errors
}

function AdminBeritaForm() {
  const { id } = useParams()
  const modeEdit = Boolean(id)
  const navigate = useNavigate()
  const [adminName] = useState(() => sessionStorage.getItem('adminName'))
  const [form, setForm] = useState(modeEdit ? null : formKosong())
  const [loading, setLoading] = useState(modeEdit)
  const [tidakAda, setTidakAda] = useState(false)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})
  const [coverError, setCoverError] = useState('')

  useEffect(() => {
    if (!modeEdit) return

    getBeritaAdminById(Number(id)).then((data) => {
      if (data) setForm(keForm(data))
      else setTidakAda(true)
      setLoading(false)
    })
  }, [id, modeEdit])

  if (!adminName) return <Navigate to="/admin" replace />

  if (loading) {
    return (
      <div className={styles.page}>
        <AdminNavbar adminName={adminName} />
        <p className={styles.status}>Memuat berita...</p>
      </div>
    )
  }

  if (tidakAda) {
    return (
      <div className={styles.page}>
        <AdminNavbar adminName={adminName} />
        <div className={styles.status}>
          <p>Berita tidak ditemukan.</p>
          <Link to="/admin/berita" className={styles.backLink}>Kembali ke Kelola Berita</Link>
        </div>
      </div>
    )
  }

  function handleChange(event) {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: undefined }))
  }

  function handleCoverChange(event) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    if (!ALLOWED_TYPES.includes(file.type)) {
      setCoverError('Format foto harus JPG, PNG, atau WebP.')
      return
    }
    if (file.size > MAX_COVER_SIZE) {
      setCoverError('Ukuran foto maksimal 5 MB.')
      return
    }

    setCoverError('')
    setForm((prev) => ({ ...prev, cover: URL.createObjectURL(file) }))
  }

  function removeCover() {
    setForm((prev) => ({ ...prev, cover: null }))
    setCoverError('')
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const validationErrors = validate(form)
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0) return

    const data = {
      title: form.title.trim(),
      date: form.date,
      excerpt: form.excerpt.trim(),
      content: form.content
        .split(/\n\s*\n/)
        .map((paragraf) => paragraf.trim())
        .filter(Boolean),
      sourceUrl: form.sourceUrl.trim() || null,
      status: form.status,
      cover: form.cover,
    }

    setSaving(true)
    try {
      if (modeEdit) await updateBerita(Number(id), data)
      else await createBerita(data)
      navigate('/admin/berita')
    } catch {
      setErrors({ submit: 'Gagal menyimpan berita. Coba lagi.' })
      setSaving(false)
    }
  }

  return (
    <div className={styles.page}>
      <AdminNavbar adminName={adminName} />

      <main className={styles.main}>
        <Link to="/admin/berita" className={styles.back}>← Kembali ke Kelola Berita</Link>

        <div className={styles.head}>
          <div>
            <h1 className={styles.title}>{modeEdit ? 'Edit Berita' : 'Tulis Berita'}</h1>
            <p className={styles.subtitle}>
              Berita yang berstatus terbit langsung tampil di halaman Berita dan Beranda.
            </p>
          </div>
          {modeEdit && <span className={styles.slugChip}>/{form.slug}</span>}
        </div>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Informasi Berita</h2>

            <div className={styles.field}>
              <label htmlFor="title" className={styles.label}>Judul Berita</label>
              <input
                id="title"
                name="title"
                className={styles.input}
                value={form.title}
                onChange={handleChange}
              />
              {errors.title && <p className={styles.error}>{errors.title}</p>}
            </div>

            <div className={styles.row}>
              <div className={styles.field}>
                <label htmlFor="date" className={styles.label}>Tanggal Berita</label>
                <input
                  id="date"
                  name="date"
                  type="date"
                  className={styles.input}
                  value={form.date}
                  onChange={handleChange}
                />
                {errors.date && <p className={styles.error}>{errors.date}</p>}
              </div>
              <div className={styles.field}>
                <label htmlFor="status" className={styles.label}>Status</label>
                <select
                  id="status"
                  name="status"
                  className={styles.select}
                  value={form.status}
                  onChange={handleChange}
                >
                  <option value="draf">Draf (belum tampil)</option>
                  <option value="terbit">Terbit (tampil di situs)</option>
                </select>
              </div>
            </div>

            <div className={styles.field}>
              <label htmlFor="excerpt" className={styles.label}>Ringkasan</label>
              <textarea
                id="excerpt"
                name="excerpt"
                rows={3}
                maxLength={220}
                className={styles.textarea}
                value={form.excerpt}
                onChange={handleChange}
              />
              <p className={styles.hint}>
                Tampil di daftar Berita dan Beranda. Maksimal 220 karakter.
              </p>
              {errors.excerpt && <p className={styles.error}>{errors.excerpt}</p>}
            </div>
          </section>

          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Isi Berita</h2>

            <div className={styles.field}>
              <label htmlFor="content" className={styles.label}>Isi Berita</label>
              <textarea
                id="content"
                name="content"
                rows={12}
                className={styles.textarea}
                value={form.content}
                onChange={handleChange}
              />
              <p className={styles.hint}>
                Pisahkan paragraf dengan satu baris kosong.
              </p>
              {errors.content && <p className={styles.error}>{errors.content}</p>}
            </div>

            <div className={styles.field}>
              <label htmlFor="sourceUrl" className={styles.label}>
                Link Sumber <span className={styles.optional}>(opsional)</span>
              </label>
              <input
                id="sourceUrl"
                name="sourceUrl"
                className={styles.input}
                placeholder="https://www.instagram.com/p/..."
                value={form.sourceUrl}
                onChange={handleChange}
              />
              <p className={styles.hint}>
                Diisi jika berita dikutip dari Instagram atau situs lain. Pembaca
                akan diarahkan ke tautan ini.
              </p>
              {errors.sourceUrl && <p className={styles.error}>{errors.sourceUrl}</p>}
            </div>
          </section>

          <section className={styles.card}>
            <h2 className={styles.cardTitle}>
              Foto Utama <span className={styles.optional}>(opsional)</span>
            </h2>
            <p className={styles.hint}>JPG, PNG, atau WebP — maksimal 5 MB.</p>

            <div className={styles.coverWrap}>
              {form.cover ? (
                <div className={styles.coverItem}>
                  <img src={form.cover} alt="Foto utama berita" className={styles.coverImage} />
                  <button
                    type="button"
                    className={styles.coverRemove}
                    onClick={removeCover}
                    aria-label="Hapus foto utama"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <label className={styles.coverAdd}>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className={styles.coverInput}
                    onChange={handleCoverChange}
                  />
                  <span aria-hidden="true">+</span>
                  Pilih Foto
                </label>
              )}
            </div>
            {coverError && <p className={styles.error}>{coverError}</p>}
          </section>

          {errors.submit && <p className={styles.error}>{errors.submit}</p>}

          <div className={styles.actions}>
            <button type="submit" className={styles.save} disabled={saving}>
              {saving ? 'Menyimpan...' : modeEdit ? 'Simpan Perubahan' : 'Simpan Berita'}
            </button>
            <Link to="/admin/berita" className={styles.cancel}>Batal</Link>
          </div>
        </form>
      </main>
    </div>
  )
}

export default AdminBeritaForm
