import { beritaData } from '../data/berita.js'
import { request, denganCadangan } from './http.js'
import { modeTiruan, panggil } from './admin.js'

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

// ---------------------------------------------------------------------------
// Data tiruan di memori. Dipakai hanya saat development bila backend tidak aktif
// (lihat http.js), atau saat admin masuk dengan mode data contoh.
// ---------------------------------------------------------------------------
let daftar = beritaData.map((item) => ({ ...item }))
let urutan = daftar.length

const urutTerbaru = (a, b) => b.date.localeCompare(a.date) || b.id - a.id

function buatSlug(judul) {
  const dasar = judul
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80) || 'berita'

  let slug = dasar
  let nomor = 2
  while (daftar.some((item) => item.slug === slug)) {
    slug = `${dasar}-${nomor}`
    nomor += 1
  }
  return slug
}

const tiruan = {
  async list() {
    await delay(300)
    return daftar.filter((item) => item.status === 'terbit').sort(urutTerbaru)
  },
  async bySlug(slug) {
    await delay(300)
    return daftar.find((item) => item.slug === slug && item.status === 'terbit') ?? null
  },
  async admin() {
    await delay(300)
    return [...daftar].sort(urutTerbaru)
  },
  async adminById(id) {
    await delay(300)
    return daftar.find((item) => item.id === id) ?? null
  },
  async create(data) {
    await delay(400)
    urutan += 1
    const baru = {
      id: urutan,
      slug: buatSlug(data.title),
      title: data.title,
      excerpt: data.excerpt,
      content: data.content,
      cover: data.cover ?? null,
      date: data.date,
      sourceUrl: data.sourceUrl || null,
      status: data.status,
    }
    daftar = [baru, ...daftar]
    return { data: baru }
  },
  async update(id, changes) {
    await delay(400)
    daftar = daftar.map((item) => (item.id === id ? { ...item, ...changes } : item))
    return { data: daftar.find((item) => item.id === id) }
  },
  async remove(id) {
    await delay(300)
    daftar = daftar.filter((item) => item.id !== id)
    return { data: { id } }
  },
}

const nullBila404 = (error) => {
  if (error.status === 404) return null
  throw error
}

// ---------------------------------------------------------------------------
// Publik
// ---------------------------------------------------------------------------

// GET /api/berita — hanya berita terbit, urut tanggal terbaru.
export async function getBeritaList() {
  return denganCadangan(() => request('/berita'), tiruan.list)
}

export async function getBeritaTerbaru(batas = 3) {
  const semua = await getBeritaList()
  return semua.slice(0, batas)
}

// GET /api/berita/:slug — null bila tidak ada atau masih draf.
export async function getBeritaBySlug(slug) {
  return denganCadangan(
    () => request(`/berita/${encodeURIComponent(slug)}`).catch(nullBila404),
    () => tiruan.bySlug(slug),
  )
}

// ---------------------------------------------------------------------------
// Admin (butuh login, token dari api/admin.js)
// ---------------------------------------------------------------------------

export async function getBeritaAdmin() {
  if (modeTiruan()) return tiruan.admin()
  return panggil('/admin/berita')
}

export async function getBeritaAdminById(id) {
  if (modeTiruan()) return tiruan.adminById(id)
  return panggil(`/admin/berita/${id}`).catch(nullBila404)
}

// Foto utama baru dari form berupa URL blob: (URL.createObjectURL). Foto itu dikirim
// sebagai file "cover" (multipart) bersama field "data" berisi JSON berita.
// cover null = hapus foto utama; cover URL lama = foto tidak berubah.
async function kirimBerita(path, method, data) {
  const { cover, ...isi } = data
  if (typeof cover === 'string' && cover.startsWith('blob:')) {
    const file = await fetch(cover).then((res) => res.blob())
    const body = new FormData()
    body.append('data', JSON.stringify(isi))
    body.append('cover', file, `cover.${(file.type.split('/')[1] || 'jpg').replace('jpeg', 'jpg')}`)
    return panggil(path, { method, body, timeoutMs: 60000 })
  }
  return panggil(path, { method, json: cover === null ? { ...isi, cover: null } : isi })
}

export async function createBerita(data) {
  if (modeTiruan()) return tiruan.create(data)
  return { data: await kirimBerita('/admin/berita', 'POST', data) }
}

export async function updateBerita(id, changes) {
  if (modeTiruan()) return tiruan.update(id, changes)
  return { data: await kirimBerita(`/admin/berita/${id}`, 'PATCH', changes) }
}

export async function deleteBerita(id) {
  if (modeTiruan()) return tiruan.remove(id)
  return { data: await panggil(`/admin/berita/${id}`, { method: 'DELETE' }) }
}
