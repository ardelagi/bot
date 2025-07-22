const GuildSettings = require("../../../database/models/GuildSettings");

module.exports = {
  name: "set-personality",
  description: "Mengubah kepribadian (system prompt) untuk AI.",
  category: "ADMIN",
  command: {
    enabled: true,
    userPermissions: ["ManageGuild"], // Hanya untuk user dengan izin "Manage Server"
  },
  async execute(message, args) {
    if (!args.length) {
      return message.reply(
        "Tolong berikan prompt kepribadian. Contoh: `!set-personality Kamu adalah asisten yang sarkastik.`"
      );
    }

    const newPrompt = args.join(" ");
    const guildId = message.guild.id;

    try {
      await GuildSettings.findOneAndUpdate(
        { guildId },
        { aiSystemPrompt: newPrompt },
        { upsert: true, new: true } // Buat baru jika belum ada
      );

      await message.reply(`Kepribadian AI berhasil diubah menjadi:\n> ${newPrompt}`);
    } catch (error) {
      console.error("Error saat mengubah kepribadian AI:", error);
      return message.reply("Maaf, terjadi kesalahan saat menyimpan pengaturan baru.");
    }
  },
};