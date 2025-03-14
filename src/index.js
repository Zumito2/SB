// Importa el paquete `express` para crear y manejar el servidor web.
import express from 'express';

import * as url from 'url';
import dotenv from 'dotenv';
import path from 'path';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, 'dotenv.env') });
console.log("JWT_SECRET en index.js:", process.env.JWT_SECRET);

// Importa el módulo `fs` para trabajar con el sistema de archivos (leer archivos).
import fs from 'fs';

// Importa el módulo `https` para crear un servidor HTTPS.
import https from 'https';

// Importa las rutas definidas para manejar usuarios y la página de inicio de la API.
import usersRoutes from './routes/users.routes.js';
import jobsRoutes from './routes/jobs.routes.js';
import loginRoutes from './routes/login.routes.js';

// Importa el middleware para autenticación del token JWT
import { authenticateToken } from './authMiddleware.js'; // Asegúrate de tener la ruta correcta

const keyPath = path.resolve(__dirname, '../keys/server.key');
const certPath = path.resolve(__dirname, '../keys/server.cert');

// Verifica si los archivos de certificado existen en las rutas especificadas usando `fs.existsSync()`.
if (!fs.existsSync(keyPath) || !fs.existsSync(certPath)) {
    console.error("❌ ERROR: Los archivos server.key o server.cert no existen en las rutas especificadas");
    process.exit(1);  // Termina el proceso con un código de error.
}

// Crea una instancia de la aplicación Express.
const app = express();

// Define las opciones del servidor HTTPS, que incluyen la clave y el certificado leídos desde los archivos.
const options = {
    key: fs.readFileSync(keyPath),  // Lee la clave privada del archivo.
    cert: fs.readFileSync(certPath)  // Lee el certificado del archivo.
};

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



// Crea y lanza el servidor HTTPS utilizando las opciones de clave y certificado.
https.createServer(options, app).listen(4433, () => {
    console.log("✅ Servidor HTTPS corriendo en https://localhost:4433");
});
