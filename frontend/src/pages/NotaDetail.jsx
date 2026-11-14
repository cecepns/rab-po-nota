import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Printer, ArrowLeft, Building2 } from "lucide-react";
import { api } from "@/utils/api";
import { API_ENDPOINTS as E } from "@/utils/endpoints";
import { request } from "@/utils/request";
import { fileUrl, rupiah } from "@/utils/format";

// Format Hari, Tanggal (Contoh: "Rabu, 11/11/2026")
const formatHariTanggal = (dateStr) => {
  if (!dateStr) return "-";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const days = [
      "Minggu",
      "Senin",
      "Selasa",
      "Rabu",
      "Kamis",
      "Jumat",
      "Sabtu",
    ];
    const dayName = days[d.getDay()];
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      return `${dayName}, ${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return `${dayName}, ${dateStr}`;
  } catch {
    return dateStr;
  }
};

export default function NotaDetail() {
  const { id } = useParams();
  const [nota, setNota] = useState(null);

  const load = async () => {
    const res = await request(() => api.get(E.NOTA.FULL(id)));
    if (res) setNota(res.data);
  };

  useEffect(() => {
    load();
  }, [id]);

  const edit = (i, k, v) =>
    setNota({
      ...nota,
      items: nota.items.map((x, n) => (n === i ? { ...x, [k]: v } : x)),
    });

  const save = async (it) => {
    if (
      await request(
        () => api.put(E.NOTA.ITEM(it.id), { qty: it.qty, price: it.price }),
        "Tersimpan"
      )
    )
      load();
  };

  if (!nota)
    return (
      <div className="mx-auto max-w-4xl space-y-4">
        <div className="h-64 animate-pulse rounded-2xl bg-white border border-slate-200" />
      </div>
    );

  const total = nota.items.reduce((s, x) => s + +x.total, 0);

  // Jumlah baris minimal agar tampilan seperti buku nota fisik
  const minRows = 8;
  const emptyRowsCount = Math.max(0, minRows - (nota.items?.length || 0));

  return (
    <div className="mx-auto max-w-4xl space-y-5 print:max-w-none print:m-0 print:p-0">
      {/* Top Action Bar (Hanya tampil di layar, tersembunyi saat cetak) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:hidden">
        <div className="flex items-center gap-3">
          <Link
            to="/nota"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition shadow-2xs"
            title="Kembali ke Daftar Nota"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Nota {nota.nota_no}
            </h1>
            <p className="text-xs text-slate-500">
              Isi qty & harga sesuai nota asli toko, lalu cetak atau simpan PDF.
            </p>
          </div>
        </div>

        <button
          onClick={() => window.print()}
          className="btn-primary flex items-center justify-center gap-2 text-xs font-bold py-2.5 px-4"
        >
          <Printer size={16} /> Cetak / Download PDF
        </button>
      </div>

      {/* Lembar Nota Kontan / Faktur Fisik */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm print:border-0 print:shadow-none print:p-0 text-slate-900 font-sans">
        {/* Header Nota: Kiri (Kop Toko) & Kanan (Hari, Tanggal, Kepada Yth) */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-3 border-b-2 border-[#7a2830]">
          {/* Sisi Kiri: Logo & Info Supplier */}
          <div className="flex items-start gap-3.5 flex-1 min-w-0">
            {nota.logo ? (
              <img
                src={fileUrl(nota.logo)}
                alt=""
                className="h-16 w-16 object-contain rounded-lg border border-slate-200 p-1 shrink-0"
              />
            ) : (
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#7a2830]/10 text-[#7a2830] shrink-0">
                <Building2 size={26} />
              </div>
            )}
            <div className="space-y-0.5 min-w-0">
              <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-[#7a2830]">
                {nota.supplier_name}
              </h2>
              {nota.supplier_address && (
                <p className="text-xs text-slate-600 leading-snug">
                  {nota.supplier_address}
                </p>
              )}
              {nota.supplier_phone && (
                <p className="text-xs text-slate-500">
                  Telp / WA: <b>{nota.supplier_phone}</b>
                </p>
              )}
            </div>
          </div>

          {/* Sisi Kanan: Tanggal & Penerima */}
          <div className="w-full sm:w-auto text-xs space-y-1 sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
            <div>
              <span className="text-slate-500">Hari, Tanggal: </span>
              <b className="text-slate-900 font-bold">
                {formatHariTanggal(nota.date)}
              </b>
            </div>
            <div>
              <span className="text-slate-500">Kepada Yth. </span>
              <b className="text-slate-900 font-bold">
                {nota.customer_name || "Pelanggan / SPPG"}
              </b>
            </div>
            {nota.customer_pic && (
              <div>
                <span className="text-slate-500">up. </span>
                <span className="font-semibold text-slate-800">
                  {nota.customer_pic}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Baris Nomor Nota & Ref PO */}
        <div className="flex items-center justify-between text-xs py-2 border-b border-[#7a2830]/30 font-semibold text-slate-700">
          <div>
            Nota No. : <b className="text-[#7a2830] font-bold">{nota.nota_no}</b>
          </div>
          {nota.po_no && (
            <div className="text-slate-500">
              Ref PO: <span className="font-medium text-slate-700">{nota.po_no}</span>
            </div>
          )}
        </div>

        {/* Tabel Rincian Barang dengan Garis Kotak Khas Nota Fisik */}
        <div className="overflow-x-auto mt-3">
          <table className="w-full text-xs border-collapse border border-[#7a2830]/40 min-w-[550px] print:min-w-full">
            <thead>
              <tr className="bg-[#7a2830] text-white font-bold text-center border-b border-[#7a2830]">
                <th className="py-2 px-2 w-10 border-r border-[#7a2830]/50">No.</th>
                <th className="py-2 px-3 text-left border-r border-[#7a2830]/50">
                  Nama Barang
                </th>
                <th className="py-2 px-2 w-20 border-r border-[#7a2830]/50">Qty</th>
                <th className="py-2 px-2 w-16 border-r border-[#7a2830]/50">Sat</th>
                <th className="py-2 px-3 w-32 text-right border-r border-[#7a2830]/50">
                  Harga Satuan (Rp.)
                </th>
                <th className="py-2 px-3 w-36 text-right">Jumlah (Rp.)</th>
              </tr>
            </thead>
            <tbody>
              {/* Item data terisi */}
              {nota.items.map((it, i) => (
                <tr
                  key={it.id}
                  className="border-b border-[#7a2830]/30 hover:bg-slate-50/50"
                >
                  <td className="py-1.5 px-2 text-center text-slate-500 border-r border-[#7a2830]/30 font-medium">
                    {i + 1}
                  </td>
                  <td className="py-1.5 px-3 font-bold text-slate-900 border-r border-[#7a2830]/30">
                    {it.item_name}
                  </td>
                  <td className="py-1 px-2 text-center border-r border-[#7a2830]/30">
                    {/* Tampilan Input di Layar */}
                    <input
                      type="number"
                      step="any"
                      min="0.01"
                      className="w-full rounded-md border border-slate-200 bg-white py-1 px-1.5 text-center font-bold text-xs [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none focus:border-[#7a2830] outline-none print:hidden"
                      value={it.qty}
                      onChange={(e) => edit(i, "qty", e.target.value)}
                      onBlur={() => save(it)}
                    />
                    {/* Tampilan Cetak */}
                    <span className="hidden print:inline font-bold">
                      {+it.qty}
                    </span>
                  </td>
                  <td className="py-1.5 px-2 text-center text-slate-600 border-r border-[#7a2830]/30">
                    {it.unit || "-"}
                  </td>
                  <td className="py-1 px-3 text-right border-r border-[#7a2830]/30">
                    {/* Tampilan Input di Layar */}
                    <input
                      type="number"
                      step="any"
                      min="0"
                      className="w-full rounded-md border border-slate-200 bg-white py-1 px-1.5 text-right font-bold text-xs [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none focus:border-[#7a2830] outline-none print:hidden"
                      value={it.price}
                      onChange={(e) => edit(i, "price", e.target.value)}
                      onBlur={() => save(it)}
                    />
                    {/* Tampilan Cetak */}
                    <span className="hidden print:inline font-semibold">
                      {rupiah(it.price).replace("Rp ", "")}
                    </span>
                  </td>
                  <td className="py-1.5 px-3 text-right font-black text-slate-900 whitespace-nowrap">
                    {rupiah(it.total).replace("Rp ", "")}
                  </td>
                </tr>
              ))}

              {/* Baris Kosong Bergaris (Menyerupai Buku Nota Fisik) */}
              {Array.from({ length: emptyRowsCount }).map((_, idx) => (
                <tr
                  key={`empty-${idx}`}
                  className="border-b border-[#7a2830]/20 h-7"
                >
                  <td className="border-r border-[#7a2830]/30"></td>
                  <td className="border-r border-[#7a2830]/30"></td>
                  <td className="border-r border-[#7a2830]/30"></td>
                  <td className="border-r border-[#7a2830]/30"></td>
                  <td className="border-r border-[#7a2830]/30"></td>
                  <td></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Bagian Bawah: Box Rekening Bank (Kiri) & Rincian Total (Kanan) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3 pt-2">
          {/* Kolom Kiri: Kotak Pembayaran Rekening Bank */}
          <div className="space-y-4">
            <div className="rounded-lg border-2 border-[#7a2830] p-3 max-w-sm bg-rose-50/20 text-xs">
              <div className="font-bold text-[#7a2830] uppercase text-[10px] tracking-wider mb-1">
                Pembayaran Via Transfer Bank :
              </div>
              <div className="font-extrabold text-sm text-slate-900">
                {nota.bank_name ? nota.bank_name.toUpperCase() : "BANK"} A/N.{" "}
                {nota.bank_account_name || nota.pic_name || nota.supplier_name}
              </div>
              <div className="text-xs font-black text-[#7a2830] mt-0.5 tracking-wide">
                No. Rek {nota.bank_account_no || "-"}
              </div>
            </div>
          </div>

          {/* Kolom Kanan: Rincian Jumlah, DP, Sisa & Terima Kasih */}
          <div className="flex flex-col items-end justify-between space-y-2">
            <div className="w-full sm:w-64 border border-[#7a2830]/40 rounded-lg overflow-hidden text-xs">
              <div className="flex justify-between items-center py-2 px-3 bg-[#7a2830]/10 border-b border-[#7a2830]/30 font-bold">
                <span className="text-slate-700">Jumlah Rp.</span>
                <span className="text-sm font-black text-[#7a2830]">
                  {rupiah(total)}
                </span>
              </div>
              <div className="flex justify-between items-center py-1.5 px-3 border-b border-[#7a2830]/20 text-slate-600">
                <span>DP Rp.</span>
                <span className="font-medium">-</span>
              </div>
              <div className="flex justify-between items-center py-1.5 px-3 text-slate-600">
                <span>Sisa Rp.</span>
                <span className="font-medium">-</span>
              </div>
            </div>

            <div className="text-right italic font-serif text-slate-500 text-xs pr-2">
              Terima Kasih
            </div>
          </div>
        </div>

        {/* Blok Tanda Tangan: Tanda Terima (Kiri) & Hormat Kami (Kanan) */}
        <div className="flex justify-between items-end mt-8 pt-4 text-xs font-semibold">
          {/* Tanda Terima (Penerima) */}
          <div className="text-center w-48">
            <p className="text-slate-800 font-bold mb-16">Tanda Terima,</p>
            <div className="border-b border-dotted border-slate-700 mx-auto w-36" />
          </div>

          {/* Hormat Kami (Toko / Supplier) */}
          <div className="text-center w-52">
            <p className="text-slate-800 font-bold">Hormat Kami,</p>
            <div className="h-16 flex items-center justify-center my-1">
              {nota.signature ? (
                <img
                  src={fileUrl(nota.signature)}
                  alt="ttd"
                  className="max-h-16 max-w-36 object-contain"
                />
              ) : (
                <div className="h-16" />
              )}
            </div>
            <div className="border-b border-dotted border-slate-700 mx-auto w-40" />
            <p className="text-[11px] font-bold text-slate-900 mt-1 uppercase">
              {nota.supplier_name}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
