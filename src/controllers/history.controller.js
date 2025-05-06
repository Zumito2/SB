// Importa el objeto `pool` desde el módulo `db.js`, que gestiona la conexión a la base de datos.
import { pool } from '../db.js';

// Define una función asincrónica `getHistory` que maneja una solicitud HTTP.
export const getHistory = async (req, res) => {
  try {
    // Ejecuta una consulta SQL para seleccionar todos los registros de la tabla `registros`,
    // ordenados de forma descendente por el campo `idRegister` (del más reciente al más antiguo).
    const [rows] = await pool.query("SELECT * FROM registros ORDER BY idRegister DESC;");

    // Envía como respuesta el resultado de la consulta en formato JSON.
    res.json(rows);
  } catch (error) {
    // Captura cualquier error que ocurra durante la ejecución de la consulta SQL.
    // Muestra el error en la consola para propósitos de depuración.
    console.error("Error al ejecutar la consulta:", error); 
    
    // Devuelve una respuesta con código de estado 500 (error interno del servidor)
    // junto con un mensaje genérico en formato JSON.
    return res.status(500).json({ message: "Something goes wrong" });
  }
};
