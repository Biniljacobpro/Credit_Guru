const { query } = require('../config/db');

const getInvoices = async (req, res, next) => {
  try {
    const result = await query(
      `SELECT i.id, i.invoice_number, i.customer_id, c.name AS customer_name,
              i.amount, i.due_date, i.status, i.created_at
       FROM invoices i JOIN customers c ON c.id = i.customer_id
       ORDER BY i.created_at DESC`,
    );
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
};

const getInvoice = async (req, res, next) => {
  try {
    const result = await query(
      `SELECT i.id, i.invoice_number, i.customer_id, c.name AS customer_name,
              i.amount, i.due_date, i.status, i.created_at
       FROM invoices i JOIN customers c ON c.id = i.customer_id WHERE i.id = $1`,
      [req.params.id],
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Invoice not found' });
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

const createInvoice = async (req, res, next) => {
  try {
    const { invoiceNumber, customerId, amount, dueDate, status = 'pending' } = req.body;
    if (!invoiceNumber || !customerId || amount === undefined || !dueDate) {
      return res.status(400).json({ error: 'invoiceNumber, customerId, amount, and dueDate are required' });
    }
    if (!Number.isFinite(Number(amount)) || Number(amount) < 0) {
      return res.status(400).json({ error: 'amount must be a non-negative number' });
    }

    const result = await query(
      `INSERT INTO invoices (invoice_number, customer_id, amount, due_date, status)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, invoice_number, customer_id, amount, due_date, status, created_at`,
      [invoiceNumber.trim(), customerId, amount, dueDate, status],
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

const updateInvoice = async (req, res, next) => {
  try {
    const { invoiceNumber, customerId, amount, dueDate, status } = req.body;
    if (!invoiceNumber || !customerId || amount === undefined || !dueDate || !status) {
      return res.status(400).json({ error: 'invoiceNumber, customerId, amount, dueDate, and status are required' });
    }
    const result = await query(
      `UPDATE invoices
       SET invoice_number = $1, customer_id = $2, amount = $3, due_date = $4, status = $5
       WHERE id = $6
       RETURNING id, invoice_number, customer_id, amount, due_date, status, created_at`,
      [invoiceNumber.trim(), customerId, amount, dueDate, status, req.params.id],
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Invoice not found' });
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

const deleteInvoice = async (req, res, next) => {
  try {
    const result = await query('DELETE FROM invoices WHERE id = $1 RETURNING id', [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Invoice not found' });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

module.exports = { getInvoices, getInvoice, createInvoice, updateInvoice, deleteInvoice };
