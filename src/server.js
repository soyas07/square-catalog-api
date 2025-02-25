import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import morgan from 'morgan'
import routes from './routes/index.js'
import { config } from './config.js'
import logger from './middlewares/logger.js'
import { connectDB } from './utils/db.js'

const app = express()

// Middlewares
app.use(cors())
app.use(cookieParser())
app.use(morgan('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Routes
app.use('/api', routes)
// app.get('/api/v1/categories', (req, res) => {
//     res.send({ msg: 'working' });
// })

// Server Start
app.listen(config.port, async () => {
  await connectDB()
  logger.info(`Server running on port ${config.port}`)
})
