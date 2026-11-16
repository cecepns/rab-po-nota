export const rupiah = (n) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n || 0);
export const today = () => new Date().toISOString().slice(0, 10);
export const fileUrl = (f) => (f ? `${import.meta.env.VITE_FILE_URL || "https://api.kingcreativestudio.my.id/rab-po-nota"}/uploads/${f}` : null);
export const cleanItemName = (name) => {
  if (!name || typeof name !== "string") return "";
  return name.replace(/^\[?[A-Z]{2,4}(?:\.\d{2,4})+\]?\s*[-–:]?\s*/i, "").trim();
};

