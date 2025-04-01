// Importa el objeto `Router` desde el paquete `express` para manejar las rutas de la API.
import { Router } from 'express';


// Importa los controladores de usuarios desde el archivo `users.controllers.js`.
// Estos controladores son funciones que se encargan de manejar las solicitudes HTTP para los usuarios.
import { getUsers, createUser, updateUser, deleteUser, getUser, getUsersByJob, getHelp, setLocation, getRecentlyLocation } from '../controllers/users.controllers.js';
import { authenticateToken } from '../authMiddleware.js'; // Importa el middleware

// Crea una instancia de `Router` para definir las rutas de la API.
const router = Router();

// Define una ruta GET para obtener la lista de todos los usuarios.
// Cuando se accede a `/users`, se ejecuta el controlador `getUsers`.
router.get('/users', authenticateToken, getUsers);

// Define una ruta GET para obtener un usuario específico según su ID.
// La ruta `/users/:id` usa un parámetro `id` en la URL y se ejecuta el controlador `getUser`.
router.get('/users/:id', authenticateToken, getUser);

// Define una ruta POST para crear un nuevo usuario.
// La ruta `/users/` recibe datos en el cuerpo de la solicitud y ejecuta el controlador `createUser`.
router.post('/users/:userId', authenticateToken, createUser);

// Define una ruta PUT para actualizar un usuario existente según su ID.
// La ruta `/users/:id` usa un parámetro `id` en la URL y se ejecuta el controlador `updateUser`.
router.put('/users/:userId/:idUser', authenticateToken, updateUser);

// Define una ruta DELETE para eliminar un usuario según su ID.
// La ruta `/users/:id` usa un parámetro `id` en la URL y se ejecuta el controlador `deleteUser`.
router.delete('/users/:userId/:idUser', authenticateToken, deleteUser);

router.get('/usersByJob/:idJob', authenticateToken, getUsersByJob);

router.get('/help', authenticateToken, getHelp);

router.post('/setLocation', authenticateToken, setLocation);

router.get('/getRecentlyLocation', authenticateToken, getRecentlyLocation);





// Exporta el objeto `router` para que pueda ser utilizado en otros archivos de la aplicación.
export default router;
