import {Router} from 'express'
import {getUsers, createUser, updateUser, deleteUser} from '../controllers/users.controllers.js'


const router = Router()

router.get('/users', getUsers), 

router.post('/users', createUser)

router.put('/users', updateUser)

router.delete('/users', deleteUser)

export default router