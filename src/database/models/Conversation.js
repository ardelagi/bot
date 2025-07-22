const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
    },
    messages: [
      {
        role: { type: String, required: true }, // 'user', 'assistant', atau 'system'
        content: { type: String, required: true },
      },
    ],
  },
  { timestamps: true } // Otomatis menambahkan createdAt dan updatedAt
);

module.exports = mongoose.model("Conversation", conversationSchema);