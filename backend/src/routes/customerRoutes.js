const express = require('express');
const controller = require('../controllers/customerController');

const router = express.Router();
router.route('/').get(controller.getCustomers).post(controller.createCustomer);
router.route('/:id').get(controller.getCustomer).put(controller.updateCustomer).delete(controller.deleteCustomer);

module.exports = router;
