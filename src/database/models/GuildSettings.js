const mongoose = require("mongoose");

const guildSettingsSchema = new mongoose.Schema({
  guildId: {
    type: String,
    required: true,
    unique: true,
  },
  aiSystemPrompt: {
    type: String,
    default: "You are a helpful and friendly assistant.",
  },
});

module.exports = mongoose.model("GuildSettings", guildSettingsSchema);