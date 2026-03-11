const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const messageRoutes = require("./routes/messageRoutes");

const app = express();
const { MONGO_URI, PORT = 5000 } = process.env;

const hasUsableMongoUri =
  typeof MONGO_URI === "string" &&
  MONGO_URI.trim() !== "" &&
  !MONGO_URI.includes("YOURCLUSTER");

app.use(cors());
app.use(express.json());

if (hasUsableMongoUri) {
  mongoose
    .connect(MONGO_URI)
    .then(() => console.log("MongoDB connected successfully"))
    .catch((err) => console.error("MongoDB connection error:", err.message));
} else {
  console.warn(
    "MongoDB connection skipped: set a real MONGO_URI in server/.env before testing persistence."
  );
}

app.use("/api/messages", messageRoutes);

app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    mongodb: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    telegram:
      process.env.BOT_TOKEN && process.env.CHAT_ID ? "configured" : "not_configured",
  });
});

app.get("/", (req, res) => {
  res.send("Server running...");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
