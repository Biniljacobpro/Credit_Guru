const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const customerRoutes = require("./routes/customerRoutes");
const invoiceRoutes = require("./routes/invoiceRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");

const app = express();

app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173"
}));
app.use(helmet());

app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        message: "Welcome to CreditGuru API"
    });
});

app.use("/api/customers", customerRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/dashboard", dashboardRoutes);

module.exports = app;