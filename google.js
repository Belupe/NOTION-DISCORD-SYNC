// Importaciones
const { google } = require('googleapis');
const { tokenGoogle } = require('./acceso');
const { enviarNotificacion } = require('./notificacionesDeGoogle');
const EventEmitter = require('events');

// Funciones de utilidad
const getCourses = async () => {
  const response = await classroom.courses.list();
  return response.data.courses;
};

const getDueDates = async (courseId) => {
  const response = await classroom.courses.courseWork.list({ courseId });
  return response.data.courseWork.map((courseWork) => courseWork.dueDate);
};

const getAnnouncements = async (courseId) => {
  const response = await classroom.courses.announcements.list({ courseId });
  return response.data.announcements;
};

const getExams = async (courseId) => {
  const response = await classroom.courses.courseWork.list({ courseId });
  return response.data.courseWork.filter((courseWork) => courseWork.type === 'Exam');
};

const getChangesInDueDates = async (courseId, previousDueDates) => {
  const newDueDates = await getDueDates(courseId);
  return newDueDates.filter((newDueDate) => {
    const previousDueDate = previousDueDates.find((previousDueDate) => previousDueDate.name === newDueDate.name);
    return !previousDueDate || previousDueDate.dueDate !== newDueDate.dueDate;
  });
};

const getNewAssignments = async (courseId, previousAssignments) => {
  const newAssignments = await getCourseWork(courseId);
  return newAssignments.filter((newAssignment) => {
    return !previousAssignments.some((previousAssignment) => previousAssignment.id === newAssignment.id);
  });
};

const getChangesInGrades = async (courseId, previousGrades) => {
  const newGrades = await getGrades(courseId);
  return newGrades.filter((newGrade) => {
    const previousGrade = previousGrades.find((previousGrade) => previousGrade.id === newGrade.id);
    return !previousGrade || previousGrade.grade !== newGrade.grade;
  });
};

// Eventos
const miEventEmitter = new EventEmitter();

miEventEmitter.on('nuevasTareas', (cursoId, tareas) => {
  console.log('Nuevas tareas en el curso ' + cursoId);
  enviarNotificacion('Nuevas tareas en el curso ' + cursoId, tareas);
});

miEventEmitter.on('fechasDeEntrega', (cursoId, fechasDeEntrega) => {
  console.log('Cambios en las fechas de entrega del curso ' + cursoId);
  enviarNotificacion('Cambios en las fechas de entrega del curso ' + cursoId, fechasDeEntrega);
});

miEventEmitter.on('fechasExamenes', (cursoId, fechasDeExamenes) => {
  console.log('Cambios en las fechas de exámenes del curso ' + cursoId);
  enviarNotificacion('Cambios en las fechas de exámenes del curso ' + cursoId, fechasDeExamenes);
});

miEventEmitter.on('comentarios', (cursoId, comentarios) => {
  console.log('Nuevos comentarios en el curso ' + cursoId);
  enviarNotificacion('Nuevos comentarios en el curso ' + cursoId, comentarios);
});

// Función principal
async function main() {
  // Obtén una lista de cursos
  const courses = await getCourses();

  // Itera sobre los cursos
  for (const course of courses) {
    // Obtén las fechas de entrega
    const dueDates = await getDueDates(course.id);
    const cambiosEnDueDates = await getChangesInDueDates(course.id, dueDates);

    // Obtén los anuncios
    const announcements = await getAnnouncements(course.id);

    // Obtén los exámenes
    const exams = await getExams(course.id);

    // Obtén los cambios en las notas
    const changesInGrades = await getChangesInGrades(course.id, previousGrades);

    // Almacena los datos en Notion
    almacenarDatosEnNotion(course, dueDates, cambiosEnDueDates, announcements, exams, changesInGrades);

    // Escucha los eventos
    miEventEmitter.on('nuevasTareas', (cursoId, tareas) => {
      console.log('Nuevas tareas en el curso ' + cursoId);
      enviarNotificacion('Nuevas tareas en el curso ' + cursoId, tareas);
    });
  }
}

// Exportaciones
module.exports = {
  getCourses,
  getDueDates,
  getAnnouncements,
  getExams,
  getChangesInDueDates,
  getNewAssignments,
  getChangesInGrades,
  main,
};