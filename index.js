//index.js

const { Client, GatewayIntentBits, TextChannel } = require('discord.js');
const { token } = require('./config.json');
const { miEventEmitter, obtenerYAlmacenarDatosDeGoogleClassroomEnNotion } = require('./google.js');
const { main: almacenarDatosEnNotion } = require('./notion.js');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once('ready', () => {
  console.log(`Bot is ready and logged in as ${client.user.tag}`);
  obtenerYAlmacenarDatosDeGoogleClassroomEnNotion();
  almacenarDatosEnNotion();
});

client.login(token);
