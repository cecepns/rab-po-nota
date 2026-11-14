import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import DataTable from "./DataTable";
import Modal from "./Modal";
import Field from "./Field";
import usePaged from "@/hooks/usePaged";
import { api } from "@/utils/api";
import { request } from "@/utils/request";
import { confirmToast } from "@/utils/confirm";

// Halaman CRUD generik: list (API pagination) + modal create/edit + confirm delete
export default function CrudPage({ title, list, detail, columns, fields, initial = {}, filters }) {
  const paged = usePaged(list, filters);
  const [modal, setModal] = useState(null); // null | {id?}
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  const openForm = (row) => {
    setForm(row ? Object.fromEntries(fields.filter((f) => f.type !== "file").map((f) => [f.name, row[f.name]])) : initial);
    setModal({ id: row?.id });
  };

  const submit = async (e) => {
    e.preventDefault();
    const missing = fields.find((f) => f.required && !form[f.name]);
    if (missing) return request(() => Promise.reject({ response: { data: { message: `${missing.label} wajib diisi` } } }));
    const fd = new FormData();
    fields.forEach((f) => { const v = form[f.name]; if (v !== undefined && v !== null) fd.append(f.name, v); });
    setSaving(true);
    const res = await request(() => (modal.id ? api.put(detail(modal.id), fd) : api.post(list, fd)), modal.id ? "Data diperbarui" : "Data ditambahkan");
    setSaving(false);
    if (res) { setModal(null); paged.reload(); }
  };

  const remove = async (row) => {
    if (!(await confirmToast("Hapus data ini?"))) return;
    if (await request(() => api.delete(detail(row.id)), "Data dihapus")) paged.reload();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900">{title}</h1>
        <button className="btn-primary" onClick={() => openForm()}><Plus size={16} /> Tambah</button>
      </div>
      <DataTable
        columns={columns}
        paged={paged}
        actions={(r) => (
          <>
            <button className="btn-ghost !p-2" onClick={() => openForm(r)}><Pencil size={15} /></button>
            <button className="btn-ghost !p-2 !text-red-600" onClick={() => remove(r)}><Trash2 size={15} /></button>
          </>
        )}
      />
      <Modal open={!!modal} title={modal?.id ? `Edit ${title}` : `Tambah ${title}`} onClose={() => setModal(null)}>
        <form onSubmit={submit} className="space-y-3">
          {fields.map((f) => <Field key={f.name} field={f} value={form[f.name]} onChange={(v) => setForm({ ...form, [f.name]: v })} />)}
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="btn-ghost" onClick={() => setModal(null)}>Batal</button>
            <button className="btn-primary" disabled={saving}>{saving ? "Menyimpan..." : "Simpan"}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
