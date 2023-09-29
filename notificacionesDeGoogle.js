// notificacionesDeGoogle.js

const { canalNotificacionesId } = require('./acceso');
const EventEmitter = require('events');
const google = require('./google.js');

// Funciones para crear embeds

function enviarNotificacionDiscord(mensaje, tipo, curso) {
  const embed = new Embed();
  embed.setTitle(tipo);
  embed.setDescription(`${mensaje} ${getEmoji(tipo)}`);
  embed.setColor(getColor(tipo));
  embed.addField('Curso', curso, true);
  return embed;
}

// Función para enviar notificaciones

function enviarNotificacion(tipo, contenido) {
  if (tipo === 'google') {
    const { cursoId, tareas, fechasDeEntrega } = contenido;
    const embed = enviarNotificacionDiscord(mensaje, tipo, cursoId);
    console.log('Enviando notificación a Discord:', embed);
    // Enviar notificación a Discord
  } else {
    console.error('Tipo de notificación no válido:', tipo);
  }
}

// Funciones para crear embeds

function enviarNotificacionDiscord(mensaje, tipo, curso) {
  const embed = new Embed();
  embed.setTitle(tipo);
  embed.setDescription(`${mensaje} ${getEmoji(tipo)}`);
  embed.setColor(getColor(tipo));
  embed.addField('Curso', curso, true);
  return embed;
}

function getColor(tipo) {
  switch (tipo) {
    case 'tareas':
      return 'ORANGE';
    case 'fechasEntrega':
      return 'GREEN';
    case 'fechasExamenes':
      return 'RED';
    case 'cursos':
      return 'YELLOW';
    case 'comentarios':
      return '💬';
    case 'anuncios':
      return '📢';
    default:
      return '❗';
  }
}

function getEmoji(tipo) {
  switch (tipo) {
    case 'tareas':
      return '📚';
    case 'fechasEntrega':
      return '⏰';
    case 'fechasExamenes':
      return '📅';
    case 'cursos':
      return '🏫';
    case 'comentarios':
      return '📝';
    case 'anuncios':
      return '📢';
    default:
      return '❗';
  }
}

// Función para enviar notificaciones

function enviarNotificacion(tipo, contenido) {
  // Obtener los datos de la notificación
  const { cursoId, tareas, fechasDeEntrega, fechasExamenes, comentario } = contenido;

  // Crear los embeds
  const embeds = [];
  if (tareas) {
    embeds.push(enviarNotificacionDiscord('Tareas nuevas', tipo, cursoId, tareas));
  }
  if (fechasDeEntrega) {
    embeds.push(enviarNotificacionDiscord('Fechas de entrega', tipo, cursoId, fechasDeEntrega));
  }
  if (fechasExamenes) {
    embeds.push(enviarNotificacionDiscord('Fechas de exámenes', tipo, cursoId, fechasExamenes));
  }
  if (comentario) {
    embeds.push(enviarNotificacionDiscord('Nuevo comentario', tipo, cursoId, comentario));
  }

  // Enviar los embeds al canal de notificaciones
  const client = require('./index').client;
  const canalDeNotificaciones = require('./acceso').canalNotificacionesId;

  client.channels.get(canalDeNotificaciones).send(embeds);
}

// Eventos de Google Classroom

// Inicializamos el objeto `google.miEventEmitter`
google.miEventEmitter = new EventEmitter();

// Eventos de Google Classroom
google.miEventEmitter.on('nuevasTareas', (cursoId, tareas) => {
  enviarNotificacion('google', { cursoId, tareas });
});

google.miEventEmitter.on('fechasEntrega', (cursoId, fechasDeEntrega) => {
  enviarNotificacion('google', { cursoId, fechasDeEntrega });
});

google.miEventEmitter.on('fechasExamenes', (cursoId, fechasExamenes) => {
  enviarNotificacion('google', { cursoId, fechasExamenes });
});

google.miEventEmitter.on('cursos', (cursoId, tipo) => {
  enviarNotificacion('google', { cursoId, tipo });
});

google.miEventEmitter.on('comentarios', (cursoId, comentario) => {
  enviarNotificacion('google', { cursoId, comentario });
});

google.miEventEmitter.on('anuncios', (cursoId, anuncio) => {
  enviarNotificacion('google', { cursoId, anuncio });
});

module.exports = {
  enviarNotificacion,
};