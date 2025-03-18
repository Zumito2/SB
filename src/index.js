// Importa el paquete `express` para crear y manejar el servidor web.
import express from 'express';
import * as url from 'url';
import dotenv from 'dotenv';
import path from 'path';

// Crea una instancia de la aplicación Express.
const app = express();

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, 'dotenv.env') });

const PORT = process.env.PORT || 3000; // Railway asignará un puerto dinámico
app.listen(PORT, () => {
    console.log(`✅ Servidor corriendo en el puerto ${PORT}`);
});

// Importa las rutas definidas para manejar usuarios y la página de inicio de la API.
import usersRoutes from './routes/users.routes.js';
import jobsRoutes from './routes/jobs.routes.js';
import loginRoutes from './routes/login.routes.js';

// Importa el middleware para autenticación del token JWT
import { authenticateToken } from './authMiddleware.js'; // Asegúrate de tener la ruta correcta



// Configura Express para manejar solicitudes con datos JSON.
app.use(express.json());

app.use((req, res, next) => {
    console.log(`📩 Nueva solicitud: ${req.method} ${req.url}`);
    console.log("📌 Headers:", req.headers);
    console.log("📌 Body:", req.body);
    next();
});

app.use(loginRoutes);

app.use(authenticateToken, usersRoutes);

// Rutas de trabajos protegidas con JWT
app.use(authenticateToken, jobsRoutes);  // Protege las rutas de trabajos con el middleware de autenticación
