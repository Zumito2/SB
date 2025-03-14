import { createPool } from 'mysql2/promise';

// Obtener las variables de entorno
const pool = createPool({
    host: process.env.DB_HOST, // El host de la base de datos
    user: process.env.DB_USER, // El usuario
    password: process.env.DB_PASSWORD, // La contraseña
    port: process.env.DB_PORT || 3306, // El puerto (opcional si es el predeterminado)
    database: process.env.DB_NAME, // El nombre de la base de datos
    ssl: process.env.DB_SSL === 'true' // Si está habilitado SSL (puede ser necesario en producción)
});

export { pool };
