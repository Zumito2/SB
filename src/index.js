import express from 'express'
import usersRoutes from './routes/users.routes.js'
import indexRouter from './routes/index.routes.js'

const app = express()

app.use(express.json())

app.use(indexRouter)
app.use(usersRoutes)

app.listen(3000)
console.log('Server running on port 3000')