const pool = require("../config/db");

const getDashboard = async (req, res, next) => {
  try {
    const [summary, invoices, payments, monthly] = await Promise.all([
      pool.query(`SELECT COUNT(*)::int AS total_invoices, COALESCE(SUM(total), 0)::numeric AS total_revenue,
        COALESCE(SUM(total) FILTER (WHERE status != 'paid'), 0)::numeric AS outstanding_balance,
        COUNT(*) FILTER (WHERE status = 'paid')::int AS paid_invoices FROM invoices`),
      pool.query(`SELECT i.id, i.invoice_number, c.name AS customer_name, i.invoice_date, i.total, i.status,
        COALESCE(SUM(p.amount), 0)::numeric AS amount_paid, (i.total - COALESCE(SUM(p.amount), 0))::numeric AS balance
        FROM invoices i JOIN customers c ON c.id = i.customer_id LEFT JOIN payments p ON p.invoice_id = i.id
        GROUP BY i.id, c.id ORDER BY i.created_at DESC LIMIT 5`),
      pool.query(`SELECT p.id, i.invoice_number, c.name AS customer_name, p.payment_date, p.amount, p.payment_method
        FROM payments p JOIN invoices i ON i.id = p.invoice_id JOIN customers c ON c.id = i.customer_id
        ORDER BY p.created_at DESC LIMIT 5`),
      pool.query(`SELECT TO_CHAR(DATE_TRUNC('month', payment_date), 'Mon YYYY') AS month,
        DATE_TRUNC('month', payment_date) AS month_date, COALESCE(SUM(amount), 0)::numeric AS revenue
        FROM payments GROUP BY month_date ORDER BY month_date DESC LIMIT 6`),
    ]);
    res.json({ summary: summary.rows[0], recentInvoices: invoices.rows, recentPayments: payments.rows, monthlyRevenue: monthly.rows.reverse() });
  } catch (error) { next(error); }
};

module.exports = { getDashboard };
