const { ActivityType, EmbedBuilder } = require("discord.js");
const axios = require('axios').create({
  timeout: 2500,
  retry: 0
});

// State management untuk multi-server
const serverStates = new Map();

/**
 * @param {import('@src/structures').BotClient} client
 */
async function updatePresence(client) {
  // Dapatkan konfigurasi server
  const config = client.config;
  
  // Inisialisasi state untuk server ini
  const guildId = config.GUILD_ID;
  if (!serverStates.has(guildId)) {
    serverStates.set(guildId, {
      lastPlayerCount: "0/0",
      lastVoiceUpdate: 0,
      lastServerStatus: null,
      statusMessageId: null,
      onlineSince: null
    });
  }
  
  const state = serverStates.get(guildId);
  let playerText = state.lastPlayerCount;
  let onlinePlayers = 0;

  try {
    // [1] FETCH DATA PLAYER
    const { data } = await axios.get('https://ferrenza.com/api/mlrp/players.json');
    if (Array.isArray(data)) {
      onlinePlayers = data.length;
      const maxPlayers = config.MAX_PLAYERS;
      playerText = `${onlinePlayers}/${maxPlayers}`;
      state.lastPlayerCount = playerText;
    }
  } catch (error) {
    console.error(`[${guildId}] Presence API Error:`, error.message);
  }

  // [2] UPDATE PRESENCE
  try {
    const presenceMessage = `${playerText} PLAYER ON MOTIONLIFE`;
    client.user.setPresence({
      status: config.PRESENCE.STATUS,
      activities: [{
        name: presenceMessage,
        type: getActivityType(config.PRESENCE.TYPE)
      }]
    });
    console.log(`[${guildId}] Presence Updated: "${presenceMessage}"`);
  } catch (error) {
    console.error(`[${guildId}] Presence Update Error:`, error.message);
  }

  // [3] DETERMINE SERVER STATUS
  const newStatus = onlinePlayers >= 5 ? "online" : "maintenance";
  const statusChanged = state.lastServerStatus !== newStatus;
  
  // Tangani perubahan status
  if (statusChanged) {
    console.log(`[${guildId}] Status changed to: ${newStatus}`);
    
    // Set onlineSince jika status berubah menjadi online
    if (newStatus === "online") {
      state.onlineSince = Date.now();
    } else {
      state.onlineSince = null;
    }
    
    state.lastServerStatus = newStatus;
  }

  // [4] UPDATE VOICE CHANNEL
  if (config.VOICE_CHANNEL_ID) {
    try {
      const currentTime = Date.now();
      const voiceChannel = await client.channels.fetch(config.VOICE_CHANNEL_ID);
      
      if (!voiceChannel) {
        console.error(`[${guildId}] Voice channel not found`);
      } else {
        const newVoiceName = newStatus === "online" ? "🟢SERVER ONLINE🟢" : "🔴SERVER MAINTENANCE🔴";
        
        // Cek apakah perlu update
        const shouldUpdate = (
          newVoiceName !== voiceChannel.name || 
          statusChanged ||
          currentTime - state.lastVoiceUpdate > 300000
        );

        if (shouldUpdate) {
          // Rate limit check
          if (currentTime - state.lastVoiceUpdate < 300000) {
            console.log(`[${guildId}] Voice: Skipping update due to rate limit`);
          } else {
            await voiceChannel.setName(newVoiceName);
            state.lastVoiceUpdate = currentTime;
            console.log(`[${guildId}] Voice Updated to: ${newVoiceName}`);
          }
        }
      }
    } catch (error) {
      if (error.code === 429) {
        console.warn(`[${guildId}] Voice: Rate limited, delaying next update`);
        state.lastVoiceUpdate = Date.now() + 300000;
      } else {
        console.error(`[${guildId}] Voice Error:`, error.message);
      }
    }
  }

  // [5] HANDLE ANNOUNCEMENTS
  if (config.ANNOUNCEMENT_CHANNEL_ID) {
    try {
      const announcementChannel = await client.channels.fetch(config.ANNOUNCEMENT_CHANNEL_ID);
      
      if (!announcementChannel || !announcementChannel.isTextBased()) {
        console.error(`[${guildId}] Announcement channel invalid`);
        return;
      }

      // [5.1] UPDATE REAL-TIME STATUS EMBED
      try {
        const statusEmbed = createStatusEmbed(newStatus, playerText, state.onlineSince);
        
        if (state.statusMessageId) {
          try {
            const statusMessage = await announcementChannel.messages.fetch(state.statusMessageId);
            await statusMessage.edit({ embeds: [statusEmbed] });
            console.log(`[${guildId}] Updated real-time status embed`);
          } catch (error) {
            if (error.code === 10008) { // Unknown message
              console.log(`[${guildId}] Status message not found, creating new one`);
              const newMessage = await announcementChannel.send({ embeds: [statusEmbed] });
              state.statusMessageId = newMessage.id;
            } else {
              throw error;
            }
          }
        } else {
          const newMessage = await announcementChannel.send({ embeds: [statusEmbed] });
          state.statusMessageId = newMessage.id;
          console.log(`[${guildId}] Created new status embed`);
        }
      } catch (error) {
        console.error(`[${guildId}] Status embed error:`, error.message);
      }

      // [5.2] SEND ANNOUNCEMENT ON STATUS CHANGE
      if (statusChanged) {
        try {
          const announcementEmbed = createAnnouncementEmbed(newStatus, playerText);
          const content = newStatus === "online" 
            ? `@everyone 🎉 Server sekarang ONLINE!` 
            : `@here ⚠️ Server sedang MAINTENANCE!`;
          
          await announcementChannel.send({
            content: content,
            embeds: [announcementEmbed]
          });
          
          console.log(`[${guildId}] Sent status change announcement`);
        } catch (error) {
          console.error(`[${guildId}] Announcement error:`, error.message);
        }
      }
    } catch (error) {
      console.error(`[${guildId}] Announcement fetch error:`, error.message);
    }
  }
}

