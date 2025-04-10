// Importa el objeto `pool` desde el archivo de configuración de base de datos (`db.js`).
// `pool` gestiona las conexiones a la base de datos.
import { pool } from '../db.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

export const login = async (req, res) => {
    try {
      console.log("✅ Método login ejecutado");
      // Extrae el nombre de usuario y la contraseña desde el cuerpo de la solicitud.
      const { name, pass } = req.body;
      console.log("📥 Datos de login:", { name, pass }); // Log de lo que recibimos
  
      // Realiza una consulta SQL para obtener el usuario con el nombre proporcionado.
      const [rows] = await pool.query("SELECT * FROM users WHERE name = ?", [name]);
      console.log("📚 Usuarios encontrados:", rows); // Verifica si la consulta devuelve resultados
  
      // Si no se encuentra el usuario con ese nombre, responde con un error 404 (Not Found).
      if (rows.length === 0) {
        console.log("❌ Usuario no encontrado");
        return res.status(404).json({ message: "Usuario no encontrado" });
      }
  
      // Si el usuario es encontrado, compara la contraseña proporcionada con la almacenada.
      const user = rows[0];
      console.log("🔐 Verificando contraseña...");
  
      // Si las contraseñas no coinciden, responde con un error 401 (Unauthorized).
      if (pass !== user.pass) {
        console.log("❌ Contraseña incorrecta");
        return res.status(401).json({ message: "Contraseña incorrecta" });
      }
  
      // Si las credenciales son correctas, genera un JWT.
      const payload = {
        userId: user.idUser,
        name: user.name,
        rol: user.rol
      };
  
      console.log("Secreto JWT:", process.env.JWT_SECRET);
      // Genera el token con el payload, la clave secreta y la expiración.
      const token = jwt.sign(payload, process.env.JWT_SECRET, {      
        expiresIn: process.env.JWT_EXPIRATION // Expiración del token (1 hora en este caso)
      });
      console.log("🗝️ Token generado:", token);
  
      // Responde con el token generado y los datos del usuario (excepto la contraseña).
      const { idUser, name: username, rol } = user;
      res.json({
        user: { idUser, username, rol },
        token // El token JWT que se envía al cliente
      });
    } catch (error) {
      // Si ocurre un error durante el login, se responde con un error 500 (Internal Server Error).
      console.error("Error durante login:", error);
      return res.status(500).json({ message: "Algo salió mal", error: error.message });
    }
  };