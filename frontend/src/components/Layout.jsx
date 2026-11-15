import { useState } from "react";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  ClipboardList,
  FileSpreadsheet,
  LayoutDashboard,
  LogOut,
  Menu,
  Receipt,
  Store,
  Users,
  X,
  BarChart3,
  UserCheck,
  UserCog,
  ChevronRight,
  Carrot,
} from "lucide-react";
import Logo from "@/components/Logo";

const SECTIONS = [
  {
    title: "UTAMA",
    items: [
      { to: "/", label: "Dashboard", icon: LayoutDashboard },
      { to: "/reports", label: "Laporan", icon: BarChart3 },
    ],
  },
  {
    title: "TRANSAKSI",
    items: [
      { to: "/rab", label: "RAB Harian", icon: ClipboardList },
      { to: "/po", label: "Purchase Order (PO)", icon: FileSpreadsheet },
      { to: "/nota", label: "Nota Toko", icon: Receipt },
    ],
  },
  {
    title: "MASTER",
    items: [
      { to: "/materials", label: "Bahan Baku", icon: Carrot },
      { to: "/suppliers", label: "Toko / Supplier", icon: Store },
      { to: "/customers", label: "Pelanggan", icon: Users },
      { to: "/users", label: "Pengguna", icon: UserCog },
    ],
  },
];

export default function Layout() {
  const [open, setOpen] = useState(false);
  const nav = useNavigate();
  const location = useLocation();

  const storedUser = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  })();
  const username = storedUser?.username || "Admin";

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    nav("/login");
  };

  // Find active page title for header
  const allItems = SECTIONS.flatMap((s) => s.items);
  const currentItem = allItems.find(
    (i) => i.to === location.pathname || (i.to !== "/" && location.pathname.startsWith(i.to))
  );
  const currentTitle = currentItem?.label || "Ikatandi Group";

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-800 print:bg-white print:text-black print:min-h-0 print:block">
      {/* Mobile Backdrop */}
      <div
        onClick={() => setOpen(false)}
        className={`fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs transition-opacity duration-300 lg:hidden print:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-slate-900 text-slate-100 shadow-2xl transition-transform duration-300 ease-in-out print:hidden lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Sidebar Header with Logo */}
        <div className="flex items-center justify-between border-b border-slate-800/80 px-6 py-5">
          <Logo size="md" light={true} />
          <button
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden"
            onClick={() => setOpen(false)}
            aria-label="Tutup menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 py-5 space-y-6">
          {SECTIONS.map((sec) => (
            <div key={sec.title} className="space-y-1.5">
              <p className="px-3 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                {sec.title}
              </p>
              <div className="space-y-1">
                {sec.items.map(({ to, label, icon: Icon }) => {
                  const isActive =
                    to === "/"
                      ? location.pathname === "/"
                      : location.pathname.startsWith(to);

                  return (
                    <NavLink
                      key={to}
                      to={to}
                      end={to === "/"}
                      onClick={() => setOpen(false)}
                      className={`group relative flex items-center justify-between rounded-xl px-3.5 py-3 text-sm font-semibold transition-all duration-150 ${
                        isActive
                          ? "bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-md shadow-teal-900/30"
                          : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <Icon
                          size={20}
                          className={`transition-transform duration-200 group-hover:scale-110 ${
                            isActive ? "text-teal-100" : "text-slate-400 group-hover:text-teal-400"
                          }`}
                        />
                        <span className="tracking-tight">{label}</span>
                      </div>
                      {isActive && (
                        <ChevronRight size={16} className="text-teal-200/80" />
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* User Card & Logout Footer */}
        <div className="border-t border-slate-800/80 p-4">
          <div className="mb-2 flex items-center justify-between rounded-xl bg-slate-800/60 p-3">
            <div className="flex items-center gap-3">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/20 text-teal-400 font-bold">
                <UserCheck size={20} />
                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-slate-900" />
              </div>
              <div className="leading-tight">
                <p className="text-sm font-bold text-white capitalize">{username}</p>
                <p className="text-xs text-teal-400 font-medium">Administrator</p>
              </div>
            </div>
            <button
              onClick={logout}
              title="Keluar"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-rose-500/20 hover:text-rose-400 transition"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="lg:pl-72 print:pl-0 flex flex-col min-h-screen print:min-h-0 print:bg-white print:block">
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 backdrop-blur-md px-4 sm:px-8 print:hidden shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 lg:hidden"
              aria-label="Buka menu"
            >
              <Menu size={22} />
            </button>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-none">
              {currentTitle}
            </h1>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 print:p-0 print:m-0 print:bg-white print:block">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
