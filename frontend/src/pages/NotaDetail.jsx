import { useEffect, useState, useRef, useMemo, Fragment } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Printer,
  ArrowLeft,
  Building2,
  Download,
  Palette,
  Pipette,
  Users,
  Layers,
  FileText,
} from "lucide-react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { api } from "@/utils/api";
import { API_ENDPOINTS as E } from "@/utils/endpoints";
import { request } from "@/utils/request";
import { fileUrl, rupiah } from "@/utils/format";
import toast from "react-hot-toast";

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

// Komponen 1 Lembar Nota Kontan / Faktur Fisik Sesuai Bukti Nyata Toko
function SingleNotaSheet({
  nota,
  customer,
  items,
  notaNo,
  sheetIndex,
  totalSheets,
  theme,
  logoDataUrl,
  sigDataUrl,
  stampDataUrl,
  isGeneratingPdf,
  editItem,
  saveItem,
  formatHariTanggal,
}) {
  const minRows = 5;
  const emptyRowsCount = Math.max(0, minRows - (items.length || 0));
  const sheetTotal = items.reduce((s, x) => s + +x.total, 0);

  return (
    <div
      className={`nota-paper text-slate-900 font-sans ${
        isGeneratingPdf
          ? "rounded-none border-0 shadow-none p-6 bg-white"
          : "rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm"
      } print:rounded-none print:border-0 print:shadow-none print:p-0 print:m-0 print:bg-white`}
      style={{ backgroundColor: "#ffffff" }}
    >
      {/* Header Nota: Kiri (Kop Toko Besar & Catatan Toko) & Kanan (Hari, Tanggal, Kepada Yth & Alamat Pelanggan Rapi) */}
      <div
        className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-3.5 border-b-2"
        style={theme.borderSolid}
      >
        {/* Sisi Kiri: Logo Toko Besar, Nama Toko Menonjol, Catatan/Slogan & Alamat */}
        <div className="flex items-start gap-4 flex-1 min-w-0">
          {nota.logo ? (
            <img
              src={logoDataUrl || fileUrl(nota.logo)}
              crossOrigin="anonymous"
              alt=""
              className="h-20 w-20 sm:h-24 sm:w-24 print:h-[78px] print:w-[78px] object-contain rounded-xl border border-slate-200/80 p-1.5 shrink-0 bg-white shadow-2xs print:shadow-none"
            />
          ) : (
            <div className="flex h-20 w-20 sm:h-24 sm:w-24 print:h-[78px] print:w-[78px] items-center justify-center rounded-xl bg-slate-100 text-slate-700 shrink-0">
              <Building2 size={36} />
            </div>
          )}
          <div className="space-y-1 min-w-0">
            <h2
              className="text-2xl sm:text-3xl print:text-[24px] font-black uppercase tracking-tight leading-none"
              style={theme.text}
            >
              {nota.supplier_name}
            </h2>
            {/* Catatan / Slogan Toko di Bawah Nama Toko (sesuai foto bukti fisik, misal: MENJUAL SEMBAKO & SAYURAN / Sedia berbagai jenis Daging...) */}
            {(nota.supplier_notes || nota.notes) && (
              <p className="text-xs sm:text-[13px] print:text-xs font-bold text-slate-800 uppercase tracking-wide leading-snug pt-0.5">
                {nota.supplier_notes || nota.notes}
              </p>
            )}
            {nota.supplier_address && (
              <p className="text-xs sm:text-[13px] print:text-[11px] text-slate-600 leading-snug pt-0.5">
                {nota.supplier_address}
              </p>
            )}
            {nota.supplier_phone && (
              <p className="text-xs sm:text-[13px] print:text-[11px] text-slate-700 font-medium">
                Telp / WA: <b className="font-bold">{nota.supplier_phone}</b>
              </p>
            )}
          </div>
        </div>

        {/* Sisi Kanan: Hari, Tanggal, Kepada Yth & Alamat Pelanggan (dibatasi agar membungkus ke bawah rapi) */}
        <div className="w-full sm:w-auto max-w-[280px] sm:max-w-[340px] print:max-w-[290px] text-right ml-auto space-y-1 text-xs print:text-[11px] border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
          <div>
            <span className="text-slate-500">Hari, Tanggal: </span>
            <b className="text-slate-900 font-bold">
              {formatHariTanggal(nota.date)}
            </b>
          </div>
          <div>
            <span className="text-slate-500">Kepada Yth. </span>
            <b className="text-slate-900 font-bold block sm:inline">
              {customer?.name || nota.customer_name || "Pelanggan / SPPG"}
            </b>
          </div>
          {/* Alamat Pelanggan ke bawah rapi tidak memanjang ke samping */}
          {(customer?.address || nota.customer_address) && (
            <p className="text-[11px] print:text-[10.5px] text-slate-600 font-normal leading-snug break-words mt-0.5">
              {customer?.address || nota.customer_address}
            </p>
          )}
          {nota.customer_pic && (
            <div className="text-[11px] text-slate-500">
              up. <span className="font-semibold text-slate-800">{nota.customer_pic}</span>
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
          Nota No. : <b style={theme.text}>{notaNo || nota.nota_no}</b>
          {totalSheets > 1 && (
            <span className="text-slate-500 font-normal ml-2">
              (Lembar {sheetIndex + 1} dari {totalSheets})
            </span>
          )}
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
            {items.map((it, i) => (
              <tr
                key={it.id || i}
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
                  {isGeneratingPdf || !it.id ? (
                    <span className="font-bold text-xs">{+it.qty}</span>
                  ) : (
                    <>
                      <input
                        type="number"
                        step="any"
                        min="0.01"
                        className="w-full rounded-md border border-slate-200 bg-white py-1 px-1.5 text-center font-bold text-xs [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none focus:border-slate-800 outline-none print:hidden"
                        value={it.qty}
                        onChange={(e) => editItem(it, "qty", e.target.value)}
                        onBlur={() => saveItem(it)}
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
                  {isGeneratingPdf || !it.id ? (
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
                        onChange={(e) => editItem(it, "price", e.target.value)}
                        onBlur={() => saveItem(it)}
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
                {rupiah(sheetTotal)}
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

      {/* Blok Tanda Tangan: Tanda Terima (Kiri) & Hormat Kami (Kanan) - SEJAJAR 100% PERSIS DENGAN JARAK ~4 CM UNTUK STEMPEL & TTD */}
      <div className="signature-block grid grid-cols-2 gap-8 mt-6 pt-2 print:mt-4 print:pt-0 text-xs font-semibold">
        {/* Tanda Terima (Penerima) */}
        <div className="flex flex-col items-center text-center">
          <div className="h-6 flex items-center justify-center">
            <p className="text-slate-800 font-bold text-sm print:text-xs">Tanda Terima,</p>
          </div>

          {/* Area Kosong Jarak 4 cm (~140px) untuk TTD & Stempel Fisik Penerima */}
          <div className="h-[140px] print:h-[135px] w-full flex items-center justify-center relative my-1">
            {/* Tempat tanda tangan & stempel fisik penerima */}
          </div>

          <div className="w-full flex flex-col items-center">
            <div className="border-b-2 border-dotted border-slate-700 w-44 sm:w-56" />
            <p className="text-xs sm:text-[13px] print:text-[11.5px] font-bold text-slate-900 mt-1.5 uppercase tracking-tight">
              ( {customer?.name || nota.customer_name || "Pelanggan / SPPG"} )
            </p>
          </div>
        </div>

        {/* Hormat Kami (Toko / Supplier) */}
        <div className="flex flex-col items-center text-center">
          <div className="h-6 flex items-center justify-center">
            <p className="text-slate-800 font-bold text-sm print:text-xs">Hormat Kami,</p>
          </div>

          {/* Area TTD & Stempel Toko Jarak 4 cm (~140px) */}
          <div className="h-[140px] print:h-[135px] w-full flex items-center justify-center relative my-1">
            {/* Stempel Toko: Ukuran lebih besar dari TTD (~130px), realistis dengan sedikit rotasi */}
            {nota.stamp && (
              <img
                src={stampDataUrl || fileUrl(nota.stamp)}
                crossOrigin="anonymous"
                alt="stempel"
                className="absolute max-h-[130px] max-w-[130px] print:max-h-[125px] print:max-w-[125px] object-contain opacity-90 pointer-events-none -rotate-6 z-10"
                style={{
                  left: nota.signature ? "30%" : "50%",
                  transform: "translateX(-50%) rotate(-6deg)",
                }}
              />
            )}

            {/* Tanda Tangan Toko: Besar dan jelas */}
            {nota.signature ? (
              <img
                src={sigDataUrl || fileUrl(nota.signature)}
                crossOrigin="anonymous"
                alt="ttd"
                className="max-h-[110px] max-w-[175px] print:max-h-[105px] print:max-w-[165px] object-contain relative z-20"
              />
            ) : (
              !nota.stamp && <div className="h-full w-full" />
            )}
          </div>

          <div className="w-full flex flex-col items-center">
            <div className="border-b-2 border-dotted border-slate-700 w-44 sm:w-56" />
            <p className="text-xs sm:text-[13px] print:text-[11.5px] font-bold text-slate-900 mt-1.5 uppercase tracking-tight">
              ( {nota.supplier_name} )
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function NotaDetail() {
  const { id } = useParams();
  const [nota, setNota] = useState(null);
  const containerRef = useRef(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [currentColor, setCurrentColor] = useState("#1e293b");
  const [logoDataUrl, setLogoDataUrl] = useState(null);
  const [sigDataUrl, setSigDataUrl] = useState(null);
  const [stampDataUrl, setStampDataUrl] = useState(null);
  // selectedCustomerId === null berarti mode "Semua Nota" (menampilkan semua lembar nota per pelanggan)
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);

  const load = async () => {
    const res = await request(() => api.get(E.NOTA.FULL(id)));
    if (res?.data) {
      setNota(res.data);
      // Preload gambar ke Base64 Data URL untuk html2canvas yang anti-error
      if (res.data.logo) {
        toDataUrl(fileUrl(res.data.logo)).then((d) => setLogoDataUrl(d));
      }
      if (res.data.signature) {
        toDataUrl(fileUrl(res.data.signature)).then((d) => setSigDataUrl(d));
      }
      if (res.data.stamp) {
        toDataUrl(fileUrl(res.data.stamp)).then((d) => setStampDataUrl(d));
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

  const editItem = (it, field, value) => {
    setNota((prev) => {
      const updateList = (list) =>
        (list || []).map((x) =>
          (it.id && x.id === it.id) || x.item_name === it.item_name
            ? { ...x, [field]: value, total: (+value || 0) * (field === "qty" ? +x.price : +x.qty) }
            : x
        );
      return {
        ...prev,
        items: updateList(prev.items),
        customer_items: updateList(prev.customer_items),
      };
    });
  };

  const saveItem = async (it) => {
    if (!it.id) return;
    if (
      await request(
        () => api.put(E.NOTA.ITEM(it.id), { qty: it.qty, price: it.price }),
        "Tersimpan"
      )
    )
      load();
  };

  // Logika Multi-Pelanggan:
  // Cek apakah nota ini terkait dengan lebih dari 1 pelanggan (misal PO gabungan)
  const hasMultipleCustomers = (nota?.customers?.length || 0) > 1;

  // Dapatkan daftar item untuk pelanggan tertentu
  const getCustomerItems = (customerId) => {
    if (!nota) return [];
    if (!hasMultipleCustomers) return nota.items || [];
    if (nota.customer_items && nota.customer_items.length) {
      const filtered = nota.customer_items.filter(
        (it) => it.customer_id === customerId
      );
      if (filtered.length) return filtered;
    }
    return nota.items || [];
  };

  // Daftar lembar nota yang akan dirender berdasarkan tab pelanggan yang dipilih
  const sheetsToRender = useMemo(() => {
    if (!nota) return [];

    if (hasMultipleCustomers) {
      // Jika salah satu pelanggan dipilih secara spesifik:
      if (selectedCustomerId) {
        const cust =
          nota.customers.find((c) => c.id === selectedCustomerId) ||
          nota.customers[0];
        const custIdx = nota.customers.findIndex((c) => c.id === cust.id);
        const items = getCustomerItems(cust.id);
        const notaNo =
          nota.customers.length > 1
            ? `${nota.nota_no}-${custIdx + 1}`
            : nota.nota_no;
        return [
          {
            customer: cust,
            items,
            notaNo,
            sheetIndex: custIdx,
            totalSheets: nota.customers.length,
          },
        ];
      }

      // Mode "Semua Nota" (selectedCustomerId === null):
      // Munculkan SEMUA lembar nota per pelanggan berurutan (misal 2 pelanggan = 2 lembar nota terpisah)
      return nota.customers.map((cust, idx) => ({
        customer: cust,
        items: getCustomerItems(cust.id),
        notaNo: `${nota.nota_no}-${idx + 1}`,
        sheetIndex: idx,
        totalSheets: nota.customers.length,
      }));
    }

    // Nota biasa (1 pelanggan)
    return [
      {
        customer: {
          name: nota.customer_name || "Pelanggan / SPPG",
          address: nota.customer_address || "",
        },
        items: nota.items || [],
        notaNo: nota.nota_no,
        sheetIndex: 0,
        totalSheets: 1,
      },
    ];
  }, [nota, selectedCustomerId, hasMultipleCustomers]);

  // Fungsi Export / Download PDF langsung menggunakan html2canvas + jsPDF
  // Jika tab "Semua Nota" aktif, semua lembar digabungkan menjadi multi-halaman PDF
  const handleDownloadPDF = async () => {
    if (!containerRef.current || !nota) return;
    setIsGeneratingPdf(true);

    try {
      // Beri jeda sekejap agar state preview bersih tanpa input interaktif
      await new Promise((resolve) => setTimeout(resolve, 80));

      const sheetElements = containerRef.current.querySelectorAll(".nota-paper");
      if (!sheetElements.length) return;

      const cleanNo = (nota.nota_no || "nota").replace(/[\/\\:]/g, "_");
      const cleanTarget = selectedCustomerId
        ? (sheetsToRender[0]?.customer?.name || "Pelanggan").replace(/[\/\\:\s]/g, "_")
        : "Semua_Nota";

      // Buat file PDF A4 Portrait
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 8;
      const printWidth = pageWidth - margin * 2; // 194mm

      for (let i = 0; i < sheetElements.length; i++) {
        if (i > 0) {
          pdf.addPage();
        }

        // Kunci background seluruh lembar kertas PDF berwarna putih murni (tidak abu-abu)
        pdf.setFillColor(255, 255, 255);
        pdf.rect(0, 0, pageWidth, pageHeight, "F");

        const element = sheetElements[i];
        const canvas = await html2canvas(element, {
          scale: 2, // Resolusi tinggi dan tajam
          useCORS: true,
          allowTaint: true,
          backgroundColor: "#ffffff",
          logging: false,
          scrollX: 0,
          scrollY: 0,
        });

        const imgData = canvas.toDataURL("image/jpeg", 0.98);
        const imgHeight = (canvas.height * printWidth) / canvas.width;
        const renderHeight = Math.min(imgHeight, pageHeight - margin * 2);

        pdf.addImage(imgData, "JPEG", margin, margin, printWidth, renderHeight);
      }

      pdf.save(`Nota_${cleanNo}_${cleanTarget}.pdf`);
      toast.success(
        sheetElements.length > 1
          ? `Berhasil mendownload ${sheetElements.length} nota dalam 1 file PDF`
          : "Nota berhasil didownload"
      );
    } catch (err) {
      console.error("Gagal export PDF langsung:", err);
      toast.error("Gagal generate PDF langsung, membuka dialog cetak...");
      window.print();
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  if (!nota)
    return (
      <div className="mx-auto max-w-4xl space-y-4">
        <div className="h-64 animate-pulse rounded-2xl bg-white border border-slate-200" />
      </div>
    );

  return (
    <div className="mx-auto max-w-4xl space-y-4 print:max-w-none print:m-0 print:p-0">
      {/* CSS Khusus Cetak Browser: Menjamin Setiap Nota Berada di Halaman A4 Tersendiri (Anti-Nempel & 1 Halaman per Nota) */}
      <style>{`
        @page {
          size: A4 portrait;
          margin: 8mm 10mm 8mm 10mm;
        }
        @media print {
          html, body {
            background: #ffffff !important;
            background-color: #ffffff !important;
            margin: 0 !important;
            padding: 0 !important;
            height: auto !important;
            min-height: 0 !important;
          }
          *, *::before, *::after {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          /* Sembunyikan SEMUA elemen toast, fixed portal, backdrop, dan UI navigasi saat print */
          [data-hot-toast],
          .toaster,
          [role="status"],
          [aria-live="polite"],
          div[style*="position: fixed"],
          div[style*="pointer-events: none"],
          aside,
          nav,
          header,
          .print-hidden {
            display: none !important;
            visibility: hidden !important;
            opacity: 0 !important;
            background: transparent !important;
          }

          /* Container pembungkus setiap lembar nota dipaksa pindah ke halaman baru */
          .nota-paper-wrapper {
            display: block !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            page-break-after: always !important;
            break-after: page !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          .nota-paper-wrapper:last-child {
            page-break-after: auto !important;
            break-after: auto !important;
          }

          .nota-paper {
            background: #ffffff !important;
            background-color: #ffffff !important;
            box-shadow: none !important;
            border: none !important;
            border-radius: 0 !important;
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }

          .signature-block {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
            page-break-after: avoid !important;
          }

          /* Elemen pemisah halaman eksplisit untuk browser print engine */
          .page-break-divider {
            display: block !important;
            page-break-before: always !important;
            break-before: page !important;
            clear: both !important;
            height: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
            visibility: hidden !important;
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
                className={`relative flex h-6 w-6 items-center justify-center rounded-lg transition ${
                  currentColor.toLowerCase() === t.colorHex.toLowerCase()
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
          <button
            onClick={handleDownloadPDF}
            disabled={isGeneratingPdf}
            className="btn-primary flex items-center justify-center gap-2 text-xs font-bold py-2 px-3.5 shadow-sm"
            title="Download file PDF langsung (Putih Bersih 1 Halaman)"
          >
            <Download size={15} />
            {isGeneratingPdf ? "Menyiapkan..." : "Download PDF"}
          </button>

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

      {/* Selector Pelanggan Jika Nota Memiliki Lebih dari 1 Pelanggan */}
      {hasMultipleCustomers && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-amber-50/90 border border-amber-200/80 px-4 py-3 rounded-2xl print:hidden shadow-2xs">
          <div className="flex items-center gap-2 text-xs text-amber-900 font-bold">
            <Users size={16} className="text-amber-700 shrink-0" />
            <div>
              <span>Tampilan Nota Multi-Pelanggan:</span>
              <p className="text-[11px] font-normal text-amber-800">
                Pilih tab pelanggan untuk melihat 1 nota, atau pilih "Semua Nota" untuk menampilkan semua lembar nota sekaligus ({nota.customers.length} lembar siap cetak).
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setSelectedCustomerId(null)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                selectedCustomerId === null
                  ? "bg-amber-800 text-white shadow-xs"
                  : "bg-white text-slate-700 border border-amber-200 hover:bg-amber-100/60"
              }`}
            >
              <Layers size={13} />
              <span>Semua Nota ({nota.customers.length} Lembar)</span>
            </button>
            {nota.customers.map((c, idx) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedCustomerId(c.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  selectedCustomerId === c.id
                    ? "bg-amber-800 text-white shadow-xs"
                    : "bg-white text-slate-700 border border-amber-200 hover:bg-amber-100/60"
                }`}
              >
                <span>Nota #{idx + 1}: {c.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Lembar-lembar Nota Kontan / Faktur Fisik */}
      <div ref={containerRef} className="space-y-8 print:space-y-0">
        {sheetsToRender.map((sheet, sIdx) => (
          <Fragment key={sheet.customer?.id || sIdx}>
            {/* Pemisah halaman eksplisit untuk cetak browser jika lebih dari 1 lembar */}
            {sIdx > 0 && (
              <div
                className="page-break-divider hidden print:block"
                style={{
                  pageBreakBefore: "always",
                  breakBefore: "page",
                  clear: "both",
                  height: 0,
                  margin: 0,
                  padding: 0,
                }}
              />
            )}

            <div className="nota-paper-wrapper space-y-2">
              {/* Banner pembatas antar lembar di layar monitor jika mode 'Semua Nota' */}
              {hasMultipleCustomers && selectedCustomerId === null && (
                <div className="flex items-center justify-between bg-amber-100/80 border border-amber-300/80 px-4 py-2.5 rounded-xl text-xs font-bold text-amber-900 print:hidden shadow-2xs">
                  <span className="flex items-center gap-1.5">
                    <FileText size={15} className="text-amber-700" />
                    <span>
                      Lembar Nota #{sIdx + 1} dari {sheetsToRender.length} : Kepada Yth. {sheet.customer?.name}
                    </span>
                  </span>
                  <span className="text-[11px] text-amber-900 font-semibold bg-white/80 px-2 py-0.5 rounded border border-amber-200">
                    {sheet.items.length} item barang • Subtotal{" "}
                    {rupiah(
                      sheet.items.reduce((s, it) => s + +it.total, 0)
                    )}
                  </span>
                </div>
              )}

              <SingleNotaSheet
                nota={nota}
                customer={sheet.customer}
                items={sheet.items}
                notaNo={sheet.notaNo}
                sheetIndex={sheet.sheetIndex}
                totalSheets={sheet.totalSheets}
                theme={theme}
                logoDataUrl={logoDataUrl}
                sigDataUrl={sigDataUrl}
                stampDataUrl={stampDataUrl}
                isGeneratingPdf={isGeneratingPdf}
                editItem={editItem}
                saveItem={saveItem}
                formatHariTanggal={formatHariTanggal}
              />
            </div>
          </Fragment>
        ))}
      </div>
    </div>
  );
}
