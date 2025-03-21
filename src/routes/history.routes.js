// Importa el objeto `Router` desde el paquete `express` para manejar las rutas de la API.
import { Router } from 'express';

// Importa los controladores de usuarios desde el archivo `users.controllers.js`.
// Estos controladores son funciones que se encargan de manejar las solicitudes HTTP para los usuarios.
import { getHistory} from '../controllers/history.controller.js';
import { authenticateToken } from '../authMiddleware.js'; // Importa el middleware

// Crea una instancia de `Router` para definir las rutas de la API.
const router = Router();

router.get('/history', authenticateToken, getHistory);

// Exporta el objeto `router` para que pueda ser utilizado en otros archivos de la aplicación.
export default router;