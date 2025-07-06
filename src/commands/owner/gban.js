module.exports = {
  name: "gban", // <== ini akan jadi /gban
  description: "Global Ban",
  category: "OWNER",
  slashCommand: {
    enabled: true,
    ephemeral: false,
    options: [
      {
        name: "add",
        description: "Tambahkan user ke daftar GBan",
        type: 1, // SUBCOMMAND
        options: [
          {
            name: "user",
            description: "User yang akan di-ban",
            type: 6, // USER
            required: true,
          },
          {
            name: "reason",
            description: "Alasan ban",
            type: 3, // STRING
            required: false,
          },
        ],
      },
      {
        name: "remove",
        description: "Hapus user dari daftar GBan",
        type: 1,
        options: [
          {
            name: "user",
            description: "User yang akan dihapus",
            type: 6,
            required: true,
          },
        ],
      },
      {
        name: "list",
        description: "Lihat daftar user yang di-GBan",
        type: 1,
      },
    ],
  },

  async interactionRun(interaction) {
    const sub = interaction.options.getSubcommand();
    const user = interaction.options.getUser("user");
    const reason = interaction.options.getString("reason");
    const GlobalBan = require("@schemas/gban");
    console.log("[GBAN] loaded")

    if (sub === "add") {
      const exist = await GlobalBan.findOne({ userId: user.id });
      if (exist) return interaction.followUp("User ini sudah di-GBan.");
      await GlobalBan.create({
        userId: user.id,
        username: user.tag,
        reason: reason || "Tanpa alasan",
        bannedBy: interaction.user.tag,
      });
      return interaction.followUp(` ${user.tag} ditambahkan ke Global Ban.`);
    }

    if (sub === "remove") {
      const result = await GlobalBan.findOneAndDelete({ userId: user.id });
      if (!result) return interaction.followUp("User ini tidak ada di daftar GBan.");
      return interaction.followUp(` ${user.tag} dihapus dari Global Ban.`);
    }

    if (sub === "list") {
      const list = await GlobalBan.find().sort({ timestamp: -1 }).limit(10);
      if (list.length === 0) return interaction.followUp("📭 Tidak ada user di Global Ban.");
      return interaction.followUp({
        embeds: [
          {
            title: " Global Ban List",
            description: list.map((x, i) => `\`${i + 1}.\` **${x.username}** - ${x.reason}`).join("\n"),
            color: 0xff0000,
          },
        ],
      });
    }
  },
};