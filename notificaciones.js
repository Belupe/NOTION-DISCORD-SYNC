// notificaciones.js

const { Client, Intents } = require('discord.js');
const { canalNotificacionesId, BugsID } = require('./acceso');
const config = require('./config.json');
const notion = require('./notion');
const google = require('./google');
import { miEventEmitter } from "./google";

function enviarNotificacionDiscord(mensaje, tipo, curso) {
  let color, emoji;

  if (tipo === 'tareas') {
    color = 'ORANGE';
    emoji = '📚';
  } else if (tipo === 'fechasEntrega') {
    color = 'GREEN';
    emoji = '⏰';
  } else if (tipo === 'fechasExamenes') {
    color = 'YELLOW';
    emoji = '📅';
  } else if (tipo === 'fechasNotas') {
    color = 'BLUE';
    emoji = '📝';
  } else {
    color = 'RED';
    emoji = '❗';
  }

  const embed = new MessageEmbed()
    .setColor(color)
    .setDescription(`${emoji} ${mensaje}`);

  const channel = client.channels.cache.get(canalNotificacionesId);
  if (channel && channel.isText()) {
    channel.send({ embeds: [embed] });
    console.log(`Notificación enviada a Discord (${curso}): ${mensaje}`);
  } else {
    console.error('Canal de notificaciones de Discord no válido.');
  }
}

function enviarNotificacionNotion(error) {
  const embed = new MessageEmbed()
    .setColor('RED')
    .setDescription(`Error en Notion: ${error}`);

  const channel = client.channels.cache.get(BugsID);
  if (channel && channel.isText()) {
    channel.send({ embeds: [embed] });
    console.log('Notificación de error en Notion enviada:', error);
  } else {
    console.error('Canal de notificaciones de Notion no válido.');
  }
}

function recibirNotificacion(tipo, contenido) {
  if (tipo === 'google') {
    const { cursoId, tareas, fechasDeEntrega } = contenido;
  } else if (tipo === 'notion') {
    const { error } = contenido;
    enviarNotificacionNotion(error);
  } else {
    console.error('Tipo de notificación no válido:', tipo);
  }
}

google.miEventEmitter.on('nuevasTareas', (cursoId, tareas) => {
  for (const tarea of tareas) {
    enviarNotificacionDiscord(`Nueva tarea en curso ${cursoId}: ${tarea.titulo}`, 'tareas', cursoId);
  }
});

notion.miEventEmitter.on('FechasDeEntrega', (cursoId, fechasDeEntrega) => {
  for (const fecha of fechasDeEntrega) {
    enviarNotificacionDiscord(`Nueva fecha de entrega en curso ${cursoId}: ${fecha.nombre}`, 'fechasEntrega', cursoId);
  }
});

module.exports = {
  recibirNotificacion
};
