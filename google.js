// google.js

const { google } = require('googleapis');
const { tokenGoogle } = require('./acceso');
const { notificarCambioAnuncio, notificarDeberesNuevos, notificarActualizacionFechas, notificarActualizacionNotas } = require('./notificaciones');
const {EventEmitter} = require('events');
const miEventEmitter = new EventEmitter();

const SCOPES = [
  'https://www.googleapis.com/auth/classroom.courses',
  'https://www.googleapis.com/auth/classroom.courses.readonly',
  'https://www.googleapis.com/auth/classroom.coursework.students',
  'https://www.googleapis.com/auth/classroom.courseworkmaterials.readonly',
  'https://www.googleapis.com/auth/classroom.announcements',
  'https://www.googleapis.com/auth/classroom.announcements.readonly',
  'https://www.googleapis.com/auth/classroom.guardianlinks.students.readonly',
];

if (tokenGoogle) {
  const googleAuth = new google.auth.OAuth2();
  googleAuth.setCredentials({ access_token: tokenGoogle });

  const classroom = google.classroom({
    version: 'v1',
    auth: googleAuth,
  });

  async function notificarCambioDeAnuncio(asignatura) {
    await notificarCambioAnuncio(asignatura);
  }

  async function notificarDeberesNuevosCurso(asignatura, fechaEntrega) {
    await notificarDeberesNuevos(asignatura, fechaEntrega);
  }

  async function notificarActualizacionFechasCurso(asignatura) {
    await notificarActualizacionFechas(asignatura);
  }

  async function notificarActualizacionNotasCurso(asignatura) {
    await notificarActualizacionNotas(asignatura);
  }

  function obtenerListaDeCursos() {
    classroom.courses.list({}, (err, res) => {
      if (err) {
        console.error(`Error al obtener la lista de cursos: ${err.message}`);
      } else {
        const courses = res.data.courses;
        console.log(`Lista de cursos: ${JSON.stringify(courses)}`);
      }
    });
  }

  function obtenerTareasDeCurso(cursoId) {
    classroom.courses.courseWork.list({ courseId: cursoId }, (err, res) => {
      if (err) {
        console.error(`Error al obtener la lista de tareas: ${err.message}`);
      } else {
        const tareas = res.data.courseWork;
        console.log(`Lista de tareas del curso ${cursoId}: ${JSON.stringify(tareas)}`);
        miEventEmitter.emit('nuevasTareas', cursoId, tareas);
      }
    });
  }

  function obtenerAnunciosDeCurso(cursoId) {
    classroom.courses.announcements.list({ courseId: cursoId }, (err, res) => {
      if (err) {
        console.error(`Error al obtener la lista de anuncios: ${err.message}`);
      } else {
        const anuncios = res.data.announcements;
        console.log(`Lista de anuncios del curso ${cursoId}: ${JSON.stringify(anuncios)}`);
        miEventEmitter.emit('AnunciosDeCurso', cursoId, anuncios);
      }
    });
  }

  function obtenerFechasDeEntrega(cursoId) {
    classroom.courses.courseWork.list({ courseId: cursoId }, (err, res) => {
      if (err) {
        console.error(`Error al obtener la lista de tareas: ${err.message}`);
      } else {
        const tareas = res.data.courseWork;
        const fechasDeEntrega = tareas.map((tarea) => ({
          nombre: tarea.title,
          fechaDeEntrega: tarea.dueDate,
        }));
        console.log(`Fechas de entrega del curso ${cursoId}: ${JSON.stringify(fechasDeEntrega)}`);
        miEventEmitter.emit('FechasDeEntrega', cursoId, fechasDeEntrega);
      }
    });
  }

  function obtenerFechasDeExamenes(cursoId) {
    classroom.courses.list({}, (err, res) => {
      if (err) {
        console.error(`Error al obtener la lista de cursos: ${err.message}`);
      } else {
        const courses = res.data.courses;
        const cursoEncontrado = courses.find((curso) => curso.id === cursoId);
        if (cursoEncontrado) {
          console.log(`Nombre del curso ${cursoId}: ${cursoEncontrado.name}`);
          const fechasDeExamenes = [
            {
              nombre: 'Examen 1',
              fecha: '2023-09-20T09:00:00Z',
            },
            {
              nombre: 'Examen 2',
              fecha: '2023-10-05T14:00:00Z',
            },
          ];
          console.log(`Fechas de exámenes del curso ${cursoId}: ${JSON.stringify(fechasDeExamenes)}`);
          miEventEmitter.emit('FechasDeExamenes', cursoId, fechasDeExamenes);
        } else {
          console.error(`Curso con ID ${cursoId} no encontrado.`);
        }
      }
    });
  }

  function descargarArchivoDeDeber(archivoId) {
    console.log(`Descargando archivo de deber con ID: ${archivoId}`);
  }

  async function obtenerCambiosDeFechas(cursoId, fechasAnteriores) {
    try {
      const tareas = await obtenerTareasDeCurso(cursoId);
      const nuevasFechas = tareas.map(tarea => ({
        nombre: tarea.title,
        fechaDeEntrega: tarea.dueDate,
      }));
  
      const cambios = nuevasFechas.filter(nuevaFecha => {
        const fechaAnterior = fechasAnteriores.find(fechaAnt => fechaAnt.nombre === nuevaFecha.nombre);
        return !fechaAnterior || fechaAnterior.fechaDeEntrega !== nuevaFecha.fechaDeEntrega;
      });
  
      return cambios;
    } catch (error) {
      console.error('Error al obtener cambios en fechas:', error);
      throw error;
    }
  }
  
  async function obtenerNuevosDeberes(cursoId, deberesAnteriores) {
    try {
      const tareas = await obtenerTareasDeCurso(cursoId);
  
      const nuevosDeberes = tareas.filter(tarea => {
        return !deberesAnteriores.some(deberAnt => deberAnt.id === tarea.id);
      });
  
      return nuevosDeberes;
    } catch (error) {
      console.error('Error al obtener deberes nuevos:', error);
      throw error;
    }
  }
  
  async function obtenerCambiosEnNotas(cursoId, notasAnteriores) {
    try {

      const notasActuales = await obtenerNotasDeCurso(cursoId);
      const cambiosEnNotas = notasActuales.filter(nuevaNota => {
        const notaAnterior = notasAnteriores.find(notaAnt => notaAnt.id === nuevaNota.id);
        return !notaAnterior || notaAnterior.nota !== nuevaNota.nota;
      });
  
      return cambiosEnNotas;
    } catch (error) {
      console.error('Error al obtener cambios en notas:', error);
      throw error;
    }
  }

  async function obtenerYAlmacenarDatosDeGoogleClassroomEnNotion() {
    try {
      const cursos = await obtenerListaDeCursos();
  
      for (const curso of cursos) {
        const tareas = await obtenerTareasDeCurso(curso.id);
        const anuncios = await obtenerAnunciosDeCurso(curso.id);
        const fechasDeEntrega = await obtenerFechasDeEntrega(curso.id);
        const fechasDeExamenes = await obtenerFechasDeExamenes(curso.id);
        almacenarDatosEnNotion(curso, tareas, anuncios, fechasDeEntrega, fechasDeExamenes);
    
        console.log('Datos de Google Classroom almacenados en Notion para el curso:', curso.id);
      }
  
      console.log('Datos de Google Classroom almacenados en Notion.');
    } catch (error) {
      console.error('Error al obtener y almacenar datos de Google Classroom en Notion:', error);
      enviarNotificacion(`Fallo en Notion: ${error.message}`, canalDeBugsId);
    }
  }
  
  module.exports = {
    classroom,
    SCOPES,
    miEventEmitter,
    obtenerYAlmacenarDatosDeGoogleClassroomEnNotion,
    obtenerListaDeCursos,
    obtenerTareasDeCurso,
    obtenerAnunciosDeCurso,
    obtenerFechasDeEntrega,
    obtenerFechasDeExamenes,
    descargarArchivoDeDeber,
    obtenerCambiosDeFechas,
    obtenerNuevosDeberes,
    obtenerCambiosEnNotas,
    notificarCambioDeAnuncio,
    notificarDeberesNuevosCurso,
    notificarActualizacionFechasCurso,
    notificarActualizacionNotasCurso
  };

} else {
  console.error('Token de acceso no válido. Asegúrate de obtener un token de acceso válido.');
}