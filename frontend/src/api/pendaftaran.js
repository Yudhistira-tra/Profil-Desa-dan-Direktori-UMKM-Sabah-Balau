import { request, denganCadangan } from "./http.js";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// POST /api/umkm (multipart/form-data) sesuai kontrak. Pendaftaran disimpan
// berstatus "pending" dan baru tampil di direktori setelah disetujui admin.
export async function submitPendaftaran(data) {
  const body = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (key === "photos" || value === null || value === undefined) return;
    body.append(key, String(value));
  });
  (data.photos ?? []).forEach((file) => body.append("photos", file));

  return denganCadangan(
    async () => ({ data: await request("/umkm", { method: "POST", body, timeoutMs: 60000 }) }),
    // Backend tidak aktif (development): hanya simulasi, data TIDAK tersimpan.
    async () => {
      await delay(800);
      console.log("Data pendaftaran (simulasi, tidak tersimpan):", [...body.entries()]);
      return { data: { message: "Pendaftaran diterima." } };
    },
  );
}
