// notificacionesDeGoogle.js

const { canalNotificacionesId } = require('./acceso');
const EventEmitter = require('events');
const google = require('./google.js');

// Funciones para crear embeds

const colores = {
  tareas: 'ORANGE',
  fechasEntrega: 'GREEN',
  fechasExamenes: 'RED',
  cursos: 'YELLOW',
  comentarios: 'PINK', // <-- Cambiado a PINK
  anuncios: 'PURPLE', // <-- Cambiado a PURPLE
};

const emojis = {
  tareas: '📚',
  fechasEntrega: '⏰',
  fechasExamenes: '📅',
  cursos: '🏫',
  comentarios: '📝',
  anuncios: '📢',
};

function enviarNotificacion(tipo, contenido) {
  const { cursoId } = contenido;

  // Obtener el nombre del curso a partir de la ID
  const nombreCurso = google.getNombreCurso(cursoId);

  // Obtener el color y el emoji de la notificación
  const { color, emoji } = getColorAndEmoji(tipo);

  // Crear el embed
  const embed = new Embed();
  embed.setTitle(tipo);
  embed.setDescription(`${contenido.mensaje} ${emoji}`);
  embed.setColor(color);
  embed.addField('Curso', nombreCurso, true);

  // Enviar el embed al canal de notificaciones
  //client.channels.get(canalNotificacionesId).send(embed);

  // Enviar un mensaje con @everyone
  const mensaje = `@everyone **Nueva notificación**`;

  // Enviar el mensaje con @everyone
  client.channels.get(canalNotificacionesId).send(mensaje, { mentionEveryone: true });

  // Enviar el embed al canal de notificaciones
  client.channels.get(canalNotificacionesId).send(embed);
}

// Funciones para obtener el color y el emoji de la notificación

function getColorAndEmoji(tipo) {
  return {
    color: colores[tipo],
    emoji: emojis[tipo],
  };
}

// Funciones para enviar notificaciones

// Eventos de Google Classroom

// Inicializamos el objeto `google.miEventEmitter`
google.miEventEmitter = new EventEmitter();

// Eventos de Google Classroom
google.miEventEmitter.on('nuevasTareas', (cursoId, tareas) => {
  enviarNotificacion('google', { cursoId });
});

google.miEventEmitter.on('fechasEntrega', (cursoId, fechasDeEntrega) => {
  enviarNotificacion('google', { cursoId });
});

google.miEventEmitter.on('fechasExamenes', (cursoId, fechasExamenes) => {
  enviarNotificacion('google', { cursoId });
});

google.miEventEmitter.on('cursos', (cursoId, tipo) => {
  enviarNotificacion('google', { cursoId });
});

google.miEventEmitter.on('comentarios', (cursoId, comentario) => {
  enviarNotificacion('google', { cursoId });
});

google.miEventEmitter.on('anuncios', (cursoId, anuncio) => {
  enviarNotificacion('google', { cursoId });
});

module.exports = {
  enviarNotificacion,
};