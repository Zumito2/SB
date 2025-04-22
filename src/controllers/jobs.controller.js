// Importa el objeto `pool` desde el archivo de configuración de base de datos (`db.js`).
// `pool` gestiona las conexiones a la base de datos.
import { pool } from '../db.js';

// **Obtener lista total de trabajos**
// Este controlador maneja la solicitud para obtener todos los trabajos de la base de datos.
export const getJobs = async (req, res) => {
  try {
    // Realiza una consulta SQL para obtener todos los trabajos.
    const [rows] = await pool.query("SELECT * FROM jobs");

    // Responde con la lista de trabajos en formato JSON.
    res.json(rows);
  } catch (error) {
    // Si ocurre un error en la consulta, se captura y se responde con un error 500 (Internal Server Error).
    console.error("Error al ejecutar la consulta:", error); 
    return res.status(500).json({ message: "Something goes wrong" });
  }
};

// **Obtener lista total de trabajos de un trabajador**
// Este controlador maneja la solicitud para obtener todos los trabajos de un trabajador de la base de datos.
export const getJobsId = async (req, res) => {
    try {
        const userId = parseInt(req.params.id, 10);
        if (isNaN(userId)) {
            return res.status(400).json({ message: "Invalid user ID" });
        }

        const [rows] = await pool.query(
            `SELECT * FROM jobs WHERE idJob = ?;`,
            [userId]
        );

        res.json(rows);
    } catch (error) {
        console.error("Error al ejecutar la consulta:", error);
        res.status(500).json({ message: "Something goes wrong" });
    }
};

export const getJobsFecha = async (req, res) => {
  try {
    const fecha = req.params.fecha;

    if (!fecha || isNaN(Date.parse(fecha))) {
      return res.status(400).json({ message: "Invalid date" });
    }

    console.log("Fecha recibida:", fecha); // Depuración

    const [rows] = await pool.query(
      `SELECT * FROM jobs WHERE DATE(dateJob) = ?;`,
      [fecha]
    );

    console.log("Resultados:", rows); // Depuración

    res.json(rows);
  } catch (error) {
    console.error("Error al ejecutar la consulta:", error);
    res.status(500).json({ message: "Something goes wrong" });
  }
};

export const getJobsPendiente = async (req, res) => {
  console.log("Buscando trabajos pendientes");
  try {
    console.log("Realizando la consulta SQL...");
    const [rows] = await pool.query(
      `SELECT * FROM jobs WHERE dateJob < now() AND (state = "Pendiente" OR state = "En Progreso");`
    );

    console.log("Resultados:", rows);
    res.json(rows);
  } catch (error) {
    console.error("Error al ejecutar la consulta:", error);
    res.status(500).json({ message: "Something goes wrong" });
  }
};



