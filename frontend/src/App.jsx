import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "@/components/Layout";
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

const Private = ({ children }) => (localStorage.getItem("token") ? children : <Navigate to="/login" replace />);

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<Private><Layout /></Private>}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/laporan" element={<Reports />} />
        <Route path="/rab" element={<Rab />} />
        <Route path="/po" element={<Po />} />
        <Route path="/nota" element={<Nota />} />
        <Route path="/nota/:id" element={<NotaDetail />} />
        <Route path="/suppliers" element={<Suppliers />} />
        <Route path="/customers" element={<Customers />} />
        <Route path="/users" element={<Users />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
