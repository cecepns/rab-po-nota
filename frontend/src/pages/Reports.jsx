import { useState, useEffect, useMemo } from "react";
import {
  Printer,
  Download,
  Calendar,
  Search,
  Filter,
  RefreshCw,
  BarChart3,
  Store,
  CheckCircle2,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  FileSpreadsheet,
  Receipt,
  ClipboardList,
  Scale,
} from "lucide-react";
import { api } from "@/utils/api";
import { API_ENDPOINTS as E } from "@/utils/endpoints";
import { request } from "@/utils/request";
import { rupiah, today } from "@/utils/format";
import Logo from "@/components/Logo";

export default function Reports() {
  const [range, setRange] = useState({
    from: today().slice(0, 8) + "01",
    to: today(),
  });
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // "all" | "diff" | "surplus" | "deficit" | "equal"
  const [rows, setRows] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadData = () => {
    setLoading(true);
    request(() => api.get(E.REPORT.SUMMARY, { params: range })).then((r) => {
      setRows(r?.data || []);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadData();
  }, [range]);

  // Quick preset period
  const applyPreset = (type) => {
    const cur = today();
    if (type === "today") {
      setRange({ from: cur, to: cur });
    } else if (type === "7days") {
      const d = new Date();
      d.setDate(d.getDate() - 7);
      setRange({ from: d.toISOString().slice(0, 10), to: cur });
    } else if (type === "month") {
      setRange({ from: cur.slice(0, 8) + "01", to: cur });
    } else if (type === "lastmonth") {
      const d = new Date();
      d.setMonth(d.getMonth() - 1);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const lastDay = new Date(y, d.getMonth() + 1, 0).getDate();
      setRange({ from: `${y}-${m}-01`, to: `${y}-${m}-${lastDay}` });
    } else if (type === "all") {
      setRange({ from: "2024-01-01", to: "2099-12-31" });
    }
  };

  // Filter rows based on search and status
  const filteredRows = useMemo(() => {
    if (!rows) return [];
    return rows.filter((r) => {
      const matchSearch = r.name.toLowerCase().includes(search.toLowerCase());
      if (!matchSearch) return false;

      const diff = r.rab_total - r.nota_total;
      if (statusFilter === "all") return true;
      if (statusFilter === "diff") return r.nota_total > 0 && diff !== 0;
      if (statusFilter === "surplus") return diff > 0 && r.nota_total > 0;
      if (statusFilter === "deficit") return diff < 0;
      if (statusFilter === "equal") return r.nota_total > 0 && diff === 0;
      if (statusFilter === "no_nota") return r.nota_total == 0;
      return true;
    });
  }, [rows, search, statusFilter]);

  // Accumulation calculations
  const totalRAB = filteredRows.reduce((s, r) => s + +r.rab_total, 0);
  const totalPO = filteredRows.reduce((s, r) => s + +r.po_total, 0);
  const totalNota = filteredRows.reduce((s, r) => s + +r.nota_total, 0);
  const totalSelisih = totalRAB - totalNota;
  const realizationPct = totalRAB > 0 ? ((totalNota / totalRAB) * 100).toFixed(1) : 0;

  // Print function
  const handlePrint = () => {
    window.print();
  };

  // Export to CSV function
  const handleExportCSV = () => {
    if (!filteredRows.length) return;

    const headers = [
      "No",
      "Nama Toko / Supplier",
      "Estimasi Nilai RAB (Rp)",
      "Nilai PO Terbit (Rp)",
      "Realisasi Nota (Rp)",
      "Selisih Anggaran (Rp)",
      "% Realisasi",
      "Status",
    ];

    const dataRows = filteredRows.map((r, i) => {
      const diff = r.rab_total - r.nota_total;
      const pct = r.rab_total > 0 ? ((r.nota_total / r.rab_total) * 100).toFixed(1) + "%" : "0%";
      const status =
        r.nota_total == 0
          ? "Belum Ada Nota"
          : diff === 0
          ? "Sesuai"
          : diff > 0
          ? "Hemat / Surplus"
          : "Over Budget / Defisit";

      return [
        i + 1,
        `"${r.name.replace(/"/g, '""')}"`,
        r.rab_total,
        r.po_total,
        r.nota_total,
        diff,
        `"${pct}"`,
        `"${status}"`,
      ];
    });

    // Summary row
    dataRows.push([
      "",
      '"TOTAL KESELURUHAN"',
      totalRAB,
      totalPO,
      totalNota,
      totalSelisih,
      `"${realizationPct}%"`,
      '""',
    ]);

    const csvContent =
      "\uFEFF" +
      [headers.join(","), ...dataRows.map((e) => e.join(","))].join("\r\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `Laporan_Rekonsiliasi_RAB_PO_Nota_${range.from}_sampai_${range.to}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* PRINT-ONLY HEADER (Hanya muncul saat dicetak) */}
      <div className="hidden print:block mb-6 border-b-2 border-slate-900 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black uppercase tracking-tight text-slate-900">
              LAPORAN REKONSILIASI KEUANGAN & PENGADAAN
            </h1>
            <p className="text-xs text-slate-700">SISTEM RAB &bull; PURCHASE ORDER &bull; REALISASI NOTA</p>
          </div>
          <div className="text-right text-xs text-slate-600">
            <p><strong>Periode:</strong> {range.from} s/d {range.to}</p>
            <p><strong>Tanggal Cetak:</strong> {new Date().toLocaleDateString("id-ID", { dateStyle: "long" })}</p>
          </div>
        </div>
      </div>

      {/* Screen Header & Top Action Controls */}
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs sm:flex-row sm:items-center sm:justify-between print:hidden">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Laporan Rekonsiliasi
          </h1>
        </div>

        {/* Action Buttons: Cetak & Ekspor */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handlePrint}
            className="btn-ghost flex items-center gap-2 text-xs font-bold"
          >
            <Printer size={16} /> Cetak
          </button>

          <button
            onClick={handleExportCSV}
            disabled={!filteredRows.length}
            className="btn-primary flex items-center gap-2 text-xs font-bold"
          >
            <Download size={16} /> Ekspor CSV
          </button>

          <button
            onClick={loadData}
            title="Muat Ulang"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition"
          >
            <RefreshCw size={15} className={loading ? "animate-spin text-teal-600" : ""} />
          </button>
        </div>
      </div>

      {/* 4 Ringkasan */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 print:grid-cols-4">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase">
            <ClipboardList size={16} className="text-teal-600" />
            <span>Total RAB</span>
          </div>
          <p className="mt-1 text-xl font-black text-slate-900">{rupiah(totalRAB)}</p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase">
            <FileSpreadsheet size={16} className="text-sky-600" />
            <span>Total PO</span>
          </div>
          <p className="mt-1 text-xl font-black text-slate-900">{rupiah(totalPO)}</p>
          <p className="text-[11px] text-sky-700 font-semibold mt-1">
            {totalRAB > 0 ? ((totalPO / totalRAB) * 100).toFixed(1) : 0}% dari RAB
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase">
            <Receipt size={16} className="text-purple-600" />
            <span>Total Nota</span>
          </div>
          <p className="mt-1 text-xl font-black text-slate-900">{rupiah(totalNota)}</p>
          <p className="text-[11px] text-purple-700 font-semibold mt-1">
            {realizationPct}% terealisasi
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase">
            <Scale size={16} className={totalSelisih < 0 ? "text-rose-600" : "text-emerald-600"} />
            <span>Selisih</span>
          </div>
          <p
            className={`mt-1 text-xl font-black ${
              totalSelisih < 0 ? "text-rose-600" : "text-emerald-700"
            }`}
          >
            {rupiah(totalSelisih)}
          </p>
          <p className="text-[11px] font-bold mt-1">
            {totalSelisih < 0 ? (
              <span className="text-rose-600">Defisit</span>
            ) : totalSelisih > 0 ? (
              <span className="text-emerald-700">Surplus</span>
            ) : (
              <span className="text-slate-500">Sesuai</span>
            )}
          </p>
        </div>
      </div>

      {/* Filter Bar (Periode, Pencarian, & Status Selisih) */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs print:hidden space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Quick preset buttons */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold">
            <span className="text-slate-600 font-bold mr-1 flex items-center gap-1">
              <Calendar size={14} /> Periode:
            </span>
            <button
              onClick={() => applyPreset("today")}
              className="rounded-lg px-2.5 py-1.5 border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            >
              Hari Ini
            </button>
            <button
              onClick={() => applyPreset("7days")}
              className="rounded-lg px-2.5 py-1.5 border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            >
              7 Hari
            </button>
            <button
              onClick={() => applyPreset("month")}
              className="rounded-lg px-2.5 py-1.5 bg-teal-50 border border-teal-200 text-teal-800 font-bold"
            >
              Bulan Ini
            </button>
            <button
              onClick={() => applyPreset("lastmonth")}
              className="rounded-lg px-2.5 py-1.5 border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            >
              Bulan Lalu
            </button>
            <button
              onClick={() => applyPreset("all")}
              className="rounded-lg px-2.5 py-1.5 border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            >
              Semua
            </button>
          </div>

          {/* Date range inputs */}
          <div className="flex items-center gap-2">
            <input
              type="date"
              className="input !py-1.5 text-xs w-36"
              value={range.from}
              onChange={(e) => setRange({ ...range, from: e.target.value })}
            />
            <span className="text-xs text-slate-400 font-bold">s/d</span>
            <input
              type="date"
              className="input !py-1.5 text-xs w-36"
              value={range.to}
              onChange={(e) => setRange({ ...range, to: e.target.value })}
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 border-t border-slate-100">
          {/* Search box */}
          <div className="relative w-full sm:flex-1">
            <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              className="input !pl-10 !py-2 text-xs"
              placeholder="Cari nama toko / supplier..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Filter Status Selisih */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter size={15} className="text-slate-400" />
            <select
              className="input !py-2 text-xs font-semibold sm:w-56"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Semua Status Selisih</option>
              <option value="diff">Ada Selisih (Over / Hemat)</option>
              <option value="surplus">Surplus (Hemat Anggaran)</option>
              <option value="deficit">Defisit (Over Budget)</option>
              <option value="equal">Sesuai / Nihil (0)</option>
              <option value="no_nota">Belum Ada Nota</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabel Laporan Lengkap */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs print:border print:border-slate-300 print:shadow-none">
        {/* Petunjuk geser di mobile */}
        <div className="flex items-center justify-between px-4 py-1.5 bg-slate-50 border-b border-slate-100 text-[11px] text-slate-400 sm:hidden print:hidden">
          <span>&larr; Geser tabel untuk kolom lainnya &rarr;</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm min-w-[720px] print:min-w-full print:text-xs">
            <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-3 px-3 text-center w-12 whitespace-nowrap">No</th>
                <th className="py-3 px-4 whitespace-nowrap">Toko / Supplier</th>
                <th className="py-3 px-4 text-right whitespace-nowrap">Nilai RAB</th>
                <th className="py-3 px-4 text-right whitespace-nowrap">Nilai PO</th>
                <th className="py-3 px-4 text-right whitespace-nowrap">Realisasi Nota</th>
                <th className="py-3 px-4 text-right whitespace-nowrap">Selisih (RAB - Nota)</th>
                <th className="py-3 px-3 text-center whitespace-nowrap">% Realisasi</th>
                <th className="py-3 px-4 text-center whitespace-nowrap">Status Rekonsiliasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 print:divide-slate-200">
              {loading &&
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={8} className="p-4">
                      <div className="h-5 w-full animate-pulse rounded bg-slate-100" />
                    </td>
                  </tr>
                ))}

              {!loading &&
                filteredRows.map((r, i) => {
                  const diff = r.rab_total - r.nota_total;
                  const pct = r.rab_total > 0 ? ((r.nota_total / r.rab_total) * 100).toFixed(1) : 0;

                  return (
                    <tr key={r.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-3 text-center text-slate-400 font-medium">{i + 1}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        <div className="flex items-center gap-2">
                          <Store size={15} className="text-teal-700 shrink-0 print:hidden" />
                          <span>{r.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-slate-800">
                        {rupiah(r.rab_total)}
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-sky-800">
                        {rupiah(r.po_total)}
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-purple-800">
                        {rupiah(r.nota_total)}
                      </td>
                      <td
                        className={`py-3 px-4 text-right font-black ${
                          r.nota_total == 0
                            ? "text-slate-400"
                            : diff < 0
                            ? "text-rose-600"
                            : "text-emerald-600"
                        }`}
                      >
                        {rupiah(diff)}
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-slate-700">
                        {pct}%
                      </td>
                      <td className="py-3 px-4 text-center">
                        {r.nota_total == 0 ? (
                          <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600">
                            Belum Ada Nota
                          </span>
                        ) : diff === 0 ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800">
                            <CheckCircle2 size={12} className="print:hidden" /> Sesuai
                          </span>
                        ) : diff > 0 ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-teal-100 px-2.5 py-0.5 text-[11px] font-bold text-teal-800">
                            <TrendingDown size={12} className="print:hidden" /> Hemat
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2.5 py-0.5 text-[11px] font-bold text-rose-800">
                            <AlertTriangle size={12} className="print:hidden" /> Over Budget
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}

              {!loading && filteredRows.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-10 text-center text-slate-400">
                    Tidak ada data rekonsiliasi yang cocok dengan kriteria filter.
                  </td>
                </tr>
              )}
            </tbody>

            {/* GRAND TOTAL ROW */}
            {filteredRows.length > 0 && (
              <tfoot className="bg-slate-100/90 font-bold text-slate-900 border-t-2 border-slate-300">
                <tr>
                  <td colSpan={2} className="py-3.5 px-4 uppercase text-xs">
                    Grand Total ({filteredRows.length} Toko)
                  </td>
                  <td className="py-3.5 px-4 text-right text-teal-900">{rupiah(totalRAB)}</td>
                  <td className="py-3.5 px-4 text-right text-sky-900">{rupiah(totalPO)}</td>
                  <td className="py-3.5 px-4 text-right text-purple-900">{rupiah(totalNota)}</td>
                  <td
                    className={`py-3.5 px-4 text-right font-black ${
                      totalSelisih < 0 ? "text-rose-700" : "text-emerald-700"
                    }`}
                  >
                    {rupiah(totalSelisih)}
                  </td>
                  <td className="py-3.5 px-3 text-center">{realizationPct}%</td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="text-xs font-bold">
                      {totalSelisih < 0 ? "Over Budget" : "Sesuai / Surplus"}
                    </span>
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* PRINT-ONLY SIGNATURE SECTION (Hanya muncul saat dicetak) */}
      <div className="hidden print:grid grid-cols-3 gap-8 pt-12 text-center text-xs">
        <div>
          <p className="font-semibold text-slate-600">Dibuat Oleh:</p>
          <div className="h-16" />
          <p className="font-bold border-t border-slate-400 pt-1 text-slate-900">
            Staf Pengadaan / Admin
          </p>
        </div>
        <div>
          <p className="font-semibold text-slate-600">Diperiksa Oleh:</p>
          <div className="h-16" />
          <p className="font-bold border-t border-slate-400 pt-1 text-slate-900">
            Supervisor Keuangan
          </p>
        </div>
        <div>
          <p className="font-semibold text-slate-600">Disetujui Oleh:</p>
          <div className="h-16" />
          <p className="font-bold border-t border-slate-400 pt-1 text-slate-900">
            Pimpinan / Kuasa Anggaran
          </p>
        </div>
      </div>
    </div>
  );
}
