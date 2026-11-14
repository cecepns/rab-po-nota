import toast from "react-hot-toast";

// Jalankan request, tampilkan toast sukses/error. Return response body atau null jika gagal.
export async function request(fn, successMsg) {
  try {
    const { data } = await fn();
    if (successMsg) toast.success(successMsg);
    return data;
  } catch (e) {
    toast.error(e.response?.data?.message || "Terjadi kesalahan, coba lagi");
    return null;
  }
}
