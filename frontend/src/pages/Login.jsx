import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LogIn,
  User,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  FileSpreadsheet,
  Receipt,
  BarChart3,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { api } from "@/utils/api";
import { API_ENDPOINTS } from "@/utils/endpoints";
import { request } from "@/utils/request";
import Logo from "@/components/Logo";

export default function Login() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [remember, setRemember] = useState(true);
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await request(
      () => api.post(API_ENDPOINTS.AUTH.LOGIN, form),
      "Login berhasil! Selamat datang kembali."
    );
    setLoading(false);
    if (res?.data?.token) {
      localStorage.setItem("token", res.data.token);
      if (res.data.user?.username) {
        localStorage.setItem("user", JSON.stringify(res.data.user));
      }
      nav("/");
    }
  };

  const fillDemo = () => {
    setForm({ username: "admin", password: "admin123" });
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sisi Kiri: Branding & Feature Highlights (Desktop) */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-7/12 relative flex-col justify-between overflow-hidden bg-gradient-to-br from-teal-900 via-teal-800 to-slate-950 p-12 text-white">
        {/* Decorative blur rings */}
        <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-teal-500/20 blur-3xl" />
        <div className="absolute top-1/2 -right-24 h-96 w-96 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="absolute -bottom-24 left-1/3 h-96 w-96 rounded-full bg-cyan-500/15 blur-3xl" />

        {/* Top Logo */}
        <div className="relative z-10">
          <Logo size="lg" light={true} />
        </div>

        {/* Center Content */}
        <div className="relative z-10 max-w-lg space-y-6">
          <h1 className="text-3xl font-extrabold leading-tight text-white">
            Ikatandi Group
          </h1>

          <p className="text-sm text-teal-100/80 leading-relaxed">
            Sistem pengelolaan rencana anggaran biaya harian, penerbitan PO supplier, dan rekonsiliasi nota belanja.
          </p>

          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3 text-sm text-teal-100">
              <CheckCircle2 size={18} className="text-teal-400" />
              <span>RAB Harian per Pelanggan & Toko</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-teal-100">
              <FileSpreadsheet size={18} className="text-teal-400" />
              <span>Penerbitan PO per Supplier Otomatis</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-teal-100">
              <Receipt size={18} className="text-teal-400" />
              <span>Pencatatan & Rekonsiliasi Nota Toko</span>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="relative z-10 text-xs text-teal-300/60 font-semibold tracking-wider uppercase">
          Ikatandi Group
        </div>
      </div>

      {/* Sisi Kanan: Form Login */}
      <div className="flex flex-1 items-center justify-center p-6 sm:p-12 lg:w-1/2 xl:w-5/12">
        <div className="w-full max-w-md space-y-6">
          {/* Brand Logo di Form Panel */}
          <div className="flex justify-center lg:justify-start">
            <Logo size="lg" />
          </div>

          <div className="space-y-1 text-center lg:text-left">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              Masuk
            </h2>
            <p className="text-sm text-slate-500">
              Masukkan username dan password akun Anda
            </p>
          </div>

          {/* Form */}
          <form onSubmit={submit} className="space-y-5">
            {/* Username Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Username
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <User size={18} />
                </div>
                <input
                  type="text"
                  required
                  placeholder="Masukkan username"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-800 placeholder-slate-400 shadow-sm transition focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand/10"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Password
                </label>
              </div>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Masukkan password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-11 text-sm text-slate-800 placeholder-slate-400 shadow-sm transition focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand/10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                />
                <span>Ingat saya di perangkat ini</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-teal-700 via-teal-600 to-emerald-600 py-3.5 px-4 text-sm font-bold text-white shadow-lg shadow-teal-700/25 transition-all duration-200 hover:from-teal-800 hover:to-emerald-700 hover:shadow-xl hover:shadow-teal-700/35 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <svg
                    className="h-5 w-5 animate-spin text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span>Memproses...</span>
                </>
              ) : (
                <>
                  <LogIn size={18} className="transition-transform group-hover:translate-x-0.5" />
                  <span>Masuk</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials Box */}
          {/* <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-xs text-slate-700">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="font-semibold text-slate-800">Akun Demo:</p>
                <p className="text-slate-600">
                  User: <code className="font-mono font-bold bg-white px-1.5 py-0.5 rounded border border-slate-200">admin</code> &bull; Pass: <code className="font-mono font-bold bg-white px-1.5 py-0.5 rounded border border-slate-200">admin123</code>
                </p>
              </div>
              <button
                type="button"
                onClick={fillDemo}
                className="rounded-lg bg-white px-2.5 py-1 font-semibold text-slate-700 shadow-xs border border-slate-200 hover:bg-slate-50 transition"
              >
                Isi Otomatis
              </button>
            </div>
          </div> */}

          <p className="text-center text-xs text-slate-400">
            &copy; {new Date().getFullYear()} Ikatandi Group
          </p>
        </div>
      </div>
    </div>
  );
}
