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


export const getJobsDate = async (req, res) => {
  try {
      const userId = parseInt(req.params.id, 10);
      const fecha = req.params.fecha; // O usa req.query.fecha si viene en query

      if (isNaN(userId) || !fecha) {
          return res.status(400).json({ message: "Invalid user ID or date" });
      }

      const [rows] = await pool.query(
          `SELECT j.idJob, j.dateJob, j.name, j.description, j.address, j.state, j.tlf
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

/*export const getJobsByUser = async (req, res) => {
  try {
      const userId = parseInt(req.params.id, 10);
      if (isNaN(userId)) {
          return res.status(400).json({ message: "Invalid user ID" });
      }

      const [rows] = await pool.query(
          `SELECT * FROM jobs WHERE tecnicoId = ?;`, // Corregir consulta
          [userId]
      );

      res.json(rows);
  } catch (error) {
      console.error("Error al ejecutar la consulta:", error);
      res.status(500).json({ message: "Something goes wrong" });
  }
};*/

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
    // Obtener el idJob desde los parámetros de la URL
    const { idJob } = req.params; // Esto obtiene el idJob de la URL
    
    // Obtener el startTime desde el cuerpo de la solicitud
    const { dateJob } = req.body; // Esto obtiene startTime (dateJob) del cuerpo
    
    // Verificar si ambos parámetros están presentes
    if (!idJob || !dateJob) {
      return res.status(400).json({ message: "Faltan parámetros: idJob o startTime" });
    }

    // Realizar la consulta SQL para actualizar el trabajo con el idJob dado
    const [result] = await pool.query(
      'UPDATE users_jobs SET fecha_inicio = ? WHERE idJob = ?',
      [dateJob, idJob]    
    );

    // Si no se encuentra el trabajo, retornar error 404
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Trabajo no encontrado" });
    }

    // Si la actualización fue exitosa, retornar mensaje de éxito
    res.status(200).json({ message: "Hora de inicio actualizada exitosamente" });

  } catch (error) {
    console.error("Error al actualizar la hora de inicio del trabajo:", error);
    res.status(500).json({ message: "Something goes wrong" });
  }
};

export const endJob = async (req, res) => {
  try {
    // Obtener el idJob desde los parámetros de la URL
    const { idJob } = req.params; // Esto obtiene el idJob de la URL
    
    // Obtener el endTime desde el cuerpo de la solicitud
    const { dateJob } = req.body; // Esto obtiene endTime (dateJob) del cuerpo
    
    // Verificar si ambos parámetros están presentes
    if (!idJob || !dateJob) {
      return res.status(400).json({ message: "Faltan parámetros: idJob o endTime" });
    }

    // Realizar la consulta SQL para actualizar el trabajo con el idJob dado
    const [result] = await pool.query(
      'UPDATE users_jobs SET fecha_fin = ? WHERE idJob = ?',
      [dateJob, idJob]
    );

    // Si no se encuentra el trabajo, retornar error 404
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Trabajo no encontrado" });
    }

    // Si la actualización fue exitosa, retornar mensaje de éxito
    res.status(200).json({ message: "Hora de fin actualizada exitosamente" });

  } catch (error) {
    console.error("Error al actualizar la hora de fin del trabajo:", error);
    res.status(500).json({ message: "Something goes wrong" });
  }

  const [rows] = await pool.query(
    "INSERT INTO registros VALUES (?, ?, NOW())", 
    [userId, `Trabajo terminado ${idJob}`]
);
};



//CRUD

export const createJob = async (req, res) => {
  try {
    const { userId } = req.params;

    const { dateJob, name, description, address, state, tlf } = req.body;

    // Insertar el trabajo en la base de datos
    const [jobResult] = await pool.query(
      "INSERT INTO jobs (dateJob, name, description, address, state, tlf) VALUES (?, ?, ?, ?, ?, ?)",
      [dateJob, name, description, address, state, tlf]
    );

    const jobId = jobResult.insertId; // Obtener el ID del nuevo trabajo

    // Insertar un registro en la tabla de registros
    await pool.query(
      "INSERT INTO registros (idUser, comentario, hora) VALUES (?, ?, NOW())",
      [userId, `Trabajo insertado ${name}`]
    );

    // Responder con el ID del trabajo creado
    res.status(201).json({ id: jobId, dateJob, name, description, address, state, tlf });
  } catch (error) {
    console.error("Error al crear el trabajo:", error);
    res.status(500).json({ message: "Something goes wrong" });
  }
};

export const updateJob = async (req, res) => {
  try {
    const { userId } = req.params;

    const { idJob, dateJob, name, description, address, state, tlf } = req.body;

    // Actualizar el trabajo en la base de datos
    const [jobResult] = await pool.query(
      'UPDATE jobs SET dateJob = ?, name = ?, description = ?, address = ?, state = ?, tlf = ? WHERE idJob = ?',
      [dateJob, name, description, address, state, tlf, idJob]
    );

    const jobId = jobResult.insertId; // Obtener el ID del nuevo trabajo

    // Insertar un registro en la tabla de registros
    await pool.query(
      "INSERT INTO registros (idUser, comentario, hora) VALUES (?, ?, NOW())",
      [userId, `Trabajo modificado ${name}`]
    );

    // Responder con el ID del trabajo creado
    res.status(201).json({ id: jobId, dateJob, name, description, address, state, tlf });
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