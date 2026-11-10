import { BrowserRouter, Navigate, Routes, Route } from "react-router-dom";
import DashboardLayout from "./layouts/DashboardLayout";
import Customers from "./pages/Customers";
import Invoices from "./pages/Invoices";
import CreateInvoice from "./pages/CreateInvoice";
import InvoiceDetails from "./pages/InvoiceDetails";

export default function App() {
  return <BrowserRouter><Routes><Route element={<DashboardLayout />}>
    <Route path="/" element={<Navigate to="/customers" replace />} />
    <Route path="/customers" element={<Customers />} />
    <Route path="/invoices" element={<Invoices />} />
    <Route path="/invoices/new" element={<CreateInvoice />} />
    <Route path="/invoices/:id" element={<InvoiceDetails />} />
  </Route></Routes></BrowserRouter>;
}
