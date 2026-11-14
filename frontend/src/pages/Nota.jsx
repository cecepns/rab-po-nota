import { useNavigate } from "react-router-dom";
import { Eye, Trash2 } from "lucide-react";
import DataTable from "@/components/DataTable";
import usePaged from "@/hooks/usePaged";
import { api } from "@/utils/api";
import { API_ENDPOINTS as E } from "@/utils/endpoints";
import { request } from "@/utils/request";
import { confirmToast } from "@/utils/confirm";
import { rupiah } from "@/utils/format";

export default function Nota() {
  const paged = usePaged(E.NOTA.LIST);
  const nav = useNavigate();
  const remove = async (n) => {
    if (!(await confirmToast("Hapus nota ini?"))) return;
    if (await request(() => api.delete(E.NOTA.DETAIL(n.id)), "Nota dihapus")) paged.reload();
  };
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Nota</h1>
      <p className="text-sm text-slate-500">Nota dibuat dari menu PO per Toko (tombol Buat Nota).</p>
      <DataTable
        paged={paged}
        columns={[
          { key: "nota_no", label: "No. Nota" },
          { key: "date", label: "Tanggal" },
          { key: "supplier_name", label: "Supplier" },
          { key: "po_no", label: "Ref. PO" },
          { key: "total", label: "Total", render: (r) => <b>{rupiah(r.total)}</b> },
        ]}
        actions={(r) => (
          <>
            <button className="btn-ghost !px-2.5" onClick={() => nav(`/nota/${r.id}`)}><Eye size={15} /> Buka</button>
            <button className="btn-ghost !p-2 !text-red-600" onClick={() => remove(r)}><Trash2 size={15} /></button>
          </>
        )}
      />
    </div>
  );
}
