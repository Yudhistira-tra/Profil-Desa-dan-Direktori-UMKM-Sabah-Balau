import { umkmData } from "../data/umkm.js";
import { request, denganCadangan } from "./http.js";

// GET /api/umkm — daftar UMKM yang sudah disetujui, urut nama A–Z.
export async function getUmkmList() {
  return denganCadangan(
    () => request("/umkm"),
    () => umkmData,
  );
}

// GET /api/umkm/:slug — null bila tidak ditemukan.
export async function getUmkmBySlug(slug) {
  return denganCadangan(
    async () => {
      try {
        return await request(`/umkm/${encodeURIComponent(slug)}`);
      } catch (error) {
        if (error.status === 404) return null;
        throw error;
      }
    },
    () => umkmData.find((umkm) => umkm.slug === slug) ?? null,
  );
}
