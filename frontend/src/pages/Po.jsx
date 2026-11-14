import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Receipt, Trash2 } from "lucide-react";
import DataTable from "@/components/DataTable";
import Modal from "@/components/Modal";
import Field from "@/components/Field";
import usePaged from "@/hooks/usePaged";
import { api } from "@/utils/api";
import { API_ENDPOINTS as E } from "@/utils/endpoints";
import { request } from "@/utils/request";
import { confirmToast } from "@/utils/confirm";
import { rupiah, today } from "@/utils/format";

export default function Po() {
  const paged = usePaged(E.PO.LIST);
  const nav = useNavigate();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ date: today(), supplier_id: "" });
  const [saving, setSaving] = useState(false);

  const generate = async (e) => {
    e.preventDefault();
    setSaving(true);
    const res = await request(() => api.post(E.PO.GENERATE, form), "PO berhasil dibuat dari RAB");
    setSaving(false);
    if (res) { setOpen(false); paged.reload(); }
  };
  const makeNota = async (po) => {
    const res = await request(() => api.post(E.NOTA.GENERATE, { po_id: po.id }), "Nota dibuat");
    if (res) nav(`/nota/${res.data.id}`);
  };
  const remove = async (po) => {
    if (!(await confirmToast("Hapus PO? Item RAB kembali ke status belum PO."))) return;
    if (await request(() => api.delete(E.PO.DETAIL(po.id)), "PO dihapus")) paged.reload();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">PO per Toko</h1>
        <button className="btn-primary" onClick={() => setOpen(true)}><Plus size={16} /> Buat PO dari RAB</button>
      </div>
      <DataTable
        paged={paged}
        columns={[
          { key: "po_no", label: "No. PO" },
          { key: "date", label: "Tanggal" },
          { key: "supplier_name", label: "Supplier" },
          { key: "total", label: "Nilai PO", render: (r) => <b>{rupiah(r.total)}</b> },
          { key: "nota_id", label: "Nota", render: (r) => (r.nota_id ? "Sudah" : <span className="text-amber-600">Belum</span>) },
        ]}
        actions={(r) => (
          <>
            {!r.nota_id && <button className="btn-ghost !px-2.5" onClick={() => makeNota(r)}><Receipt size={15} /> Buat Nota</button>}
            <button className="btn-ghost !p-2 !text-red-600" onClick={() => remove(r)}><Trash2 size={15} /></button>
          </>
        )}
      />
      <Modal open={open} title="Buat PO dari RAB" onClose={() => setOpen(false)}>
        <form onSubmit={generate} className="space-y-3">
          <p className="text-sm text-slate-500">Semua item RAB tanggal tersebut untuk toko terpilih (dari semua pelanggan) digabung menjadi satu PO.</p>
          <Field field={{ label: "Tanggal RAB", type: "date", required: true }} value={form.date} onChange={(v) => setForm({ ...form, date: v })} />
          <Field field={{ label: "Toko / Supplier", type: "select", required: true, options: { endpoint: E.SUPPLIERS.LIST, label: "name" } }} value={form.supplier_id} onChange={(v) => setForm({ ...form, supplier_id: v })} />
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="btn-ghost" onClick={() => setOpen(false)}>Batal</button>
            <button className="btn-primary" disabled={saving}>{saving ? "Memproses..." : "Buat PO"}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
