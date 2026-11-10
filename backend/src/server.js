require("dotenv").config();

const app = require("./app");
const pool = require("./config/db");

const PORT = Number(process.env.PORT || 5000);

async function startServer() {
    app.listen(PORT, async () => {
        console.log(`Server running on port ${PORT}`);

        try {
        await pool.query("SELECT NOW()");
            console.log("Database connection successful");
        } catch (error) {
            if (error.code === "ECONNREFUSED") {
                console.error(
                    `Database unavailable at ${process.env.DATABASE_URL || "localhost:5432"}. ` +
                    "Start PostgreSQL or update DATABASE_URL in backend/.env.",
                );
                return;
            }

            console.error("Database connection failed:", error.message);
        }
    });
}

if (require.main === module) {
    startServer();
}

module.exports = app;