export const getJobsDate = async (req, res) => {
  try {
      const userId = parseInt(req.params.id, 10);
      const fecha = req.params.fecha; // O usa req.query.fecha si viene en query

      if (isNaN(userId) || !fecha) {
          return res.status(400).json({ message: "Invalid user ID or date" });
      }

      const [rows] = await pool.query(
          `SELECT j.idJob, j.dateJob, j.name, j.description, j.address, j.state, j.tlf, j.presencial, j.notas
           FROM jobs j 
           JOIN users_jobs uj ON j.idJob = uj.idJob 
           WHERE uj.idUser = ? AND DATE(j.dateJob) = ?;`,
          [userId, fecha]
      );

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

export const getJobsByUser = async (req, res) => {
  try {
      const userId = parseInt(req.params.id, 10);
      if (isNaN(userId)) {
          return res.status(400).json({ message: "Invalid user ID" });
      }

      // Obtener los idJob asignados al usuario
      const [userJobs] = await pool.query(
          `SELECT idJob FROM users_jobs WHERE idUser = ?;`,
          [userId]
      );

      // Si el usuario no tiene trabajos asignados, retornar una lista vacía
      if (userJobs.length === 0) {
          return res.json([]);
      }

      // Obtener los detalles de los trabajos
      const jobIds = userJobs.map(job => job.idJob);
      const [jobs] = await pool.query(
          `SELECT * FROM jobs WHERE idJob IN (?);`,
          [jobIds]
      );

      res.json(jobs);
  } catch (error) {
      console.error("Error al ejecutar la consulta:", error);
      res.status(500).json({ message: "Something goes wrong" });
  }
};



export const startJob = async (req, res) => {
  try {
    const { idJob } = req.params; // Obtener idJob de la URL
    const { dateJob } = req.body; // Obtener fecha de inicio del cuerpo

    if (!idJob || !dateJob) {
      return res.status(400).json({ message: "Faltan parámetros: idJob o dateJob" });
    }

    // 1️⃣ Primera consulta: Actualizar fecha de inicio en users_jobs
    const [result] = await pool.query(
      'UPDATE users_jobs SET fecha_inicio = ? WHERE idJob = ?',
      [dateJob, idJob]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Trabajo no encontrado" });
    }

    // 2️⃣ Segunda consulta: Actualizar estado en la tabla jobs
    const newStatus = "En Progreso";
    const [statusUpdate] = await pool.query(
      'UPDATE jobs SET state = ? WHERE idJob = ?',
      [newStatus, idJob]
    );

    if (statusUpdate.affectedRows === 0) {
      return res.status(404).json({ message: "No se pudo actualizar el estado del trabajo" });
    }

    // 3️⃣ Enviar una única respuesta después de ambas actualizaciones
    res.status(200).json({ message: "Hora de inicio y estado actualizados correctamente" });

  } catch (error) {
    console.error("Error al actualizar el trabajo:", error);
    res.status(500).json({ message: "Something goes wrong" });
  }
};


export const endJob = async (req, res) => {
  try {
    const { idJob } = req.params; // Obtener idJob de la URL
    const { dateJob, userId } = req.body; // Obtener fecha de fin y userId

    if (!idJob || !dateJob) {
      return res.status(400).json({ message: "Faltan parámetros: idJob, endTime" });
    }

    // 1️⃣ Actualizar fecha de fin en users_jobs
    const [result] = await pool.query(
      'UPDATE users_jobs SET fecha_fin = ? WHERE idJob = ?',
      [dateJob, idJob]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Trabajo no encontrado" });
    }

    // 2️⃣ Actualizar estado en jobs
    const newStatus = "Terminado";
    const [statusUpdate] = await pool.query(
      'UPDATE jobs SET state = ? WHERE idJob = ?',
      [newStatus, idJob]
    );

    if (statusUpdate.affectedRows === 0) {
      return res.status(404).json({ message: "No se pudo actualizar el estado del trabajo" });
    }

    // 4️⃣ Enviar respuesta después de que todo se complete
    res.status(200).json({ message: "Hora de fin y estado actualizados correctamente" });

  } catch (error) {
    console.error("Error al finalizar el trabajo:", error);
    res.status(500).json({ message: "Something goes wrong" });
  }
};




//CRUD

export const createJob = async (req, res) => {
  try {
    const { userId } = req.params;

    const { dateJob, name, description, address, state, tlf, presencial, notas } = req.body;

    // Insertar el trabajo en la base de datos
    const [jobResult] = await pool.query(
      "INSERT INTO jobs (dateJob, name, description, address, state, tlf, presencial, notas) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [dateJob, name, description, address, state, tlf, presencial, notas ]
    );

    const jobId = jobResult.insertId; // Obtener el ID del nuevo trabajo

    // Insertar un registro en la tabla de registros
    await pool.query(
      "INSERT INTO registros (idUser, comentario, hora) VALUES (?, ?, NOW())",
      [userId, `Trabajo insertado ${name}`]
    );

    // Responder con el ID del trabajo creado
    res.status(201).json({ idJob: jobId });
  } catch (error) {
    console.error("Error al crear el trabajo:", error);
    res.status(500).json({ message: "Something goes wrong" });
  }
};

export const updateJob = async (req, res) => {
  try {
    const { userId } = req.params;  // userId de los parámetros de la URL
    const { idJob, dateJob, name, description, address, state, tlf, presencial, notas } = req.body;

    // Actualizar el trabajo en la base de datos
    const [jobResult] = await pool.query(
      'UPDATE jobs SET dateJob = ?, name = ?, description = ?, address = ?, state = ?, tlf = ? , presencial = ?, notas = ? WHERE idJob = ?',
      [dateJob, name, description, address, state, tlf, presencial, notas, idJob]
    );

    // Si no se actualizó ninguna fila, se puede retornar un error indicando que no se encontró el trabajo.
    if (jobResult.affectedRows === 0) {
      return res.status(404).json({ message: "Trabajo no encontrado" });
    }

    // Insertar un registro en la tabla de registros
    await pool.query(
      "INSERT INTO registros (idUser, comentario, hora) VALUES (?, ?, NOW())",
      [userId, `Trabajo modificado ${name}`]
    );

    // Responder con el ID del trabajo actualizado (idJob)
    res.status(200).json({ idJob });
  } catch (error) {
    console.error("Error al modificar el trabajo:", error);
    res.status(500).json({ message: "Something goes wrong" });
  }
};


// **Eliminar un trabajo existente**
export const deleteJob = async (req, res) => {
  try {
      const { id } = req.params;
      console.log("Intentando eliminar el trabajo con ID:", id);

      // Eliminar registros dependientes en users_jobs
      await pool.query('DELETE FROM users_jobs WHERE idJob = ?', [id]);

      // Eliminar el trabajo de la tabla jobs
      const [result] = await pool.query('DELETE FROM jobs WHERE idJob = ?', [id]);

      console.log("Resultado de la consulta:", result);
      if (result.affectedRows === 0) {
          return res.status(404).json({ message: "Trabajo no encontrado" });
      }
      res.sendStatus(204);
  } catch (error) {
      console.error("Error al eliminar el trabajo:", error);
      res.status(500).json({ message: "Something goes wrong" });
  }

  const [rows] = await pool.query(
    "INSERT INTO registros VALUES (?, ?, NOW())", 
    [userId, `Trabajo eliminado ${id}`]
);
};

export const createUserJob = async (req, res) => {
  console.log("Iniciando createUserJob")
  try {
    const { idUser, idJob } = req.body; // Obtener idUser e idJob del cuerpo de la solicitud

    if (!idUser || !idJob) {
      return res.status(400).json({ message: "Faltan parámetros: idUser o idJob" });
    }

    // 1️⃣ Verificar si el usuario y el trabajo existen antes de insertar
    const [userExists] = await pool.query('SELECT idUser FROM users WHERE idUser = ?', [idUser]);
    if (userExists.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const [jobExists] = await pool.query('SELECT idJob FROM jobs WHERE idJob = ?', [idJob]);
    if (jobExists.length === 0) {
      return res.status(404).json({ message: "Trabajo no encontrado" });
    }

    // 2️⃣ Verificar si la relación ya existe
    const [relationExists] = await pool.query(
      'SELECT * FROM users_jobs WHERE idUser = ? AND idJob = ?',
      [idUser, idJob]
    );

    if (relationExists.length > 0) {
      return res.status(400).json({ message: "El usuario ya tiene asignado este trabajo" });
    }

    // 3️⃣ Insertar en users_jobs
    await pool.query(
      'INSERT INTO users_jobs (idUser, idJob) VALUES (?, ?)',
      [idUser, idJob]
    );

    // 4️⃣ Responder con éxito
    res.status(201).json({ message: "Trabajo asignado correctamente" });

  } catch (error) {
    console.error("Error al asignar el trabajo:", error);
    res.status(500).json({ message: "Something goes wrong" });
  }
};

export const updateUserJob = async (req, res) => {
  try {
    const { userId, idJob, fecha_inicio, fecha_fin } = req.body; // Obtener idUser, idJob y fechas del cuerpo de la solicitud

    // Verificar que los parámetros necesarios estén presentes antes de hacer cualquier operación
    if (!userId || !idJob) {
      return res.status(400).json({ message: "Faltan parámetros: idUser o idJob" });
    }

    // 1️⃣ Verificar si el usuario y el trabajo existen antes de eliminar
    const [[userExists]] = await pool.query('SELECT idUser FROM users WHERE idUser = ?', [userId]);
    if (!userExists) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const [[jobExists]] = await pool.query('SELECT idJob FROM jobs WHERE idJob = ?', [idJob]);
    if (!jobExists) {
      return res.status(404).json({ message: "Trabajo no encontrado" });
    }

    // 2️⃣ Eliminar todos los registros previos del trabajo en users_jobs
    await pool.query('DELETE FROM users_jobs WHERE idJob = ?', [idJob]);

    // 3️⃣ Insertar la nueva relación usuario-trabajo
    await pool.query('INSERT INTO users_jobs (idUser, idJob, fecha_inicio, fecha_fin) VALUES (?, ?, ?, ?)', [userId, idJob, fecha_inicio, fecha_fin]);

    // 4️⃣ Responder con éxito
    res.status(200).json({ message: "Usuario actualizado para el trabajo correctamente" });

  } catch (error) {
    console.error("Error al actualizar el usuario del trabajo:", error);
    res.status(500).json({ message: "Something goes wrong" });
  }
};


export const guardarNota = async (req, res) => {
  try{
    const { notas } = req.body
    const { idJob } = req.params

    const [[jobExists]] = await pool.query('SELECT idJob FROM jobs WHERE idJob = ?', [idJob]);
    if (!jobExists) {
      return res.status(404).json({ message: "Trabajo no encontrado" });
    }

    if (jobExists.notas) {
      return res.status(400).json({ message: "La nota ya ha sido guardada y no se puede editar" });
    }

    await pool.query('UPDATE jobs SET notas = ? WHERE idJob = ?', [notas, idJob]);
    res.status(200).json({ message: "Nota guardada correctamente" });

  } catch (error) {
    console.error("Error al insertar notas:", error);
    res.status(500).json({ message: "Something goes wrong" });
  }
};

export const createTaller = async (req, res) => {
  try {

    const { idJob, cliente, equipo, averia, suceso } = req.body;

    // Insertar el trabajo en la base de datos
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


// Nuevo controlador para obtener trabajos finalizados de un usuario
export const getFinishedJobsByUser = async (req, res) => {
  try {

    const { fecha_inicio } = req.params
    const { fecha_fin } = req.params

      const [rows] = await pool.query(
          ` SELECT jobs.name AS nameJob, users.name AS nameTecnico, users_jobs.fecha_inicio, users_jobs.fecha_fin, users.precio AS precio_trabajo
                  FROM jobs INNER JOIN users_jobs ON jobs.idJob = users_jobs.idJob INNER JOIN users ON users_jobs.idUser = users.idUser
                            WHERE jobs.state = 'Terminado' AND jobs.dateJob BETWEEN ? AND ?;`,
          [fecha_inicio, fecha_fin]
      );

      const facturas = rows.map(row => ({
        nameJob: row.nameJob,
        nameTecnico: row.nameTecnico,
        fecha_inicio: row.fecha_inicio,
        fecha_fin: row.fecha_fin,
        precio: row.precio,
    }));

      res.json(facturas);
  } catch (error) {
      console.error("Error al obtener trabajos finalizados del usuario:", error);
      return res.status(500).json({ message: "Something goes wrong" });
  }
};

