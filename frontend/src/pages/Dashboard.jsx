import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  ClipboardList,
  FileSpreadsheet,
  Receipt,
  Scale,
  TrendingDown,
  TrendingUp,
  Store,
  ArrowRight,
  PlusCircle,
  BarChart3,
  Calendar,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  PieChart,
} from "lucide-react";
import { api } from "@/utils/api";
import { API_ENDPOINTS as E } from "@/utils/endpoints";
import { request } from "@/utils/request";
import { rupiah, today } from "@/utils/format";

// Card komponen dengan Icon Lucide
const StatCard = ({ title, value, subtitle, icon: Icon, color, trend, trendType }) => {
  const colorMap = {
    teal: {
      border: "border-teal-100 hover:border-teal-300",
      iconBg: "bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-md shadow-teal-500/20",
      subText: "text-slate-500",
    },
    blue: {
      border: "border-sky-100 hover:border-sky-300",
      iconBg: "bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-md shadow-sky-500/20",
      subText: "text-slate-500",
    },
    purple: {
      border: "border-purple-100 hover:border-purple-300",
      iconBg: "bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-md shadow-purple-500/20",
      subText: "text-slate-500",
    },
    emerald: {
      border: "border-emerald-100 hover:border-emerald-300",
      iconBg: "bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/20",
      subText: "text-emerald-700",
    },
    rose: {
      border: "border-rose-100 hover:border-rose-300",
      iconBg: "bg-gradient-to-br from-rose-500 to-red-600 text-white shadow-md shadow-rose-500/20",
      subText: "text-rose-700",
    },
    slate: {
      border: "border-slate-200 hover:border-slate-300",
      iconBg: "bg-gradient-to-br from-slate-600 to-slate-700 text-white shadow-md shadow-slate-500/20",
      subText: "text-slate-500",
    },
  };

  const scheme = colorMap[color] || colorMap.teal;

  return (
    <div
      className={`relative flex flex-col justify-between rounded-2xl border ${scheme.border} bg-white p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-1 min-w-0 flex-1 pr-2">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            {title}
          </p>
          <p className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 truncate" title={value}>
            {value}
          </p>
        </div>

        {/* Icon box berukuran proporsional yang TIDAK AKAN PERNAH terdistorsi / stretch */}
        <div
          className={`flex h-12 w-12 min-w-[48px] min-h-[48px] shrink-0 aspect-square items-center justify-center rounded-2xl ${scheme.iconBg}`}
        >
          <Icon size={22} className="shrink-0" />
        </div>
      </div>

      {(subtitle || trend) && (
        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-2.5 text-xs">
          <span className={`font-semibold ${scheme.subText}`}>{subtitle}</span>
          {trend && (
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                trendType === "danger"
                  ? "bg-rose-50 text-rose-700 border border-rose-200"
                  : trendType === "success"
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-slate-100 text-slate-700 border border-slate-200"
              }`}
            >
              {trend}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default function Dashboard() {
  const [range, setRange] = useState({
    from: today().slice(0, 8) + "01",
    to: today(),
  });
  const [activePreset, setActivePreset] = useState("month");
  const [rows, setRows] = useState(null);
  const [loading, setLoading] = useState(false);
  const [chartView, setChartView] = useState("all"); // "all" | "top"

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

  // Perhitungan Akumulasi
  const sum = (k) => (rows || []).reduce((s, r) => s + +r[k], 0);
  const rabTotal = sum("rab_total");
  const poTotal = sum("po_total");
  const notaTotal = sum("nota_total");
  const selisihTotal = rabTotal - notaTotal;

  // Rasio Realisasi
  const realizationPct = rabTotal > 0 ? ((notaTotal / rabTotal) * 100).toFixed(1) : 0;
  const poCoveragePct = rabTotal > 0 ? ((poTotal / rabTotal) * 100).toFixed(1) : 0;

  // Preset Periode
  const applyPreset = (type) => {
    setActivePreset(type);
    const cur = today();
    if (type === "today") {
      setRange({ from: cur, to: cur });
    } else if (type === "7days") {
      const d = new Date();
      d.setDate(d.getDate() - 7);
      setRange({ from: d.toISOString().slice(0, 10), to: cur });
    } else if (type === "month") {
      setRange({ from: cur.slice(0, 8) + "01", to: cur });
    } else if (type === "all") {
      setRange({ from: "2024-01-01", to: "2099-12-31" });
    }
  };

  // Chart data: Supplier dengan nilai terbesar
  const sortedBySpend = useMemo(() => {
    if (!rows) return [];
    return [...rows].sort((a, b) => b.rab_total - a.rab_total);
  }, [rows]);

  const maxRowValue = useMemo(() => {
    if (!rows || !rows.length) return 1;
    return Math.max(...rows.map((r) => Math.max(r.rab_total, r.po_total, r.nota_total, 1)));
  }, [rows]);

  return (
    <div className="space-y-6">
      {/* Top Banner / Filter Bar */}
      <div className="flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-xs border border-slate-200/80 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Dashboard
          </h1>
        </div>

        {/* Date Filters & Presets */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Quick presets */}
          <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-semibold">
            <button
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

          <div className="flex items-center gap-1.5">
            <input
              type="date"
              className="input !py-1.5 text-xs font-medium"
              value={range.from}
              onChange={(e) => {
                setActivePreset(null);
                setRange({ ...range, from: e.target.value });
              }}
            />
            <span className="text-xs text-slate-400 font-bold">-</span>
            <input
              type="date"
              className="input !py-1.5 text-xs font-medium"
              value={range.to}
              onChange={(e) => {
                setActivePreset(null);
                setRange({ ...range, to: e.target.value });
              }}
            />
          </div>

          <button
            onClick={loadData}
            title="Muat Ulang"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition"
          >
            <RefreshCw size={15} className={loading ? "animate-spin text-teal-600" : ""} />
          </button>
        </div>
      </div>

      {/* 4 Stat Cards dengan Lucide Icons */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Nilai RAB"
          value={rupiah(rabTotal)}
          icon={ClipboardList}
          color="teal"
        />

        <StatCard
          title="Total Nilai PO"
          value={rupiah(poTotal)}
          subtitle={`${poCoveragePct}% dari RAB`}
          icon={FileSpreadsheet}
          color="blue"
        />

        <StatCard
          title="Realisasi Nota"
          value={rupiah(notaTotal)}
          subtitle={`${realizationPct}% terealisasi`}
          icon={Receipt}
          color="purple"
        />

        <StatCard
          title="Selisih (RAB - Nota)"
          value={rupiah(Math.abs(selisihTotal))}
          subtitle={
            selisihTotal > 0
              ? "Surplus"
              : selisihTotal < 0
              ? "Defisit"
              : "Sesuai"
          }
          icon={selisihTotal < 0 ? TrendingUp : selisihTotal > 0 ? TrendingDown : Scale}
          color={selisihTotal < 0 ? "rose" : selisihTotal > 0 ? "emerald" : "slate"}
          trend={selisihTotal < 0 ? "Over" : selisihTotal > 0 ? "Hemat" : "Impas"}
          trendType={selisihTotal < 0 ? "danger" : selisihTotal > 0 ? "success" : "neutral"}
        />
      </div>

      {/* FITUR CHART / VISUALISASI DATA (Perbandingan RAB vs PO vs Nota per Toko) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Kolom 1 & 2: Bar Chart Perbandingan Toko */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs lg:col-span-2">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="text-teal-600" size={18} />
              <h3 className="font-bold text-slate-900 text-sm">
                Komparasi per Toko
              </h3>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-3 text-xs font-semibold">
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-sm bg-teal-500" /> RAB
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-sm bg-sky-500" /> PO
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-sm bg-purple-500" /> Nota
              </span>
            </div>
          </div>

          {/* Bar Chart Visual */}
          <div className="mt-6 space-y-5">
            {loading && (
              <div className="space-y-4 py-8">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-12 w-full animate-pulse rounded-xl bg-slate-100" />
                ))}
              </div>
            )}

            {!loading && rows && rows.length === 0 && (
              <div className="py-12 text-center text-slate-400">
                <BarChart3 size={40} className="mx-auto mb-2 text-slate-300" />
                <p className="text-sm font-semibold">Belum ada data transaksi pada rentang periode ini.</p>
                <p className="text-xs mt-1">Coba ubah tanggal atau pilih preset "Semua".</p>
              </div>
            )}

            {!loading &&
              sortedBySpend.map((row) => {
                const rabPct = Math.round((row.rab_total / maxRowValue) * 100);
                const poPct = Math.round((row.po_total / maxRowValue) * 100);
                const notaPct = Math.round((row.nota_total / maxRowValue) * 100);
                const diff = row.rab_total - row.nota_total;

                return (
                  <div key={row.id} className="group rounded-xl border border-slate-100 bg-slate-50/50 p-3.5 transition hover:bg-slate-50">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-2">
                      <div className="flex items-center gap-2">
                        <Store size={15} className="text-teal-700" />
                        <span className="text-sm font-black text-slate-900">{row.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500">Selisih:</span>
                        <span
                          className={`font-black ${
                            row.nota_total == 0
                              ? "text-slate-400"
                              : diff < 0
                              ? "text-rose-600"
                              : "text-emerald-600"
                          }`}
                        >
                          {rupiah(diff)}
                        </span>
                      </div>
                    </div>

                    {/* Progress Bars */}
                    <div className="space-y-1.5">
                      {/* RAB Bar */}
                      <div className="flex items-center gap-2 text-[11px]">
                        <span className="w-10 font-bold text-teal-700">RAB</span>
                        <div className="h-3 flex-1 rounded-full bg-slate-200/70 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-teal-500 transition-all duration-500"
                            style={{ width: `${Math.max(rabPct, 2)}%` }}
                          />
                        </div>
                        <span className="w-24 text-right font-medium text-slate-700">
                          {rupiah(row.rab_total)}
                        </span>
                      </div>

                      {/* PO Bar */}
                      <div className="flex items-center gap-2 text-[11px]">
                        <span className="w-10 font-bold text-sky-700">PO</span>
                        <div className="h-3 flex-1 rounded-full bg-slate-200/70 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-sky-500 transition-all duration-500"
                            style={{ width: `${Math.max(poPct, 2)}%` }}
                          />
                        </div>
                        <span className="w-24 text-right font-medium text-slate-700">
                          {rupiah(row.po_total)}
                        </span>
                      </div>

                      {/* Nota Bar */}
                      <div className="flex items-center gap-2 text-[11px]">
                        <span className="w-10 font-bold text-purple-700">Nota</span>
                        <div className="h-3 flex-1 rounded-full bg-slate-200/70 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-purple-500 transition-all duration-500"
                            style={{ width: `${Math.max(notaPct, 2)}%` }}
                          />
                        </div>
                        <span className="w-24 text-right font-medium text-slate-700">
                          {rupiah(row.nota_total)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Kolom 3: Health Score & Action Cart/Shortcuts */}
        <div className="space-y-6">
          {/* Ringkasan Realisasi Anggaran */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <PieChart className="text-teal-600" size={20} />
              <h3 className="font-extrabold text-slate-900 text-base">Realisasi Anggaran</h3>
            </div>

            <div className="mt-5 space-y-4">
              {/* Circular / Progress Metric */}
              <div className="text-center py-2">
                <span className="text-4xl font-black tracking-tight text-teal-700">
                  {realizationPct}%
                </span>
                <p className="text-xs text-slate-500 mt-1">Realisasi Belanja</p>
              </div>

              {/* Progress bar */}
              <div className="h-3.5 w-full rounded-full bg-slate-100 overflow-hidden p-0.5 border border-slate-200/60">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 transition-all duration-700"
                  style={{ width: `${Math.min(realizationPct, 100)}%` }}
                />
              </div>

              {/* Metric Breakdown */}
              <div className="space-y-2.5 pt-2 text-xs">
                <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                  <span className="text-slate-600 font-medium">Toko Terdaftar</span>
                  <span className="font-bold text-slate-900">{rows?.length || 0} Toko</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                  <span className="text-slate-600 font-medium">Cakupan PO</span>
                  <span className="font-bold text-sky-700">{poCoveragePct}%</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                  <span className="text-slate-600 font-medium">Status</span>
                  <span
                    className={`font-bold ${
                      selisihTotal < 0
                        ? "text-rose-600"
                        : selisihTotal > 0
                        ? "text-emerald-600"
                        : "text-slate-600"
                    }`}
                  >
                    {selisihTotal < 0
                      ? "Defisit"
                      : selisihTotal > 0
                      ? "Surplus"
                      : "Sesuai"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Action Cards */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
            <h3 className="font-bold text-slate-900 text-sm mb-3">
              Menu Cepat
            </h3>
            <div className="grid grid-cols-1 gap-2.5">
              <Link
                to="/rab"
                className="group flex items-center justify-between rounded-xl border border-slate-200/80 p-3 hover:border-teal-500 hover:bg-teal-50/50 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-100 text-teal-700">
                    <PlusCircle size={18} />
                  </div>
                  <span className="text-xs font-bold text-slate-900">RAB Harian</span>
                </div>
                <ArrowRight size={15} className="text-slate-400 group-hover:text-teal-600 group-hover:translate-x-1 transition" />
              </Link>

              <Link
                to="/po"
                className="group flex items-center justify-between rounded-xl border border-slate-200/80 p-3 hover:border-sky-500 hover:bg-sky-50/50 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-100 text-sky-700">
                    <FileSpreadsheet size={18} />
                  </div>
                  <span className="text-xs font-bold text-slate-900">Purchase Order</span>
                </div>
                <ArrowRight size={15} className="text-slate-400 group-hover:text-sky-600 group-hover:translate-x-1 transition" />
              </Link>

              <Link
                to="/reports"
                className="group flex items-center justify-between rounded-xl border border-slate-200/80 p-3 hover:border-purple-500 hover:bg-purple-50/50 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-100 text-purple-700">
                    <BarChart3 size={18} />
                  </div>
                  <span className="text-xs font-bold text-slate-900">Laporan</span>
                </div>
                <ArrowRight size={15} className="text-slate-400 group-hover:text-purple-600 group-hover:translate-x-1 transition" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Tabel Ringkasan Rekonsiliasi Toko */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 p-5">
          <h3 className="text-base font-bold text-slate-900">
            Rekonsiliasi per Toko
          </h3>
          <Link
            to="/reports"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 hover:text-teal-800 transition"
          >
            Lihat Laporan <ArrowRight size={14} />
          </Link>
        </div>

        {/* Petunjuk geser di mobile */}
        <div className="flex items-center justify-between px-4 py-1.5 bg-slate-50 border-b border-slate-100 text-[11px] text-slate-400 sm:hidden">
          <span>&larr; Geser tabel untuk kolom lainnya &rarr;</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm min-w-[620px]">
            <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="py-3 px-4 whitespace-nowrap">Nama Toko</th>
                <th className="py-3 px-4 whitespace-nowrap">Estimasi RAB</th>
                <th className="py-3 px-4 whitespace-nowrap">Nilai PO</th>
                <th className="py-3 px-4 whitespace-nowrap">Realisasi Nota</th>
                <th className="py-3 px-4 whitespace-nowrap">Selisih (+/-)</th>
                <th className="py-3 px-4 text-center whitespace-nowrap">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading &&
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={6} className="p-4">
                      <div className="h-5 w-full animate-pulse rounded bg-slate-100" />
                    </td>
                  </tr>
                ))}

              {!loading &&
                rows?.map((r) => {
                  const d = r.rab_total - r.nota_total;
                  return (
                    <tr key={r.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-50 text-teal-700 font-bold text-xs">
                            {r.name.slice(0, 2).toUpperCase()}
                          </div>
                          <span>{r.name}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-700">{rupiah(r.rab_total)}</td>
                      <td className="py-3.5 px-4 font-medium text-sky-800">{rupiah(r.po_total)}</td>
                      <td className="py-3.5 px-4 font-medium text-purple-800">{rupiah(r.nota_total)}</td>
                      <td
                        className={`py-3.5 px-4 font-black ${
                          r.nota_total == 0
                            ? "text-slate-400"
                            : d < 0
                            ? "text-rose-600"
                            : "text-emerald-600"
                        }`}
                      >
                        {rupiah(d)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {r.nota_total == 0 ? (
                          <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
                            Belum Ada Nota
                          </span>
                        ) : d === 0 ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                            <CheckCircle2 size={12} /> Sesuai
                          </span>
                        ) : d > 0 ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-teal-100 px-2.5 py-0.5 text-xs font-bold text-teal-800">
                            <TrendingDown size={12} /> Hemat
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-bold text-rose-800">
                            <AlertTriangle size={12} /> Over
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}

              {!loading && rows && rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    Tidak ada data transaksi.
                  </td>
                </tr>
              )}
            </tbody>
            {/* Grand Total Footer */}
            {rows && rows.length > 0 && (
              <tfoot className="bg-slate-100/80 font-bold text-slate-900 border-t-2 border-slate-200">
                <tr>
                  <td className="py-3.5 px-4 uppercase text-xs">Grand Total</td>
                  <td className="py-3.5 px-4 text-teal-900">{rupiah(rabTotal)}</td>
                  <td className="py-3.5 px-4 text-sky-900">{rupiah(poTotal)}</td>
                  <td className="py-3.5 px-4 text-purple-900">{rupiah(notaTotal)}</td>
                  <td
                    className={`py-3.5 px-4 ${
                      selisihTotal < 0 ? "text-rose-700" : "text-emerald-700"
                    }`}
                  >
                    {rupiah(selisihTotal)}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="text-xs font-semibold text-slate-500">
                      {rows.length} Toko
                    </span>
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}
