// server/routes/chatbotRoutes.js
const express = require("express");
const router = express.Router();

const {
  chatbotReply,
  getUserChats,
  createChat,
  updateChat,
  deleteChat,
} = require("../controllers/chatbotController");

const { authRequired } = require("../config/jwtMiddleware");

// CHATBOT RAG ENDPOINT
router.post("/", chatbotReply);

// CHAT MANAGEMENT
router.get("/chats/all", authRequired, getUserChats);
router.post("/chats/create", authRequired, createChat);
router.put("/chats/update/:id", authRequired, updateChat);
router.delete("/chats/delete/:id", authRequired, deleteChat);

module.exports = router;
