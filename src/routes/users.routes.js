// Importa el objeto `Router` desde el paquete `express` para manejar las rutas de la API.
import { Router } from 'express';

// Importa los controladores de usuarios desde el archivo `users.controllers.js`.
// Estos controladores son funciones que se encargan de manejar las solicitudes HTTP para los usuarios.
import { getUsers, createUser, updateUser, deleteUser, getUser, login } from '../controllers/users.controllers.js';

// Crea una instancia de `Router` para definir las rutas de la API.
const router = Router();

// Define una ruta GET para obtener la lista de todos los usuarios.
// Cuando se accede a `/users`, se ejecuta el controlador `getUsers`.
router.get('/users', getUsers);

// Define una ruta GET para obtener un usuario específico según su ID.
// La ruta `/users/:id` usa un parámetro `id` en la URL y se ejecuta el controlador `getUser`.
router.get('/users/:id', getUser);

// Define una ruta POST para crear un nuevo usuario.
// La ruta `/users/` recibe datos en el cuerpo de la solicitud y ejecuta el controlador `createUser`.
router.post('/users/', createUser);

// Define una ruta PUT para actualizar un usuario existente según su ID.
// La ruta `/users/:id` usa un parámetro `id` en la URL y se ejecuta el controlador `updateUser`.
router.put('/users/:id', updateUser);

// Define una ruta DELETE para eliminar un usuario según su ID.
// La ruta `/users/:id` usa un parámetro `id` en la URL y se ejecuta el controlador `deleteUser`.
router.delete('/users/:id', deleteUser);

// Define una ruta POST para realizar el login de un usuario.
// La ruta `/login` recibe las credenciales del usuario y ejecuta el controlador `login`.
router.post('/login', login);


// Exporta el objeto `router` para que pueda ser utilizado en otros archivos de la aplicación.
export default router;
