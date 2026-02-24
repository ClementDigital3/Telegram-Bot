const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config(); // Load .env

const messageRoutes = require("./routes/messageRoutes");

const app = express();

app.use(cors());
app.use(express.json());

// 🔹 Debug: Check MONGO_URI is read correctly
console.log("MONGO_URI =>", process.env.MONGO_URI);

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// Routes
app.use("/api/messages", messageRoutes);

// Optional test route
app.get("/", (req, res) => {
  res.send("Server running...");
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

