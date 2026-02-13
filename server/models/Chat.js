const mongoose = require("mongoose");

const ChatSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
    title: { type: String, required: true },
    messages: [
      {
        sender: { type: String, enum: ["user", "bot"], required: true },
        text: { type: String, required: true },
        ts: { type: Number, required: true },
        // Allow optional product cards (persisted from bot responses)
        cards: [
          {
            type: mongoose.Schema.Types.Mixed,
          },
        ],
      },
    ],
    createdAt: { type: Number, default: Date.now },
    updatedAt: { type: Number, default: Date.now },
  },
  { timestamps: false }
);

module.exports = mongoose.model("Chat", ChatSchema);
