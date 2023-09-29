// index.js

const token = 'TOKEN';

// Importa solo las clases y constantes que necesitas
import { Client, GatewayIntentBits } from 'discord.js';
import { Client as NotionClient } from '@notionhq/client';

// Define la constante Intents
const intents = new GatewayIntentBits([
  GatewayIntentBits.GUILDS,
  GatewayIntentBits.GUILD_MEMBERS,
  GatewayIntentBits.GUILD_EMOJIS_AND_STICKERS,
  GatewayIntentBits.GUILD_INTEGRATIONS,
  GatewayIntentBits.GUILD_PRESENCES,
  GatewayIntentBits.GUILD_MESSAGES,
  GatewayIntentBits.GUILD_MESSAGE_REACTIONS,
  GatewayIntentBits.GUILD_MESSAGE_TYPING,
  GatewayIntentBits.GUILD_EMBEDS,
  GatewayIntentBits.DIRECT_MESSAGES,
  GatewayIntentBits.DIRECT_MESSAGE_REACTIONS,
  GatewayIntentBits.DIRECT_MESSAGE_TYPING,
]);

const { tokenNotion, baseDeDatosNotionId, BugsID, canalNotificacionesId } = require('./acceso.js');
const { enviarNotificacion } = require('./notificacionesDeGoogle');

const notion = new NotionClient({ auth: tokenNotion });
const canalDeBugsId = BugsID;

// Crea una nueva instancia de la clase Client, proporcionando los intents necesarios
const client = new Client({
  intents,
});

client.on('ready', () => {
  console.log(`Bot is ready and logged in as ${client.user.tag}`);

  // Ejecutar la función principal
  main();

  // Enviar notificaciones
  const canalDeNotificaciones = client.channels.get(canalNotificacionesId);
  enviarNotificacion(canalDeNotificaciones);
});

async function main() {
  await verificarConexionNotion();
  await obtenerYAlmacenarDatosDeGoogleClassroomEnNotion();
}