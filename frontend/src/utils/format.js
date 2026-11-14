export const rupiah = (n) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n || 0);
export const today = () => new Date().toISOString().slice(0, 10);
export const fileUrl = (f) => (f ? `${import.meta.env.VITE_FILE_URL || "https://api.kingcreativestudio.my.id/rab-po-nota"}/uploads/${f}` : null);
