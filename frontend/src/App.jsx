import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "@/components/Layout";
import LandingPage from "@/pages/LandingPage";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Rab from "@/pages/Rab";
import Suppliers from "@/pages/Suppliers";
import Customers from "@/pages/Customers";
import Po from "@/pages/Po";
import Nota from "@/pages/Nota";
import NotaDetail from "@/pages/NotaDetail";
import Reports from "@/pages/Reports";
import Users from "@/pages/Users";
import Materials from "@/pages/Materials";
import Settings from "@/pages/Settings";

const Private = ({ children }) => (localStorage.getItem("token") ? children : <Navigate to="/login" replace />);

export default function App() {
  return (
    <Routes>
      {/* Website Depan Publik (Landing Page) */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/beranda" element={<LandingPage />} />

      {/* Autentikasi */}
      <Route path="/login" element={<Login />} />

      {/* Sistem Portal Internal */}
      <Route element={<Private><Layout /></Private>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/app" element={<Dashboard />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/laporan" element={<Reports />} />
        <Route path="/rab" element={<Rab />} />
        <Route path="/po" element={<Po />} />
        <Route path="/nota" element={<Nota />} />
        <Route path="/nota/:id" element={<NotaDetail />} />
        <Route path="/materials" element={<Materials />} />
        <Route path="/suppliers" element={<Suppliers />} />
        <Route path="/customers" element={<Customers />} />
        <Route path="/users" element={<Users />} />
        <Route path="/settings" element={<Settings />} />
      </Route>

      {/* Fallback ke beranda */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
