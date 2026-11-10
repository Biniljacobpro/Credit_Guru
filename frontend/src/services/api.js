import axios from "axios";
const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api" });
export const customersApi = { list: () => api.get("/customers"), get: (id) => api.get(`/customers/${id}`), create: (data) => api.post("/customers", data) };
export const invoicesApi = { list: () => api.get("/invoices"), get: (id) => api.get(`/invoices/${id}`), create: (data) => api.post("/invoices", data) };
export const paymentsApi = { list: () => api.get("/payments"), create: (data) => api.post("/payments", data) };
