//index.js

const { GatewayIntentBits, TextChannel } = require('discord.js');
const { token } = require('./config.json');
const { miEventEmitter, obtenerYAlmacenarDatosDeGoogleClassroomEnNotion } = require('./google.js');
const { main: almacenarDatosEnNotion } = require('./notion.js');
const Discord = require('discord.js');

const client = new Discord.Client({
  intents: {
    GUILDS: true,
    GUILD_MEMBERS: true,
    GUILD_BANS: true,
    GUILD_EMOJIS_AND_STICKERS: true,
    GUILD_INTEGRATIONS: true,
    GUILD_WEBHOOKS: true,
    GUILD_INVITES: true,
    GUILD_VOICE_STATES: true,
    GUILD_PRESENCES: true,
    GUILD_MESSAGES: true,
    GUILD_MESSAGE_REACTIONS: true,
    GUILD_MESSAGE_TYPING: true,
    DIRECT_MESSAGES: true,
    DIRECT_MESSAGE_REACTIONS: true,
    DIRECT_MESSAGE_TYPING: true,
  },
});

client.once('ready', () => {
  console.log(`Bot is ready and logged in as ${client.user.tag}`);
  obtenerYAlmacenarDatosDeGoogleClassroomEnNotion();
  almacenarDatosEnNotion();
});

client.login(token);
