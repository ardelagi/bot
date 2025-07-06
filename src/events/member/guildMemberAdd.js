const { inviteHandler, greetingHandler } = require("@src/handlers");
const { getSettings } = require("@schemas/Guild");
const GlobalBan = require("@schemas/gban");
/**
 * @param {import('@src/structures').BotClient} client
 * @param {import('discord.js').GuildMember} member
 */
module.exports = async (client, member) => {
  if (!member || !member.guild) return;

 // Cek apakah user masuk daftar Global Ban
try {
  const banned = await GlobalBan.findOne({ userId: member.id });
  if (banned) {
    await member.ban({ reason: `[Global Ban] ${banned.reason || "Tidak ada alasan"}` });

    const logChannel = member.guild.channels.cache.get("LOG_GBAN");
    if (logChannel) {
      logChannel.send({
        content: `**${member.user.tag}** di-ban otomatis karena ada di daftar Global Ban.\nAlasan: ${banned.reason}`,
      });
    }
    return; // stop proses lainnya
  }
} catch (err) {
  console.error(`[GBan] Gagal autoban ${member.user.tag}`, err);
}

  const { guild } = member;
  const settings = await getSettings(guild);

  // Autorole
  if (settings.autorole) {
    const role = guild.roles.cache.get(settings.autorole);
    if (role) member.roles.add(role).catch((err) => {});
  }

  // Check for counter channel
  if (settings.counters.find((doc) => ["MEMBERS", "BOTS", "USERS"].includes(doc.counter_type.toUpperCase()))) {
    if (member.user.bot) {
      settings.data.bots += 1;
      await settings.save();
    }
    if (!client.counterUpdateQueue.includes(guild.id)) client.counterUpdateQueue.push(guild.id);
  }

  // Check if invite tracking is enabled
  const inviterData = settings.invite.tracking ? await inviteHandler.trackJoinedMember(member) : {};

  // Send welcome message
  greetingHandler.sendWelcome(member, inviterData);
};
