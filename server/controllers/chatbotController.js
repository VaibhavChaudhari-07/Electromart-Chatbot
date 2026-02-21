// server/controllers/chatbotController.js
const { detectIntent } = require("../rag/intentDetector");
const { buildContext } = require("../rag/contextBuilder");
const { generateFinalAnswer } = require("../rag/chatbotLLM");
const Chat = require("../models/Chat");

exports.chatbotReply = async (req, res) => {
  try {
    const query = req.body.query;
    // Support both authenticated users and direct userId in body for testing
    const userIdFromAuth = req.user?._id || req.admin?._id;
    const userIdFromBody = req.body.userId;
    const userId = userIdFromAuth || userIdFromBody;

    if (!query || query.trim().length === 0) {
      return res.status(400).json({ message: "Query cannot be empty" });
    }

    // Step 1: Intent Detection - Identify query intent
    const intentObj = await detectIntent(query);
    console.log(`[Intent] ${intentObj.intent} (confidence: ${intentObj.confidence})`);

    // Step 2: Adaptive Routing & Context Fusion
    const context = await buildContext(query, intentObj, { userId });
    console.log(`[Route] ${context.route} [Type] ${context.type} [Items] ${context.items?.length || 0}`);

    // Step 3: LLM Response Generation with Retrieved Context
    const answer = await generateFinalAnswer({
      query,
      intent: intentObj.intent,
      context,
    });

    console.log(`[Response] Generated ${answer.length} characters`);

    // Map product items to UI-friendly card objects when available
    let cards = [];
    try {
      if (context.items && Array.isArray(context.items) && context.items.length > 0) {
        // Handle both products and orders
        cards = context.items.map((it) => {
          // For orders
          if (it.status) {
            return {
              id: it._id,
              title: `Order ${it._id.toString().slice(-8)} - ${it.status}`,
              price: it.totalAmount,
              type: "order",
              status: it.status,
              content: it.description || "",
            };
          }
          
          // For products
          return {
            id: it._id || it.productId || null,
            title: it.title || it.name || it.productName || "Product",
            price: it.price || it.totalAmount || null,
            rating: it.rating || null,
            image: (it.images && it.images[0]) || it.imageUrl || null,
            features: it.features || [],
            stock: typeof it.stock !== "undefined" ? it.stock : null,
            category: it.category || null,
            snippet: it.description ? (it.description.length > 140 ? it.description.slice(0, 140) + "..." : it.description) : null,
          };
        });
      }
    } catch (mapErr) {
      console.error("Error mapping cards:", mapErr.message);
    }

    res.json({
      response: answer,
      intent: intentObj.intent,
      confidence: intentObj.confidence,
      retrievalMethod: context.retrievalType || "none",
      datapoints: context.items?.length || 0,
      cards,
      data: {
        intent: intentObj.intent,
        cards: cards,
      },
    });
  } catch (err) {
    console.error("Chatbot error:", err);
    res.status(500).json({
      message: "Chatbot service encountered an error. Please try again.",
      error: err.message,
    });
  }
};

// Get all chats for authenticated user
exports.getUserChats = async (req, res) => {
  try {
    const userId = req.user?._id;
    const adminId = req.admin?._id;

    if (!userId && !adminId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const query = userId ? { userId } : { adminId };
    const chats = await Chat.find(query).sort({ createdAt: -1 });

    res.json(chats);
  } catch (err) {
    console.error("Error fetching chats:", err);
    res.status(500).json({ message: "Failed to fetch chats" });
  }
};

// Create new chat
exports.createChat = async (req, res) => {
  try {
    const { title } = req.body;
    const userId = req.user?._id;
    const adminId = req.admin?._id;

    if (!userId && !adminId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const chatData = {
      title: title || `Chat ${Date.now()}`,
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    if (userId) chatData.userId = userId;
    if (adminId) chatData.adminId = adminId;

    const chat = new Chat(chatData);
    await chat.save();

    res.status(201).json(chat);
  } catch (err) {
    console.error("Error creating chat:", err);
    res.status(500).json({ message: "Failed to create chat" });
  }
};

// Update chat with new message
exports.updateChat = async (req, res) => {
  try {
    const { id } = req.params;
    const { messages } = req.body;
    const userId = req.user?._id;
    const adminId = req.admin?._id;

    if (!userId && !adminId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const query = { _id: id };
    if (userId) query.userId = userId;
    if (adminId) query.adminId = adminId;

    const chat = await Chat.findOneAndUpdate(
      query,
      { messages, updatedAt: Date.now() },
      { new: true }
    );

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    res.json(chat);
  } catch (err) {
    console.error("Error updating chat:", err);
    res.status(500).json({ message: "Failed to update chat" });
  }
};

// Delete chat
exports.deleteChat = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;
    const adminId = req.admin?._id;

    if (!userId && !adminId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const query = { _id: id };
    if (userId) query.userId = userId;
    if (adminId) query.adminId = adminId;

    const chat = await Chat.findOneAndDelete(query);

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    res.json({ message: "Chat deleted successfully" });
  } catch (err) {
    console.error("Error deleting chat:", err);
    res.status(500).json({ message: "Failed to delete chat" });
  }
};
