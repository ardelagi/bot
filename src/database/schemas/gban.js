const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
  },
  username: {
    type: String,
    required: true,
  },
  reason: {
    type: String,
    default: "Tanpa alasan",
  },
  bannedBy: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: () => Date.now(),
  },
});

module.exports = mongoose.model("GlobalBan", schema);