import { useState } from "react";
import {
  Users as UsersIcon,
  Plus,
  Edit2,
  Trash2,
  Shield,
  KeyRound,
  UserCheck,
  Calendar,
  Lock,
  Eye,
  EyeOff,
  User,
} from "lucide-react";
import DataTable from "@/components/DataTable";
import Modal from "@/components/Modal";
import usePaged from "@/hooks/usePaged";
import { api } from "@/utils/api";
import { API_ENDPOINTS as E } from "@/utils/endpoints";
import { request } from "@/utils/request";
import { confirmToast } from "@/utils/confirm";

export default function Users() {
  const paged = usePaged(E.USERS.LIST);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ username: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);

  const currentUser = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  })();

  const openCreate = () => {
    setEditing(null);
    setForm({ username: "", password: "" });
    setShowPassword(false);
    setOpen(true);
  };

  const openEdit = (user) => {
    setEditing(user);
    setForm({ username: user.username, password: "" });
    setShowPassword(false);
    setOpen(true);
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);

    const isEdit = Boolean(editing);
    const action = isEdit
      ? () => api.put(E.USERS.DETAIL(editing.id), form)
      : () => api.post(E.USERS.LIST, form);

    const successMsg = isEdit
      ? "Data pengguna berhasil diperbarui"
      : "Pengguna baru berhasil ditambahkan";

    const res = await request(action, successMsg);
    setSaving(false);

    if (res) {
      setOpen(false);
      paged.reload();
    }
  };

  const remove = async (user) => {
    if (user.username === currentUser.username) {
      alert("Anda tidak dapat menghapus akun Anda sendiri yang sedang aktif digunakan.");
      return;
    }

    if (
      !(await confirmToast(
        `Hapus akun pengguna "${user.username}"? Akses login pengguna ini akan dicabut permanen.`
      ))
    )
      return;

    if (await request(() => api.delete(E.USERS.DETAIL(user.id)), "Pengguna berhasil dihapus")) {
      paged.reload();
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-bold tracking-tight text-slate-900">
          Pengguna
        </h1>

        <button onClick={openCreate} className="btn-primary flex items-center gap-2 text-xs font-bold">
          <Plus size={16} /> Tambah Pengguna
        </button>
      </div>

      {/* Tabel Data Users */}
      <DataTable
        paged={paged}
        columns={[
          {
            key: "username",
            label: "Username",
            render: (r) => {
              const isCurrent = r.username === currentUser.username;
              return (
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-teal-100 text-teal-800 font-bold text-xs uppercase">
                    {r.username.slice(0, 2)}
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-bold text-slate-900">{r.username}</span>
                    {isCurrent && (
                      <span className="rounded-full bg-teal-100 px-1.5 py-0.5 text-[10px] font-bold text-teal-800">
                        Anda
                      </span>
                    )}
                  </div>
                </div>
              );
            },
          },
          {
            key: "role",
            label: "Role",
            render: () => (
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                <Shield size={12} className="text-teal-600" /> Admin
              </span>
            ),
          },
          {
            key: "created_at",
            label: "Tanggal Dibuat",
            render: (r) => (
              <span className="text-xs text-slate-500 whitespace-nowrap">
                {r.created_at
                  ? new Date(r.created_at).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })
                  : "-"}
              </span>
            ),
          },
        ]}
        actions={(r) => {
          const isCurrent = r.username === currentUser.username;
          return (
            <div className="flex items-center gap-1">
              <button
                onClick={() => openEdit(r)}
                title="Edit Pengguna"
                className="btn-ghost !px-2.5 !py-1 text-xs text-slate-700 hover:text-teal-700"
              >
                <Edit2 size={13} /> Edit
              </button>
              <button
                onClick={() => remove(r)}
                disabled={isCurrent}
                title={isCurrent ? "Tidak dapat menghapus akun sendiri" : "Hapus Pengguna"}
                className={`btn-ghost !px-2 !py-1 text-xs ${
                  isCurrent
                    ? "cursor-not-allowed opacity-40 text-slate-400"
                    : "text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                }`}
              >
                <Trash2 size={13} />
              </button>
            </div>
          );
        }}
      />

      {/* Modal Tambah / Edit User */}
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? `Edit Pengguna: ${editing.username}` : "Tambah Pengguna Baru"}
      >
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Username <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <User size={16} className="absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                required
                placeholder="Masukkan username baru"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                className="input !pl-10"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Password {editing ? "(Opsional)" : <span className="text-rose-500">*</span>}
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-3 text-slate-400" />
              <input
                type={showPassword ? "text" : "password"}
                required={!editing}
                minLength={4}
                placeholder={
                  editing
                    ? "Kosongkan jika tidak ingin mengubah password"
                    : "Minimal 4 karakter"
                }
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="input !pl-10 !pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {editing && (
              <p className="text-[11px] text-slate-400">
                Isi hanya jika Anda ingin mengatur ulang (reset) password pengguna ini.
              </p>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              className="btn-ghost"
              onClick={() => setOpen(false)}
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="btn-primary"
            >
              {saving ? "Menyimpan..." : editing ? "Perbarui Pengguna" : "Buat Pengguna"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
