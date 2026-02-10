// server/routes/chatbotRoutes.js
const express = require("express");
const router = express.Router();

const { chatbotReply } = require("../controllers/chatbotController");

// CHATBOT RAG ENDPOINT
router.post("/", chatbotReply);

module.exports = router;
