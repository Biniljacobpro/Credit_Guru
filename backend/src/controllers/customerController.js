const { query } = require('../config/db');

const getCustomers = async (req, res, next) => {
  try {
    const result = await query(
      'SELECT id, name, email, phone, address, created_at FROM customers ORDER BY created_at DESC',
    );
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
};

const getCustomer = async (req, res, next) => {
  try {
    const result = await query(
      'SELECT id, name, email, phone, address, created_at FROM customers WHERE id = $1',
      [req.params.id],
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Customer not found' });
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

const createCustomer = async (req, res, next) => {
  try {
    const { name, email, phone, address } = req.body;
    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ error: 'name is required' });
    }

    const result = await query(
      `INSERT INTO customers (name, email, phone, address)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, phone, address, created_at`,
      [name.trim(), email || null, phone || null, address || null],
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

const updateCustomer = async (req, res, next) => {
  try {
    const { name, email, phone, address } = req.body;
    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ error: 'name is required' });
    }

    const result = await query(
      `UPDATE customers
       SET name = $1, email = $2, phone = $3, address = $4
       WHERE id = $5
       RETURNING id, name, email, phone, address, created_at`,
      [name.trim(), email || null, phone || null, address || null, req.params.id],
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Customer not found' });
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

const deleteCustomer = async (req, res, next) => {
  try {
    const result = await query('DELETE FROM customers WHERE id = $1 RETURNING id', [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Customer not found' });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

module.exports = { getCustomers, getCustomer, createCustomer, updateCustomer, deleteCustomer };
