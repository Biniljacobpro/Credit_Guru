const express = require('express');
const controller = require('../controllers/customerController');

const router = express.Router();
router.route('/').get(controller.getCustomers).post(controller.createCustomer);
router.get('/:id', controller.getCustomer);

module.exports = router;
