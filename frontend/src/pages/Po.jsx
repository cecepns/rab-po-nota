import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Receipt,
  Trash2,
  Download,
  CreditCard,
  Edit3,
  CheckCircle2,
  Clock,
  ChevronDown,
  ChevronUp,
  Package,
  Layers,
  FileText,
  X,
  Save,
  ArrowLeft,
} from "lucide-react";
import DataTable from "@/components/DataTable";
import Modal from "@/components/Modal";
import usePaged from "@/hooks/usePaged";
import { api } from "@/utils/api";
import { API_ENDPOINTS as E } from "@/utils/endpoints";
import { request } from "@/utils/request";
import { confirmToast } from "@/utils/confirm";
import { rupiah, today } from "@/utils/format";
import toast from "react-hot-toast";

// Opsi Sumber Bayar standar
const PAYMENT_METHODS = [
  "Transfer Bank (VA)",
  "Tunai / Cash",
  "Transfer Bank (BCA)",
  "Transfer Bank (Mandiri)",
  "Transfer Bank (BRI)",
  "Transfer Bank (BNI)",
];

// Opsi Kategori Bahan Pangan
const CATEGORIES = [
  "Karbohidrat",
  "Protein Hewani",
  "Protein Nabati",
  "Sayuran",
  "Bumbu & Minyak",
  "Susu & Olahan",
  "Buah-buahan",
  "Lainnya",
];

// Helper tebak kategori otomatis dari nama bahan
const guessCategory = (name = "") => {
  const n = name.toLowerCase();
  if (/beras|tepung|mie|bihun|kentang|ubi|singkong|roti|gandum/i.test(n))
    return "Karbohidrat";
  if (/daging|ayam|sapi|ikan|telur|bebek|udang|kambing|kornet/i.test(n))
    return "Protein Hewani";
  if (/tahu|tempe|kacang|oncom/i.test(n))
    return "Protein Nabati";
  if (/wortel|bayam|kangkung|kol|sawi|tomat|timun|sayur|buncis|labu|terong|selada/i.test(n))
    return "Sayuran";
  if (/minyak|gula|garam|bawang|cabai|cabe|kecap|saus|bumbu|kunyit|jahe|lengkuas|merica|lada/i.test(n))
    return "Bumbu & Minyak";
  if (/susu|keju|yogurt/i.test(n))
    return "Susu & Olahan";
  if (/buah|pisang|jeruk|apel|semangka|melon|mangga|pepaya/i.test(n))
    return "Buah-buahan";
  return "Lainnya";
};

