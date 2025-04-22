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






    // Extraer el userId del payload del token y adjuntarlo a req
    req.userId = decoded.userId; // Asegúrate de que la clave 'userId' coincida con la del payload del token

    console.log("Middleware - Token decodificado:", decoded); // Log para verificar el payload
    console.log("Middleware - userId extraído:", req.userId); // Log del userId extraído







    

    next(); // Continuar con la siguiente función/middleware
  } catch (error) {
    // Si el token no es válido o ha expirado, responde con error 403
    return res.status(403).json({ message: "Token no válido o expirado" });
  }
};
