import axios from "axios";

const configuredApiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const normalizedApiUrl = configuredApiUrl.replace(/\/+$/, "").endsWith("/api")
  ? configuredApiUrl.replace(/\/+$/, "")
  : `${configuredApiUrl.replace(/\/+$/, "")}/api`;
const api = axios.create({ baseURL: normalizedApiUrl });

export const customersApi = { list: () => api.get("/customers"), get: (id) => api.get(`/customers/${id}`), create: (data) => api.post("/customers", data) };
export const invoicesApi = { list: () => api.get("/invoices"), get: (id) => api.get(`/invoices/${id}`), create: (data) => api.post("/invoices", data) };
export const paymentsApi = { list: () => api.get("/payments"), create: (data) => api.post("/payments", data) };
