import { profilDesa } from '../content/profilDesa.js'

const STORAGE_KEY = 'profilDesaAdmin'
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

// Tiruan penyimpanan admin: perubahan ditumpuk di atas konten bawaan.
// Nanti diganti GET /api/profil dan PATCH /api/admin/profil.
function bacaSimpanan() {
  try {
    const teks = localStorage.getItem(STORAGE_KEY)
    return teks ? JSON.parse(teks) : null
  } catch {
    return null
  }
}

export function profilDesaTampil() {
  const simpanan = bacaSimpanan()
  return simpanan ? { ...profilDesa, ...simpanan } : profilDesa
}

export async function getProfil() {
  await delay(200)
  return profilDesaTampil()
}

export async function updateProfil(changes) {
  await delay(400)
  const sekarang = bacaSimpanan() ?? {}
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...sekarang, ...changes }))
  return { data: profilDesaTampil() }
}
