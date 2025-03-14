import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

// Middleware para verificar el token JWT
export const authenticateToken = (req, res, next) => {
  // Obtener el token del encabezado de la solicitud (Authorization: Bearer <token>)
  const token = req.header('Authorization')?.replace('Bearer ', '');

  // Si no hay token, responde con error 401
  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    // Verificar que el token sea válido usando la clave secreta
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Agregar los datos decodificados del usuario en la solicitud (req.user)
    req.user = decoded;
    next(); // Continuar con la siguiente función/middleware
  } catch (error) {
    // Si el token no es válido o ha expirado, responde con error 403
    return res.status(403).json({ message: "Token no válido o expirado" });
  }
};
