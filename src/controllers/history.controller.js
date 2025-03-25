import { pool } from '../db.js';

export const getHistory = async (req, res) => {
    try {
      // Realiza una consulta SQL para obtener todos los registros.
      const [rows] = await pool.query("SELECT * FROM registros ORDER BY idRegister DESC;");
  
      // Responde con la lista de trabajos en formato JSON.
      res.json(rows);
    } catch (error) {
      // Si ocurre un error en la consulta, se captura y se responde con un error 500 (Internal Server Error).
      console.error("Error al ejecutar la consulta:", error); 
      return res.status(500).json({ message: "Something goes wrong" });
    }
  };