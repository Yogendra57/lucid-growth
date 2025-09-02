const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const bodyParser = require("body-parser");

dotenv.config();

const emailRoutes = require("./routes/emailRoutes");
const sessionRoutes = require("./routes/sessionRoutes");
const connectDB = require("./config/db");
const startEmailListener = require("./emailListener");

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use("/api/emails", emailRoutes);
app.use("/api/sessions", sessionRoutes);

// MongoDB Connection
connectDB().then(() => {
  // Start IMAP listener only after DB connected
  startEmailListener();
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
