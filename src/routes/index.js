import express from 'express'
import categoryRoutes from './categories.js'

const router = express.Router({ strict: false })

router.get('/', (req, res) => {
  res.json({ message: 'Welcome to Express API!' })
})

router.use('/v1/categories', categoryRoutes)

export default router
