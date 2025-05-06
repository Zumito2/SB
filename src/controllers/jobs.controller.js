// Importa el objeto `pool` desde el archivo de configuración de base de datos (`db.js`).
// `pool` gestiona las conexiones a la base de datos.
import { pool } from '../db.js';

// Controlador para obtener todos los trabajos
export const getJobs = async (req, res) => {
  try {
    // Realiza una consulta SQL para obtener todos los registros de la tabla "jobs"
    const [rows] = await pool.query("SELECT * FROM jobs");

    // Responde con la lista de trabajos en formato JSON
    res.json(rows);
  } catch (error) {
    // Si ocurre un error durante la consulta, lo muestra en consola y devuelve un error 500
    console.error("Error al ejecutar la consulta:", error); 
    return res.status(500).json({ message: "Something goes wrong" });
  }
};

// Controlador para obtener un trabajo por su ID
export const getJobsId = async (req, res) => {
  try {
    // Obtiene el ID desde los parámetros de la URL y lo convierte a entero
    const userId = parseInt(req.params.id, 10);

    // Verifica si el ID es válido (un número)
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    // Realiza la consulta usando el ID como parámetro
    const [rows] = await pool.query(
      `SELECT * FROM jobs WHERE idJob = ?;`,
      [userId]
    );

    // Devuelve el resultado en formato JSON
    res.json(rows);
  } catch (error) {
    console.error("Error al ejecutar la consulta:", error);
    res.status(500).json({ message: "Something goes wrong" });
  }
};

// Controlador para obtener trabajos por fecha específica
export const getJobsFecha = async (req, res) => {
  try {
    // Extrae la fecha desde los parámetros de la URL
    const fecha = req.params.fecha;

    // Verifica que la fecha sea válida
    if (!fecha || isNaN(Date.parse(fecha))) {
      return res.status(400).json({ message: "Invalid date" });
    }

    console.log("Fecha recibida:", fecha); // Log de depuración

    // Realiza la consulta filtrando por fecha (ignorando la hora)
    const [rows] = await pool.query(
      `SELECT * FROM jobs WHERE DATE(dateJob) = ?;`,
      [fecha]
    );

    console.log("Resultados:", rows); // Log de depuración

    // Devuelve los trabajos encontrados en esa fecha
    res.json(rows);
  } catch (error) {
    console.error("Error al ejecutar la consulta:", error);
    res.status(500).json({ message: "Something goes wrong" });
  }
};

// Controlador para obtener trabajos pendientes o en progreso cuya fecha ya pasó
export const getJobsPendiente = async (req, res) => {
  console.log("Buscando trabajos pendientes");
  try {
    console.log("Realizando la consulta SQL...");

    // Consulta trabajos con fecha anterior a la actual y con estado "Pendiente" o "En Progreso"
    const [rows] = await pool.query(
      `SELECT * FROM jobs WHERE dateJob < now() AND (state = "Pendiente" OR state = "En Progreso");`
    );

    console.log("Resultados:", rows); // Log de depuración
    res.json(rows);
  } catch (error) {
    console.error("Error al ejecutar la consulta:", error);
    res.status(500).json({ message: "Something goes wrong" });
  }
};

// Controlador para obtener los trabajos de un usuario en una fecha específica
export const getJobsDate = async (req, res) => {
  try {
    // Extrae el ID del usuario y la fecha desde los parámetros de la URL
    const userId = parseInt(req.params.id, 10);
    const fecha = req.params.fecha;

    // Verifica que ambos parámetros sean válidos
    if (isNaN(userId) || !fecha) {
      return res.status(400).json({ message: "Invalid user ID or date" });
    }

    // Consulta los trabajos que pertenecen al usuario y coinciden con la fecha especificada
    const [rows] = await pool.query(
      `SELECT j.idJob, j.dateJob, j.name, j.description, j.address, j.state, j.tlf, j.presencial, j.notas
       FROM jobs j 
       JOIN users_jobs uj ON j.idJob = uj.idJob 
       WHERE uj.idUser = ? AND DATE(j.dateJob) = ?;`,
      [userId, fecha]
    );

    // Devuelve los trabajos encontrados
    res.json(rows);
  } catch (error) {
    console.error("Error al ejecutar la consulta:", error);
    res.status(500).json({ message: "Something goes wrong" });
  }
};


