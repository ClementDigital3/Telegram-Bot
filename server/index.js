const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const messageRoutes = require("./routes/messageRoutes");

const app = express();
const { MONGO_URI, PORT = 5000, CORS_ORIGIN } = process.env;

const hasUsableMongoUri =
  typeof MONGO_URI === "string" &&
  MONGO_URI.trim() !== "" &&
  !MONGO_URI.includes("YOURCLUSTER");

const allowedOrigins = (CORS_ORIGIN || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

let mongoConnectionPromise;

function connectToMongo() {
  if (!hasUsableMongoUri) {
    console.warn(
      "MongoDB connection skipped: set a real MONGO_URI in server/.env before testing persistence."
    );
    return Promise.resolve();
  }

  if (mongoose.connection.readyState === 1) {
    return Promise.resolve();
  }

  if (!mongoConnectionPromise) {
    mongoConnectionPromise = mongoose
      .connect(MONGO_URI)
      .then(() => console.log("MongoDB connected successfully"))
      .catch((err) => {
        mongoConnectionPromise = null;
        console.error("MongoDB connection error:", err.message);
        throw err;
      });
  }

  return mongoConnectionPromise;
}

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`Origin ${origin} is not allowed by CORS.`));
    },
  })
);
app.use(express.json());

app.use(async (req, res, next) => {
  try {
    await connectToMongo();
    next();
  } catch (error) {
    next(error);
  }
});

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

app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({
    success: false,
    error: error.message || "Server error",
  });
});

if (!process.env.VERCEL) {
  connectToMongo().finally(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  });
}

module.exports = app;
