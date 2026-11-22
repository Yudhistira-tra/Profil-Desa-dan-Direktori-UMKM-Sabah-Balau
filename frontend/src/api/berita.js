import { beritaData } from '../data/berita.js'

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

// Data tiruan di memori. Nanti diganti fetch ke endpoint berita di kontrak
// (GET /api/berita, GET /api/berita/:slug, dan endpoint admin).
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

export async function getBeritaList() {
  await delay(300)
  return daftar.filter((item) => item.status === 'terbit').sort(urutTerbaru)
}

export async function getBeritaTerbaru(batas = 3) {
  const semua = await getBeritaList()
  return semua.slice(0, batas)
}

export async function getBeritaBySlug(slug) {
  await delay(300)
  return daftar.find((item) => item.slug === slug && item.status === 'terbit') ?? null
}

export async function getBeritaAdmin() {
  await delay(300)
  return [...daftar].sort(urutTerbaru)
}

export async function getBeritaAdminById(id) {
  await delay(300)
  return daftar.find((item) => item.id === id) ?? null
}

export async function createBerita(data) {
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
}

export async function updateBerita(id, changes) {
  await delay(400)
  daftar = daftar.map((item) => (item.id === id ? { ...item, ...changes } : item))
  return { data: daftar.find((item) => item.id === id) }
}

export async function deleteBerita(id) {
  await delay(300)
  daftar = daftar.filter((item) => item.id !== id)
  return { data: { id } }
}
