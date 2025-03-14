// Importa el objeto `Router` desde el paquete `express` para manejar las rutas de la API.
import { Router } from 'express';


// Importa los controladores de usuarios desde el archivo `users.controllers.js`.
// Estos controladores son funciones que se encargan de manejar las solicitudes HTTP para los usuarios.
import { login } from '../controllers/login.controller.js'

// Crea una instancia de `Router` para definir las rutas de la API.
const router = Router();

// Define una ruta POST para realizar el login de un usuario.
// La ruta `/login` recibe las credenciales del usuario y ejecuta el controlador `login`.
router.post('/login', login);

// Exporta el objeto `router` para que pueda ser utilizado en otros archivos de la aplicación.
export default router;