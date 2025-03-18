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
    // Extrae los datos del nuevo usuario desde el cuerpo de la solicitud (name, pass, rol).
    const { name, pass, rol } = req.body;

    // Realiza una consulta SQL para insertar un nuevo usuario en la base de datos.
    const [rows] = await pool.query(
      "INSERT INTO users (name, pass, rol) VALUES (?, ?, ?)",
      [name, pass, rol]
    );

    // Responde con el ID del nuevo usuario junto con su nombre, contraseña y rol.
    res.status(201).json({ id: rows.insertId, name, pass, rol });
  } catch (error) {
    // Si ocurre un error en la consulta, se responde con un error 500 (Internal Server Error).
    return res.status(500).json({ message: "Something goes wrong" });
  }

  const [rows] = await pool.query(
    "INSERT INTO registros VALUES (?, ?, NOW())", 
    [userId, `Usuario creado ${id}`]
);

};

// **Eliminar un usuario**
// Este controlador maneja la solicitud para eliminar un usuario por su ID.
export const deleteUser = async (req, res) => {
  try {
    // Extrae el ID del usuario a eliminar desde los parámetros de la solicitud.
    const { id } = req.params;

    // Realiza una consulta SQL para eliminar un usuario de la base de datos utilizando su ID.
    const [result] = await pool.query("DELETE FROM users WHERE idUser = ?", [Number(id)]);

    // Si no se eliminó ningún registro, responde con un error 404 (Not Found).
    if (result.affectedRows <= 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Responde con un estado 204 (No Content) si la eliminación fue exitosa.
    res.sendStatus(204);
  } catch (error) {
    // Si ocurre un error durante la eliminación, se responde con un error 500 (Internal Server Error).
    console.error("Error al eliminar usuario:", error);
    return res.status(500).json({ message: "Something goes wrong" });
  }

  const [rows] = await pool.query(
    "INSERT INTO registros VALUES (?, ?, NOW())", 
    [userId, `Usuario eliminado ${id}`]
  );

};

// **Modificar un usuario**
// Este controlador maneja la solicitud para actualizar los datos de un usuario.
export const updateUser = async (req, res) => {
  try {
    // Extrae el ID del usuario a modificar desde los parámetros de la solicitud.
    const { id } = req.params;

    // Extrae los nuevos valores del usuario (name, pass, rol) desde el cuerpo de la solicitud.
    const { name, pass, rol } = req.body;

    // Realiza una consulta SQL para actualizar los datos del usuario.
    // La función `IFNULL(?, value)` asegura que solo los campos no nulos sean actualizados.
    const [result] = await pool.query(
      "UPDATE users SET name = IFNULL(?, name), pass = IFNULL(?, pass), rol = IFNULL(?, rol) WHERE idUser = ?",
      [name, pass, rol, id]
    );

    // Si no se actualizó ningún registro (afectó 0 filas), responde con un error 404 (Not Found).
    if (result.affectedRows === 0)
      return res.status(404).json({ message: "User not found" });

    // Si la actualización fue exitosa, obtiene el usuario actualizado y lo devuelve en formato JSON.
    const [rows] = await pool.query("SELECT * FROM users WHERE idUser = ?", [id]);

    res.json(rows[0]);
  } catch (error) {
    // Si ocurre un error durante la actualización, se responde con un error 500 (Internal Server Error).
    return res.status(500).json({ message: "Something goes wrong" });
  }

  const [rows] = await pool.query(
    "INSERT INTO registros VALUES (?, ?, NOW())", 
    [userId, `Usuario modificado ${id}`]
  );

};



