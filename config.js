module.exports = {
  OWNER_IDS: ["729602261508161636"],

  SUPPORT_SERVER: "https://discord.gg/motionliferoleplay",

  PREFIX_COMMANDS: {
    ENABLED: true,
    DEFAULT_PREFIX: "!",
  },

  INTERACTIONS: {
    SLASH: true,
    CONTEXT: true,
    GLOBAL: false,
    TEST_GUILD_ID: "1383040700400013403",
  },

  EMBED_COLORS: {
    BOT_EMBED: "#068ADD",
    TRANSPARENT: "#36393F",
    SUCCESS: "#00A56A",
    ERROR: "#D61A3C",
    WARNING: "#F7E919",
  },

  CACHE_SIZE: {
    GUILDS: 100,
    USERS: 50000,
    MEMBERS: 50000,
  },

  MESSAGES: {
    API_ERROR: "Unexpected Backend Error! Try again later or contact support server",
  },

  // PLUGINS

  AUTOMOD: {
    ENABLED: false,
    LOG_EMBED: "#36393F",
    DM_EMBED: "#36393F",
  },  

  DASHBOARD: {
    enabled: true,
    baseURL: "http://localhost:8080",
    failureURL: "http://localhost:8080",
    port: "8080",
  },

  ECONOMY: {
    ENABLED: false,
    CURRENCY: "₪",
    DAILY_COINS: 100,
    MIN_BEG_AMOUNT: 100,
    MAX_BEG_AMOUNT: 2500,
  },

  MUSIC: { // PERBAIKI: Tambahkan koma di akhir
    ENABLED: true,
    IDLE_TIME: 60,
    MAX_SEARCH_RESULTS: 5,
    DEFAULT_SOURCE: "YT",
    LAVALINK_NODES: [
      {
        id: "ajie-node",
        host: "lava-all.ajieblogs.eu.org",
        port: 443,
        password: "https://dsc.gg/ajidevserver",
        secure: true
      }
    ],
  }, // TAMBAHKAN KOMA DI SINI

  GIVEAWAYS: {
    ENABLED: false,
    REACTION: "🎁",
    START_EMBED: "#FF468A",
    END_EMBED: "#FF468A",
  },

  IMAGE: {
    ENABLED: true,
    BASE_API: "https://strangeapi.hostz.me/api",
  },

  INVITE: {
    ENABLED: false,
  },

  MODERATION: {
    ENABLED: true,
    COLORS: {
      TIMEOUT: "#102027",
      UNTIMEOUT: "#4B636E",
      KICK: "#FF7961",
      SOFTBAN: "#AF4448",
      BAN: "#D32F2F",
      UNBAN: "#00C853",
      VMUTE: "#102027",
      VUNMUTE: "#4B636E",
      DEAFEN: "#102027",
      UNDEAFEN: "#4B636E",
      DISCONNECT: "RANDOM",
      MOVE: "RANDOM",
    },
  },

  ANNOUNCEMENT_CHANNEL_ID: "1391134846880841728",
  VOICE_CHANNEL_ID: "1391376785463316560",
  MAX_PLAYERS: 800, 
  PRESENCE: {
    ENABLED: true,
    STATUS: "online",
    TYPE: "WATCHING",
  }, 



  STATS: {
    ENABLED: true,
    XP_COOLDOWN: 5,
    DEFAULT_LVL_UP_MSG: "{member:tag}, You just advanced to **Level {level}**",
  },

  SUGGESTIONS: {
    ENABLED: false,
    EMOJI: {
      UP_VOTE: "⬆️",
      DOWN_VOTE: "⬇️",
    },
    DEFAULT_EMBED: "#4F545C",
    APPROVED_EMBED: "#43B581",
    DENIED_EMBED: "#F04747",
  },

  TICKET: {
    ENABLED: false,
    CREATE_EMBED: "#068ADD",
    CLOSE_EMBED: "#068ADD",
  },
}; // Akhir file 