import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { Printer, ArrowLeft, Building2, Download, Palette } from "lucide-react";
import html2pdf from "html2pdf.js";
import { api } from "@/utils/api";
import { API_ENDPOINTS as E } from "@/utils/endpoints";
import { request } from "@/utils/request";
import { fileUrl, rupiah } from "@/utils/format";

// Pilihan tema warna nota (Default: Hitam/Slate Netral yang universal untuk semua toko)
const NOTA_THEMES = {
  slate: {
    id: "slate",
    name: "Hitam Netral",
    colorHex: "#1e293b",
    textClass: "text-slate-900",
    headerBg: "bg-slate-900",
    headerText: "text-white",
    borderColor: "border-slate-300",
    borderHeader: "border-slate-900",
    bankBox: "border-2 border-slate-900 bg-slate-50/80 text-slate-900",
    bankTitle: "text-slate-700",
    bankRek: "text-slate-900",
    totalBoxHeader: "bg-slate-100 border-slate-300",
    totalText: "text-slate-900",
  },
  navy: {
    id: "navy",
    name: "Biru Toko",
    colorHex: "#1e3a8a",
    textClass: "text-blue-950",
    headerBg: "bg-blue-900",
    headerText: "text-white",
    borderColor: "border-blue-200",
    borderHeader: "border-blue-900",
    bankBox: "border-2 border-blue-900 bg-blue-50/40 text-blue-950",
    bankTitle: "text-blue-800",
    bankRek: "text-blue-900",
    totalBoxHeader: "bg-blue-50 border-blue-200",
    totalText: "text-blue-900",
  },
  teal: {
    id: "teal",
    name: "Hijau Pangan",
    colorHex: "#0f766e",
    textClass: "text-teal-950",
    headerBg: "bg-teal-800",
    headerText: "text-white",
    borderColor: "border-teal-200",
    borderHeader: "border-teal-800",
    bankBox: "border-2 border-teal-800 bg-teal-50/40 text-teal-950",
    bankTitle: "text-teal-800",
    bankRek: "text-teal-900",
    totalBoxHeader: "bg-teal-50 border-teal-200",
    totalText: "text-teal-900",
  },
  maroon: {
    id: "maroon",
    name: "Merah Marun",
    colorHex: "#7a2830",
    textClass: "text-[#7a2830]",
    headerBg: "bg-[#7a2830]",
    headerText: "text-white",
    borderColor: "border-[#7a2830]/30",
    borderHeader: "border-[#7a2830]",
    bankBox: "border-2 border-[#7a2830] bg-rose-50/30 text-slate-900",
    bankTitle: "text-[#7a2830]",
    bankRek: "text-[#7a2830]",
    totalBoxHeader: "bg-[#7a2830]/10 border-[#7a2830]/30",
    totalText: "text-[#7a2830]",
  },
};

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
  const notaRef = useRef(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [themeKey, setThemeKey] = useState("slate");

  const load = async () => {
    const res = await request(() => api.get(E.NOTA.FULL(id)));
    if (res) setNota(res.data);
  };

  useEffect(() => {
    load();
  }, [id]);

  // Ingat preferensi tema warna per supplier di browser
  useEffect(() => {
    if (nota?.supplier_id) {
      const savedTheme = localStorage.getItem(`nota_theme_${nota.supplier_id}`);
      if (savedTheme && NOTA_THEMES[savedTheme]) {
        setThemeKey(savedTheme);
      } else {
        setThemeKey("slate"); // Default universal: Hitam Netral
      }
    }
  }, [nota?.supplier_id]);

  const changeTheme = (key) => {
    setThemeKey(key);
    if (nota?.supplier_id) {
      localStorage.setItem(`nota_theme_${nota.supplier_id}`, key);
    }
  };

  const theme = NOTA_THEMES[themeKey] || NOTA_THEMES.slate;

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

  // Fungsi Export / Download PDF menggunakan library html2pdf
  const handleDownloadPDF = async () => {
    if (!notaRef.current || !nota) return;
    setIsGeneratingPdf(true);

    setTimeout(async () => {
      try {
        const cleanNo = (nota.nota_no || "nota").replace(/[\/\\:]/g, "_");
        const element = notaRef.current;
        const opt = {
          margin: [6, 8, 6, 8],
          filename: `Nota_${cleanNo}.pdf`,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: {
            scale: 2,
            useCORS: true,
            logging: false,
            letterRendering: true,
          },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        };

        await html2pdf().set(opt).from(element).save();
      } catch (err) {
        console.error("Gagal export PDF:", err);
        alert("Gagal mengunduh PDF. Mengalihkan ke dialog cetak browser...");
        window.print();
      } finally {
        setIsGeneratingPdf(false);
      }
    }, 150);
  };

  if (!nota)
    return (
      <div className="mx-auto max-w-4xl space-y-4">
        <div className="h-64 animate-pulse rounded-2xl bg-white border border-slate-200" />
      </div>
    );

  const total = nota.items.reduce((s, x) => s + +x.total, 0);

  // Jumlah baris minimal agar tampilan menyerupai buku nota fisik asli
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
              Isi qty & harga sesuai nota asli toko, lalu download PDF atau cetak.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Pilihan Warna Tema Nota (Dapat disesuaikan per toko) */}
          <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white p-1 shadow-2xs">
            <span className="text-[11px] font-semibold text-slate-500 pl-1.5 pr-0.5 flex items-center gap-1">
              <Palette size={13} /> Tema:
            </span>
            {Object.values(NOTA_THEMES).map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => changeTheme(t.id)}
                title={t.name}
                className={`flex h-6 items-center gap-1 rounded-lg px-2 text-[11px] font-bold transition ${
                  themeKey === t.id
                    ? "bg-slate-900 text-white shadow-xs"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: t.colorHex }}
                />
                <span className="hidden md:inline">{t.name}</span>
              </button>
            ))}
          </div>

          {/* Tombol Download PDF dengan library html2pdf */}
          <button
            onClick={handleDownloadPDF}
            disabled={isGeneratingPdf}
            className="btn-primary flex items-center justify-center gap-2 text-xs font-bold py-2 px-3.5 shadow-sm"
            title="Download PDF secara langsung"
          >
            <Download size={15} />
            {isGeneratingPdf ? "Menyiapkan..." : "Download PDF"}
          </button>

          {/* Tombol Cetak Browser */}
          <button
            onClick={() => window.print()}
            className="btn-ghost flex items-center justify-center gap-2 text-xs font-semibold py-2 px-3"
            title="Cetak langsung menggunakan printer"
          >
            <Printer size={15} /> Cetak
          </button>
        </div>
      </div>

      {/* Lembar Nota Kontan / Faktur Fisik */}
      <div
        ref={notaRef}
        className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm print:border-0 print:shadow-none print:p-0 text-slate-900 font-sans"
      >
        {/* Header Nota: Kiri (Kop Toko) & Kanan (Hari, Tanggal, Kepada Yth) */}
        <div
          className={`flex flex-col sm:flex-row justify-between items-start gap-4 pb-3 border-b-2 ${theme.borderHeader}`}
        >
          {/* Sisi Kiri: Logo & Info Supplier */}
          <div className="flex items-start gap-3.5 flex-1 min-w-0">
            {nota.logo ? (
              <img
                src={fileUrl(nota.logo)}
                crossOrigin="anonymous"
                alt=""
                className="h-16 w-16 object-contain rounded-lg border border-slate-200 p-1 shrink-0"
              />
            ) : (
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-slate-100 text-slate-800 shrink-0">
                <Building2 size={26} />
              </div>
            )}
            <div className="space-y-0.5 min-w-0">
              <h2
                className={`text-xl sm:text-2xl font-black uppercase tracking-tight ${theme.textClass}`}
              >
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
        <div
          className={`flex items-center justify-between text-xs py-2 border-b ${theme.borderColor} font-semibold text-slate-700`}
        >
          <div>
            Nota No. : <b className={`${theme.textClass} font-bold`}>{nota.nota_no}</b>
          </div>
          {nota.po_no && (
            <div className="text-slate-500">
              Ref PO: <span className="font-medium text-slate-700">{nota.po_no}</span>
            </div>
          )}
        </div>

        {/* Tabel Rincian Barang dengan Garis Kotak Khas Nota Fisik */}
        <div className="overflow-x-auto mt-3">
          <table
            className={`w-full text-xs border-collapse border ${theme.borderColor} min-w-[550px] print:min-w-full`}
          >
            <thead>
              <tr
                className={`${theme.headerBg} ${theme.headerText} font-bold text-center border-b ${theme.borderHeader}`}
              >
                <th className="py-2 px-2 w-10 border-r border-white/20">No.</th>
                <th className="py-2 px-3 text-left border-r border-white/20">
                  Nama Barang
                </th>
                <th className="py-2 px-2 w-20 border-r border-white/20">Qty</th>
                <th className="py-2 px-2 w-16 border-r border-white/20">Sat</th>
                <th className="py-2 px-3 w-32 text-right border-r border-white/20">
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
                  className={`border-b ${theme.borderColor} hover:bg-slate-50/50`}
                >
                  <td
                    className={`py-1.5 px-2 text-center text-slate-500 border-r ${theme.borderColor} font-medium`}
                  >
                    {i + 1}
                  </td>
                  <td
                    className={`py-1.5 px-3 font-bold text-slate-900 border-r ${theme.borderColor}`}
                  >
                    {it.item_name}
                  </td>
                  <td
                    className={`py-1 px-2 text-center border-r ${theme.borderColor}`}
                  >
                    {/* Tampilan saat generate PDF */}
                    {isGeneratingPdf ? (
                      <span className="font-bold text-xs">{+it.qty}</span>
                    ) : (
                      <>
                        {/* Tampilan Input di Layar */}
                        <input
                          type="number"
                          step="any"
                          min="0.01"
                          className={`w-full rounded-md border border-slate-200 bg-white py-1 px-1.5 text-center font-bold text-xs [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none focus:${theme.borderHeader} outline-none print:hidden`}
                          value={it.qty}
                          onChange={(e) => edit(i, "qty", e.target.value)}
                          onBlur={() => save(it)}
                        />
                        {/* Tampilan Cetak Browser */}
                        <span className="hidden print:inline font-bold">
                          {+it.qty}
                        </span>
                      </>
                    )}
                  </td>
                  <td
                    className={`py-1.5 px-2 text-center text-slate-600 border-r ${theme.borderColor}`}
                  >
                    {it.unit || "-"}
                  </td>
                  <td
                    className={`py-1 px-3 text-right border-r ${theme.borderColor}`}
                  >
                    {/* Tampilan saat generate PDF */}
                    {isGeneratingPdf ? (
                      <span className="font-semibold text-xs">
                        {rupiah(it.price).replace("Rp ", "")}
                      </span>
                    ) : (
                      <>
                        {/* Tampilan Input di Layar */}
                        <input
                          type="number"
                          step="any"
                          min="0"
                          className={`w-full rounded-md border border-slate-200 bg-white py-1 px-1.5 text-right font-bold text-xs [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none focus:${theme.borderHeader} outline-none print:hidden`}
                          value={it.price}
                          onChange={(e) => edit(i, "price", e.target.value)}
                          onBlur={() => save(it)}
                        />
                        {/* Tampilan Cetak Browser */}
                        <span className="hidden print:inline font-semibold">
                          {rupiah(it.price).replace("Rp ", "")}
                        </span>
                      </>
                    )}
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
                  className={`border-b ${theme.borderColor} h-7`}
                >
                  <td className={`border-r ${theme.borderColor}`}></td>
                  <td className={`border-r ${theme.borderColor}`}></td>
                  <td className={`border-r ${theme.borderColor}`}></td>
                  <td className={`border-r ${theme.borderColor}`}></td>
                  <td className={`border-r ${theme.borderColor}`}></td>
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
            <div className={`rounded-lg ${theme.bankBox} p-3 max-w-sm text-xs`}>
              <div
                className={`font-bold ${theme.bankTitle} uppercase text-[10px] tracking-wider mb-1`}
              >
                Pembayaran Via Transfer Bank :
              </div>
              <div className="font-extrabold text-sm text-slate-900">
                {nota.bank_name ? nota.bank_name.toUpperCase() : "BANK"} A/N.{" "}
                {nota.bank_account_name || nota.pic_name || nota.supplier_name}
              </div>
              <div
                className={`text-xs font-black ${theme.bankRek} mt-0.5 tracking-wide`}
              >
                No. Rek {nota.bank_account_no || "-"}
              </div>
            </div>
          </div>

          {/* Kolom Kanan: Rincian Jumlah, DP, Sisa & Terima Kasih */}
          <div className="flex flex-col items-end justify-between space-y-2">
            <div
              className={`w-full sm:w-64 border ${theme.borderColor} rounded-lg overflow-hidden text-xs`}
            >
              <div
                className={`flex justify-between items-center py-2 px-3 ${theme.totalBoxHeader} border-b ${theme.borderColor} font-bold`}
              >
                <span className="text-slate-700">Jumlah Rp.</span>
                <span className={`text-sm font-black ${theme.totalText}`}>
                  {rupiah(total)}
                </span>
              </div>
              <div
                className={`flex justify-between items-center py-1.5 px-3 border-b ${theme.borderColor} text-slate-600`}
              >
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
                  crossOrigin="anonymous"
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
