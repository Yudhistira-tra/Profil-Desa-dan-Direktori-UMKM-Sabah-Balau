import { profilDesa } from '../content/profilDesa.js'
import { request, denganCadangan } from './http.js'
import { modeTiruan, panggil } from './admin.js'

const STORAGE_KEY = 'profilDesaAdmin'
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

// Tiruan penyimpanan admin (development tanpa backend / mode data contoh):
// perubahan ditumpuk di atas konten bawaan.
function bacaSimpanan() {
  try {
    const teks = localStorage.getItem(STORAGE_KEY)
    return teks ? JSON.parse(teks) : null
  } catch {
    return null
  }
}

// Versi sinkron (tanpa backend). Dipakai halaman yang belum memanggil getProfil().
export function profilDesaTampil() {
  const simpanan = bacaSimpanan()
  return simpanan ? { ...profilDesa, ...simpanan } : profilDesa
}

// GET /api/profil
export async function getProfil() {
  return denganCadangan(
    async () => ({ ...profilDesa, ...(await request('/profil')) }),
    async () => {
      await delay(200)
      return profilDesaTampil()
    },
  )
}

// PATCH /api/admin/profil — hanya bagian yang dikirim yang diganti.
export async function updateProfil(changes) {
  if (modeTiruan()) {
    await delay(400)
    const sekarang = bacaSimpanan() ?? {}
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...sekarang, ...changes }))
    return { data: profilDesaTampil() }
  }
  const data = await panggil('/admin/profil', { method: 'PATCH', json: changes })
  return { data: { ...profilDesa, ...data } }
}
