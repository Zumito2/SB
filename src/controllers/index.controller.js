// Importa el objeto `pool` desde el archivo de configuración de base de datos (`db.js`).
// Este `pool` gestiona las conexiones a la base de datos.
import { pool } from "../db.js";

// Definición de la ruta `index` para la API.
// Cuando se accede a esta ruta, se devuelve un mensaje de bienvenida en formato JSON.
export const index = (req, res) => res.json({ message: "welcome to my api" });

// Definición de la ruta `ping` para la API, utilizando una función asíncrona.
// Esta ruta simula una consulta a la base de datos y responde con un valor fijo ("pong").
export const ping = async (req, res) => {
  // Realiza una consulta SQL a la base de datos utilizando el `pool` para obtener el valor "pong".
  // `SELECT "pong" as result` es una consulta que devuelve un solo valor estático "pong" como un campo llamado `result`.
  const [result] = await pool.query('SELECT "pong" as result');
  
  // Envía la respuesta en formato JSON con el primer valor del resultado de la consulta.
  // `result[0]` es un objeto con la clave `result` y el valor "pong".
  res.json(result[0]);
};
