// Satu pintu untuk semua panggilan ke backend (lihat docs/api-contract.md).
// Alamat backend diambil dari VITE_API_URL (file .env.local); bila tidak diisi, dipakai alamat development.
export const API_URL = (import.meta.env.VITE_API_URL ?? "http://localhost:8000/api").replace(/\/+$/, "");

// Data tiruan hanya dipakai saat development (npm run dev) DAN backend tidak bisa dihubungi,
// supaya halaman tetap bisa dikerjakan/didemokan tanpa backend. Di build produksi tidak pernah dipakai.
export const BOLEH_TIRUAN = import.meta.env.DEV === true;

export class ApiError extends Error {
  constructor(message, status = 0, errors) {
    super(message);
    this.status = status; // 0 = backend tidak bisa dihubungi
    this.errors = errors; // isi "errors" dari respons 422
    this.luring = status === 0;
  }
}

// Mengirim permintaan ke backend dan mengembalikan isi "data" dari respons.
// opsi.json  : objek yang dikirim sebagai JSON
// opsi.body  : FormData (multipart) — jangan set Content-Type sendiri
// opsi.token : token sesi admin
export async function request(path, { method = "GET", json, body, token, timeoutMs = 15000 } = {}) {
  const headers = {};
  if (json !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(json);
  }
  if (token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(`${API_URL}${path}`, { method, headers, body, signal: AbortSignal.timeout(timeoutMs) });
  } catch {
    throw new ApiError("Tidak bisa terhubung ke server. Pastikan backend sedang berjalan.");
  }
  const payload = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(payload.message ?? "Terjadi kesalahan pada server.", res.status, payload.errors);
  }
  return payload.data;
}

// Jalankan `utama` (panggilan backend). Bila backend tidak aktif saat development, pakai `cadangan` (data tiruan).
export async function denganCadangan(utama, cadangan) {
  try {
    return await utama();
  } catch (error) {
    if (error.luring && BOLEH_TIRUAN) {
      console.warn("[API] Backend tidak aktif, memakai data contoh.");
      return cadangan();
    }
    throw error;
  }
}
