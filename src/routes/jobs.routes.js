// Importa el objeto `Router` desde el paquete `express` para manejar las rutas de la API.
import { Router } from 'express';

// Importa los controladores de usuarios desde el archivo `users.controllers.js`.
// Estos controladores son funciones que se encargan de manejar las solicitudes HTTP para los usuarios.
import { getJobs, getJobsId, getJobsDate, getJob, startJob, endJob, getJobsFecha} from '../controllers/jobs.controller.js';

// Crea una instancia de `Router` para definir las rutas de la API.
const router = Router();

// Define una ruta GET para obtener la lista de todos los usuarios.
// Cuando se accede a `/users`, se ejecuta el controlador `getUsers`.
router.get('/jobs', getJobs);

router.get('/jobs/:id', getJobsId);

router.get('/jobs/fecha/:fecha', getJobsFecha);

router.get('/jobs/:id/:fecha', getJobsDate);

router.get('/job/:id', getJob);

router.put('/jobs/jobStart/:idJob', startJob);

router.put('/jobs/jobEnd/:idJob', endJob);

// Exporta el objeto `router` para que pueda ser utilizado en otros archivos de la aplicación.
export default router;