import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { Printer, ArrowLeft, Building2, Download, Palette, Pipette } from "lucide-react";
import html2pdf from "html2pdf.js";
import { api } from "@/utils/api";
import { API_ENDPOINTS as E } from "@/utils/endpoints";
import { request } from "@/utils/request";
import { fileUrl, rupiah } from "@/utils/format";

// Preset tema warna nota asli berdasarkan bukti fisik toko / sembako / daging
export const THEME_PRESETS = [
  {
    id: "green",
    name: "Hijau Toko",
    colorHex: "#23943d",
    desc: "Toko Rangga / Sayuran & Sembako",
  },
  {
    id: "orange",
    name: "Oranye Sembako",
    colorHex: "#e07a1e",
    desc: "Toko Farsyha Kencana",
  },
  {
    id: "terracotta",
    name: "Cokelat Bata",
    colorHex: "#b05246",
    desc: "Tahu Gemoy",
  },
  {
    id: "coral",
    name: "Merah Bata",
    colorHex: "#be4b55",
    desc: "Toko Gemoy",
  },
  {
    id: "maroon",
    name: "Merah Marun",
    colorHex: "#7a2830",
    desc: "Sumber Daging",
  },
  {
    id: "navy",
    name: "Biru Faktur",
    colorHex: "#1e40af",
    desc: "Toko Bahan Bangunan / Elektronik",
  },
  {
    id: "slate",
    name: "Hitam Netral",
    colorHex: "#1e293b",
    desc: "Standar Universal",
  },
];

// Helper kalkulasi tema warna dinamis dengan inline style agar tahan cetak browser & html2pdf
const getTheme = (colorHex = "#1e293b") => {
  const hex = colorHex || "#1e293b";
  return {
    colorHex: hex,
    text: { color: hex },
    headerTr: {
      backgroundColor: hex,
      color: "#ffffff",
      WebkitPrintColorAdjust: "exact",
      printColorAdjust: "exact",
    },
    headerTh: {
      backgroundColor: hex,
      color: "#ffffff",
      borderColor: "rgba(255, 255, 255, 0.3)",
      WebkitPrintColorAdjust: "exact",
      printColorAdjust: "exact",
    },
    borderSolid: {
      borderColor: hex,
    },
    borderGrid: {
      borderColor: `${hex}55`, // ~33% opacity untuk grid tabel
    },
    bankBox: {
      borderColor: hex,
      backgroundColor: `${hex}0a`, // 4% tint
      color: "#0f172a",
      WebkitPrintColorAdjust: "exact",
      printColorAdjust: "exact",
    },
    bankTitle: {
      color: hex,
    },
    totalHeader: {
      backgroundColor: `${hex}14`, // 8% tint
      borderColor: `${hex}45`,
      WebkitPrintColorAdjust: "exact",
      printColorAdjust: "exact",
    },
    totalText: {
      color: hex,
    },
  };
};

