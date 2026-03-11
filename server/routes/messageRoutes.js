const express = require("express");
const axios = require("axios");
const mongoose = require("mongoose");

const Message = require("../models/Message");

const router = express.Router();

function ensureMongoConnection(res) {
  if (mongoose.connection.readyState === 1) {
    return true;
  }

  res.status(503).json({
    success: false,
    error:
      "MongoDB is not connected. Update server/.env with a valid MONGO_URI before testing messages.",
  });
  return false;
}

router.get("/", async (req, res) => {
  if (!ensureMongoConnection(res)) {
    return;
  }

  try {
    const messages = await Message.find().sort({ createdAt: 1 });
    res.json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post("/", async (req, res) => {
  if (!ensureMongoConnection(res)) {
    return;
  }

  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        error: "name, email, message are required",
      });
    }

    const newMessage = await Message.create({ name, email, message });

    if (!process.env.BOT_TOKEN || !process.env.CHAT_ID) {
      return res.status(201).json({
        success: true,
        data: newMessage,
        telegramDelivered: false,
        warning: "Message saved, but Telegram is not configured.",
      });
    }

    try {
      await axios.post(
        `https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`,
        {
          chat_id: process.env.CHAT_ID,
          text: `New Message\n\nName: ${name}\nEmail: ${email}\nMessage: ${message}`,
        }
      );
    } catch (telegramError) {
      return res.status(502).json({
        success: false,
        data: newMessage,
        telegramDelivered: false,
        error: "Message saved, but Telegram delivery failed.",
        details: telegramError.response?.data?.description || telegramError.message,
      });
    }

    res.status(201).json({ success: true, data: newMessage, telegramDelivered: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