// **Buscar trabajo por ID**
// Este controlador maneja la solicitud para obtener un trabajo por su ID.
export const getJob = async (req, res) => {
  try {
    // Realiza una consulta SQL para obtener un trabajo por su ID. `req.params.id` obtiene el ID desde los parámetros de la URL.
    const [rows] = await pool.query('SELECT jobs.*, users_jobs.fecha_inicio, users_jobs.fecha_fin FROM jobs LEFT JOIN users_jobs ON jobs.idJob = users_jobs.idJob WHERE jobs.idJob = ?;', [req.params.id]);
    //const [rows] = await pool.query('SELECT * FROM jobs WHERE idJob = ?', [req.params.id]);

    // Si no se encuentra ningún trabajo con el ID especificado, se responde con un error 404 (Not Found).
    if (rows.length <= 0) {
      return res.status(404).json({ message: "Trabajo no encontrado" });
    }

    // Si el trabajo existe, se responde con el trabajo encontrado en formato JSON.
    res.json(rows);
  } catch (error) {
    // En caso de un error, se responde con un error 500 (Internal Server Error).
    return res.status(500).json({ message: "Something goes wrong" });
  }
};

// Controlador para obtener todos los trabajos asignados a un usuario específico
export const getJobsByUser = async (req, res) => {
  try {
      // Extrae el ID del usuario desde los parámetros de la URL y lo convierte a número
      const userId = parseInt(req.params.id, 10);
      
      // Verifica si el ID es un número válido
      if (isNaN(userId)) {
          return res.status(400).json({ message: "Invalid user ID" });
      }

      // Consulta todos los idJob que están asignados al usuario en la tabla users_jobs
      const [userJobs] = await pool.query(
          `SELECT idJob FROM users_jobs WHERE idUser = ?;`,
          [userId]
      );

      // Si el usuario no tiene trabajos asignados, retorna una lista vacía
      if (userJobs.length === 0) {
          return res.json([]);
      }

      // Extrae todos los ID de trabajos en un array
      const jobIds = userJobs.map(job => job.idJob);

      // Consulta los detalles de los trabajos cuyo idJob está en la lista obtenida
      const [jobs] = await pool.query(
          `SELECT * FROM jobs WHERE idJob IN (?);`,
          [jobIds]
      );

      // Devuelve los trabajos encontrados
      res.json(jobs);
  } catch (error) {
      console.error("Error al ejecutar la consulta:", error);
      res.status(500).json({ message: "Something goes wrong" });
  }
};


// Controlador para iniciar un trabajo: actualizar hora de inicio y estado
export const startJob = async (req, res) => {
  try {
    // Extrae el id del trabajo desde los parámetros de la URL
    const { idJob } = req.params;

    // Extrae la fecha de inicio desde el cuerpo de la solicitud
    const { dateJob } = req.body;

    // Verifica que ambos parámetros estén presentes
    if (!idJob || !dateJob) {
      return res.status(400).json({ message: "Faltan parámetros: idJob o dateJob" });
    }

    // 1️⃣ Actualiza la fecha de inicio en la tabla users_jobs para ese trabajo
    const [result] = await pool.query(
      'UPDATE users_jobs SET fecha_inicio = ? WHERE idJob = ?',
      [dateJob, idJob]
    );

    // Si no se afectó ninguna fila, el trabajo no existe
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Trabajo no encontrado" });
    }

    // 2️⃣ Actualiza el estado del trabajo a "En Progreso" en la tabla jobs
    const newStatus = "En Progreso";
    const [statusUpdate] = await pool.query(
      'UPDATE jobs SET state = ? WHERE idJob = ?',
      [newStatus, idJob]
    );

    // Verifica si el estado se actualizó correctamente
    if (statusUpdate.affectedRows === 0) {
      return res.status(404).json({ message: "No se pudo actualizar el estado del trabajo" });
    }

    // 3️⃣ Devuelve una respuesta exitosa si ambas operaciones se completaron bien
    res.status(200).json({ message: "Hora de inicio y estado actualizados correctamente" });

  } catch (error) {
    console.error("Error al actualizar el trabajo:", error);
    res.status(500).json({ message: "Something goes wrong" });
  }
};


