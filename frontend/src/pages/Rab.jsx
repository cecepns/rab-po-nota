import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import {
  Plus,
  Trash2,
  Edit2,
  Calendar,
  Users,
  Store,
  Layers,
  CheckCircle2,
  ShoppingBag,
  Sparkles,
  Search,
  Copy,
  FileSpreadsheet,
  Printer,
  RotateCcw,
  Download,
} from "lucide-react";
import AsyncCreatableSelect from "react-select/async-creatable";
import AsyncSelect from "react-select/async";
import DataTable from "@/components/DataTable";
import Modal from "@/components/Modal";
import Field from "@/components/Field";
import usePaged from "@/hooks/usePaged";
import { api } from "@/utils/api";
import { API_ENDPOINTS as E } from "@/utils/endpoints";
import { request } from "@/utils/request";
import { confirmToast } from "@/utils/confirm";
import { rupiah, today } from "@/utils/format";

const creatableSelectStyles = {
  control: (base, state) => ({
    ...base,
    borderRadius: "0.75rem",
    borderColor: state.isFocused ? "#0f766e" : "#e2e8f0",
    boxShadow: state.isFocused ? "0 0 0 3px rgba(15, 118, 110, 0.15)" : "none",
    "&:hover": {
      borderColor: state.isFocused ? "#0f766e" : "#cbd5e1",
    },
    padding: "0px 2px",
    backgroundColor: "#ffffff",
    fontSize: "0.875rem",
    minHeight: "38px",
  }),
  menuPortal: (base) => ({ ...base, zIndex: 99999 }),
  menu: (base) => ({
    ...base,
    borderRadius: "0.75rem",
    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.15)",
    border: "1px solid #f1f5f9",
    zIndex: 99999,
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected
      ? "#0f766e"
      : state.isFocused
        ? "#f0fdfa"
        : "#ffffff",
    color: state.isSelected ? "#ffffff" : "#1e293b",
    fontSize: "0.875rem",
    cursor: "pointer",
    padding: "8px 12px",
  }),
  placeholder: (base) => ({
    ...base,
    color: "#94a3b8",
    fontSize: "0.875rem",
  }),
  singleValue: (base) => ({
    ...base,
    color: "#0f172a",
    fontWeight: 600,
    fontSize: "0.875rem",
  }),
  multiValue: (base) => ({
    ...base,
    backgroundColor: "#ccfbf1",
    borderRadius: "0.5rem",
    padding: "1px 4px",
  }),
  multiValueLabel: (base) => ({
    ...base,
    color: "#0f766e",
    fontWeight: 700,
    fontSize: "0.75rem",
  }),
  multiValueRemove: (base) => ({
    ...base,
    color: "#0f766e",
    borderRadius: "0.375rem",
    "&:hover": {
      backgroundColor: "#0f766e",
      color: "#ffffff",
    },
  }),
};

