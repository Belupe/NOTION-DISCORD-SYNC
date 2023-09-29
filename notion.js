// notion.js

const { Client: NotionClient } = require('@notionhq/client');
const { tokenNotion, baseDeDatosNotionId } = require('./acceso');
const notion = new NotionClient({ auth: tokenNotion });

async function verificarConexionNotion() {
  try {
    await notion.databases.list();
    console.log('Conexión a Notion verificada.');
    return true;
  } catch (error) {
    await enviarNotificacion(`Error al verificar la conexión a Notion: ${error.message}`, BugsID);
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
      const cursoEnNotion = await crearEntradaDeCursoEnNotion(curso.nombre, curso.descripcion);

      // Crear base de datos de tareas y exámenes
      const baseDeDatosTareas = await notion.databases.create({
        title: `Tareas y exámenes de ${curso.nombre}`,
      });

      // Crear etiquetas de curso
      const etiquetas = ['Tarea', 'Examen'];
      for (const etiqueta of etiquetas) {
        await notion.pages.create({
          parent: {
            database_id: baseDeDatosTareas.id,
          },
          properties: {
            etiquetas: {
              title: [{ type: "text", text: { content: etiqueta } }],
            },
          },
        });
      }

      // Agregar tareas a la base de datos
      for (const tarea of tareas) {
        const nuevaTarea = {
          titulo: tarea.titulo,
          descripcion: tarea.descripcion,
          estado: tarea.estado,
          fechaDeEntrega: tarea.fechaDeEntrega,
          tipo: tarea.tipo,
          curso: curso.nombre,
        };

        // Eliminar tareas entregadas
        if (tarea.estado === 'Entregada') {
          // No hacer nada
        } else {
          // Añadir la tarea a la base de datos
          await notion.pages.create({
            parent: {
              database_id: baseDeDatosTareas.id,
            },
            properties: nuevaTarea,
          });
        }
      }

      // Crear tabla de tareas en portada
      await crearTablaDeberesEnPortada(curso.nombre);

      // Crear calendario de tareas
      const calendario = await notion.calendars.create({
        title: `Tareas y exámenes de ${curso.nombre}`,
      });

      // Añadir tareas al calendario
      const recordatorios = tareas.map(tarea => {
        const recordatorio = {
          start: {
            date: tarea.fechaDeEntrega,
          },
          name: tarea.titulo,
          color: '#FF0000',
          reminder: {
            time: '1 hour',
          },
        };

        // Agregar recordatorio al calendario
        await notion.calendars.items.create({
          calendar_id: calendario.id,
          properties: recordatorio,
        });

        return recordatorio;
      });

      // Actualizar calendario
      await notion.calendars.update(calendario.id, {
        items: recordatorios.map(recordatorio => {
          return {
            id: recordatorio.id,
            checked: recordatorio.estado === 'Entregada',
          };
        }),
      });
    }

    console.log('Datos de Google Classroom almacenados en Notion.');

  } catch (error);
}