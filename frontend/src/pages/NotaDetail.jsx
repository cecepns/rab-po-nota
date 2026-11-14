import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Printer } from "lucide-react";
import { api } from "@/utils/api";
import { API_ENDPOINTS as E } from "@/utils/endpoints";
import { request } from "@/utils/request";
import { fileUrl, rupiah } from "@/utils/format";

export default function NotaDetail() {
  const { id } = useParams();
  const [nota, setNota] = useState(null);

  const load = async () => { const res = await request(() => api.get(E.NOTA.FULL(id))); if (res) setNota(res.data); };
  useEffect(() => { load(); }, [id]);

  const edit = (i, k, v) => setNota({ ...nota, items: nota.items.map((x, n) => (n === i ? { ...x, [k]: v } : x)) });
  const save = async (it) => {
    if (await request(() => api.put(E.NOTA.ITEM(it.id), { qty: it.qty, price: it.price }), "Tersimpan")) load();
  };

  if (!nota) return <div className="h-40 animate-pulse rounded-2xl bg-white" />;
  const total = nota.items.reduce((s, x) => s + +x.total, 0);

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="flex justify-between print:hidden">
        <h1 className="text-xl font-bold">Nota {nota.nota_no}</h1>
        <button className="btn-primary" onClick={() => window.print()}><Printer size={16} /> Cetak</button>
      </div>
      <p className="text-sm text-slate-500 print:hidden">Isi qty & harga sesuai nota asli toko (data awal diambil dari RAB), lalu cetak.</p>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm print:border-0 print:shadow-none">
        <div className="flex items-center gap-4 border-b-2 border-brand pb-4">
          {nota.logo && <img src={fileUrl(nota.logo)} alt="" className="h-16 w-16 object-contain" />}
          <div className="flex-1">
            <h2 className="text-xl font-extrabold">{nota.supplier_name}</h2>
            <p className="text-sm text-slate-500">{nota.supplier_address} {nota.supplier_phone && `• ${nota.supplier_phone}`}</p>
          </div>
          <div className="text-right text-sm"><p>Tanggal: <b>{nota.date}</b></p><p>No: <b>{nota.nota_no}</b></p><p>Ref PO: {nota.po_no}</p></div>
        </div>
        <div className="overflow-x-auto">
          <table className="mt-4 w-full text-sm min-w-[500px] print:min-w-full">
            <thead>
              <tr className="border-b text-left text-xs uppercase text-slate-500">
                <th className="py-2 whitespace-nowrap">Nama Barang</th>
                <th className="w-24 whitespace-nowrap">Qty</th>
                <th className="w-16 whitespace-nowrap">Sat</th>
                <th className="w-32 whitespace-nowrap">Harga</th>
                <th className="text-right whitespace-nowrap">Jumlah</th>
              </tr>
            </thead>
            <tbody>
              {nota.items.map((it, i) => (
                <tr key={it.id} className="border-b border-slate-100">
                  <td className="py-2 font-medium">{it.item_name}</td>
                  <td>
                    <input
                      type="number"
                      className="input !py-1 text-xs print:border-0 print:p-0"
                      value={it.qty}
                      onChange={(e) => edit(i, "qty", e.target.value)}
                      onBlur={() => save(it)}
                    />
                  </td>
                  <td className="px-2 text-slate-500 text-xs">{it.unit}</td>
                  <td>
                    <input
                      type="number"
                      className="input !py-1 text-xs print:border-0 print:p-0"
                      value={it.price}
                      onChange={(e) => edit(i, "price", e.target.value)}
                      onBlur={() => save(it)}
                    />
                  </td>
                  <td className="text-right font-semibold text-slate-900 whitespace-nowrap">
                    {rupiah(it.total)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={4} className="pt-3 text-right font-bold text-slate-600">
                  Jumlah Rp.
                </td>
                <td className="pt-3 text-right text-base font-extrabold text-teal-800 whitespace-nowrap">
                  {rupiah(total)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
        <div className="mt-8 flex justify-between text-sm">
          <div className="text-center"><p>Tanda Terima</p><div className="h-20" /><p>(................)</p></div>
          <div className="text-center"><p>Hormat Kami</p>
            <div className="flex h-20 items-center justify-center">{nota.signature && <img src={fileUrl(nota.signature)} alt="ttd" className="max-h-20" />}</div>
            <p>{nota.supplier_name}</p></div>
        </div>
      </div>
    </div>
  );
}