// Controlador para finalizar un trabajo: actualizar hora de fin y estado
export const endJob = async (req, res) => {
  try {
    // Extrae el id del trabajo desde los parámetros
    const { idJob } = req.params;

    // Extrae la fecha de fin y el ID del usuario desde el cuerpo de la solicitud
    const { dateJob, userId } = req.body;

    // Verifica que los parámetros necesarios estén presentes
    if (!idJob || !dateJob) {
      return res.status(400).json({ message: "Faltan parámetros: idJob, endTime" });
    }

    // 1️⃣ Actualiza la fecha de fin en la tabla users_jobs para ese trabajo
    const [result] = await pool.query(
      'UPDATE users_jobs SET fecha_fin = ? WHERE idJob = ?',
      [dateJob, idJob]
    );

    // Si no se actualizó ninguna fila, no se encontró el trabajo
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Trabajo no encontrado" });
    }

    // 2️⃣ Actualiza el estado del trabajo a "Terminado" en la tabla jobs
    const newStatus = "Terminado";
    const [statusUpdate] = await pool.query(
      'UPDATE jobs SET state = ? WHERE idJob = ?',
      [newStatus, idJob]
    );

    // Verifica que el estado se haya actualizado
    if (statusUpdate.affectedRows === 0) {
      return res.status(404).json({ message: "No se pudo actualizar el estado del trabajo" });
    }

    // 3️⃣ Devuelve una respuesta exitosa si todo salió bien
    res.status(200).json({ message: "Hora de fin y estado actualizados correctamente" });

  } catch (error) {
    console.error("Error al finalizar el trabajo:", error);
    res.status(500).json({ message: "Something goes wrong" });
  }
};


// Crear un nuevo trabajo y registrarlo
export const createJob = async (req, res) => {
  try {
    const { userId } = req.params; // ID del usuario que está creando el trabajo
    const { dateJob, name, description, address, state, tlf, presencial, notas } = req.body;

    // Insertar el nuevo trabajo en la base de datos
    const [jobResult] = await pool.query(
      "INSERT INTO jobs (dateJob, name, description, address, state, tlf, presencial, notas) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [dateJob, name, description, address, state, tlf, presencial, notas]
    );

    const jobId = jobResult.insertId; // Obtener el ID generado para el nuevo trabajo

    // Registrar la creación del trabajo en la tabla de registros
    await pool.query(
      "INSERT INTO registros (idUser, comentario, hora) VALUES (?, ?, NOW())",
      [userId, `Trabajo insertado ${name}`]
    );

    // Enviar respuesta con el ID del trabajo creado
    res.status(201).json({ idJob: jobId });
  } catch (error) {
    console.error("Error al crear el trabajo:", error);
    res.status(500).json({ message: "Something goes wrong" });
  }
};

// Actualizar un trabajo existente
export const updateJob = async (req, res) => {
  try {
    const { userId } = req.params; // ID del usuario que está actualizando
    const { idJob, dateJob, name, description, address, state, tlf, presencial, notas } = req.body;

    // Actualizar los campos del trabajo
    const [jobResult] = await pool.query(
      'UPDATE jobs SET dateJob = ?, name = ?, description = ?, address = ?, state = ?, tlf = ?, presencial = ?, notas = ? WHERE idJob = ?',
      [dateJob, name, description, address, state, tlf, presencial, notas, idJob]
    );

    // Si no se modificó ninguna fila, significa que el trabajo no existe
    if (jobResult.affectedRows === 0) {
      return res.status(404).json({ message: "Trabajo no encontrado" });
    }

    // Registrar la modificación en la tabla de registros
    await pool.query(
      "INSERT INTO registros (idUser, comentario, hora) VALUES (?, ?, NOW())",
      [userId, `Trabajo modificado ${name}`]
    );

    // Enviar respuesta con el ID del trabajo actualizado
    res.status(200).json({ idJob });
  } catch (error) {
    console.error("Error al modificar el trabajo:", error);
    res.status(500).json({ message: "Something goes wrong" });
  }
};

