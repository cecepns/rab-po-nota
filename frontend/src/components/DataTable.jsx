import { useState, Fragment } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Inbox,
  Search,
  Table as TableIcon,
  LayoutGrid,
} from "lucide-react";

const pageList = (p, t) => {
  const s = Math.max(1, Math.min(p - 2, t - 4)),
    e = Math.min(t, s + 4);
  return Array.from({ length: e - s + 1 }, (_, i) => s + i);
};

export default function DataTable({ columns, paged, actions, renderExpandedRow }) {
  const {
    rows,
    pagination: pg,
    loading,
    error,
    search,
    setSearch,
    setPage,
    limit,
    setLimit,
    reload,
  } = paged;

  // Mode tampilan: "table" atau "card"
  const [viewMode, setViewMode] = useState("table");

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
      {/* Toolbar: Search, View Switcher & Limit */}
      <div className="flex flex-col gap-2.5 border-b border-slate-100 p-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:w-72">
          <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
          <input
            className="input !pl-10 !py-2 text-xs"
            placeholder="Cari..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-2">
          {/* Switcher Tampilan (Tabel / Kartu) untuk kenyamanan di mobile */}
          <div className="flex rounded-xl bg-slate-100 p-0.5 border border-slate-200/60">
            <button
              type="button"
              onClick={() => setViewMode("table")}
              title="Tampilan Tabel"
              className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ${
                viewMode === "table"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <TableIcon size={14} />
              <span className="hidden xs:inline">Tabel</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("card")}
              title="Tampilan Kartu"
              className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ${
                viewMode === "card"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <LayoutGrid size={14} />
              <span className="hidden xs:inline">Kartu</span>
            </button>
          </div>

          <select
            className="input !py-1.5 text-xs !w-28"
            value={limit}
            onChange={(e) => setLimit(+e.target.value)}
          >
            {[10, 25, 50, 100].map((n) => (
              <option key={n} value={n}>
                {n} / hal
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* TAMPILAN 1: TABEL RESPONSIF DENGAN STICKY AKSI */}
      {viewMode === "table" && (
        <div>
          {/* Petunjuk geser di mobile */}
          <div className="flex items-center justify-between px-4 py-1.5 bg-slate-50 border-b border-slate-100 text-[11px] text-slate-400 sm:hidden">
            <span>&larr; Geser tabel untuk kolom lainnya &rarr;</span>
          </div>

          <div className="overflow-x-auto relative">
            <table className="w-full text-left text-sm min-w-[650px] divide-y divide-slate-100">
              <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="py-3 px-3.5 text-center w-12 whitespace-nowrap">No</th>
                  {columns.map((c) => (
                    <th key={c.key} className="py-3 px-3.5 whitespace-nowrap">
                      {c.label}
                    </th>
                  ))}
                  {actions && (
                    <th className="py-3 px-3.5 text-right sticky right-0 z-10 bg-slate-50 shadow-[-6px_0_10px_-2px_rgba(0,0,0,0.06)] whitespace-nowrap">
                      Aksi
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading &&
                  Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i}>
                      <td colSpan={columns.length + 2} className="px-4 py-3">
                        <div className="h-5 animate-pulse rounded bg-slate-100" />
                      </td>
                    </tr>
                  ))}

                {!loading && error && (
                  <tr>
                    <td colSpan={columns.length + 2} className="p-8 text-center text-rose-600">
                      {error}{" "}
                      <button className="underline font-bold ml-1" onClick={reload}>
                        Coba lagi
                      </button>
                    </td>
                  </tr>
                )}

                {!loading && !error && !rows.length && (
                  <tr>
                    <td
                      colSpan={columns.length + 2}
                      className="p-10 text-center text-slate-400"
                    >
                      <Inbox className="mx-auto mb-2 text-slate-300" size={32} />
                      Belum ada data
                    </td>
                  </tr>
                )}

                {!loading &&
                  !error &&
                  rows.map((r, i) => (
                    <Fragment key={r.id}>
                      <tr
                        className="group hover:bg-slate-50/80 transition-colors"
                      >
                        <td className="py-3 px-3.5 text-center text-xs text-slate-400 font-medium whitespace-nowrap">
                          {(pg.page - 1) * pg.limit + i + 1}
                        </td>
                        {columns.map((c) => (
                          <td key={c.key} className="py-3 px-3.5 whitespace-nowrap">
                            {c.render ? c.render(r) : r[c.key] ?? "-"}
                          </td>
                        ))}
                        {actions && (
                          <td className="py-3 px-3.5 text-right sticky right-0 z-10 bg-white group-hover:bg-slate-50 transition-colors shadow-[-6px_0_10px_-2px_rgba(0,0,0,0.06)] whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              {actions(r)}
                            </div>
                          </td>
                        )}
                      </tr>
                      {renderExpandedRow && renderExpandedRow(r) && (
                        <tr className="bg-slate-50/60 border-t border-b border-slate-200/80">
                          <td colSpan={columns.length + (actions ? 2 : 1)} className="p-0">
                            {renderExpandedRow(r)}
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAMPILAN 2: KARTU MOBILE (Responsif tanpa perlu geser horizontal) */}
      {viewMode === "card" && (
        <div className="p-3 sm:p-4">
          {loading && (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-28 animate-pulse rounded-xl bg-slate-100" />
              ))}
            </div>
          )}

          {!loading && error && (
            <div className="p-8 text-center text-rose-600">
              {error}{" "}
              <button className="underline font-bold ml-1" onClick={reload}>
                Coba lagi
              </button>
            </div>
          )}

          {!loading && !error && !rows.length && (
            <div className="p-10 text-center text-slate-400">
              <Inbox className="mx-auto mb-2 text-slate-300" size={32} />
              Belum ada data
            </div>
          )}

          {!loading && !error && rows.length > 0 && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {rows.map((r, i) => (
                <div
                  key={r.id}
                  className="rounded-xl border border-slate-200/90 bg-slate-50/50 p-4 space-y-3 shadow-2xs hover:bg-slate-50 transition"
                >
                  <div className="flex items-start justify-between gap-2 border-b border-slate-200/60 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-slate-200 text-xs font-bold text-slate-700">
                        {(pg.page - 1) * pg.limit + i + 1}
                      </span>
                      <div className="font-bold text-slate-900 text-sm">
                        {columns[0]?.render ? columns[0].render(r) : r[columns[0]?.key] ?? "-"}
                      </div>
                    </div>
                  </div>

                  {/* Kolom lainnya */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {columns.slice(1).map((c) => (
                      <div key={c.key} className="space-y-0.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
                          {c.label}
                        </span>
                        <div className="font-medium text-slate-800">
                          {c.render ? c.render(r) : r[c.key] ?? "-"}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Expanded Row Content in Card */}
                  {renderExpandedRow && renderExpandedRow(r) && (
                    <div className="pt-2 border-t border-slate-200/60">
                      {renderExpandedRow(r)}
                    </div>
                  )}

                  {/* Actions Footer */}
                  {actions && (
                    <div className="pt-2 border-t border-slate-200/60 flex items-center justify-end gap-2">
                      {actions(r)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Pagination Footer */}
      <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-100 p-3.5 text-xs text-slate-600 sm:flex-row">
        <span>
          Menampilkan {rows.length} dari <b>{pg.total}</b> data
        </span>

        <div className="flex items-center gap-1">
          <button
            className="btn-ghost !px-2.5 !py-1.5"
            disabled={pg.page <= 1}
            onClick={() => setPage(pg.page - 1)}
            aria-label="Halaman sebelumnya"
          >
            <ChevronLeft size={16} />
          </button>

          {/* Versi Mobile: Teks halaman sederhana */}
          <span className="px-2 font-semibold text-slate-700 sm:hidden">
            {pg.page} / {pg.totalPages || 1}
          </span>

          {/* Versi Desktop: Tombol nomor halaman */}
          <div className="hidden sm:flex items-center gap-1">
            {pageList(pg.page, pg.totalPages).map((n) => (
              <button
                key={n}
                onClick={() => setPage(n)}
                className={`h-8 w-8 rounded-lg text-xs font-bold transition ${
                  n === pg.page
                    ? "bg-teal-700 text-white shadow-xs"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                {n}
              </button>
            ))}
          </div>

          <button
            className="btn-ghost !px-2.5 !py-1.5"
            disabled={pg.page >= pg.totalPages}
            onClick={() => setPage(pg.page + 1)}
            aria-label="Halaman selanjutnya"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
