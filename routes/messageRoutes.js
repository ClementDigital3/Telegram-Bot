const express = require("express");
const router = express.Router();
const axios = require("axios");
const Message = require("../models/Message");

// POST /send
router.post("/send", async (req, res) => {
  try {
    const { name, email, message } = req.body;

    // Save to MongoDB
    await Message.create({ name, email, message });

    // Send to Telegram
    await axios.post(
      `https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`,
      {
        chat_id: process.env.CHAT_ID,
        text: `New Message\nName: ${name}\nEmail: ${email}\nMessage: ${message}`
      }
    );

    res.json({ success: true });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false });
  }
});

module.exports = router;
