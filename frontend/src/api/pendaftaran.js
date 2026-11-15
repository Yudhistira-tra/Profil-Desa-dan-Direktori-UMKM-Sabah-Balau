const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Sementara hanya simulasi. Request sudah disusun sebagai FormData
// (multipart) sesuai kontrak POST /api/umkm, jadi tinggal diganti fetch
// ke endpoint backend yang disepakati.
export async function submitPendaftaran(data) {
  await delay(800);

  const body = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (key === "photos" || value === null || value === undefined) return;
    body.append(key, String(value));
  });
  (data.photos ?? []).forEach((file) => body.append("photos", file));

  console.log("Data pendaftaran:", [...body.entries()]);
  return { data: { message: "Pendaftaran diterima." } };
}
