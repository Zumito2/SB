// Importación de dependencias necesarias
import { pool } from '../db.js'; // Manejador de conexiones MySQL
import jwt from 'jsonwebtoken'; // Para autenticación con tokens (no usado aquí, pero importado)
import dotenv from 'dotenv'; // Para usar variables de entorno
dotenv.config();

// ================================
// Obtener todos los usuarios
// ================================
export const getUsers = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT u.idUser, u.name, u.rol, u.tlf, u.email, u.precio FROM users u");
    res.json(rows);
  } catch (error) {
    console.error("Error al ejecutar la consulta:", error); 
    return res.status(500).json({ message: "Something goes wrong" });
  }
};

// ================================
// Obtener un usuario por ID
// ================================
export const getUser = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT u.idUser, u.name, u.rol, u.tlf, u.email, u.precio FROM users u WHERE idUser = ?', 
      [req.params.id]
    );

    if (rows.length <= 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.json(rows[0]);
  } catch (error) {
    return res.status(500).json({ message: "Something goes wrong" });
  }
};

// ================================
// Crear un nuevo usuario
// ================================
export const createUser = async (req, res) => {
  try {
    const { userId } = req.params; // ID del usuario que realiza la acción (para registros)
    const { name, pass, email, tlf, precio, rol } = req.body;

    // Inserta el nuevo usuario en la tabla users
    const [rows] = await pool.query(
      "INSERT INTO users (name, pass, email, tlf, precio, rol) VALUES (?, ?, ?, ?, ?, ?)",
      [name, pass, email, tlf, precio, rol]
    );

    const idUser = rows.insertId;

    // Inserta una ubicación vacía inicial para el nuevo usuario
    await pool.query(
      "INSERT INTO location (idUser, name, latitud, longitud, fecha) VALUES (?, ?, ?, ?, NOW())",
      [idUser, name, "", ""]
    );

    // Registra en la tabla de auditoría que se creó un nuevo usuario
    await pool.query(
      "INSERT INTO registros (idUser, comentario, hora) VALUES (?, ?, NOW())",
      [userId, `Usuario creado ${name}`]
    );

    res.status(201).json({ id: idUser, name, rol, tlf, email, precio });
  } catch (error) {
    return res.status(500).json({ message: "Something goes wrong" });
  }
};

// ================================
// Eliminar un usuario
// ================================
export const deleteUser = async (req, res) => {
  try {
    const { idUser, userId } = req.params;

    // Elimina el usuario de la base de datos
    const [result] = await pool.query("DELETE FROM users WHERE idUser = ?", [Number(idUser)]);

    if (result.affectedRows <= 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Elimina también la ubicación asociada
    await pool.query("DELETE FROM location WHERE idUser = ?", [Number(idUser)]);

    // Registra la eliminación en la tabla de auditoría
    await pool.query(
      "INSERT INTO registros (idUser, comentario, hora) VALUES (?, ?, NOW())",
      [userId, `Usuario eliminado ${idUser}`]
    );

    res.sendStatus(204);
  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    return res.status(500).json({ message: "Something goes wrong" });
  }
};

// ================================
// Actualizar datos de un usuario
// ================================
export const updateUser = async (req, res) => {
  try {
    const { idUser } = req.params;

    // Verificar existencia del usuario
    const [existingUser] = await pool.query("SELECT * FROM users WHERE idUser = ?", [idUser]);
    if (existingUser.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const { name, pass, rol, tlf, email } = req.body;

    // Actualiza el usuario, solo los campos que se envían
    const [result] = await pool.query(
      "UPDATE users SET name = IFNULL(?, name), pass = IFNULL(?, pass), rol = IFNULL(?, rol),  tlf = IFNULL(?, tlf),  email = IFNULL(?, email) WHERE idUser = ?",
      [name, pass, rol, tlf, email, idUser]
    );

    if (result.affectedRows === 0) {
      return res.status(400).json({ message: "No changes made" });
    }

    // Obtiene los datos actualizados
    const [rows] = await pool.query("SELECT * FROM users WHERE idUser = ?", [idUser]);

    // Registra el cambio en la tabla de auditoría
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

// ================================
// Obtener usuarios asignados a un trabajo
// ================================
export const getUsersByJob = async (req, res) => {
  try {
    const { idJob } = req.params;

    const [rows] = await pool.query(
      "SELECT u.idUser, u.name, u.rol, u.tlf, u.email, u.precio FROM users u JOIN users_jobs j ON u.idUser = j.idUser WHERE j.idJob = ?", 
      [idJob]
    );

    res.json(rows);
  } catch (error) {
    console.error("Error al ejecutar la consulta:", error); 
    return res.status(500).json({ message: "Something goes wrong" });
  }
};

// ================================
// Obtener teléfono del soporte (usuario ID 999)
// ================================
export const getHelp = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT tlf FROM users WHERE idUser = 999');

    if (rows.length <= 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.json(rows[0]);
  } catch (error) {
    return res.status(500).json({ message: "Something goes wrong" });
  }
};

// ================================
// Actualizar ubicación del usuario
// ================================
export const setLocation = async (req, res) => {
  try {
    const { idUser, latitud, longitud, fecha } = req.body;

    if (!idUser || !latitud || !longitud || !fecha) {
      return res.status(400).json({ error: "Faltan datos necesarios" });
    }

    const [result] = await pool.query(
      "UPDATE location SET latitud = ?, longitud = ?, fecha = NOW() WHERE idUser = ?",
      [latitud, longitud, idUser]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.json({ message: "Ubicación actualizada correctamente" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

// ================================
// Obtener todas las ubicaciones recientes
// ================================
export const getRecentlyLocation = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM location");
    res.json(rows);
  } catch (error) {
    console.error("Error al ejecutar la consulta:", error); 
    return res.status(500).json({ message: "Something goes wrong" });
  }
};
