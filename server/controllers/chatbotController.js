// server/controllers/chatbotController.js
const { detectIntent } = require("../rag/intentDetector");
const { buildContext } = require("../rag/contextBuilder");
const { generateFinalAnswer } = require("../rag/chatbotLLM");

exports.chatbotReply = async (req, res) => {
  try {
    const query = req.body.query;

    const intent = await detectIntent(query);
    const context = await buildContext(query, intent);

    const answer = await generateFinalAnswer({
      query,
      intent,
      context,
    });

    res.json({ response: answer });
  } catch (err) {
    console.error("Chatbot error:", err);
    res.status(500).json({ message: "Chatbot failed, try again" });
  }
};
