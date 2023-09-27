// notion.js

const { Client: NotionClient } = require('@notionhq/client');
const { tokenNotion, baseDeDatosNotionId, BugsID} = require('./acceso');
const { enviarNotificacion } = require('./notificaciones');
const notion = new NotionClient({ auth: tokenNotion });
const canalDeBugsId = BugsID;

async function verificarConexionNotion() {
  try {
    await notion.databases.list();
    console.log('Conexión a Notion verificada.');
    return true;
  } catch (error) {
    console.error('Error al verificar la conexión a Notion:', error);
    enviarNotificacion(`Fallo en Notion: ${error.message}`, canalDeBugsId);
    return false;
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
      const cursoEnNotion = await crearEntradaDeCursoEnNotion(curso.nombre, curso.descripcion);

      await crearTablaDeberes(cursoEnNotion.id, tareas, fechasDeEntrega, fechasDeExamenes, curso.nombre);
      await crearHojaCursoConSubhojas(curso.nombre);
    }

    console.log('Datos de Google Classroom almacenados en Notion.');
  } catch (error) {
    console.error('Error al obtener y almacenar datos de Google Classroom en Notion:', error);
    enviarNotificacion(`Fallo en Notion: ${error.message}`, canalDeBugsId);
  }
}

async function crearEntradaDeCursoEnNotion(nombre, descripcion) {
  try {
    const response = await notion.pages.create({
      parent: {
        database_id: baseDeDatosNotionId,
      },
      properties: {
        Nombre: {
          title: [{ type: "text", text: { content: nombre } }],
        },
        Descripcion: {
          rich_text: [{ type: "text", text: { content: descripcion } }],
        },
      },
    });

    console.log('Entrada de curso creada en Notion:', response);
    return response;
  } catch (error) {
    console.error('Error al crear entrada de curso en Notion:', error);
    enviarNotificacion(`Fallo en Notion: ${error.message}`, canalDeBugsId);
  }
}

async function crearTablaDeberes(cursoId, tareas, anuncios, fechasDeEntrega, fechasDeExamenes, nombreCurso) {
  try {
    const tasksTable = tareas.map(tarea => ({
      task_title: tarea.titulo,
      task_description: tarea.descripcion,
      due_date: tarea.fechaEntrega,
      course_name: nombreCurso,
    }));

    const datesTable = [...fechasDeEntrega, ...fechasDeExamenes].map(fecha => ({
      item_title: fecha.nombre,
      item_date: fecha.fechaDeEntrega || fecha.fecha,
      item_type: fecha.fechaDeEntrega ? "Entrega" : "Examen",
      course_name: nombreCurso,
    }));

    const response = await notion.pages.create({
      parent: {
        database_id: cursoId,
      },
      properties: {
        Deberes: {
          type: 'rich_text',
          rich_text: [{ text: { content: JSON.stringify(tasksTable, null, 2) } }],
        },
        Fechas: {
          type: 'rich_text',
          rich_text: [{ text: { content: JSON.stringify(datesTable, null, 2) } }],
        },
      },
    });

    console.log('Tabla de deberes creada en Notion:', response);
  } catch (error) {
    console.error('Error al crear tabla de deberes en Notion:', error);
    enviarNotificacion(`Fallo en Notion: ${error.message}`, canalDeBugsId);
  }
}

async function crearHojaCursoConSubhojas(nombreCurso) {
  try {
    const cursoPage = await notion.pages.create({
      parent: {
        database_id: baseDeDatosNotionId,
      },
      properties: {
        Nombre: {
          title: [{ type: 'text', text: { content: nombreCurso } }],
        },
      },
    });

    const subhojas = ['Apuntes', 'Anuncios'];

    for (const subhojaNombre of subhojas) {
      await notion.pages.create({
        parent: {
          page_id: cursoPage.id,
        },
        properties: {
          title: { title: [{ type: 'text', text: { content: subhojaNombre } }] },
        },
      });
    }

    console.log(`Hoja de curso creada: ${nombreCurso}`);
    console.log(`Subhojas creadas: ${subhojas.join(', ')}`);
  } catch (error) {
    console.error('Error al crear hoja de curso y subhojas:', error);
    enviarNotificacion(`Fallo en Notion: ${error.message}`, canalDeBugsId);
  }
}

async function main() {
  const conexionNotion = await verificarConexionNotion();
  if (conexionNotion) {
    await obtenerYAlmacenarDatosDeGoogleClassroomEnNotion();
    console.log('Proceso completado.');
  } else {
    console.log('No se pudo verificar la conexión a Notion. Proceso cancelado.');
    enviarNotificacion('No se pudo verificar la conexión a Notion. Proceso cancelado.', canalDeBugsId);
  }
}

async function enviarNotificacionNuevosErrores(mensaje) {
  try {
    await enviarNotificacion(mensaje);
  } catch (error) {
    console.error('Error al enviar notificación de errores:', error);
    throw error;
  }
}
async function main() {
  const conexionNotion = await verificarConexionNotion();
  if (conexionNotion) {
    await obtenerYAlmacenarDatosDeGoogleClassroomEnNotion();
    console.log('Proceso completado.');
  } else {
    console.log('No se pudo verificar la conexión a Notion. Proceso cancelado.');
    enviarNotificacion('No se pudo verificar la conexión a Notion. Proceso cancelado.', canalDeBugsId);
  }
}

main();
module.exports = {
  enviarNotificacionNuevosErrores
};