// Helper konversi URL gambar ke Base64 Data URL agar html2canvas tidak error kena CORS / tainted canvas
const toDataUrl = async (url) => {
  if (!url) return null;
  if (url.startsWith("data:")) return url;
  try {
    const res = await fetch(url, { mode: "cors" });
    if (!res.ok) return url;
    const blob = await res.blob();
    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = () => resolve(url);
      reader.readAsDataURL(blob);
    });
  } catch {
    return url;
  }
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
  const [currentColor, setCurrentColor] = useState("#1e293b");
  const [logoDataUrl, setLogoDataUrl] = useState(null);
  const [sigDataUrl, setSigDataUrl] = useState(null);

  const load = async () => {
    const res = await request(() => api.get(E.NOTA.FULL(id)));
    if (res?.data) {
      setNota(res.data);
      // Preload gambar ke Base64 Data URL untuk html2pdf yang anti-error
      if (res.data.logo) {
        toDataUrl(fileUrl(res.data.logo)).then((d) => setLogoDataUrl(d));
      }
      if (res.data.signature) {
        toDataUrl(fileUrl(res.data.signature)).then((d) => setSigDataUrl(d));
      }
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  // Ingat preferensi tema warna per supplier di browser
  useEffect(() => {
    if (nota?.supplier_id) {
      const savedColor = localStorage.getItem(`nota_color_${nota.supplier_id}`);
      if (savedColor) {
        setCurrentColor(savedColor);
      } else {
        // Cek nama supplier untuk saran warna bawaan jika belum pernah diatur
        const sName = (nota.supplier_name || "").toLowerCase();
        if (sName.includes("rangga") || sName.includes("sayur")) {
          setCurrentColor("#23943d"); // Hijau
        } else if (sName.includes("farsyha") || sName.includes("sembako")) {
          setCurrentColor("#e07a1e"); // Oranye
        } else if (sName.includes("gemoy") || sName.includes("tahu")) {
          setCurrentColor("#b05246"); // Terakota
        } else if (sName.includes("daging")) {
          setCurrentColor("#7a2830"); // Marun
        } else {
          setCurrentColor("#1e293b"); // Default Netral
        }
      }
    }
  }, [nota?.supplier_id, nota?.supplier_name]);

  const changeColor = (hex) => {
    setCurrentColor(hex);
    if (nota?.supplier_id) {
      localStorage.setItem(`nota_color_${nota.supplier_id}`, hex);
    }
  };

  const theme = getTheme(currentColor);

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

  // Fungsi Export / Download PDF menggunakan html2pdf dengan penanganan error lengkap
  const handleDownloadPDF = async () => {
    if (!notaRef.current || !nota) return;
    setIsGeneratingPdf(true);

    // Beri jeda kecil agar React render state preview tanpa input
    setTimeout(async () => {
      try {
        let pdfFn = html2pdf;
        if (typeof pdfFn !== "function" && pdfFn?.default) {
          pdfFn = pdfFn.default;
        }
        if (typeof pdfFn !== "function" && window.html2pdf) {
          pdfFn = window.html2pdf;
        }
        if (typeof pdfFn !== "function") {
          throw new Error("Modul html2pdf tidak tersedia.");
        }

        const cleanNo = (nota.nota_no || "nota").replace(/[\/\\:]/g, "_");
        const element = notaRef.current;

        const opt = {
          margin: [6, 8, 6, 8],
          filename: `Nota_${cleanNo}.pdf`,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            logging: false,
            scrollY: 0,
            scrollX: 0,
          },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
          pagebreak: { mode: ["avoid-all", "css", "legacy"] },
        };

        await pdfFn().set(opt).from(element).save();
      } catch (err) {
        console.error("Gagal export PDF html2pdf:", err);
        // Fallback langsung buka Cetak Browser (di mana sudah kita buat 1 halaman pas & warna solid)
        if (
          confirm(
            "Pembuatan PDF otomatis sedang terhalang sistem browser. Buka Cetak Browser untuk 'Simpan sebagai PDF' (1 halaman rapi & warna pas)?"
          )
        ) {
          window.print();
        }
      } finally {
        setIsGeneratingPdf(false);
      }
    }, 120);
  };

  if (!nota)
    return (
      <div className="mx-auto max-w-4xl space-y-4">
        <div className="h-64 animate-pulse rounded-2xl bg-white border border-slate-200" />
      </div>
    );

  const total = nota.items.reduce((s, x) => s + +x.total, 0);

  // Jumlah baris minimal 5 agar pas 1 halaman A4 dan tidak tumpah ke page 2
  const minRows = 5;
  const emptyRowsCount = Math.max(0, minRows - (nota.items?.length || 0));

  return (
    <div className="mx-auto max-w-4xl space-y-4 print:max-w-none print:m-0 print:p-0">
      {/* CSS Khusus Cetak Browser: Menjamin 1 Halaman A4 & Memaksa Warna Header Tidak Transparan */}
      <style>{`
        @page {
          size: A4 portrait;
          margin: 7mm 9mm 7mm 9mm;
        }
        @media print {
          html, body {
            background: #ffffff !important;
            margin: 0 !important;
            padding: 0 !important;
            font-size: 11px !important;
          }
          *, *::before, *::after {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          .nota-paper {
            box-shadow: none !important;
            border: none !important;
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }
          .signature-block {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
            page-break-after: avoid !important;
          }
        }
      `}</style>

      {/* Top Action Bar (Hanya tampil di layar monitor) */}
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
              Sesuaikan warna nota toko, lalu download PDF atau cetak 1 halaman.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Pilihan Warna Tema Nota Sesuai Nota Fisik */}
          <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white p-1 shadow-2xs">
            <span className="text-[11px] font-semibold text-slate-500 pl-1.5 pr-0.5 flex items-center gap-1">
              <Palette size={13} /> Warna:
            </span>
            {THEME_PRESETS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => changeColor(t.colorHex)}
                title={`${t.name} (${t.desc})`}
                className={`relative flex h-6 w-6 items-center justify-center rounded-lg transition ${currentColor.toLowerCase() === t.colorHex.toLowerCase()
                    ? "ring-2 ring-slate-800 ring-offset-1 scale-110 shadow-xs"
                    : "hover:opacity-80"
                  }`}
                style={{ backgroundColor: t.colorHex }}
              >
                {currentColor.toLowerCase() === t.colorHex.toLowerCase() && (
                  <span className="h-1.5 w-1.5 rounded-full bg-white" />
                )}
              </button>
            ))}

            {/* Color Picker Kustom Bebas */}
            <label
              title="Pilih Warna Bebas (Color Picker)"
              className="relative flex h-6 w-6 cursor-pointer items-center justify-center rounded-lg border border-slate-300 bg-slate-50 hover:bg-slate-100 transition"
            >
              <Pipette size={12} className="text-slate-700" />
              <input
                type="color"
                value={currentColor}
                onChange={(e) => changeColor(e.target.value)}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
            </label>
          </div>

          {/* Tombol Download PDF */}
          {/* <button
            onClick={handleDownloadPDF}
            disabled={isGeneratingPdf}
            className="btn-primary flex items-center justify-center gap-2 text-xs font-bold py-2 px-3.5 shadow-sm"
            title="Download file PDF langsung"
          >
            <Download size={15} />
            {isGeneratingPdf ? "Menyiapkan..." : "Download PDF"}
          </button> */}

          {/* Tombol Cetak Browser */}
          <button
            onClick={() => window.print()}
            className="btn-ghost flex items-center justify-center gap-2 text-xs font-semibold py-2 px-3"
            title="Cetak langsung ke printer atau Simpan PDF (1 Halaman Pas)"
          >
            <Printer size={15} /> Cetak
          </button>
        </div>
      </div>

      {/* Lembar Nota Kontan / Faktur Fisik */}
      <div
        ref={notaRef}
        className="nota-paper rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm text-slate-900 font-sans print:border-0 print:shadow-none print:p-0 print:m-0"
      >
        {/* Header Nota: Kiri (Kop Toko) & Kanan (Hari, Tanggal, Kepada Yth) */}
        <div
          className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-3 border-b-2"
          style={theme.borderSolid}
        >
          {/* Sisi Kiri: Logo & Info Toko */}
          <div className="flex items-start gap-3.5 flex-1 min-w-0">
            {nota.logo ? (
              <img
                src={logoDataUrl || fileUrl(nota.logo)}
                crossOrigin="anonymous"
                alt=""
                className="h-14 w-14 object-contain rounded-lg border border-slate-200 p-1 shrink-0"
              />
            ) : (
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-slate-100 text-slate-800 shrink-0">
                <Building2 size={26} />
              </div>
            )}
            <div className="space-y-0.5 min-w-0">
              <h2
                className="text-xl sm:text-2xl font-black uppercase tracking-tight"
                style={theme.text}
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
          className="flex items-center justify-between text-xs py-2 border-b font-semibold text-slate-700"
          style={theme.borderGrid}
        >
          <div>
            Nota No. : <b style={theme.text}>{nota.nota_no}</b>
          </div>
          {nota.po_no && (
            <div className="text-slate-500">
              Ref PO: <span className="font-medium text-slate-700">{nota.po_no}</span>
            </div>
          )}
        </div>

        {/* Tabel Rincian Barang dengan Garis Kotak Khas Nota Fisik */}
        <div className="overflow-x-auto mt-2">
          <table
            className="w-full text-xs border-collapse border min-w-[550px] print:min-w-full"
            style={theme.borderSolid}
          >
            <thead>
              <tr style={theme.headerTr} className="font-bold text-center">
                <th style={theme.headerTh} className="py-2 px-2 w-10 border-r">
                  No.
                </th>
                <th style={theme.headerTh} className="py-2 px-3 text-left border-r">
                  Nama Barang
                </th>
                <th style={theme.headerTh} className="py-2 px-2 w-20 border-r">
                  Qty
                </th>
                <th style={theme.headerTh} className="py-2 px-2 w-16 border-r">
                  Sat
                </th>
                <th style={theme.headerTh} className="py-2 px-3 w-32 text-right border-r">
                  Harga Satuan (Rp.)
                </th>
                <th style={theme.headerTh} className="py-2 px-3 w-36 text-right">
                  Jumlah (Rp.)
                </th>
              </tr>
            </thead>
            <tbody>
              {/* Item data terisi */}
              {nota.items.map((it, i) => (
                <tr
                  key={it.id}
                  className="border-b hover:bg-slate-50/50"
                  style={theme.borderGrid}
                >
                  <td
                    className="py-1.5 px-2 text-center text-slate-500 border-r font-medium"
                    style={theme.borderGrid}
                  >
                    {i + 1}
                  </td>
                  <td
                    className="py-1.5 px-3 font-bold text-slate-900 border-r"
                    style={theme.borderGrid}
                  >
                    {it.item_name}
                  </td>
                  <td
                    className="py-1 px-2 text-center border-r"
                    style={theme.borderGrid}
                  >
                    {isGeneratingPdf ? (
                      <span className="font-bold text-xs">{+it.qty}</span>
                    ) : (
                      <>
                        <input
                          type="number"
                          step="any"
                          min="0.01"
                          className="w-full rounded-md border border-slate-200 bg-white py-1 px-1.5 text-center font-bold text-xs [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none focus:border-slate-800 outline-none print:hidden"
                          value={it.qty}
                          onChange={(e) => edit(i, "qty", e.target.value)}
                          onBlur={() => save(it)}
                        />
                        <span className="hidden print:inline font-bold">
                          {+it.qty}
                        </span>
                      </>
                    )}
                  </td>
                  <td
                    className="py-1.5 px-2 text-center text-slate-600 border-r"
                    style={theme.borderGrid}
                  >
                    {it.unit || "-"}
                  </td>
                  <td
                    className="py-1 px-3 text-right border-r"
                    style={theme.borderGrid}
                  >
                    {isGeneratingPdf ? (
                      <span className="font-semibold text-xs">
                        {rupiah(it.price).replace("Rp ", "")}
                      </span>
                    ) : (
                      <>
                        <input
                          type="number"
                          step="any"
                          min="0"
                          className="w-full rounded-md border border-slate-200 bg-white py-1 px-1.5 text-right font-bold text-xs [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none focus:border-slate-800 outline-none print:hidden"
                          value={it.price}
                          onChange={(e) => edit(i, "price", e.target.value)}
                          onBlur={() => save(it)}
                        />
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
                  className="border-b h-6 print:h-5"
                  style={theme.borderGrid}
                >
                  <td className="border-r" style={theme.borderGrid}></td>
                  <td className="border-r" style={theme.borderGrid}></td>
                  <td className="border-r" style={theme.borderGrid}></td>
                  <td className="border-r" style={theme.borderGrid}></td>
                  <td className="border-r" style={theme.borderGrid}></td>
                  <td></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Bagian Bawah: Box Rekening Bank (Kiri) & Rincian Total (Kanan) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2.5 pt-1.5">
          {/* Kolom Kiri: Kotak Pembayaran Rekening Bank */}
          <div className="space-y-2">
            <div
              className="rounded-lg border-2 p-2.5 max-w-sm text-xs"
              style={theme.bankBox}
            >
              <div
                className="font-bold uppercase text-[10px] tracking-wider mb-0.5"
                style={theme.bankTitle}
              >
                Pembayaran Via Transfer Bank :
              </div>
              <div className="font-extrabold text-xs sm:text-sm text-slate-900">
                {nota.bank_name ? nota.bank_name.toUpperCase() : "BANK"} A/N.{" "}
                {nota.bank_account_name || nota.pic_name || nota.supplier_name}
              </div>
              <div
                className="text-xs font-black mt-0.5 tracking-wide"
                style={theme.text}
              >
                No. Rek {nota.bank_account_no || "-"}
              </div>
            </div>
          </div>

          {/* Kolom Kanan: Rincian Jumlah, DP, Sisa & Terima Kasih */}
          <div className="flex flex-col items-end justify-between space-y-1.5">
            <div
              className="w-full sm:w-64 border rounded-lg overflow-hidden text-xs"
              style={theme.borderGrid}
            >
              <div
                className="flex justify-between items-center py-1.5 px-3 border-b font-bold"
                style={theme.totalHeader}
              >
                <span className="text-slate-700">Jumlah Rp.</span>
                <span className="text-sm font-black" style={theme.totalText}>
                  {rupiah(total)}
                </span>
              </div>
              <div
                className="flex justify-between items-center py-1 px-3 border-b text-slate-600"
                style={theme.borderGrid}
              >
                <span>DP Rp.</span>
                <span className="font-medium">-</span>
              </div>
              <div className="flex justify-between items-center py-1 px-3 text-slate-600">
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
        <div className="signature-block flex justify-between items-end mt-4 pt-2 print:mt-2 print:pt-1 text-xs font-semibold">
          {/* Tanda Terima (Penerima) */}
          <div className="text-center w-44">
            <p className="text-slate-800 font-bold mb-10 print:mb-7">Tanda Terima,</p>
            <div className="border-b border-dotted border-slate-700 mx-auto w-32" />
          </div>

          {/* Hormat Kami (Toko / Supplier) */}
          <div className="text-center w-48">
            <p className="text-slate-800 font-bold">Hormat Kami,</p>
            <div className="h-12 print:h-10 flex items-center justify-center my-0.5">
              {nota.signature ? (
                <img
                  src={sigDataUrl || fileUrl(nota.signature)}
                  crossOrigin="anonymous"
                  alt="ttd"
                  className="max-h-12 print:max-h-9 max-w-32 object-contain"
                />
              ) : (
                <div className="h-12 print:h-10" />
              )}
            </div>
            <div className="border-b border-dotted border-slate-700 mx-auto w-36" />
            <p className="text-[11px] font-bold text-slate-900 mt-0.5 uppercase">
              {nota.supplier_name}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
