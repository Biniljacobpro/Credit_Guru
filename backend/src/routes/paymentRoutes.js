const express = require('express');
const controller = require('../controllers/paymentController');

const router = express.Router();
router.route('/').get(controller.getPayments).post(controller.createPayment);
router.delete('/:id', controller.deletePayment);

module.exports = router;
