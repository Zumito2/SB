// Importa el objeto `Router` desde el paquete `express` para manejar las rutas de la API.
import { Router } from "express";

// Importa los controladores `index` y `ping` desde el archivo de controladores (`index.controller.js`).
import { index, ping } from "../controllers/index.controller.js";

// Crea una instancia de `Router` para definir las rutas de la API.
const router = Router();

// Define una ruta GET en la raíz ("/") que ejecutará el controlador `index`.
// Cuando se acceda a esta ruta, el controlador `index` responderá con un mensaje de bienvenida.
router.get("/", index);

// Define una ruta GET en la ruta "/ping" que ejecutará el controlador `ping`.
// Esta ruta normalmente se usa para probar si la API está funcionando correctamente.
router.get("/ping", ping);

// Exporta el objeto `router` para que pueda ser utilizado en otros archivos, como en el archivo principal de la aplicación.
export default router;
