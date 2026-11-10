const { query } = require('../config/db');

const getPayments = async (req, res, next) => {
  try {
    const result = await query(
      `SELECT p.id, p.invoice_id, i.invoice_number, p.amount, p.payment_date, p.method, p.created_at
       FROM payments p JOIN invoices i ON i.id = p.invoice_id
       ORDER BY p.payment_date DESC, p.created_at DESC`,
    );
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
};

const createPayment = async (req, res, next) => {
  try {
    const { invoiceId, amount, paymentDate, method } = req.body;
    if (!invoiceId || amount === undefined || !paymentDate) {
      return res.status(400).json({ error: 'invoiceId, amount, and paymentDate are required' });
    }
    if (!Number.isFinite(Number(amount)) || Number(amount) <= 0) {
      return res.status(400).json({ error: 'amount must be greater than zero' });
    }

    const result = await query(
      `INSERT INTO payments (invoice_id, amount, payment_date, method)
       VALUES ($1, $2, $3, $4)
       RETURNING id, invoice_id, amount, payment_date, method, created_at`,
      [invoiceId, amount, paymentDate, method || null],
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

const deletePayment = async (req, res, next) => {
  try {
    const result = await query('DELETE FROM payments WHERE id = $1 RETURNING id', [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Payment not found' });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

module.exports = { getPayments, createPayment, deletePayment };
