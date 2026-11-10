const pool = require("../config/db");
const money = (value) => Math.round(Number(value) * 100) / 100;
const validDate = (value) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || "")) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
};
const invoiceSelect = `SELECT i.id, i.invoice_number, i.customer_id, c.name AS customer_name, c.email AS customer_email, c.phone AS customer_phone,
 i.invoice_date, i.due_date, i.total, COALESCE(SUM(p.amount), 0)::numeric AS amount_paid,
 (i.total - COALESCE(SUM(p.amount), 0))::numeric AS balance, i.status, i.created_at
 FROM invoices i JOIN customers c ON c.id = i.customer_id LEFT JOIN payments p ON p.invoice_id = i.id`;

const getInvoices = async (req, res, next) => {
  try {
    const result = await pool.query(`${invoiceSelect} GROUP BY i.id, c.id ORDER BY i.created_at DESC`);
    res.json(result.rows);
  } catch (error) { next(error); }
};

const getInvoice = async (req, res, next) => {
  try {
    const invoice = await pool.query(`${invoiceSelect} WHERE i.id = $1 GROUP BY i.id, c.id`, [req.params.id]);
    if (!invoice.rows[0]) return res.status(404).json({ error: "Invoice not found" });
    const [items, payments] = await Promise.all([
      pool.query("SELECT id, description, quantity, unit_price, tax_rate, line_total FROM invoice_items WHERE invoice_id = $1 ORDER BY id", [req.params.id]),
      pool.query("SELECT id, payment_date, amount, payment_method, created_at FROM payments WHERE invoice_id = $1 ORDER BY payment_date DESC, created_at DESC", [req.params.id]),
    ]);
    res.json({ ...invoice.rows[0], items: items.rows, payments: payments.rows });
  } catch (error) { next(error); }
};

const createInvoice = async (req, res, next) => {
  let client;
  try {
    const { invoiceNumber, customerId, invoiceDate, dueDate, items } = req.body;
    if (!invoiceNumber || !customerId || !validDate(invoiceDate) || !validDate(dueDate) || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "invoiceNumber, customerId, valid dates, and at least one item are required" });
    }
    if (new Date(dueDate) < new Date(invoiceDate)) return res.status(400).json({ error: "dueDate cannot be before invoiceDate" });
    const calculated = items.map((item) => {
      const quantity = Number(item.quantity), unitPrice = Number(item.unitPrice), taxRate = Number(item.taxRate || 0);
      if (!item.description?.trim() || !Number.isFinite(quantity) || quantity <= 0 || !Number.isFinite(unitPrice) || unitPrice < 0 || !Number.isFinite(taxRate) || taxRate < 0 || taxRate > 100) return null;
      const subtotal = quantity * unitPrice;
      return { description: item.description.trim(), quantity, unitPrice, taxRate, lineTotal: money(subtotal + subtotal * taxRate / 100) };
    });
    if (calculated.some((item) => !item)) return res.status(400).json({ error: "Each item needs a description, positive quantity, non-negative price, and tax rate from 0 to 100" });
    const total = money(calculated.reduce((sum, item) => sum + item.lineTotal, 0));
    if (!Number.isFinite(total) || total < 0) {
      return res.status(400).json({ error: "Invoice total is invalid" });
    }

    client = await pool.connect();
    await client.query("BEGIN");
    const customer = await client.query("SELECT id FROM customers WHERE id = $1", [customerId]);
    if (!customer.rows[0]) { await client.query("ROLLBACK"); return res.status(400).json({ error: "Customer not found" }); }
    const invoice = await client.query(
      "INSERT INTO invoices (invoice_number, customer_id, invoice_date, due_date, total) VALUES ($1, $2, $3, $4, $5) RETURNING id",
      [invoiceNumber.trim(), customerId, invoiceDate, dueDate, total],
    );
    for (const item of calculated) {
      await client.query("INSERT INTO invoice_items (invoice_id, description, quantity, unit_price, tax_rate) VALUES ($1, $2, $3, $4, $5)",
        [invoice.rows[0].id, item.description, item.quantity, item.unitPrice, item.taxRate]);
    }
    await client.query("COMMIT");
    res.status(201).json({ id: invoice.rows[0].id, invoiceNumber: invoiceNumber.trim(), total, status: "unpaid" });
  } catch (error) {
    if (client) await client.query("ROLLBACK").catch(() => {});
    next(error);
  } finally {
    if (client) client.release();
  }
};

const deleteInvoice = async (req, res, next) => {
  try {
    const result = await pool.query("DELETE FROM invoices WHERE id = $1 RETURNING id", [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ error: "Invoice not found" });
    res.status(204).send();
  } catch (error) { next(error); }
};

module.exports = { getInvoices, getInvoice, createInvoice, deleteInvoice };
