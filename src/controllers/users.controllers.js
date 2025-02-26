import {pool} from '../db.js'

export const getUsers = async (req, res) => {
    try {
      const [rows] = await pool.query("SELECT * FROM users");
      res.json(rows);
    } catch (error) {
      return res.status(500).json({ message: "Something goes wrong" });
    }
  };

export const createUser = async (req, res) => {
    const {name, pass, rol} = req.body
    const [rows] = await pool.query('INSERT INTO users (name, pass, rol) VALUES (?,?,?)', [name, pass, rol])    
    res.send({
      id: rows.insertId,
      name,
      pass,
      rol
    })
}

export const updateUser = (req, res) => res.send('Actualizando')

export const deleteUser = (req, res) => res.send('Eliminando')