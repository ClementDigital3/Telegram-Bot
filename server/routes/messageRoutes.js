const express = require("express");
const router = express.Router();
const axios = require("axios");
const Message = require("../models/Message");

// ✅ GET all messages (saved in MongoDB)
router.get("/", async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: 1 }); // oldest first
    res.json(messages);
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ✅ POST message (save to MongoDB + send to Telegram)
router.post("/", async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        error: "name, email, message are required",
      });
    }

    // Save to MongoDB
    const newMessage = await Message.create({ name, email, message });

    // Send to Telegram
    await axios.post(
      `https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`,
      {
        chat_id: process.env.CHAT_ID,
        text: `📩 New Message\n\nName: ${name}\nEmail: ${email}\nMessage: ${message}`,
      }
    );

    res.json({ success: true, data: newMessage });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;