import { pool } from '../db.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

export const login = async (req, res) => {
  try {
    console.log("✅ Método login ejecutado");

    // Extrae nombre de usuario y contraseña del request
    const { name, pass } = req.body;
    console.log("📥 Datos de login:", { name, pass });

    // Busca el usuario en la base de datos
    const [rows] = await pool.query("SELECT * FROM users WHERE name = ?", [name]);
    console.log("📚 Usuarios encontrados:", rows);

    if (rows.length === 0) {
      console.log("❌ Usuario no encontrado");
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const user = rows[0];
    console.log("🔐 Verificando contraseña...");

    if (pass !== user.pass) {
      console.log("❌ Contraseña incorrecta");
      return res.status(401).json({ message: "Contraseña incorrecta" });
    }

    // Genera payload y token
    const payload = {
      idUser: user.idUser,
      name: user.name,
      rol: user.rol
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRATION
    });
    console.log("🗝️ Token generado:", token);

    // Registra el inicio de sesión en la base de datos
    await pool.query(
      "INSERT INTO registros VALUES (?, 'Inicio sesion', NOW())",
      [payload.idUser]
    );
    console.log("📝 Registro de login guardado");

    // Devuelve la respuesta al cliente
    const { idUser, name: username, rol } = user;
    res.json({
      user: { idUser, username, rol },
      token
    });

  } catch (error) {
    console.error("❗ Error durante login:", error);
    return res.status(500).json({ message: "Algo salió mal", error: error.message });
  }
};
