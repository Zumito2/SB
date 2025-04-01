// Importa el objeto `pool` desde el archivo de configuración de base de datos (`db.js`).
// `pool` gestiona las conexiones a la base de datos.
import { pool } from '../db.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

// **Obtener lista total de usuarios**
// Este controlador maneja la solicitud para obtener todos los usuarios de la base de datos.
export const getUsers = async (req, res) => {
  try {
    // Realiza una consulta SQL para obtener todos los usuarios.
    const [rows] = await pool.query("SELECT * FROM users");

    // Responde con la lista de usuarios en formato JSON.
    res.json(rows);
  } catch (error) {
    // Si ocurre un error en la consulta, se captura y se responde con un error 500 (Internal Server Error).
    console.error("Error al ejecutar la consulta:", error); 
    return res.status(500).json({ message: "Something goes wrong" });
  }
};

// **Buscar usuario por ID**
// Este controlador maneja la solicitud para obtener un usuario por su ID.
export const getUser = async (req, res) => {
  try {
    // Realiza una consulta SQL para obtener un usuario por su ID. `req.params.id` obtiene el ID desde los parámetros de la URL.
    const [rows] = await pool.query('SELECT * FROM users WHERE idUser = ?', [req.params.id]);

    // Si no se encuentra ningún usuario con el ID especificado, se responde con un error 404 (Not Found).
    if (rows.length <= 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Si el usuario existe, se responde con el usuario encontrado en formato JSON.
    res.json(rows[0]);
  } catch (error) {
    // En caso de un error, se responde con un error 500 (Internal Server Error).
    return res.status(500).json({ message: "Something goes wrong" });
  }
};

// **Crear un nuevo usuario**
// Este controlador maneja la solicitud para crear un nuevo usuario.
export const createUser = async (req, res) => {
  try {
    const { userId } = req.params;
    // Extrae los datos del nuevo usuario desde el cuerpo de la solicitud (name, pass, rol).
    const { name, pass, email, tlf, precio, rol } = req.body;

    // Realiza una consulta SQL para insertar un nuevo usuario en la base de datos.
    const [rows] = await pool.query(
      "INSERT INTO users (name, pass, email, tlf, precio, rol) VALUES (?, ?, ?, ?, ?, ?)",
      [name, pass, email, tlf, precio, rol ]
    );

    const idUser = rows.insertId;

    await pool.query(
      "INSERT INTO location (idUser, name, latitud, longitud, fecha) VALUES (?, ?, ?, ?, NOW())",
      [idUser, name, "", ""]
    );

    // Insertar un registro en la tabla de registros
    await pool.query(
    "INSERT INTO registros (idUser, comentario, hora) VALUES (?, ?, NOW())",
    [userId, `Usuario creado ${name}`]
    );

    // Responde con el ID del nuevo usuario junto con su nombre, contraseña y rol.
    res.status(201).json({ id: rows.insertId, name, rol, tlf, email, precio });
  } catch (error) {
    // Si ocurre un error en la consulta, se responde con un error 500 (Internal Server Error).
    return res.status(500).json({ message: "Something goes wrong" });
  }

};

// **Eliminar un usuario**
// Este controlador maneja la solicitud para eliminar un usuario por su ID.
export const deleteUser = async (req, res) => {
  try {
    // Extrae el ID del usuario a eliminar desde los parámetros de la solicitud.
    const { idUser } = req.params;
    const { userId } = req.params;

    // Realiza una consulta SQL para eliminar un usuario de la base de datos utilizando su ID.
    const [result] = await pool.query("DELETE FROM users WHERE idUser = ?", [Number(idUser)]);

    // Si no se eliminó ningún registro, responde con un error 404 (Not Found).
    if (result.affectedRows <= 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    await pool.query("DELETE FROM location WHERE idUser = ?", [Number(idUser)]);

    // Insertar un registro en la tabla de registros
    await pool.query(
      "INSERT INTO registros (idUser, comentario, hora) VALUES (?, ?, NOW())",
      [userId, `Usuario eliminado ${idUser}`]
      );

    // Responde con un estado 204 (No Content) si la eliminación fue exitosa.
    res.sendStatus(204);
  } catch (error) {
    // Si ocurre un error durante la eliminación, se responde con un error 500 (Internal Server Error).
    console.error("Error al eliminar usuario:", error);
    return res.status(500).json({ message: "Something goes wrong" });
  }

};

export const updateUser = async (req, res) => {
  try {
    const { idUser } = req.params;
    
    // Verificar si el usuario existe antes de actualizar
    const [existingUser] = await pool.query("SELECT * FROM users WHERE idUser = ?", [idUser]);
    if (existingUser.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const { name, pass, rol, tlf, email } = req.body;

    const [result] = await pool.query(
      "UPDATE users SET name = IFNULL(?, name), pass = IFNULL(?, pass), rol = IFNULL(?, rol),  tlf = IFNULL(?, tlf),  email = IFNULL(?, email)WHERE idUser = ?",
      [name, pass, rol, tlf, email, idUser]
    );

    if (result.affectedRows === 0) {
      return res.status(400).json({ message: "No changes made" });
    }

    // Obtener el usuario actualizado
    const [rows] = await pool.query("SELECT * FROM users WHERE idUser = ?", [idUser]);

    // Insertar registro en logs
    await pool.query(
      "INSERT INTO registros (idUser, comentario, hora) VALUES (?, ?, NOW())",
      [idUser, `Usuario modificado ${name || existingUser[0].name}`]
    );

    res.json(rows[0]);
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    return res.status(500).json({ message: "Something goes wrong" });
  }
};


export const getUsersByJob = async (req, res) => {
  try {
    console.log("Iniciando getUsersByJob")
    const { idJob } = req.params;
    // Realiza una consulta SQL para obtener todos los usuarios.
    const [rows] = await pool.query("SELECT u.* FROM users u JOIN users_jobs j ON u.idUser = j.idUser WHERE j.idJob = ?", [idJob]);

    // Responde con la lista de usuarios en formato JSON.
    res.json(rows);
    console.log(rows);
  } catch (error) {
    // Si ocurre un error en la consulta, se captura y se responde con un error 500 (Internal Server Error).
    console.error("Error al ejecutar la consulta:", error); 
    return res.status(500).json({ message: "Something goes wrong" });
  }
};

// **Buscar usuario por ID**
// Este controlador maneja la solicitud para obtener un usuario por su ID.
export const getHelp = async (req, res) => {
  try {
    // Realiza una consulta SQL para obtener un usuario por su ID.
    const [rows] = await pool.query('SELECT tlf FROM users WHERE idUser = 999');

    // Si no se encuentra ningún usuario con el ID especificado, se responde con un error 404 (Not Found).
    if (rows.length <= 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Si el usuario existe, se responde con el usuario encontrado en formato JSON.
    res.json(rows[0]);
  } catch (error) {
    // En caso de un error, se responde con un error 500 (Internal Server Error).
    return res.status(500).json({ message: "Something goes wrong" });
  }
};

export const setLocation = async (req, res) => {
  try {
    const { idUser, latitud, longitud, fecha } = req.body;

    // Validar los parámetros necesarios
    if (!idUser || !latitud || !longitud || !fecha) {
      return res.status(400).json({ error: "Faltan datos necesarios" });
    }

    // SQL para actualizar la ubicación
    const [result] = await pool.query(
      "UPDATE location SET latitud = ?, longitud = ?, fecha = NOW() WHERE idUser = ?",
      [latitud, longitud, idUser]
    );

    // Verificar si el usuario fue encontrado y actualizado
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Respuesta en caso de éxito
    res.json({ message: "Ubicación actualizada correctamente" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const getRecentlyLocation = async (req, res) => {
  try {
    // Realiza una consulta SQL para obtener todas las ubicaciones.
    const [rows] = await pool.query("SELECT * FROM location WHERE fecha BETWEEN NOW() - INTERVAL 30 MINUTE AND NOW()");

    // Responde con la lista de ubicaciones en formato JSON.
    res.json(rows);
  } catch (error) {
    // Si ocurre un error en la consulta, se captura y se responde con un error 500 (Internal Server Error).
    console.error("Error al ejecutar la consulta:", error); 
    return res.status(500).json({ message: "Something goes wrong" });
  }
};