// notion.js

const { Client: NotionClient } = require('@notionhq/client');
const { tokenNotion, baseDeDatosNotionId, BugsID, canalTareasPendientes } = require('./acceso');
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

      await crearTablaDeberes(cursoEnNotion.id, tareas, anuncios, fechasDeEntrega, fechasDeExamenes, curso.nombre);
      await crearHojaCursoConSubhojas(curso.nombre);
      await crearEtiquetaCurso(curso.nombre);

      // Eliminar tareas entregadas
      const tareasEntregadas = tareas.filter(tarea => tarea.estado === 'Entregada');
      for (const tareaEntregada of tareasEntregadas) {
        await notion.pages.delete({
          page_id: tareaEntregada.id,
        });
      }

      // Notificar tareas pendientes
      const tareasPendientes = tareas.filter(tarea => tarea.estado !== 'Entregada');
      const titulosTareasPendientes = tareasPendientes.map(tarea => tarea.titulo);
      const numeroTareasPendientes = tareasPendientes.length;

      const embedTareasPendientes = {
        embeds: [{
          type: 'image',
          image: {
            url: 'https://img.icons8.com/external-flat-icons/16/000000/warning--flat-icons.png',
          },
        }, {
          type: 'rich_text',
          rich_text: [{
            text: `¡Faltan ${numeroTareasPendientes} tareas de ${curso.nombre}!`,
            bold: true,
            color: '#FF0000',
          }],
        }],
      };

      enviarNotificacion(embedTareasPendientes, canalTareasPendientes);
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
    return null;
  }
}