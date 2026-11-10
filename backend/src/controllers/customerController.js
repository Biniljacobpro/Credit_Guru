const pool = require("../config/db");

const getCustomers = async (req, res, next) => {
  try {
    const result = await pool.query("SELECT id, name, email, phone, created_at FROM customers ORDER BY created_at DESC");
    res.json(result.rows);
  } catch (error) { next(error); }
};

const getCustomer = async (req, res, next) => {
  try {
    const result = await pool.query("SELECT id, name, email, phone, created_at FROM customers WHERE id = $1", [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ error: "Customer not found" });
    const invoices = await pool.query("SELECT id, invoice_number, invoice_date, due_date, total, status FROM invoices WHERE customer_id = $1 ORDER BY created_at DESC", [req.params.id]);
    res.json({ ...result.rows[0], invoices: invoices.rows });
  } catch (error) { next(error); }
};

const createCustomer = async (req, res, next) => {
  try {
    const { name, email, phone } = req.body;
    if (!name?.trim() || !email?.trim() || !phone?.trim()) return res.status(400).json({ error: "name, email, and phone are required" });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: "email is invalid" });
    const result = await pool.query(
      "INSERT INTO customers (name, email, phone) VALUES ($1, $2, $3) RETURNING id, name, email, phone, created_at",
      [name.trim(), email.trim().toLowerCase(), phone.trim()],
    );
    res.status(201).json(result.rows[0]);
  } catch (error) { next(error); }
};

module.exports = { getCustomers, getCustomer, createCustomer };
