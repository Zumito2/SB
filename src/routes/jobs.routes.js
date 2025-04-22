// Importa el objeto `Router` desde el paquete `express` para manejar las rutas de la API.
import { Router } from 'express';

// Importa los controladores de usuarios desde el archivo `users.controllers.js`.
// Estos controladores son funciones que se encargan de manejar las solicitudes HTTP para los usuarios.
import { getJobs, getJobsId, getJobsDate, getJob, startJob, endJob, getJobsFecha, createJob, updateJob, deleteJob, getJobsByUser,
     createUserJob, updateUserJob, guardarNota, getJobsPendiente, createTaller, getFinishedJobsByUser, finishJob } from '../controllers/jobs.controller.js';
import { authenticateToken } from '../authMiddleware.js'; // Importa el middleware

// Crea una instancia de `Router` para definir las rutas de la API.
const router = Router();

// Define una ruta GET para obtener la lista de todos los usuarios.
// Cuando se accede a `/users`, se ejecuta el controlador `getUsers`.
router.get('/jobs', authenticateToken, getJobs);

router.get('/jobs/:id', authenticateToken, getJobsId);

router.get('/jobs/fecha/:fecha', authenticateToken, getJobsFecha);

router.get('/jobsPendiente', authenticateToken, getJobsPendiente);

router.get('/jobs/:id/:fecha', authenticateToken, getJobsDate);

router.get('/job/:id', authenticateToken, getJob);

router.put('/jobs/jobStart/:idJob', authenticateToken, startJob);

router.put('/jobs/jobEnd/:idJob', authenticateToken, endJob);

router.post('/jobs/:userId', authenticateToken, createJob);

router.put('/jobs/:userId', authenticateToken, updateJob);

router.delete('/jobs/:id', authenticateToken, deleteJob);

router.get('/jobs/user/:id', authenticateToken, getJobsByUser);

router.post('/userjob', authenticateToken, createUserJob);

router.put('/userjob', authenticateToken, updateUserJob);

router.put('/notas/:idJob', authenticateToken, guardarNota);

router.post('/createTaller', authenticateToken, createTaller);

router.get('/finalizados/:fecha_inicio/:fecha_fin', authenticateToken, getFinishedJobsByUser)

// Exporta el objeto `router` para que pueda ser utilizado en otros archivos de la aplicación.
export default router;