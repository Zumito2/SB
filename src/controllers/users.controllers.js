import {pool} from '../db.js'

// Lista total de usuarios
export const getUsers = async (req, res) => {
    try {
      const [rows] = await pool.query("SELECT * FROM users");
      res.json(rows);
    } catch (error) {
      return res.status(500).json({ message: "Something goes wrong" });
    }
  };

// Buscar usuario por id
export const getUser = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE idUser = ?', [req.params.id]);

    if (rows.length <= 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.json(rows[0]);
  } catch (error) {
    return res.status(500).json({ message: "Something goes wrong" });
  }
};

// Crear usuario
export const createUser = async (req, res) => {
  try {
    const { name, pass, rol } = req.body;
    const [rows] = await pool.query(
      "INSERT INTO users (name, pass, rol) VALUES (?, ?, ?)",
      [name, pass, rol]
    );
    res.status(201).json({ id: rows.insertId, name, pass, rol });
  } catch (error) {
    return res.status(500).json({ message: "Something goes wrong" });
  }
};

// Eliminar usuario
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query("DELETE FROM users WHERE idUser = ?", [Number(id)]);

    if (result.affectedRows <= 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.sendStatus(204);
  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    return res.status(500).json({ message: "Something goes wrong" });
  }
};

// Modificar usuario
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, pass, rol } = req.body;

    const [result] = await pool.query(
      "UPDATE users SET name = IFNULL(?, name), pass = IFNULL(?, pass), rol = IFNULL(?, rol) WHERE idUser = ?",
      [name, pass, rol, id]
    );

    if (result.affectedRows === 0)
      return res.status(404).json({ message: "User not found" });

    const [rows] = await pool.query("SELECT * FROM users WHERE idUser = ?", [
      id,
    ]);

    res.json(rows[0]);
  } catch (error) {
    return res.status(500).json({ message: "Something goes wrong" });
  }
};


export const login = async (req, res) => {
  try {
    const { name, pass } = req.body;

    const [rows] = await pool.query("SELECT * FROM users WHERE name = ?", [name]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const user = rows[0];

    if (pass != user.pass) {
      return res.status(401).json({ message: "Contraseña incorrecta" });
    }

    const { id, name: username, rol } = user; // Desestructuración del usuario

    res.json({ id, name: username, rol });
  } catch (error) {
    console.error("Error durante login:", error);  // Imprime el error con un mensaje claro
    return res.status(500).json({ message: "Algo salió mal", error: error.message });  // Incluye el mensaje de error
  }
};