export default function Po() {
  const paged = usePaged(E.PO.LIST);
  const nav = useNavigate();

  // State Modal Buat PO dari Import RAB
  const [openImportModal, setOpenImportModal] = useState(false);
  const [importForm, setImportForm] = useState({
    date: today(),
    payment_method: "Transfer Bank (VA)",
    notes: "",
  });
  const [importedItems, setImportedItems] = useState([]);
  const [loadingRab, setLoadingRab] = useState(false);
  const [savingPo, setSavingPo] = useState(false);
  const [showInvoiceDiff, setShowInvoiceDiff] = useState(false);

  // State Daftar Supplier untuk dropdown di form import
  const [suppliersList, setSuppliersList] = useState([]);

  // State Modal Edit PO
  const [openEditModal, setOpenEditModal] = useState(false);
  const [editingPo, setEditingPo] = useState(null);
  const [editForm, setEditForm] = useState({
    status: "unpaid",
    payment_method: "Transfer Bank (VA)",
    notes: "",
    date: today(),
  });
  const [savingEdit, setSavingEdit] = useState(false);

  // State View Detail Items PO
  const [expandedPoIds, setExpandedPoIds] = useState({});
  const [poItemsMap, setPoItemsMap] = useState({});
  const [loadingItemsId, setLoadingItemsId] = useState(null);

  // Muat daftar master supplier untuk dropdown
  useEffect(() => {
    api.get(E.SUPPLIERS.LIST + "?all=1&limit=100").then((res) => {
      if (res?.data?.data) {
        setSuppliersList(res.data.data);
      }
    });
  }, []);

  // Ambil Data RAB berdasarkan tanggal (Import RAB)
  const handleImportFromRab = async () => {
    if (!importForm.date) {
      toast.error("Pilih tanggal terlebih dahulu");
      return;
    }
    setLoadingRab(true);
    try {
      const res = await api.get(E.PO.RAB_PREVIEW(importForm.date));
      const items = res?.data?.data || res?.data || [];
      if (!items.length) {
        toast("Tidak ada item RAB yang belum masuk PO untuk tanggal ini", {
          icon: "ℹ️",
        });
        setImportedItems([]);
      } else {
        // Format item agar siap di-edit dan disimpan
        const formatted = items.map((it) => ({
          id: it.id,
          item_name: it.item_name,
          category: guessCategory(it.item_name),
          qty: +it.qty,
          unit: it.unit || "kg",
          price: +it.price,
          subtotal: +it.qty * +it.price,
          supplier_id: it.supplier_id || "",
          supplier_name: it.supplier_name || "",
          customer_name: it.customer_name || "",
          received_qty: "",
          invoice_price: "",
        }));
        setImportedItems(formatted);
        toast.success(`Berhasil menarik ${formatted.length} bahan dari RAB`);
      }
    } catch (err) {
      console.error(err);
      toast.error("Gagal mengambil data dari RAB");
    } finally {
      setLoadingRab(false);
    }
  };

  // Update per item di daftar import RAB
  const updateImportItem = (idx, key, value) => {
    setImportedItems((prev) => {
      const next = [...prev];
      const it = { ...next[idx], [key]: value };
      if (key === "qty" || key === "price") {
        it.subtotal = (+it.qty || 0) * (+it.price || 0);
      }
      next[idx] = it;
      return next;
    });
  };

  // Hapus item dari daftar import
  const removeImportItem = (idx) => {
    setImportedItems((prev) => prev.filter((_, i) => i !== idx));
  };

  // Simpan PO Sekaligus (Batch Create otomatis group by Supplier)
  const handleSaveBatchPo = async (e) => {
    e.preventDefault();
    if (!importedItems.length) {
      toast.error("Daftar bahan masih kosong. Klik 'Ambil dari RAB' terlebih dahulu.");
      return;
    }

    // Validasi bahwa semua item memiliki supplier
    const unassigned = importedItems.find((it) => !it.supplier_id);
    if (unassigned) {
      toast.error(`Item "${unassigned.item_name}" belum memilih toko/supplier.`);
      return;
    }

    setSavingPo(true);
    const res = await request(
      () =>
        api.post(E.PO.BATCH_CREATE, {
          date: importForm.date,
          payment_method: importForm.payment_method,
          notes: importForm.notes,
          items: importedItems,
        }),
      "PO berhasil dibuat langsung dari RAB!"
    );
    setSavingPo(false);

    if (res) {
      setOpenImportModal(false);
      setImportedItems([]);
      setImportForm({
        date: today(),
        payment_method: "Transfer Bank (VA)",
        notes: "",
      });
      paged.reload();
    }
  };

  // Toggle Status Bayar (Belum Dibayar <-> Sudah Dibayar)
  const togglePaymentStatus = async (po) => {
    const res = await request(
      () => api.post(E.PO.PAY(po.id)),
      po.status === "paid" ? "Status: Belum Dibayar" : "Status: Sudah Dibayar"
    );
    if (res) paged.reload();
  };

  // Buka Modal Edit PO
  const openEdit = (po) => {
    setEditingPo(po);
    setEditForm({
      status: po.status || "unpaid",
      payment_method: po.payment_method || "Transfer Bank (VA)",
      notes: po.notes || "",
      date: po.date ? po.date.slice(0, 10) : today(),
    });
    setOpenEditModal(true);
  };

  // Simpan Perubahan PO
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingPo) return;
    setSavingEdit(true);
    const res = await request(
      () => api.put(E.PO.DETAIL(editingPo.id), editForm),
      "Data PO berhasil diperbarui"
    );
    setSavingEdit(false);
    if (res) {
      setOpenEditModal(false);
      paged.reload();
    }
  };

  // Buat Nota dari PO
  const makeNota = async (po) => {
    const res = await request(() => api.post(E.NOTA.GENERATE, { po_id: po.id }), "Nota dibuat");
    if (res) {
      if (res.data?.id) nav(`/nota/${res.data.id}`);
      else paged.reload();
    }
  };

  // Hapus PO
  const remove = async (po) => {
    if (!(await confirmToast("Hapus PO ini? Item RAB terkait akan kembali ke status belum PO."))) return;
    if (await request(() => api.delete(E.PO.DETAIL(po.id)), "PO berhasil dihapus")) {
      paged.reload();
    }
  };

  // Expand / Collapse Items di PO
  const toggleExpand = async (poId) => {
    const isExpanded = !!expandedPoIds[poId];
    setExpandedPoIds((prev) => ({
      ...prev,
      [poId]: !isExpanded,
    }));

    if (!isExpanded && !poItemsMap[poId]) {
      setLoadingItemsId(poId);
      try {
        const res = await api.get(E.PO.ITEMS(poId));
        const items = res?.data?.data || res?.data || [];
        setPoItemsMap((prev) => ({ ...prev, [poId]: items }));
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingItemsId(null);
      }
    }
  };

  // Render Rincian Bahan & Catatan PO Langsung di Bawah Baris Tabel (Inline Sub-row)
  const renderInlineExpandedRow = (r) => {
    if (!expandedPoIds[r.id]) return null;

    const items = poItemsMap[r.id] || [];
    const isLoading = loadingItemsId === r.id;

    return (
      <div className="p-4 sm:p-5 bg-slate-50/70 border-l-4 border-l-teal-600 space-y-3.5">
        {/* Baris Ringkasan Catatan PO & Info Transaksi */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Kotak Catatan PO */}
          <div className="md:col-span-2 rounded-xl border border-amber-200/80 bg-amber-50/70 p-3 text-xs text-amber-950 flex items-start gap-2.5 shadow-2xs">
            <FileText size={16} className="text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1 space-y-1">
              <div className="font-bold text-[11px] uppercase tracking-wider text-amber-800 flex items-center justify-between">
                <span>Catatan PO</span>
                <span className="text-[10px] font-normal text-amber-700">Ref: {r.po_no}</span>
              </div>
              <p className="text-xs text-amber-950 font-medium whitespace-pre-wrap leading-relaxed">
                {r.notes && r.notes.trim() ? (
                  r.notes
                ) : (
                  <span className="text-amber-700/60 italic">Tidak ada catatan</span>
                )}
              </p>
            </div>
          </div>

          {/* Kotak Info Pembayaran & Supplier */}
          <div className="rounded-xl border border-slate-200 bg-white p-3 text-xs space-y-2 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Sumber Bayar:</span>
              <span className="font-bold text-slate-800 flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded">
                <CreditCard size={12} className="text-slate-500" />
                {r.payment_method || "Transfer Bank (VA)"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Supplier:</span>
              <span className="font-bold text-slate-900 uppercase text-[11px]">{r.supplier_name}</span>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-slate-100">
              <span className="text-slate-500">Total PO:</span>
              <span className="font-extrabold text-teal-800 text-sm">{rupiah(r.total)}</span>
            </div>
          </div>
        </div>

        {/* Tabel Bahan / Item PO */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700 px-0.5">
            <span className="flex items-center gap-1.5">
              <Package size={14} className="text-teal-600" />
              <span>Daftar Bahan / Rincian Belanja PO:</span>
            </span>
            {items.length > 0 && (
              <span className="text-[11px] text-slate-500 font-normal">
                {items.length} item bahan
              </span>
            )}
          </div>

          {isLoading ? (
            <div className="py-6 text-center text-xs text-slate-400 bg-white rounded-xl border border-slate-200">
              <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-teal-600 border-r-transparent mr-2 align-middle" />
              Memuat rincian bahan...
            </div>
          ) : items.length === 0 ? (
            <div className="py-4 text-center text-xs text-slate-400 bg-white rounded-xl border border-slate-200">
              Tidak ada rincian bahan untuk PO ini
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200/90 bg-white shadow-2xs">
              <table className="w-full text-xs text-slate-800 min-w-[550px]">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 text-left">
                    <th className="py-2.5 px-3.5 text-center w-10">No</th>
                    <th className="py-2.5 px-3.5">Nama Bahan</th>
                    <th className="py-2.5 px-3.5">Kategori</th>
                    <th className="py-2.5 px-3.5 text-center">Jumlah</th>
                    <th className="py-2.5 px-3.5 text-right">Harga Satuan</th>
                    <th className="py-2.5 px-3.5 text-right">Subtotal</th>
                    <th className="py-2.5 px-3.5">Pelanggan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((it, idx) => (
                    <tr key={it.id || idx} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-2.5 px-3.5 text-center text-slate-400 font-medium">
                        {idx + 1}
                      </td>
                      <td className="py-2.5 px-3.5 font-bold text-slate-900">
                        {it.item_name}
                      </td>
                      <td className="py-2.5 px-3.5">
                        <span className="inline-block rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                          {guessCategory(it.item_name)}
                        </span>
                      </td>
                      <td className="py-2.5 px-3.5 text-center font-bold text-slate-800">
                        {+it.qty} {it.unit || "kg"}
                      </td>
                      <td className="py-2.5 px-3.5 text-right text-slate-600">
                        {rupiah(it.price)}
                      </td>
                      <td className="py-2.5 px-3.5 text-right font-bold text-slate-900">
                        {rupiah(it.total)}
                      </td>
                      <td className="py-2.5 px-3.5 text-slate-600">
                        {it.customer_name ? (
                          <span className="font-semibold text-slate-700">{it.customer_name}</span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="border-t border-slate-200 bg-slate-50/70 font-bold text-slate-800">
                  <tr>
                    <td colSpan={5} className="py-2.5 px-3.5 text-right text-slate-600">
                      Total ({items.length} item):
                    </td>
                    <td className="py-2.5 px-3.5 text-right font-extrabold text-teal-800">
                      {rupiah(items.reduce((s, it) => s + (+it.total || 0), 0))}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Grand Total bahan yang di-import
  const importGrandTotal = importedItems.reduce((s, it) => s + (+it.subtotal || 0), 0);

  return (
    <div className="space-y-4">
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Purchase Order (PO)</h1>
          <p className="text-xs text-slate-500">
            Daftar pesanan ke supplier. Import langsung dari RAB tanpa perlu memilih satu-satu.
          </p>
        </div>
        <button
          className="btn-primary flex items-center justify-center gap-2 text-xs font-bold py-2.5 px-4 shadow-sm"
          onClick={() => {
            setOpenImportModal(true);
            if (!importedItems.length) handleImportFromRab();
          }}
        >
          <Plus size={16} /> Buat PO dari RAB
        </button>
      </div>

      {/* Tabel PO */}
      <DataTable
        paged={paged}
        renderExpandedRow={renderInlineExpandedRow}
        columns={[
          {
            key: "date",
            label: "Tanggal",
            render: (r) => {
              const isExpanded = !!expandedPoIds[r.id];
              return (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleExpand(r.id);
                    }}
                    className={`p-1 rounded-md transition ${
                      isExpanded
                        ? "text-teal-700 bg-teal-50"
                        : "text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                    }`}
                    title={isExpanded ? "Tutup rincian & catatan" : "Lihat rincian & catatan"}
                  >
                    {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                  </button>
                  <span
                    onClick={() => toggleExpand(r.id)}
                    className="font-semibold text-slate-800 cursor-pointer hover:text-teal-700"
                    title="Klik untuk buka/tutup rincian & catatan"
                  >
                    {r.date ? r.date.slice(0, 10) : "-"}
                  </span>
                </div>
              );
            },
          },
          {
            key: "po_no",
            label: "No. PO",
            render: (r) => (
              <div
                onClick={() => toggleExpand(r.id)}
                className="cursor-pointer group/pono"
                title="Klik untuk buka/tutup rincian & catatan"
              >
                <span className="font-bold text-slate-900 group-hover/pono:text-teal-700 transition">
                  {r.po_no}
                </span>
                {r.item_count ? (
                  <span className="block text-[11px] text-slate-500 font-medium">
                    {r.item_count} item bahan
                  </span>
                ) : null}
              </div>
            ),
          },
          {
            key: "supplier_name",
            label: "Supplier / Toko",
            render: (r) => (
              <div>
                <span className="font-bold text-slate-900 uppercase text-xs">
                  {r.supplier_name}
                </span>
                {r.payment_method && (
                  <span className="block text-[11px] text-slate-500">
                    {r.payment_method}
                  </span>
                )}
              </div>
            ),
          },
          {
            key: "total",
            label: "Total Nilai",
            render: (r) => (
              <span className="font-extrabold text-slate-900 text-sm">
                {rupiah(r.total)}
              </span>
            ),
          },
          {
            key: "status",
            label: "Status Bayar",
            render: (r) => {
              const isPaid = r.status === "paid" || r.status === "Lunas" || r.status === "Sudah Dibayar";
              return isPaid ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-200">
                  <CheckCircle2 size={12} /> Sudah Dibayar
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-700 border border-amber-200">
                  <Clock size={12} /> Belum Dibayar
                </span>
              );
            },
          },
          {
            key: "nota_id",
            label: "Status Nota",
            render: (r) =>
              r.nota_id ? (
                <span className="inline-flex items-center gap-1 rounded-md bg-teal-50 px-2 py-0.5 text-[11px] font-bold text-teal-700">
                  Ada Nota
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500">
                  Belum Nota
                </span>
              ),
          },
        ]}
        actions={(r) => {
          const isPaid = r.status === "paid" || r.status === "Lunas" || r.status === "Sudah Dibayar";
          return (
            <div className="flex items-center gap-1.5">
              {/* Tombol Bayar / Status */}
              <button
                type="button"
                onClick={() => togglePaymentStatus(r)}
                className={`btn-ghost !py-1 !px-2 text-xs font-bold flex items-center gap-1 ${
                  isPaid
                    ? "!text-slate-600 hover:!bg-slate-100"
                    : "!text-emerald-700 !bg-emerald-50 hover:!bg-emerald-100 !border-emerald-200"
                }`}
                title={isPaid ? "Ubah jadi Belum Dibayar" : "Tandai Sudah Dibayar"}
              >
                <CreditCard size={14} />
                <span>{isPaid ? "Batal Bayar" : "Bayar"}</span>
              </button>

              {/* Tombol Edit PO */}
              <button
                type="button"
                onClick={() => openEdit(r)}
                className="btn-ghost !p-1.5 text-slate-600 hover:text-slate-900"
                title="Edit PO"
              >
                <Edit3 size={15} />
              </button>

              {/* Tombol Buat Nota jika belum ada nota */}
              {!r.nota_id && (
                <button
                  type="button"
                  onClick={() => makeNota(r)}
                  className="btn-ghost !py-1 !px-2.5 text-xs font-bold !text-teal-700 hover:!bg-teal-50 !border-teal-200"
                  title="Buat Nota Toko dari PO ini"
                >
                  <Receipt size={14} /> Buat Nota
                </button>
              )}

              {/* Tombol Hapus PO */}
              <button
                type="button"
                onClick={() => remove(r)}
                className="btn-ghost !p-1.5 !text-rose-600 hover:!bg-rose-50"
                title="Hapus PO"
              >
                <Trash2 size={15} />
              </button>
            </div>
          );
        }}
      />

      {/* Modal 1: Buat PO Langsung Import dari RAB (Sesuai Gambar 1, 2, 4) */}
      <Modal
        open={openImportModal}
        title="Buat PO dari RAB (Import Otomatis)"
        maxWidth="max-w-4xl"
        onClose={() => setOpenImportModal(false)}
      >
        <form onSubmit={handleSaveBatchPo} className="space-y-4">
          {/* Card 1: Info Nota / Transaksi (Gambar 1) */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 space-y-3 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-slate-800 text-sm">
              <FileText size={16} className="text-teal-600" />
              <span>Info Nota / Transaksi</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Tanggal *</label>
                <input
                  type="date"
                  required
                  value={importForm.date}
                  onChange={(e) => setImportForm({ ...importForm, date: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 bg-white py-2 px-3 text-xs font-semibold focus:border-teal-600 outline-none shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Sumber Bayar *</label>
                <select
                  value={importForm.payment_method}
                  onChange={(e) => setImportForm({ ...importForm, payment_method: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 bg-white py-2 px-3 text-xs font-semibold focus:border-teal-600 outline-none shadow-2xs"
                >
                  {PAYMENT_METHODS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Catatan</label>
                <input
                  type="text"
                  placeholder="No. nota, keterangan, dll"
                  value={importForm.notes}
                  onChange={(e) => setImportForm({ ...importForm, notes: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 bg-white py-2 px-3 text-xs focus:border-teal-600 outline-none shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Import RAB</label>
                <button
                  type="button"
                  onClick={handleImportFromRab}
                  disabled={loadingRab}
                  className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-3 flex items-center justify-center gap-2 transition shadow-xs disabled:opacity-50"
                >
                  <Download size={14} />
                  <span>{loadingRab ? "Menarik data..." : "Ambil dari RAB"}</span>
                </button>
              </div>
            </div>

            {/* Toggle Info Invoice Supplier */}
            <div className="pt-2 border-t border-slate-200/70 flex items-center justify-between text-xs">
              <span className="text-slate-500 italic">
                Info Invoice Supplier (opsional - isi jika harga invoice berbeda dari PO)
              </span>
              <button
                type="button"
                onClick={() => setShowInvoiceDiff(!showInvoiceDiff)}
                className="text-xs font-bold text-teal-700 hover:text-teal-900 transition"
              >
                {showInvoiceDiff ? "- Sembunyikan Selisih" : "+ Ada Selisih Invoice"}
              </button>
            </div>
          </div>

          {/* Card 2: Daftar Bahan dari RAB (Gambar 2 & Gambar 4) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold text-slate-800 text-sm">
                <Layers size={16} className="text-teal-600" />
                <span>Daftar Bahan dari RAB</span>
              </div>
              {importedItems.length > 0 && (
                <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                  {importedItems.length} bahan terambil
                </span>
              )}
            </div>

            {/* Empty State */}
            {importedItems.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 py-12 px-4 text-center text-slate-400 space-y-2">
                <div className="flex justify-center text-slate-300">
                  <Download size={36} />
                </div>
                <p className="text-xs font-medium">
                  Klik tombol <b>"Ambil dari RAB"</b> di atas untuk mengisi daftar bahan secara otomatis.
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
                {importedItems.map((it, idx) => (
                  <div
                    key={it.id || idx}
                    className="relative rounded-2xl border border-slate-200 bg-white p-3.5 shadow-2xs space-y-2.5 text-xs hover:border-slate-300 transition"
                  >
                    {/* Tombol Hapus item dari daftar */}
                    <button
                      type="button"
                      onClick={() => removeImportItem(idx)}
                      className="absolute top-2.5 right-2.5 h-6 w-6 rounded-full bg-rose-50 text-rose-500 hover:bg-rose-100 flex items-center justify-center transition"
                      title="Keluarkan bahan ini dari PO"
                    >
                      <X size={13} />
                    </button>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pr-6">
                      {/* Kolom Kiri: Kategori & Jumlah */}
                      <div className="space-y-2">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 mb-0.5">
                            Kategori *
                          </label>
                          <select
                            value={it.category}
                            onChange={(e) => updateImportItem(idx, "category", e.target.value)}
                            className="w-full rounded-lg border border-slate-200 bg-white py-1.5 px-2.5 text-xs font-semibold focus:border-teal-600 outline-none"
                          >
                            {CATEGORIES.map((c) => (
                              <option key={c} value={c}>
                                {c}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 mb-0.5">
                            Jumlah *
                          </label>
                          <div className="flex items-center gap-1.5">
                            <input
                              type="number"
                              step="any"
                              required
                              value={it.qty}
                              onChange={(e) => updateImportItem(idx, "qty", e.target.value)}
                              className="w-full rounded-lg border border-slate-200 bg-white py-1.5 px-2.5 text-xs font-bold text-slate-900 focus:border-teal-600 outline-none"
                            />
                            <span className="rounded-lg bg-slate-100 px-2 py-1.5 text-xs font-bold text-slate-600 border border-slate-200">
                              {it.unit || "kg"}
                            </span>
                          </div>
                        </div>

                        {showInvoiceDiff && (
                          <div>
                            <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                              Jumlah Diterima (jika beda)
                            </label>
                            <input
                              type="number"
                              step="any"
                              placeholder="kosong = sesuai PO"
                              value={it.received_qty}
                              onChange={(e) => updateImportItem(idx, "received_qty", e.target.value)}
                              className="w-full rounded-lg border border-amber-200 bg-amber-50/40 py-1.5 px-2.5 text-xs focus:border-amber-500 outline-none"
                            />
                          </div>
                        )}
                      </div>

                      {/* Kolom Kanan: Nama Bahan & Harga */}
                      <div className="space-y-2">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 mb-0.5">
                            Nama Bahan *
                          </label>
                          <input
                            type="text"
                            required
                            value={it.item_name}
                            onChange={(e) => updateImportItem(idx, "item_name", e.target.value)}
                            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 px-2.5 text-xs font-bold text-slate-900 focus:border-teal-600 outline-none"
                          />
                        </div>

                        <div>
                          <div className="flex justify-between items-center mb-0.5">
                            <label className="text-[11px] font-bold text-slate-600">
                              Harga RAB/PO *
                            </label>
                            <span className="text-[11px] font-black text-slate-900">
                              Subtotal: {rupiah(it.subtotal)}
                            </span>
                          </div>
                          <input
                            type="number"
                            step="any"
                            required
                            value={it.price}
                            onChange={(e) => updateImportItem(idx, "price", e.target.value)}
                            className="w-full rounded-lg border border-slate-200 bg-white py-1.5 px-2.5 text-xs font-bold text-slate-900 text-right focus:border-teal-600 outline-none"
                          />
                        </div>

                        {showInvoiceDiff && (
                          <div>
                            <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                              Harga Invoice (jika beda)
                            </label>
                            <input
                              type="number"
                              step="any"
                              placeholder="0 = sama dengan RAB"
                              value={it.invoice_price}
                              onChange={(e) => updateImportItem(idx, "invoice_price", e.target.value)}
                              className="w-full rounded-lg border border-amber-200 bg-amber-50/40 py-1.5 px-2.5 text-xs focus:border-amber-500 outline-none"
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Baris Bawah: Pemilihan Toko / Supplier */}
                    <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-1">
                        <label className="text-[11px] font-bold text-slate-700 shrink-0">
                          Supplier / Toko:
                        </label>
                        <select
                          required
                          value={it.supplier_id}
                          onChange={(e) => updateImportItem(idx, "supplier_id", e.target.value)}
                          className="w-full rounded-lg border border-slate-300 bg-white py-1 px-2 text-xs font-bold text-slate-800 uppercase focus:border-teal-600 outline-none"
                        >
                          <option value="">-- Pilih Toko Supplier --</option>
                          {suppliersList.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {it.customer_name && (
                        <span className="text-[11px] text-slate-500 shrink-0 font-medium">
                          Pelanggan: <b className="text-slate-700">{it.customer_name}</b>
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Grand Total & Footer Buttons (Gambar 4) */}
          <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="text-xs">
              <span className="text-slate-500 font-medium">Grand Total PO: </span>
              <span className="text-base sm:text-lg font-black text-slate-900">
                {rupiah(importGrandTotal)}
              </span>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                className="btn-ghost text-xs py-2 px-3.5"
                onClick={() => setOpenImportModal(false)}
              >
                <ArrowLeft size={14} /> Kembali
              </button>
              <button
                type="submit"
                disabled={savingPo || importedItems.length === 0}
                className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-5 text-xs flex items-center gap-1.5 transition shadow-sm disabled:opacity-50"
              >
                <Save size={15} />
                <span>{savingPo ? "Menyimpan..." : "Simpan PO"}</span>
              </button>
            </div>
          </div>
        </form>
      </Modal>

      {/* Modal 2: Edit PO (Status Bayar, Sumber Bayar, Catatan, Tanggal) */}
      <Modal
        open={openEditModal}
        title={`Edit PO ${editingPo?.po_no || ""}`}
        maxWidth="max-w-md"
        onClose={() => setOpenEditModal(false)}
      >
        <form onSubmit={handleSaveEdit} className="space-y-3.5 text-xs">
          <div>
            <label className="block text-slate-700 font-bold mb-1">Supplier / Toko</label>
            <input
              type="text"
              readOnly
              value={editingPo?.supplier_name || ""}
              className="w-full rounded-xl border border-slate-200 bg-slate-100 py-2 px-3 text-xs font-bold text-slate-700 uppercase outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Tanggal PO</label>
            <input
              type="date"
              required
              value={editForm.date}
              onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
              className="w-full rounded-xl border border-slate-300 bg-white py-2 px-3 text-xs font-semibold focus:border-teal-600 outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Status Pembayaran</label>
            <select
              value={editForm.status}
              onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
              className="w-full rounded-xl border border-slate-300 bg-white py-2 px-3 text-xs font-bold focus:border-teal-600 outline-none"
            >
              <option value="unpaid">Belum Dibayar</option>
              <option value="paid">Sudah Dibayar / Lunas</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Sumber Bayar</label>
            <select
              value={editForm.payment_method}
              onChange={(e) => setEditForm({ ...editForm, payment_method: e.target.value })}
              className="w-full rounded-xl border border-slate-300 bg-white py-2 px-3 text-xs font-semibold focus:border-teal-600 outline-none"
            >
              {PAYMENT_METHODS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Catatan</label>
            <textarea
              rows={2}
              placeholder="No. nota, keterangan, dll"
              value={editForm.notes}
              onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
              className="w-full rounded-xl border border-slate-300 bg-white py-2 px-3 text-xs focus:border-teal-600 outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              className="btn-ghost text-xs py-2 px-3"
              onClick={() => setOpenEditModal(false)}
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={savingEdit}
              className="btn-primary text-xs py-2 px-4 font-bold"
            >
              {savingEdit ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
