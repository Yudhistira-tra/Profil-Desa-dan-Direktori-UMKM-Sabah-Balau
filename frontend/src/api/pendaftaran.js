const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Sementara hanya simulasi. Setelah target submit diputuskan (backend /
// Google Apps Script), fungsi ini diganti fetch ke URL yang disepakati.
export async function submitPendaftaran(data) {
  await delay(800);
  console.log("Data pendaftaran:", data);
  return { data: { message: "Pendaftaran diterima." } };
}
