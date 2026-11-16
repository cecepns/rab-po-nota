import { useState, useEffect } from "react";
import {
  Settings as SettingsIcon,
  Phone,
  Mail,
  Building,
  MapPin,
  Save,
  CheckCircle2,
  Globe,
  ExternalLink,
  MessageCircle,
  Sparkles,
} from "lucide-react";
import { api } from "@/utils/api";
import { API_ENDPOINTS as E } from "@/utils/endpoints";
import { request } from "@/utils/request";
import toast from "react-hot-toast";

export default function Settings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    phone: "082312693414",
    email: "mochamirudin17899@gmail.com",
    company_name: "Ikatandi Group",
    address: "Jl. Logistik Pangan No. 45, Kawasan Niaga Terpadu, Jakarta & Jaringan Cabang Regional, Indonesia",
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await api.get(E.SETTINGS);
      if (res.data?.data) {
        setForm((prev) => ({
          ...prev,
          ...res.data.data,
        }));
      }
    } catch {
      // Fallback ke default
    } finally {
      setLoading(false);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const res = await request(
      () => api.put(E.SETTINGS, form),
      "Pengaturan website & kontak berhasil disimpan!"
    );
    setSaving(false);
  };

  const cleanPhone = (form.phone || "").replace(/\D/g, "");
  const waNumber = cleanPhone.startsWith("0") ? "62" + cleanPhone.slice(1) : cleanPhone;

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Top Banner */}
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-teal-50 text-teal-800">
              <SettingsIcon size={20} />
            </span>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Pengaturan Website & Kontak
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Ubah nomor WhatsApp, email resmi, dan informasi kontak yang dicantumkan pada tampilan website depan (landing page).
          </p>
        </div>

        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-ghost flex items-center gap-1.5 text-xs font-semibold shrink-0"
        >
          <Globe size={14} className="text-teal-600" />
          <span>Lihat Website Depan</span>
          <ExternalLink size={12} className="text-slate-400" />
        </a>
      </div>

      <form onSubmit={submit} className="space-y-6">
        {/* Card: Kontak Utama Website Depan */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Saluran Kontak Resmi Website
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Nomor WhatsApp dan email ini akan otomatis tampil di header, form RFQ, dan footer website depan.
              </p>
            </div>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Globe size={12} /> Live di Website
            </span>
          </div>

          <div className="p-6 space-y-5">
            {/* Input Nomor WhatsApp */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Nomor WhatsApp Bisnis (Kemitraan B2B) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Phone size={16} className="absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="Contoh: 082312693414"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="input !pl-10 font-bold text-slate-900"
                />
              </div>
              <p className="text-[11px] text-slate-500">
                Digunakan untuk tombol chat WhatsApp langsung dan pengiriman pesan RFQ dari calon klien.
              </p>
            </div>

            {/* Input Email Resmi */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Email Resmi Perusahaan & RFQ <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="Contoh: mochamirudin17899@gmail.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="input !pl-10 font-bold text-slate-900"
                />
              </div>
              <p className="text-[11px] text-slate-500">
                Ditampilkan pada bagian Saluran Komunikasi Resmi dan footer website depan.
              </p>
            </div>
          </div>
        </div>

        {/* Card: Profil Perusahaan */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4">
            <h2 className="text-sm font-bold text-slate-900">
              Identitas & Lokasi Operasional
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Identitas perusahaan yang ditampilkan pada kop dokumen dan kartu kontak website.
            </p>
          </div>

          <div className="p-6 space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Nama Perusahaan / Grup
              </label>
              <div className="relative">
                <Building size={16} className="absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  required
                  value={form.company_name}
                  onChange={(e) => setForm({ ...form, company_name: e.target.value })}
                  className="input !pl-10 font-semibold"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Alamat Kantor Pusat & Pusat Distribusi
              </label>
              <div className="relative">
                <MapPin size={16} className="absolute left-3.5 top-3 text-slate-400" />
                <textarea
                  rows={2}
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="input !pl-10 font-medium"
                ></textarea>
              </div>
            </div>
          </div>
        </div>

        {/* Live Preview Card */}
        <div className="rounded-2xl bg-[#0a192f] text-white p-5 sm:p-6 shadow-md border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-amber-400 font-bold flex items-center gap-1.5">
              <Sparkles size={14} /> Preview Tampilan Kontak di Website Depan
            </span>
            <span className="text-[10px] text-slate-400">Pratinjau Otomatis</span>
          </div>

          <div className="grid sm:grid-cols-2 gap-3 pt-1 text-xs">
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
              <div>
                <span className="text-slate-400 block text-[10px]">Email Website</span>
                <span className="font-semibold text-white break-all">{form.email || "-"}</span>
              </div>
              <Mail size={16} className="text-amber-400 shrink-0 ml-2" />
            </div>

            <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-600/40 flex items-center justify-between">
              <div>
                <span className="text-emerald-300 block text-[10px]">WhatsApp Website</span>
                <span className="font-bold text-white">{form.phone || "-"}</span>
              </div>
              <MessageCircle size={16} className="text-emerald-400 shrink-0 ml-2" />
            </div>
          </div>
        </div>

        {/* Tombol Simpan */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={saving || loading}
            className="btn-primary !px-6 !py-3 text-sm flex items-center gap-2 shadow-md"
          >
            <Save size={16} />
            <span>{saving ? "Menyimpan Perubahan..." : "Simpan Pengaturan"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