// Helper: Buat embed untuk real-time status
function createStatusEmbed(status, playerCount, onlineSince) {
  return new EmbedBuilder()
    .setColor(status === "online" ? '#00FF00' : '#FF0000')
    .setTitle(status === "online" ? '🚀 SERVER ONLINE' : '🔧 SERVER MAINTENANCE')
    .setDescription(status === "online" 
      ? 'MotionLife RP sekarang **ONLINE** dan siap dimainkan!' 
      : 'MotionLife RP sedang dalam **MAINTENANCE**!'
    )
    .addFields(
      { name: 'Status', value: status === "online" ? '🟢 ONLINE' : '🔴 MAINTENANCE', inline: true },
      { name: 'Players', value: playerCount, inline: true },
      { 
        name: 'Uptime', 
        value: status === "online" && onlineSince 
          ? `<t:${Math.floor(onlineSince/1000)}:R>` 
          : 'N/A', 
        inline: true 
      }
    )
    .setFooter({ text: 'Real-time Status • Terakhir diperbarui' })
    .setTimestamp();
}

// Helper: Buat embed untuk pengumuman perubahan status
function createAnnouncementEmbed(status, playerCount) {
  return new EmbedBuilder()
    .setColor(status === "online" ? '#00FF00' : '#FF0000')
    .setTitle(status === "online" ? '🎉 SERVER KEMBALI ONLINE' : '⚠️ SERVER MAINTENANCE DIMULAI')
    .setDescription(status === "online" 
      ? 'Selamat bermain kembali di MotionLife RP!\n\nSemua sistem telah pulih dan siap untuk Anda.' 
      : 'MotionLife RP akan sementara offline untuk perawatan.\n\nKami akan kembali secepatnya!'
    )
    .addFields(
      { name: 'Status', value: status === "online" ? '🟢 ONLINE' : '🔴 MAINTENANCE', inline: true },
      { name: 'Players Saat Ini', value: playerCount, inline: true }
    )
    .setImage(status === "online" 
      ? 'https://i.imgur.com/online-banner.png' 
      : 'https://i.imgur.com/maintenance-banner.png'
    )
    .setFooter({ text: 'System Notification' })
    .setTimestamp();
}

// Helper function untuk activity type
function getActivityType(type) {
  const mapping = {
    "COMPETING": ActivityType.Competing,
    "LISTENING": ActivityType.Listening,
    "PLAYING": ActivityType.Playing,
    "WATCHING": ActivityType.Watching,
    "CUSTOM": ActivityType.Custom
  };
  return mapping[type] || ActivityType.Competing;
}

module.exports = function handlePresence(client) {
  if (!client.config.PRESENCE.ENABLED) return;
  
  // Update pertama langsung
  updatePresence(client);
  
  // Update setiap 15 detik
  setInterval(() => updatePresence(client), 15 * 1000);
};