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
            `SELECT j.idJob, j.dateJob, j.name, j.description, j.address, j.state, j.tlf
             FROM jobs j 
             JOIN users_jobs uj ON j.idJob = uj.idJob 
             WHERE uj.idUser = ?;`,
            [userId]
        );

        res.json(rows);
    } catch (error) {
        console.error("Error al ejecutar la consulta:", error);
        res.status(500).json({ message: "Something goes wrong" });
    }
};
