// Importa el objeto `Router` desde el paquete `express` para manejar las rutas de la API.
import { Router } from 'express';

// Importa los controladores de usuarios desde el archivo `users.controllers.js`.
// Estos controladores son funciones que se encargan de manejar las solicitudes HTTP para los usuarios.
import { getJobs, getJobsId } from '../controllers/jobs.controller.js';

// Crea una instancia de `Router` para definir las rutas de la API.
const router = Router();

// Define una ruta GET para obtener la lista de todos los usuarios.
// Cuando se accede a `/users`, se ejecuta el controlador `getUsers`.
router.get('/jobs', getJobs);

router.get('/jobs/:id', getJobsId);



// Exporta el objeto `router` para que pueda ser utilizado en otros archivos de la aplicación.
export default router;