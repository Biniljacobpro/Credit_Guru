const pool = require("../config/db");
const validDate = (value) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || "")) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
};

const createPayment = async (req, res, next) => {
  let client;
  try {
    const { invoiceId, paymentDate, amount, paymentMethod } = req.body;
    const value = Number(amount);
    if (!invoiceId) {
      return res.status(400).json({ error: "invoiceId is required" });
    }
    if (!validDate(paymentDate)) {
      return res.status(400).json({ error: "paymentDate must be a valid date in YYYY-MM-DD format" });
    }
    if (!Number.isFinite(value) || value <= 0) {
      return res.status(400).json({ error: "amount must be greater than zero" });
    }
    if (!["cash", "bank", "upi"].includes(paymentMethod)) {
      return res.status(400).json({ error: "paymentMethod must be cash, bank, or upi" });
    }
    client = await pool.connect();
    await client.query("BEGIN");
    const invoice = await client.query("SELECT id, total FROM invoices WHERE id = $1 FOR UPDATE", [invoiceId]);
    if (!invoice.rows[0]) { await client.query("ROLLBACK"); return res.status(404).json({ error: "Invoice not found" }); }
    const paid = await client.query("SELECT COALESCE(SUM(amount), 0)::numeric AS amount_paid FROM payments WHERE invoice_id = $1", [invoiceId]);
    const balance = Number(invoice.rows[0].total) - Number(paid.rows[0].amount_paid);
    if (value > balance + 0.005) { await client.query("ROLLBACK"); return res.status(400).json({ error: `Payment exceeds the remaining balance of ${balance.toFixed(2)}` }); }
    const payment = await client.query(
      "INSERT INTO payments (invoice_id, payment_date, amount, payment_method) VALUES ($1, $2, $3, $4) RETURNING id, invoice_id, payment_date, amount, payment_method",
      [invoiceId, paymentDate, value.toFixed(2), paymentMethod],
    );
    const newBalance = balance - value;
    const status = newBalance <= 0.005 ? "paid" : "partly_paid";
    await client.query("UPDATE invoices SET status = $1 WHERE id = $2", [status, invoiceId]);
    await client.query("COMMIT");
    res.status(201).json({ ...payment.rows[0], status, balance: Math.max(0, newBalance) });
  } catch (error) {
    if (client) await client.query("ROLLBACK").catch(() => {});
    next(error);
  } finally {
    if (client) client.release();
  }
};

const getPayments = async (req, res, next) => {
  try {
    const result = await pool.query(`SELECT p.id, p.invoice_id, i.invoice_number, c.name AS customer_name,
      p.payment_date, p.amount, p.payment_method, p.created_at
      FROM payments p JOIN invoices i ON i.id = p.invoice_id JOIN customers c ON c.id = i.customer_id
      ORDER BY p.payment_date DESC, p.created_at DESC`);
    res.json(result.rows);
  } catch (error) { next(error); }
};

module.exports = { getPayments, createPayment };
