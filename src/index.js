// Importa el paquete `express` para crear y manejar el servidor web.
import express from 'express';

// Importa el módulo `fs` para trabajar con el sistema de archivos (leer archivos).
import fs from 'fs';

// Importa el módulo `https` para crear un servidor HTTPS.
import https from 'https';

// Importa el módulo `path` para trabajar con rutas de archivos.
import path from 'path'; 

// Importa las rutas definidas para manejar usuarios y la página de inicio de la API.
import usersRoutes from './routes/users.routes.js';
import indexRouter from './routes/index.routes.js';

// Usa rutas absolutas con `path.resolve()` para definir la ubicación de los archivos de clave y certificado.
// `keyPath` y `certPath` contienen las rutas absolutas de los archivos del servidor (key y cert) necesarios para HTTPS.
const keyPath = path.resolve("C:/Users/Zumito/Desktop/SmartByteProject/keys/server.key");
const certPath = path.resolve("C:/Users/Zumito/Desktop/SmartByteProject/keys/server.cert");

// Muestra las rutas absolutas de los archivos de clave y certificado en la consola.
console.log("Ruta al archivo server.key:", keyPath);
console.log("Ruta al archivo server.cert:", certPath);

// Verifica si los archivos de certificado existen en las rutas especificadas usando `fs.existsSync()`.
// Si cualquiera de los archivos no existe, muestra un mensaje de error y termina el proceso con `process.exit(1)`.
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

// Usa las rutas definidas para manejar las solicitudes de los usuarios y la página de inicio.
app.use(indexRouter);   // Ruta para la página de inicio de la API.
app.use(usersRoutes);   // Ruta para las operaciones de usuarios (crear, leer, actualizar, eliminar usuarios).

// Crea y lanza el servidor HTTPS utilizando las opciones de clave y certificado.
// El servidor escucha en el puerto 4433 y, cuando se inicia, muestra un mensaje en la consola.
https.createServer(options, app).listen(4433, () => {
    console.log("✅ Servidor HTTPS corriendo en https://localhost:4433");
});

