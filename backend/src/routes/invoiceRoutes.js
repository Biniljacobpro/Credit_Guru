const express = require("express");
const controller = require("../controllers/invoiceController");
const router = express.Router();
router.get("/", controller.getInvoices);
router.post("/", controller.createInvoice);
router.get("/:id", controller.getInvoice);
router.delete("/:id", controller.deleteInvoice);
module.exports = router;
