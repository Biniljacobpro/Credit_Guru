const express = require("express");
const controller = require("../controllers/paymentController");
const router = express.Router();
router.get("/", controller.getPayments);
router.post("/", controller.createPayment);
module.exports = router;
