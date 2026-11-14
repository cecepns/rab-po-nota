import { useState, useEffect, useCallback, useRef } from "react";
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
};

export default function Rab() {
  const paged = usePaged(E.RAB.LIST);
  const [suppliers, setSuppliers] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [materialOptions, setMaterialOptions] = useState([]);

  // State Modal Multi-Input (Batch)
  const [batchOpen, setBatchOpen] = useState(false);
  const [batchHeader, setBatchHeader] = useState({
    date: today(),
    customer_id: "",
  });
  const [batchItems, setBatchItems] = useState([
    { item_name: "", supplier_id: "", qty: 1, unit: "kg", price: 0 },
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
        label: m.name,
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
      .catch(() => {});

    api
      .get(E.CUSTOMERS.LIST, { params: { limit: 100 } })
      .then((r) => setCustomers(r.data?.data || []))
      .catch(() => {});

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
              label: m.name,
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

  // Search customer untuk AsyncSelect Pelanggan / SPPG (debounce 1 detik)
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
    }, 1000);
  }, []);

  // Search supplier untuk AsyncSelect Toko / Supplier (debounce 1 detik)
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
    }, 1000);
  }, []);

  // Buka Modal Multi-Input baru (refresh master bahan baku)
  const openBatchModal = () => {
    fetchMaterials();
    setBatchHeader({
      date: today(),
      customer_id: customers[0]?.id || "",
    });
    setBatchItems([
      {
        item_name: "",
        supplier_id: suppliers[0]?.id || "",
        qty: 1,
        unit: "kg",
        price: 0,
      },
    ]);
    setBatchOpen(true);
  };

  // Tambah baris item baru di batch
  const addBatchRow = () => {
    setBatchItems((prev) => [
      ...prev,
      {
        item_name: "",
        supplier_id: suppliers[0]?.id || "",
        qty: 1,
        unit: "kg",
        price: 0,
      },
    ]);
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
    if (!batchHeader.customer_id) {
      alert("Silakan pilih Pelanggan");
      return;
    }

    const invalid = batchItems.find(
      (it) => !it.item_name || !it.supplier_id || !it.qty || it.qty <= 0
    );
    if (invalid) {
      alert("Pastikan nama bahan, supplier, dan qty terisi dengan benar di setiap baris.");
      return;
    }

    setSavingBatch(true);
    const res = await request(
      () =>
        api.post(E.RAB.BATCH, {
          date: batchHeader.date,
          customer_id: batchHeader.customer_id,
          items: batchItems,
        }),
      `${batchItems.length} item RAB berhasil disimpan & dicatat ke master bahan baku!`
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

  const customerOptions = customers.map((c) => ({
    value: c.id,
    label: c.name,
    data: c,
  }));
  const supplierOptions = suppliers.map((s) => ({
    value: s.id,
    label: s.name,
    data: s,
  }));

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
          <div className="relative w-full max-w-5xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[96vh] sm:max-h-[92vh]">
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
              {/* Header Input: Tanggal & Pelanggan */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 rounded-xl border border-slate-200 bg-slate-50/60 p-3.5 sm:p-4">
                <div className="space-y-1.5">
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

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                    <Users size={14} className="text-teal-600" /> Pelanggan / SPPG *
                  </label>
                  <AsyncSelect
                    cacheOptions
                    defaultOptions={customerOptions}
                    loadOptions={loadCustomerOptions}
                    value={
                      batchHeader.customer_id
                        ? {
                            value: batchHeader.customer_id,
                            label:
                              customers.find(
                                (c) =>
                                  c.id === batchHeader.customer_id ||
                                  c.id === +batchHeader.customer_id
                              )?.name || "Pilih Pelanggan / SPPG...",
                          }
                        : null
                    }
                    onChange={(opt) => {
                      setBatchHeader({
                        ...batchHeader,
                        customer_id: opt ? opt.value : "",
                      });
                      if (opt?.data && !customers.some((c) => c.id === opt.data.id)) {
                        setCustomers((prev) => [...prev, opt.data]);
                      }
                    }}
                    placeholder="Pilih atau cari Pelanggan / SPPG..."
                    menuPosition="fixed"
                    menuPortalTarget={typeof document !== "undefined" ? document.body : null}
                    styles={creatableSelectStyles}
                    noOptionsMessage={() => "Data pelanggan tidak ditemukan"}
                    loadingMessage={() => "Mencari..."}
                  />
                </div>
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
                        {/* Header Item & Tombol Hapus */}
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-800">
                            <span className="flex h-5 w-5 items-center justify-center rounded-md bg-teal-50 text-[11px] font-black text-teal-700">
                              {idx + 1}
                            </span>
                            Item Bahan
                          </span>

                          <button
                            type="button"
                            onClick={() => removeBatchRow(idx)}
                            disabled={batchItems.length <= 1}
                            className={`flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition ${
                              batchItems.length <= 1
                                ? "opacity-30 cursor-not-allowed"
                                : "hover:bg-rose-50 hover:text-rose-600"
                            }`}
                            title="Hapus baris item"
                          >
                            &times;
                          </button>
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
                              className="input !py-1.5 !px-2 text-xs"
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
                              className="input !py-1.5 !px-2 text-xs font-semibold text-right"
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
                              className="input !py-1.5 !px-2 text-xs font-semibold text-right"
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
                <div className="hidden md:block overflow-x-auto rounded-xl border border-slate-200 bg-white">
                  <table className="w-full text-left text-sm min-w-[820px]">
                    <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3 w-10 text-center">No</th>
                        <th className="py-2.5 px-3 min-w-[240px]">
                          Uraian / Nama Bahan *
                        </th>
                        <th className="py-2.5 px-3 min-w-[220px]">Supplier *</th>
                        <th className="py-2.5 px-3 w-24">Satuan</th>
                        <th className="py-2.5 px-3 w-24">Qty *</th>
                        <th className="py-2.5 px-3 w-32">Harga (Rp) *</th>
                        <th className="py-2.5 px-3 w-32 text-right">Jumlah</th>
                        <th className="py-2.5 px-2 w-10 text-center"></th>
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

                            {/* Uraian dengan AsyncCreatableSelect */}
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

                            {/* Supplier dengan AsyncSelect */}
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
                            <td className="py-2 px-3">
                              <input
                                type="text"
                                placeholder="kg"
                                className="input !py-1.5 !px-2 text-xs"
                                value={row.unit}
                                onChange={(e) =>
                                  updateBatchRow(idx, "unit", e.target.value)
                                }
                              />
                            </td>

                            {/* Qty */}
                            <td className="py-2 px-3">
                              <input
                                type="number"
                                step="any"
                                min="0.01"
                                required
                                className="input !py-1.5 !px-2 text-xs font-semibold text-right"
                                value={row.qty}
                                onChange={(e) =>
                                  updateBatchRow(idx, "qty", e.target.value)
                                }
                              />
                            </td>

                            {/* Harga */}
                            <td className="py-2 px-3">
                              <input
                                type="number"
                                step="any"
                                min="0"
                                required
                                className="input !py-1.5 !px-2 text-xs font-semibold text-right"
                                value={row.price}
                                onChange={(e) =>
                                  updateBatchRow(idx, "price", e.target.value)
                                }
                              />
                            </td>

                            {/* Jumlah */}
                            <td className="py-2.5 px-3 text-right font-black text-slate-800 text-xs">
                              {rupiah(lineTotal)}
                            </td>

                            {/* Tombol Hapus Baris */}
                            <td className="py-2 px-2 text-center">
                              <button
                                type="button"
                                onClick={() => removeBatchRow(idx)}
                                disabled={batchItems.length <= 1}
                                title="Hapus baris"
                                className={`flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition ${
                                  batchItems.length <= 1
                                    ? "opacity-30 cursor-not-allowed"
                                    : "hover:bg-rose-50 hover:text-rose-600"
                                }`}
                              >
                                &times;
                              </button>
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
                <div className="flex items-center justify-between w-full sm:w-auto gap-4">
                  <div className="text-xs text-slate-500">
                    Total: <b>{batchItems.length}</b> Bahan
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
