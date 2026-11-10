const express = require('express');
const controller = require('../controllers/invoiceController');

const router = express.Router();
router.route('/').get(controller.getInvoices).post(controller.createInvoice);
router.route('/:id').get(controller.getInvoice).put(controller.updateInvoice).delete(controller.deleteInvoice);

module.exports = router;