export default function Rab() {
  // Filter Rentang Waktu (Bisa difilter dari - sampai)
  const [dateRange, setDateRange] = useState({
    from: today().slice(0, 8) + "01", // Awal bulan ini
    to: today(), // Hari ini
  });
  const [activePreset, setActivePreset] = useState("month");

  // Query params reaktif untuk usePaged
  const queryParams = useMemo(() => {
    const p = {};
    if (dateRange.from) p.from = dateRange.from;
    if (dateRange.to) p.to = dateRange.to;
    return p;
  }, [dateRange]);

  const paged = usePaged(E.RAB.LIST, queryParams);
  const [exportingExcel, setExportingExcel] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);
  const [suppliers, setSuppliers] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [materialOptions, setMaterialOptions] = useState([]);

  // State Modal Multi-Input (Batch)
  const [batchOpen, setBatchOpen] = useState(false);
  const [batchHeader, setBatchHeader] = useState({
    date: today(),
  });
  const [batchItems, setBatchItems] = useState([
    {
      customer_id: "",
      item_name: "",
      supplier_id: "",
      qty: 1,
      unit: "kg",
      price: 0,
    },
  ]);
  const [savingBatch, setSavingBatch] = useState(false);

  // State Modal Single Edit
  const [editModal, setEditModal] = useState(null); // null | row
  const [editForm, setEditForm] = useState({});
  const [savingEdit, setSavingEdit] = useState(false);

  // Muat opsi Master Bahan Baku dari API
  const fetchMaterials = useCallback(async () => {
    try {
      const res = await api.get(E.MATERIALS.LIST, { params: { limit: 100 } });
      const items = res.data?.data || [];
      const opts = items.map((m) => ({
        value: m.name,
        label: m.code ? `[${m.code}] ${m.name}` : m.name,
        data: m,
      }));
      setMaterialOptions(opts);
      return opts;
    } catch {
      return [];
    }
  }, []);

  // Muat opsi Master Supplier & Customer untuk form
  useEffect(() => {
    api
      .get(E.SUPPLIERS.LIST, { params: { limit: 100 } })
      .then((r) => setSuppliers(r.data?.data || []))
      .catch(() => { });

    api
      .get(E.CUSTOMERS.LIST, { params: { limit: 100 } })
      .then((r) => setCustomers(r.data?.data || []))
      .catch(() => { });

    fetchMaterials();
  }, [fetchMaterials]);

  // Search bahan baku dari master data / riwayat untuk CreatableSelect
  const searchTimerRef = useRef(null);
  const loadMaterialOptions = useCallback(
    (inputValue, callback) => {
      if (!inputValue || !inputValue.trim()) {
        callback(materialOptions);
        return;
      }

      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
      searchTimerRef.current = setTimeout(async () => {
        try {
          const res = await api.get(E.MATERIALS.LIST, {
            params: { search: inputValue.trim(), limit: 50 },
          });
          const items = res.data?.data || [];
          callback(
            items.map((m) => ({
              value: m.name,
              label: m.code ? `[${m.code}] ${m.name}` : m.name,
              data: m,
            }))
          );
        } catch {
          callback([]);
        }
      }, 250);
    },
    [materialOptions]
  );

  // Handler buat bahan baku baru langsung dari dropdown
  const handleCreateMaterial = (idx, inputValue) => {
    const trimmed = (inputValue || "").trim();
    if (!trimmed) return;
    const newOpt = {
      value: trimmed,
      label: trimmed,
      __isNew__: true,
    };
    setMaterialOptions((prev) => {
      if (prev.some((o) => o.value.toLowerCase() === trimmed.toLowerCase())) return prev;
      return [newOpt, ...prev];
    });
    handleMaterialSelect(idx, newOpt);
  };

  // Search customer untuk AsyncSelect Pelanggan / SPPG
  const customerTimerRef = useRef(null);
  const loadCustomerOptions = useCallback((inputValue, callback) => {
    if (customerTimerRef.current) clearTimeout(customerTimerRef.current);

    if (!inputValue || !inputValue.trim()) {
      api
        .get(E.CUSTOMERS.LIST, { params: { limit: 50 } })
        .then((res) => {
          const items = res.data?.data || [];
          callback(items.map((c) => ({ value: c.id, label: c.name, data: c })));
        })
        .catch(() => callback([]));
      return;
    }

    customerTimerRef.current = setTimeout(async () => {
      try {
        const res = await api.get(E.CUSTOMERS.LIST, {
          params: { search: inputValue.trim(), limit: 50 },
        });
        const items = res.data?.data || [];
        callback(items.map((c) => ({ value: c.id, label: c.name, data: c })));
      } catch {
        callback([]);
      }
    }, 250);
  }, []);

  // Search supplier untuk AsyncSelect Toko / Supplier
  const supplierTimerRef = useRef(null);
  const loadSupplierOptions = useCallback((inputValue, callback) => {
    if (supplierTimerRef.current) clearTimeout(supplierTimerRef.current);

    if (!inputValue || !inputValue.trim()) {
      api
        .get(E.SUPPLIERS.LIST, { params: { limit: 50 } })
        .then((res) => {
          const items = res.data?.data || [];
          callback(items.map((s) => ({ value: s.id, label: s.name, data: s })));
        })
        .catch(() => callback([]));
      return;
    }

    supplierTimerRef.current = setTimeout(async () => {
      try {
        const res = await api.get(E.SUPPLIERS.LIST, {
          params: { search: inputValue.trim(), limit: 50 },
        });
        const items = res.data?.data || [];
        callback(items.map((s) => ({ value: s.id, label: s.name, data: s })));
      } catch {
        callback([]);
      }
    }, 250);
  }, []);

  // Buka Modal Multi-Input baru (refresh master bahan baku)
  const openBatchModal = async () => {
    fetchMaterials();

    let currCust = customers;
    if (!currCust.length) {
      try {
        const res = await api.get(E.CUSTOMERS.LIST, { params: { limit: 100 } });
        currCust = res.data?.data || [];
        setCustomers(currCust);
      } catch { }
    }
    let currSupp = suppliers;
    if (!currSupp.length) {
      try {
        const res = await api.get(E.SUPPLIERS.LIST, { params: { limit: 100 } });
        currSupp = res.data?.data || [];
        setSuppliers(currSupp);
      } catch { }
    }

    setBatchHeader({
      date: today(),
    });
    setBatchItems([
      {
        customer_id: "",
        item_name: "",
        supplier_id: currSupp[0]?.id || "",
        qty: 1,
        unit: "kg",
        price: 0,
      },
    ]);
    setBatchOpen(true);
  };

  // Tambah baris item baru di batch (otomatis mewarisi pelanggan & supplier baris sebelumnya)
  const addBatchRow = () => {
    const lastRow = batchItems[batchItems.length - 1];
    setBatchItems((prev) => [
      ...prev,
      {
        customer_id: lastRow?.customer_id || "",
        item_name: "",
        supplier_id: lastRow?.supplier_id || suppliers[0]?.id || "",
        qty: 1,
        unit: "kg",
        price: 0,
      },
    ]);
  };

  // Salin/Duplikasi baris item
  const duplicateBatchRow = (idx) => {
    const row = batchItems[idx];
    if (!row) return;
    setBatchItems((prev) => {
      const next = [...prev];
      next.splice(idx + 1, 0, { ...row });
      return next;
    });
  };

  // Hapus baris item di batch
  const removeBatchRow = (idx) => {
    setBatchItems((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((_, i) => i !== idx);
    });
  };

  // Ubah nilai field pada baris item tertentu
  const updateBatchRow = (idx, field, value) => {
    setBatchItems((prev) =>
      prev.map((row, i) => {
        if (i !== idx) return row;
        return { ...row, [field]: value };
      })
    );
  };

  // Handler saat memilih atau membuat bahan baku di CreatableSelect
  const handleMaterialSelect = (idx, opt) => {
    if (!opt) {
      updateBatchRow(idx, "item_name", "");
      return;
    }

    const materialData = opt.data;
    const defaultSuppId = materialData?.default_supplier_id;

    if (defaultSuppId && materialData?.default_supplier_name) {
      setSuppliers((prev) => {
        if (prev.some((s) => s.id === defaultSuppId)) return prev;
        return [...prev, { id: defaultSuppId, name: materialData.default_supplier_name }];
      });
    }

    setBatchItems((prev) =>
      prev.map((row, i) => {
        if (i !== idx) return row;
        return {
          ...row,
          item_name: opt.label || opt.value,
          unit: materialData?.unit || row.unit || "kg",
          price:
            materialData?.price != null && materialData.price > 0
              ? materialData.price
              : row.price,
          supplier_id:
            defaultSuppId || row.supplier_id || suppliers[0]?.id || "",
        };
      })
    );
  };

  // Simpan Batch RAB
  const submitBatch = async (e) => {
    e.preventDefault();

    const invalid = batchItems.find(
      (it) =>
        !it.customer_id ||
        !it.item_name ||
        !it.supplier_id ||
        !it.qty ||
        it.qty <= 0
    );
    if (invalid) {
      alert("Pastikan Pelanggan, Nama Bahan, Supplier, dan Qty terisi dengan benar di setiap baris.");
      return;
    }

    setSavingBatch(true);
    const res = await request(
      () =>
        api.post(E.RAB.BATCH, {
          date: batchHeader.date,
          items: batchItems,
        }),
      `Berhasil menyimpan ${batchItems.length} item RAB!`
    );
    setSavingBatch(false);

    if (res) {
      setBatchOpen(false);
      paged.reload();
    }
  };

  // Handler Single Edit
  const openEdit = (row) => {
    setEditModal(row);
    setEditForm({
      date: row.date,
      customer_id: row.customer_id,
      supplier_id: row.supplier_id,
      item_name: row.item_name,
      qty: row.qty,
      unit: row.unit || "",
      price: row.price,
    });
  };

  const submitEdit = async (e) => {
    e.preventDefault();
    setSavingEdit(true);
    const res = await request(
      () => api.put(E.RAB.DETAIL(editModal.id), editForm),
      "Item RAB berhasil diperbarui"
    );
    setSavingEdit(false);
    if (res) {
      setEditModal(null);
      paged.reload();
    }
  };

  // Handler Hapus Single Row
  const removeRow = async (row) => {
    if (row.po_no) {
      alert(`Item ini sudah masuk ke ${row.po_no}. Hapus PO terlebih dahulu jika ingin menghapus item ini.`);
      return;
    }
    if (!(await confirmToast(`Hapus bahan "${row.item_name}" dari RAB?`))) return;
    if (await request(() => api.delete(E.RAB.DETAIL(row.id)), "Item dihapus")) {
      paged.reload();
    }
  };

  // Grand Total perhitungan di batch modal
  const batchGrandTotal = batchItems.reduce(
    (sum, it) => sum + (parseFloat(it.qty) || 0) * (parseFloat(it.price) || 0),
    0
  );

  const customerOptions = useMemo(
    () =>
      customers.map((c) => ({
        value: c.id,
        label: c.name,
        data: c,
      })),
    [customers]
  );
  const supplierOptions = useMemo(
    () =>
      suppliers.map((s) => ({
        value: s.id,
        label: s.name,
        data: s,
      })),
    [suppliers]
  );

  // Preset Periode
  const applyPreset = (type) => {
    setActivePreset(type);
    const cur = today();
    if (type === "today") {
      setDateRange({ from: cur, to: cur });
    } else if (type === "7days") {
      const d = new Date();
      d.setDate(d.getDate() - 7);
      setDateRange({ from: d.toISOString().slice(0, 10), to: cur });
    } else if (type === "month") {
      setDateRange({ from: cur.slice(0, 8) + "01", to: cur });
    } else if (type === "lastmonth") {
      const d = new Date();
      d.setMonth(d.getMonth() - 1);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const lastDay = new Date(y, d.getMonth() + 1, 0).getDate();
      setDateRange({ from: `${y}-${m}-01`, to: `${y}-${m}-${lastDay}` });
    } else if (type === "all") {
      setDateRange({ from: "", to: "" });
    }
  };

  // Export Excel (.xls dengan styling & total)
  const handleExportExcel = async () => {
    try {
      setExportingExcel(true);
      const res = await api.get(E.RAB.LIST, {
        params: {
          from: dateRange.from || undefined,
          to: dateRange.to || undefined,
          search: paged.search || undefined,
          all: 1,
        },
      });
      const data = res.data?.data || [];
      if (!data.length) {
        alert("Tidak ada data RAB pada rentang waktu ini untuk diekspor.");
        return;
      }

      const grandTotal = data.reduce((s, r) => s + (parseFloat(r.total) || 0), 0);
      const periodText =
        dateRange.from && dateRange.to
          ? `${dateRange.from} s/d ${dateRange.to}`
          : dateRange.from
          ? `Mulai ${dateRange.from}`
          : dateRange.to
          ? `Hingga ${dateRange.to}`
          : "Semua Waktu";

      const tableHtml = `
        <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
        <head>
          <meta http-equiv="content-type" content="application/vnd.ms-excel; charset=UTF-8">
          <style>
            table { border-collapse: collapse; width: 100%; font-family: Arial, sans-serif; font-size: 11pt; }
            th { background-color: #0f766e; color: #ffffff; font-weight: bold; border: 1px solid #0b5852; padding: 8px; text-align: left; }
            td { border: 1px solid #d1d5db; padding: 6px 8px; vertical-align: middle; }
            .num { text-align: right; mso-number-format: "#,##0"; }
            .center { text-align: center; }
            .bold { font-weight: bold; }
            .total-row { background-color: #f0fdfa; font-weight: bold; color: #0f766e; border-top: 2px solid #0f766e; }
            .header-title { font-size: 15pt; font-weight: bold; color: #111827; }
            .header-sub { font-size: 10pt; color: #4b5563; }
          </style>
        </head>
        <body>
          <table>
            <tr><td colspan="10" class="header-title">RENCANA ANGGARAN BIAYA (RAB) HARIAN</td></tr>
            <tr><td colspan="10" class="header-sub">Periode: ${periodText} | Dicetak: ${new Date().toLocaleString("id-ID")}</td></tr>
            <tr><td colspan="10"></td></tr>
            <thead>
              <tr>
                <th class="center" style="width: 40px;">No</th>
                <th class="center" style="width: 100px;">Tanggal</th>
                <th style="width: 180px;">Pelanggan / SPPG</th>
                <th style="width: 220px;">Uraian / Nama Bahan</th>
                <th style="width: 180px;">Toko / Supplier</th>
                <th class="center" style="width: 70px;">Satuan</th>
                <th class="num" style="width: 80px;">Qty</th>
                <th class="num" style="width: 120px;">Harga Satuan (Rp)</th>
                <th class="num" style="width: 130px;">Jumlah (Rp)</th>
                <th class="center" style="width: 110px;">Status PO</th>
              </tr>
            </thead>
            <tbody>
              ${data
                .map(
                  (r, i) => `
                <tr>
                  <td class="center">${i + 1}</td>
                  <td class="center">${r.date || "-"}</td>
                  <td>${r.customer_name || "-"}</td>
                  <td class="bold">${r.item_name || "-"}</td>
                  <td>${r.supplier_name || "-"}</td>
                  <td class="center">${r.unit || "-"}</td>
                  <td class="num">${r.qty || 0}</td>
                  <td class="num">${r.price || 0}</td>
                  <td class="num bold">${r.total || 0}</td>
                  <td class="center">${r.po_no ? "PO: " + r.po_no : "Belum PO"}</td>
                </tr>`
                )
                .join("")}
            </tbody>
            <tfoot>
              <tr class="total-row">
                <td colspan="8" class="bold" style="text-align: right; padding: 10px;">TOTAL NILAI RAB:</td>
                <td class="num bold" style="padding: 10px;">${grandTotal}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </body>
        </html>
      `;

      const blob = new Blob(["\uFEFF" + tableHtml], {
        type: "application/vnd.ms-excel;charset=utf-8",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const fName = `RAB_${dateRange.from || "semua"}_sd_${dateRange.to || "semua"}.xls`;
      link.download = fName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch {
      alert("Gagal mengekspor data Excel. Silakan coba beberapa saat lagi.");
    } finally {
      setExportingExcel(false);
    }
  };

  // Export PDF / Cetak Format Resmi
  const handleExportPDF = async () => {
    try {
      setExportingPdf(true);
      const res = await api.get(E.RAB.LIST, {
        params: {
          from: dateRange.from || undefined,
          to: dateRange.to || undefined,
          search: paged.search || undefined,
          all: 1,
        },
      });
      const data = res.data?.data || [];
      if (!data.length) {
        alert("Tidak ada data RAB pada rentang waktu ini untuk dicetak/diekspor.");
        return;
      }

      const grandTotal = data.reduce((s, r) => s + (parseFloat(r.total) || 0), 0);
      const periodText =
        dateRange.from && dateRange.to
          ? `${dateRange.from} s/d ${dateRange.to}`
          : dateRange.from
          ? `Mulai ${dateRange.from}`
          : dateRange.to
          ? `Hingga ${dateRange.to}`
          : "Semua Waktu";

      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        alert("Pop-up browser terblokir. Izinkan pop-up untuk mencetak / simpan PDF.");
        return;
      }

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Laporan RAB - ${periodText}</title>
          <style>
            @page { size: A4 landscape; margin: 12mm 15mm; }
            * { box-sizing: border-box; }
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; color: #1e293b; margin: 0; padding: 15px; font-size: 11px; }
            .header { border-bottom: 2px solid #0f766e; padding-bottom: 12px; margin-bottom: 15px; display: flex; justify-content: space-between; align-items: flex-start; }
            .title { font-size: 18px; font-weight: 900; color: #0f766e; letter-spacing: -0.5px; margin: 0 0 4px 0; }
            .subtitle { font-size: 11px; color: #64748b; margin: 0; }
            .meta { text-align: right; font-size: 11px; color: #475569; }
            .meta b { color: #0f766e; }
            .summary-box { background: #f0fdfa; border: 1px solid #ccfbf1; border-radius: 8px; padding: 10px 14px; margin-bottom: 15px; display: flex; justify-content: space-between; align-items: center; }
            .summary-item { font-size: 11px; }
            .summary-item b { font-size: 14px; color: #0f766e; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 10px; }
            th { background: #0f766e; color: #ffffff; font-weight: 700; text-transform: uppercase; font-size: 9px; letter-spacing: 0.5px; padding: 7px 6px; border: 1px solid #0f766e; }
            td { padding: 6px; border: 1px solid #e2e8f0; vertical-align: middle; }
            tr:nth-child(even) { background-color: #f8fafc; }
            .text-center { text-align: center; }
            .text-right { text-align: right; }
            .font-bold { font-weight: 700; }
            .badge-po { display: inline-block; padding: 2px 6px; border-radius: 4px; font-size: 9px; font-weight: 600; background: #e0f2fe; color: #0369a1; }
            .badge-no-po { display: inline-block; padding: 2px 6px; border-radius: 4px; font-size: 9px; font-weight: 600; background: #fef3c7; color: #92400e; }
            .signatures { display: flex; justify-content: space-between; margin-top: 30px; page-break-inside: avoid; }
            .sign-box { text-align: center; width: 200px; font-size: 11px; }
            .sign-space { height: 60px; }
            @media print {
              body { padding: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h1 class="title">RENCANA ANGGARAN BIAYA (RAB) HARIAN</h1>
              <p class="subtitle">Sistem Pengadaan &bull; Rekapitulasi Kebutuhan Belanja Harian</p>
            </div>
            <div class="meta">
              <div>Periode: <b>${periodText}</b></div>
              <div>Tanggal Cetak: <b>${new Date().toLocaleDateString("id-ID", { dateStyle: "long" })}</b></div>
            </div>
          </div>

          <div class="summary-box">
            <div class="summary-item">Total Item: <b>${data.length} Baris Bahan</b></div>
            <div class="summary-item">Total Nilai Anggaran: <b>${rupiah(grandTotal)}</b></div>
          </div>

          <table>
            <thead>
              <tr>
                <th class="text-center" style="width: 25px;">No</th>
                <th class="text-center" style="width: 70px;">Tanggal</th>
                <th style="width: 140px;">Pelanggan / SPPG</th>
                <th>Uraian / Nama Bahan</th>
                <th style="width: 140px;">Toko / Supplier</th>
                <th class="text-center" style="width: 50px;">Satuan</th>
                <th class="text-right" style="width: 50px;">Qty</th>
                <th class="text-right" style="width: 80px;">Harga (Rp)</th>
                <th class="text-right" style="width: 90px;">Jumlah (Rp)</th>
                <th class="text-center" style="width: 75px;">Status PO</th>
              </tr>
            </thead>
            <tbody>
              ${data
                .map(
                  (r, i) => `
                <tr>
                  <td class="text-center">${i + 1}</td>
                  <td class="text-center">${r.date || "-"}</td>
                  <td>${r.customer_name || "-"}</td>
                  <td class="font-bold">${r.item_name || "-"}</td>
                  <td>${r.supplier_name || "-"}</td>
                  <td class="text-center">${r.unit || "-"}</td>
                  <td class="text-right font-bold">${+r.qty}</td>
                  <td class="text-right">${rupiah(r.price)}</td>
                  <td class="text-right font-bold" style="color: #0f766e;">${rupiah(r.total)}</td>
                  <td class="text-center">${
                    r.po_no
                      ? `<span class="badge-po">${r.po_no}</span>`
                      : `<span class="badge-no-po">Belum PO</span>`
                  }</td>
                </tr>`
                )
                .join("")}
            </tbody>
            <tfoot>
              <tr style="background: #f0fdfa; font-weight: bold;">
                <td colspan="8" class="text-right font-bold" style="padding: 8px;">TOTAL NILAI KESELURUHAN:</td>
                <td class="text-right font-bold" style="color: #0f766e; font-size: 11px; padding: 8px;">${rupiah(grandTotal)}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>

          <div class="signatures">
            <div class="sign-box">
              <p>Dibuat Oleh,</p>
              <div class="sign-space"></div>
              <p>( _______________________ )<br>Petugas RAB</p>
            </div>
            <div class="sign-box">
              <p>Mengetahui,</p>
              <div class="sign-space"></div>
              <p>( _______________________ )<br>Koordinator Pengadaan</p>
            </div>
            <div class="sign-box">
              <p>Disetujui Oleh,</p>
              <div class="sign-space"></div>
              <p>( _______________________ )<br>Pimpinan / Manajemen</p>
            </div>
          </div>

          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
        </html>
      `);
      printWindow.document.close();
    } catch {
      alert("Gagal menyiapkan dokumen PDF. Silakan coba lagi.");
    } finally {
      setExportingPdf(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Action */}
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            RAB Harian
          </h1>
          <p className="text-xs text-slate-500">
            Daftar estimasi kebutuhan belanja harian per pelanggan dan toko/supplier
          </p>
        </div>

        <button
          onClick={openBatchModal}
          className="btn-primary flex items-center gap-2 text-xs font-bold"
        >
          <Plus size={16} /> Input RAB (Multi-Item)
        </button>
      </div>

      {/* Filter Rentang Waktu & Aksi Export Excel / PDF */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs lg:flex-row lg:items-center lg:justify-between">
        {/* Kontrol Rentang Waktu */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Presets */}
          <div className="flex items-center rounded-xl bg-slate-100 p-1 border border-slate-200/60 text-xs">
            <button
              type="button"
              onClick={() => applyPreset("today")}
              className={`rounded-lg px-2.5 py-1 transition ${
                activePreset === "today"
                  ? "bg-white text-teal-800 shadow-xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Hari Ini
            </button>
            <button
              type="button"
              onClick={() => applyPreset("7days")}
              className={`rounded-lg px-2.5 py-1 transition ${
                activePreset === "7days"
                  ? "bg-white text-teal-800 shadow-xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              7 Hari
            </button>
            <button
              type="button"
              onClick={() => applyPreset("month")}
              className={`rounded-lg px-2.5 py-1 transition ${
                activePreset === "month"
                  ? "bg-white text-teal-800 shadow-xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Bulan Ini
            </button>
            <button
              type="button"
              onClick={() => applyPreset("all")}
              className={`rounded-lg px-2.5 py-1 transition ${
                activePreset === "all"
                  ? "bg-white text-teal-800 shadow-xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Semua
            </button>
          </div>

          {/* Custom Date Pickers */}
          <div className="flex items-center gap-1.5">
            <input
              type="date"
              className="input !py-1.5 !px-2.5 text-xs font-medium"
              value={dateRange.from}
              onChange={(e) => {
                setActivePreset(null);
                setDateRange({ ...dateRange, from: e.target.value });
              }}
            />
            <span className="text-xs text-slate-400 font-bold">-</span>
            <input
              type="date"
              className="input !py-1.5 !px-2.5 text-xs font-medium"
              value={dateRange.to}
              onChange={(e) => {
                setActivePreset(null);
                setDateRange({ ...dateRange, to: e.target.value });
              }}
            />
          </div>

          {(dateRange.from || dateRange.to) && (
            <button
              type="button"
              onClick={() => applyPreset("all")}
              title="Reset Filter Tanggal"
              className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-slate-500 hover:bg-slate-100 hover:text-rose-600 transition"
            >
              <RotateCcw size={12} /> Reset
            </button>
          )}
        </div>

        {/* Tombol Export Excel & PDF */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportExcel}
            disabled={exportingExcel}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50/80 px-3.5 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-100 hover:border-emerald-300 transition shadow-2xs disabled:opacity-50"
            title="Download file Excel (.xls)"
          >
            <FileSpreadsheet size={15} className="text-emerald-700" />
            {exportingExcel ? "Mengekspor..." : "Export Excel"}
          </button>

          <button
            type="button"
            onClick={handleExportPDF}
            disabled={exportingPdf}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-teal-800 transition shadow-2xs disabled:opacity-50"
            title="Cetak atau Simpan sebagai PDF"
          >
            <Printer size={15} className="text-teal-700" />
            {exportingPdf ? "Menyiapkan..." : "Export PDF"}
          </button>
        </div>
      </div>

      {/* Tabel Data RAB */}
      <DataTable
        paged={paged}
        columns={[
          { key: "date", label: "Tanggal" },
          { key: "customer_name", label: "Pelanggan" },
          { key: "supplier_name", label: "Supplier" },
          {
            key: "item_name",
            label: "Bahan Baku",
            render: (r) => (
              <span className="font-bold text-slate-900">{r.item_name}</span>
            ),
          },
          {
            key: "qty",
            label: "Qty",
            render: (r) => `${+r.qty} ${r.unit || ""}`,
          },
          {
            key: "price",
            label: "Harga Satuan",
            render: (r) => rupiah(r.price),
          },
          {
            key: "total",
            label: "Jumlah",
            render: (r) => (
              <span className="font-bold text-teal-800">{rupiah(r.total)}</span>
            ),
          },
          {
            key: "po_no",
            label: "Status PO",
            render: (r) =>
              r.po_no ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-sky-100 px-2.5 py-0.5 text-xs font-semibold text-sky-800">
                  <CheckCircle2 size={12} /> {r.po_no}
                </span>
              ) : (
                <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
                  Belum PO
                </span>
              ),
          },
        ]}
        actions={(r) => (
          <div className="flex items-center gap-1">
            <button
              onClick={() => openEdit(r)}
              title="Edit Item"
              className="btn-ghost !px-2.5 !py-1 text-xs text-slate-700 hover:text-teal-700"
            >
              <Edit2 size={13} /> Edit
            </button>
            <button
              onClick={() => removeRow(r)}
              title="Hapus Item"
              className="btn-ghost !px-2 !py-1 text-xs text-rose-600 hover:bg-rose-50 hover:text-rose-700"
            >
              <Trash2 size={13} />
            </button>
          </div>
        )}
      />

      {/* MODAL MULTI-ITEM INPUT RAB */}
      {batchOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 overflow-y-auto bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-6xl xl:max-w-7xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[96vh] sm:max-h-[92vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-4 sm:px-6 py-3.5 sm:py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-teal-600 text-white shadow-xs shrink-0">
                  <ShoppingBag size={18} />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                    Input RAB Harian (Multi-Item)
                  </h2>
                  <p className="text-[11px] sm:text-xs text-slate-500">
                    Bahan baru otomatis tersimpan ke Master Bahan Baku.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setBatchOpen(false)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition"
              >
                &times;
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={submitBatch} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
              {/* Header Input: Tanggal RAB */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1 sm:w-72">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                    <Calendar size={14} className="text-teal-600" /> Tanggal RAB *
                  </label>
                  <input
                    type="date"
                    required
                    className="input"
                    value={batchHeader.date}
                    onChange={(e) =>
                      setBatchHeader({ ...batchHeader, date: e.target.value })
                    }
                  />
                </div>
                {/* <div className="text-xs text-slate-500 sm:text-right">
                  Pilih <b>Pelanggan / SPPG</b> di kolom pertama setiap baris item di bawah. Baris baru otomatis mengikuti pelanggan sebelumnya.
                </div> */}
              </div>

              {/* Items List (Mobile Cards vs Desktop Table) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Layers size={15} className="text-teal-600" /> Daftar Bahan Baku / Uraian
                  </span>
                  <span className="text-xs text-slate-500">
                    Total: <b>{batchItems.length}</b> baris item
                  </span>
                </div>

                {/* --- 1. TAMPILAN MOBILE: KARTU PER ITEM (md:hidden) --- */}
                <div className="space-y-3 md:hidden">
                  {batchItems.map((row, idx) => {
                    const lineTotal =
                      (parseFloat(row.qty) || 0) * (parseFloat(row.price) || 0);

                    return (
                      <div
                        key={idx}
                        className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs space-y-3"
                      >
                        {/* Header Item & Tombol Aksi */}
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-800">
                            <span className="flex h-5 w-5 items-center justify-center rounded-md bg-teal-50 text-[11px] font-black text-teal-700">
                              {idx + 1}
                            </span>
                            Item Bahan
                          </span>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => duplicateBatchRow(idx)}
                              className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-teal-700 transition"
                              title="Salin baris ini"
                            >
                              <Copy size={13} />
                            </button>
                            <button
                              type="button"
                              onClick={() => removeBatchRow(idx)}
                              disabled={batchItems.length <= 1}
                              className={`flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition ${batchItems.length <= 1
                                  ? "opacity-30 cursor-not-allowed"
                                  : "hover:bg-rose-50 hover:text-rose-600"
                                }`}
                              title="Hapus baris item"
                            >
                              &times;
                            </button>
                          </div>
                        </div>

                        {/* Pelanggan / SPPG (Kolom Pertama) */}
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1">
                            <Users size={12} className="text-teal-600" /> Pelanggan / SPPG *
                          </label>
                          <AsyncSelect
                            cacheOptions
                            defaultOptions={customerOptions}
                            loadOptions={loadCustomerOptions}
                            value={
                              row.customer_id
                                ? {
                                  value: row.customer_id,
                                  label:
                                    customers.find(
                                      (c) =>
                                        c.id === row.customer_id ||
                                        c.id === +row.customer_id
                                    )?.name || "Pilih Pelanggan...",
                                }
                                : null
                            }
                            onChange={(opt) => {
                              updateBatchRow(idx, "customer_id", opt ? opt.value : "");
                              if (opt?.data && !customers.some((c) => c.id === opt.data.id)) {
                                setCustomers((prev) => [...prev, opt.data]);
                              }
                            }}
                            placeholder="Pilih Pelanggan..."
                            isClearable
                            menuPosition="fixed"
                            menuPortalTarget={typeof document !== "undefined" ? document.body : null}
                            styles={creatableSelectStyles}
                            noOptionsMessage={() => "Pelanggan tidak ditemukan"}
                            loadingMessage={() => "Mencari..."}
                          />
                        </div>

                        {/* Uraian / Nama Bahan */}
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                            Uraian / Nama Bahan *
                          </label>
                          <AsyncCreatableSelect
                            defaultOptions={materialOptions}
                            loadOptions={loadMaterialOptions}
                            value={
                              row.item_name
                                ? { value: row.item_name, label: row.item_name }
                                : null
                            }
                            onChange={(opt) => handleMaterialSelect(idx, opt)}
                            onCreateOption={(val) => handleCreateMaterial(idx, val)}
                            formatCreateLabel={(val) => `+ Tambah baru: "${val}"`}
                            placeholder="Pilih atau ketik nama bahan..."
                            menuPosition="fixed"
                            menuPortalTarget={typeof document !== "undefined" ? document.body : null}
                            styles={creatableSelectStyles}
                            noOptionsMessage={() => "Ketik nama untuk buat baru"}
                            isClearable
                          />
                        </div>

                        {/* Supplier */}
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                            Toko / Supplier *
                          </label>
                          <AsyncSelect
                            cacheOptions
                            defaultOptions={supplierOptions}
                            loadOptions={loadSupplierOptions}
                            value={
                              row.supplier_id
                                ? {
                                  value: row.supplier_id,
                                  label:
                                    suppliers.find(
                                      (s) =>
                                        s.id === row.supplier_id ||
                                        s.id === +row.supplier_id
                                    )?.name || "Pilih Supplier...",
                                }
                                : null
                            }
                            onChange={(opt) => {
                              updateBatchRow(idx, "supplier_id", opt ? opt.value : "");
                              if (opt?.data && !suppliers.some((s) => s.id === opt.data.id)) {
                                setSuppliers((prev) => [...prev, opt.data]);
                              }
                            }}
                            placeholder="Pilih Supplier..."
                            isClearable
                            menuPosition="fixed"
                            menuPortalTarget={typeof document !== "undefined" ? document.body : null}
                            styles={creatableSelectStyles}
                            noOptionsMessage={() => "Supplier tidak ditemukan"}
                            loadingMessage={() => "Mencari..."}
                          />
                        </div>

                        {/* Satuan, Qty, Harga in 3-column grid */}
                        <div className="grid grid-cols-3 gap-2">
                          <div className="space-y-1">
                            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                              Satuan
                            </label>
                            <input
                              type="text"
                              placeholder="kg"
                              className="w-full rounded-lg border border-slate-200 bg-white py-2 px-2.5 text-xs text-center font-medium focus:border-teal-600 focus:ring-2 focus:ring-teal-600/10 outline-none"
                              value={row.unit}
                              onChange={(e) => updateBatchRow(idx, "unit", e.target.value)}
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                              Qty *
                            </label>
                            <input
                              type="number"
                              step="any"
                              min="0.01"
                              required
                              className="w-full rounded-lg border border-slate-200 bg-white py-2 px-2.5 text-xs font-semibold text-right [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/10 outline-none"
                              value={row.qty}
                              onChange={(e) => updateBatchRow(idx, "qty", e.target.value)}
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                              Harga *
                            </label>
                            <input
                              type="number"
                              step="any"
                              min="0"
                              required
                              className="w-full rounded-lg border border-slate-200 bg-white py-2 px-2.5 text-xs font-semibold text-right [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/10 outline-none"
                              value={row.price}
                              onChange={(e) => updateBatchRow(idx, "price", e.target.value)}
                            />
                          </div>
                        </div>

                        {/* Subtotal Item */}
                        <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-xs border border-slate-100">
                          <span className="font-medium text-slate-500">Subtotal:</span>
                          <span className="font-bold text-teal-800">{rupiah(lineTotal)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* --- 2. TAMPILAN DESKTOP: TABEL MULTI-KOLOM (hidden md:block) --- */}
                <div className="hidden md:block overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-xs">
                  <table className="w-full text-left text-sm min-w-[1100px]">
                    <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                      <tr>
                        <th className="py-3 px-3 w-12 text-center">No</th>
                        <th className="py-3 px-3 min-w-[210px]">Pelanggan / SPPG *</th>
                        <th className="py-3 px-3 min-w-[230px]">
                          Uraian / Nama Bahan *
                        </th>
                        <th className="py-3 px-3 min-w-[190px]">Supplier *</th>
                        <th className="py-3 px-2 w-24 min-w-[90px] text-center">Satuan</th>
                        <th className="py-3 px-2 w-28 min-w-[100px] text-right">Qty *</th>
                        <th className="py-3 px-2 w-36 min-w-[140px] text-right">Harga (Rp) *</th>
                        <th className="py-3 px-3 w-36 min-w-[130px] text-right">Jumlah</th>
                        <th className="py-3 px-2 w-20 min-w-[80px] text-center"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {batchItems.map((row, idx) => {
                        const lineTotal =
                          (parseFloat(row.qty) || 0) * (parseFloat(row.price) || 0);

                        return (
                          <tr key={idx} className="hover:bg-slate-50/50">
                            <td className="py-2.5 px-3 text-center text-xs text-slate-400 font-bold">
                              {idx + 1}
                            </td>

                            {/* Kolom 1: Pelanggan / SPPG */}
                            <td className="py-2 px-3">
                              <AsyncSelect
                                cacheOptions
                                defaultOptions={customerOptions}
                                loadOptions={loadCustomerOptions}
                                value={
                                  row.customer_id
                                    ? {
                                      value: row.customer_id,
                                      label:
                                        customers.find(
                                          (c) =>
                                            c.id === row.customer_id ||
                                            c.id === +row.customer_id
                                        )?.name || "Pilih Pelanggan...",
                                    }
                                    : null
                                }
                                onChange={(opt) => {
                                  updateBatchRow(
                                    idx,
                                    "customer_id",
                                    opt ? opt.value : ""
                                  );
                                  if (
                                    opt?.data &&
                                    !customers.some((c) => c.id === opt.data.id)
                                  ) {
                                    setCustomers((prev) => [...prev, opt.data]);
                                  }
                                }}
                                placeholder="Pilih Pelanggan..."
                            isClearable
                                menuPosition="fixed"
                                menuPortalTarget={
                                  typeof document !== "undefined"
                                    ? document.body
                                    : null
                                }
                                styles={creatableSelectStyles}
                                noOptionsMessage={() => "Pelanggan tidak ditemukan"}
                                loadingMessage={() => "Mencari..."}
                              />
                            </td>

                            {/* Kolom 2: Uraian dengan AsyncCreatableSelect */}
                            <td className="py-2 px-3">
                              <AsyncCreatableSelect
                                defaultOptions={materialOptions}
                                loadOptions={loadMaterialOptions}
                                value={
                                  row.item_name
                                    ? { value: row.item_name, label: row.item_name }
                                    : null
                                }
                                onChange={(opt) => handleMaterialSelect(idx, opt)}
                                onCreateOption={(val) => handleCreateMaterial(idx, val)}
                                formatCreateLabel={(val) => `+ Tambah baru: "${val}"`}
                                placeholder="Pilih atau ketik bahan..."
                                menuPosition="fixed"
                                menuPortalTarget={
                                  typeof document !== "undefined"
                                    ? document.body
                                    : null
                                }
                                styles={creatableSelectStyles}
                                noOptionsMessage={() => "Ketik nama untuk buat baru"}
                                isClearable
                              />
                            </td>

                            {/* Kolom 3: Supplier dengan AsyncSelect */}
                            <td className="py-2 px-3">
                              <AsyncSelect
                                cacheOptions
                                defaultOptions={supplierOptions}
                                loadOptions={loadSupplierOptions}
                                value={
                                  row.supplier_id
                                    ? {
                                      value: row.supplier_id,
                                      label:
                                        suppliers.find(
                                          (s) =>
                                            s.id === row.supplier_id ||
                                            s.id === +row.supplier_id
                                        )?.name || "Pilih Supplier...",
                                    }
                                    : null
                                }
                                onChange={(opt) => {
                                  updateBatchRow(
                                    idx,
                                    "supplier_id",
                                    opt ? opt.value : ""
                                  );
                                  if (
                                    opt?.data &&
                                    !suppliers.some((s) => s.id === opt.data.id)
                                  ) {
                                    setSuppliers((prev) => [
                                      ...prev,
                                      opt.data,
                                    ]);
                                  }
                                }}
                                placeholder="Pilih Supplier..."
                            isClearable
                                menuPosition="fixed"
                                menuPortalTarget={
                                  typeof document !== "undefined"
                                    ? document.body
                                    : null
                                }
                                styles={creatableSelectStyles}
                                noOptionsMessage={() => "Supplier tidak ditemukan"}
                                loadingMessage={() => "Mencari..."}
                              />
                            </td>

                            {/* Satuan */}
                            <td className="py-2 px-2 w-24 min-w-[90px]">
                              <input
                                type="text"
                                placeholder="kg"
                                className="w-full rounded-lg border border-slate-200 bg-white py-2 px-2.5 text-xs text-center font-medium focus:border-teal-600 focus:ring-2 focus:ring-teal-600/10 outline-none"
                                value={row.unit}
                                onChange={(e) =>
                                  updateBatchRow(idx, "unit", e.target.value)
                                }
                              />
                            </td>

                            {/* Qty */}
                            <td className="py-2 px-2 w-28 min-w-[100px]">
                              <input
                                type="number"
                                step="any"
                                min="0.01"
                                required
                                className="w-full rounded-lg border border-slate-200 bg-white py-2 px-2.5 text-xs font-semibold text-right [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/10 outline-none"
                                value={row.qty}
                                onChange={(e) =>
                                  updateBatchRow(idx, "qty", e.target.value)
                                }
                              />
                            </td>

                            {/* Harga */}
                            <td className="py-2 px-2 w-36 min-w-[140px]">
                              <input
                                type="number"
                                step="any"
                                min="0"
                                required
                                className="w-full rounded-lg border border-slate-200 bg-white py-2 px-2.5 text-xs font-semibold text-right [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/10 outline-none"
                                value={row.price}
                                onChange={(e) =>
                                  updateBatchRow(idx, "price", e.target.value)
                                }
                              />
                            </td>

                            {/* Jumlah */}
                            <td className="py-2.5 px-3 w-36 min-w-[130px] text-right font-black text-slate-800 text-xs">
                              {rupiah(lineTotal)}
                            </td>

                            {/* Tombol Salin & Hapus Baris */}
                            <td className="py-2 px-2 w-20 min-w-[80px] text-center">
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => duplicateBatchRow(idx)}
                                  title="Salin baris ini"
                                  className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-teal-700 transition"
                                >
                                  <Copy size={14} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => removeBatchRow(idx)}
                                  disabled={batchItems.length <= 1}
                                  title="Hapus baris"
                                  className={`flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition ${batchItems.length <= 1
                                      ? "opacity-30 cursor-not-allowed"
                                      : "hover:bg-rose-50 hover:text-rose-600"
                                    }`}
                                >
                                  &times;
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Tombol Tambah Item */}
                <button
                  type="button"
                  onClick={addBatchRow}
                  className="btn-ghost flex items-center justify-center gap-1.5 text-xs font-bold text-teal-800 hover:text-teal-900 border-dashed w-full sm:w-auto py-2.5"
                >
                  <Plus size={15} /> Tambah Item
                </button>
              </div>

              {/* Grand Total & Action Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200 pt-4 sm:pt-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full sm:w-auto gap-2 sm:gap-6">
                  <div className="text-xs text-slate-500">
                    Total: <b className="text-slate-800">{batchItems.length}</b> Baris Item RAB
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-600">
                      Total Nilai:
                    </span>
                    <span className="text-lg sm:text-xl font-black text-teal-800">
                      {rupiah(batchGrandTotal)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setBatchOpen(false)}
                    className="btn-ghost flex-1 sm:flex-none"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={savingBatch}
                    className="btn-primary flex-1 sm:flex-none flex items-center justify-center gap-2 py-2.5"
                  >
                    {savingBatch ? "Menyimpan..." : "Simpan Semua Item RAB"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDIT SINGLE ROW */}
      <Modal
        open={Boolean(editModal)}
        onClose={() => setEditModal(null)}
        title="Edit Item RAB"
      >
        <form onSubmit={submitEdit} className="space-y-4">
          <Field
            field={{ name: "date", label: "Tanggal", type: "date", required: true }}
            value={editForm.date}
            onChange={(v) => setEditForm({ ...editForm, date: v })}
          />

          <Field
            field={{
              name: "customer_id",
              label: "Pelanggan",
              type: "select",
              required: true,
              options: { endpoint: E.CUSTOMERS.LIST, label: "name" },
            }}
            value={editForm.customer_id}
            onChange={(v) => setEditForm({ ...editForm, customer_id: v })}
          />

          <Field
            field={{
              name: "supplier_id",
              label: "Toko / Supplier",
              type: "select",
              required: true,
              options: { endpoint: E.SUPPLIERS.LIST, label: "name" },
            }}
            value={editForm.supplier_id}
            onChange={(v) => setEditForm({ ...editForm, supplier_id: v })}
          />

          <Field
            field={{ name: "item_name", label: "Nama Bahan", required: true }}
            value={editForm.item_name}
            onChange={(v) => setEditForm({ ...editForm, item_name: v })}
          />

          <div className="grid grid-cols-2 gap-3">
            <Field
              field={{ name: "qty", label: "Qty", type: "number", required: true }}
              value={editForm.qty}
              onChange={(v) => setEditForm({ ...editForm, qty: v })}
            />
            <Field
              field={{ name: "unit", label: "Satuan" }}
              value={editForm.unit}
              onChange={(v) => setEditForm({ ...editForm, unit: v })}
            />
          </div>

          <Field
            field={{
              name: "price",
              label: "Harga Satuan (Rp)",
              type: "number",
              required: true,
            }}
            value={editForm.price}
            onChange={(v) => setEditForm({ ...editForm, price: v })}
          />

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              className="btn-ghost"
              onClick={() => setEditModal(null)}
            >
              Batal
            </button>
            <button type="submit" disabled={savingEdit} className="btn-primary">
              {savingEdit ? "Menyimpan..." : "Perbarui"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