// Eliminar un trabajo de la base de datos
export const deleteJob = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Intentando eliminar el trabajo con ID:", id);

    // Eliminar relaciones en la tabla users_jobs que dependen del trabajo
    await pool.query('DELETE FROM users_jobs WHERE idJob = ?', [id]);

    // Eliminar el trabajo en sí
    const [result] = await pool.query('DELETE FROM jobs WHERE idJob = ?', [id]);

    // Verificar si el trabajo existía
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Trabajo no encontrado" });
    }

    // Enviar respuesta sin contenido (204 = eliminado correctamente)
    res.sendStatus(204);

    // NOTA: Este bloque está mal ubicado. No se puede ejecutar después de enviar la respuesta
    // Además, falta `userId` aquí, lo que causará un error
    /*
    const [rows] = await pool.query(
      "INSERT INTO registros VALUES (?, ?, NOW())", 
      [userId, `Trabajo eliminado ${id}`]
    );
    */
  } catch (error) {
    console.error("Error al eliminar el trabajo:", error);
    res.status(500).json({ message: "Something goes wrong" });
  }
};

// Asignar un trabajo a un usuario
export const createUserJob = async (req, res) => {
  console.log("Iniciando createUserJob");
  try {
    const { idUser, idJob } = req.body;

    // Validar datos requeridos
    if (!idUser || !idJob) {
      return res.status(400).json({ message: "Faltan parámetros: idUser o idJob" });
    }

    // Verificar existencia del usuario
    const [userExists] = await pool.query('SELECT idUser FROM users WHERE idUser = ?', [idUser]);
    if (userExists.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Verificar existencia del trabajo
    const [jobExists] = await pool.query('SELECT idJob FROM jobs WHERE idJob = ?', [idJob]);
    if (jobExists.length === 0) {
      return res.status(404).json({ message: "Trabajo no encontrado" });
    }

    // Verificar si la relación ya existe
    const [relationExists] = await pool.query(
      'SELECT * FROM users_jobs WHERE idUser = ? AND idJob = ?',
      [idUser, idJob]
    );

    if (relationExists.length > 0) {
      return res.status(400).json({ message: "El usuario ya tiene asignado este trabajo" });
    }

    // Crear la relación usuario-trabajo
    await pool.query(
      'INSERT INTO users_jobs (idUser, idJob) VALUES (?, ?)',
      [idUser, idJob]
    );

    // Respuesta exitosa
    res.status(201).json({ message: "Trabajo asignado correctamente" });

  } catch (error) {
    console.error("Error al asignar el trabajo:", error);
    res.status(500).json({ message: "Something goes wrong" });
  }
};

// Actualizar la asignación de un usuario a un trabajo
export const updateUserJob = async (req, res) => {
  try {
    const { userId, idJob, fecha_inicio, fecha_fin } = req.body;

    // Validar parámetros requeridos
    if (!userId || !idJob) {
      return res.status(400).json({ message: "Faltan parámetros: idUser o idJob" });
    }

    // Verificar existencia del usuario
    const [[userExists]] = await pool.query('SELECT idUser FROM users WHERE idUser = ?', [userId]);
    if (!userExists) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Verificar existencia del trabajo
    const [[jobExists]] = await pool.query('SELECT idJob FROM jobs WHERE idJob = ?', [idJob]);
    if (!jobExists) {
      return res.status(404).json({ message: "Trabajo no encontrado" });
    }

    // Eliminar relaciones anteriores de ese trabajo
    await pool.query('DELETE FROM users_jobs WHERE idJob = ?', [idJob]);

    // Crear nueva asignación con fechas
    await pool.query(
      'INSERT INTO users_jobs (idUser, idJob, fecha_inicio, fecha_fin) VALUES (?, ?, ?, ?)',
      [userId, idJob, fecha_inicio, fecha_fin]
    );

    // Respuesta exitosa
    res.status(200).json({ message: "Usuario actualizado para el trabajo correctamente" });

  } catch (error) {
    console.error("Error al actualizar el usuario del trabajo:", error);
    res.status(500).json({ message: "Something goes wrong" });
  }
};



// ✅ Guardar nota en un trabajo (solo si aún no hay nota guardada)
export const guardarNota = async (req, res) => {
  try {
    const { notas } = req.body;        // Obtener la nota del cuerpo de la solicitud
    const { idJob } = req.params;      // Obtener el ID del trabajo desde los parámetros

    // Verificar si el trabajo existe en la base de datos
    const [[jobExists]] = await pool.query('SELECT idJob, notas FROM jobs WHERE idJob = ?', [idJob]);
    if (!jobExists) {
      return res.status(404).json({ message: "Trabajo no encontrado" });
    }

    // Si ya existe una nota, no se permite editarla
    if (jobExists.notas) {
      return res.status(400).json({ message: "La nota ya ha sido guardada y no se puede editar" });
    }

    // Actualizar el campo de notas del trabajo
    await pool.query('UPDATE jobs SET notas = ? WHERE idJob = ?', [notas, idJob]);
    res.status(200).json({ message: "Nota guardada correctamente" });

  } catch (error) {
    console.error("Error al insertar notas:", error);
    res.status(500).json({ message: "Something goes wrong" });
  }
};

// ✅ Crear un registro en la tabla "taller"
export const createTaller = async (req, res) => {
  try {

    const { idJob, cliente, equipo, averia, suceso } = req.body;

    // Insertar nuevo registro del taller con la información del cliente y problema
    const [jobResult] = await pool.query(
      "INSERT INTO taller (idJob, cliente, equipo, averia, suceso) VALUES (?, ?, ?, ?, ?)",
      [ idJob, cliente, equipo, averia, suceso ]
    );

    // Responder con el ID del trabajo del taller creado
    res.status(201).json({ idJob: jobId });
  } catch (error) {
    console.error("Error al crear el trabajo del taller:", error);
    res.status(500).json({ message: "Something goes wrong" });
  }
};


// ✅ Obtener trabajos finalizados por un usuario entre fechas dadas
export const getFinishedJobsByUser = async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin } = req.params; // Rango de fechas recibido como parámetros de la URL

    // Consultar trabajos que estén en estado "Terminado" y dentro del rango de fechas
    const [rows] = await pool.query(
      `SELECT 
         jobs.name AS nameJob,
         users.name AS nameTecnico,
         users_jobs.fecha_inicio,
         users_jobs.fecha_fin,
         users.precio AS precioPorHora,
         jobs.idJob
       FROM jobs
       INNER JOIN users_jobs ON jobs.idJob = users_jobs.idJob
       INNER JOIN users ON users_jobs.idUser = users.idUser
       WHERE jobs.state = 'Terminado' AND jobs.dateJob BETWEEN ? AND ?;`,
      [fecha_inicio, fecha_fin]
    );

    // Formatear los resultados para la respuesta
    const facturas = rows.map(row => ({
      nameJob: row.nameJob,
      nameTecnico: row.nameTecnico,
      fecha_inicio: row.fecha_inicio,
      fecha_fin: row.fecha_fin,
      precio: row.precioPorHora,
      idJob: row.idJob
    }));

    res.json(facturas);

  } catch (error) {
    console.error("Error al obtener trabajos finalizados del usuario:", error);
    return res.status(500).json({ message: "Something goes wrong" });
  }
};




