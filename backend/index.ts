import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import router from './routes/router'
import { errorHandler } from './middlewares/error-handler'
import './queues'

const app = express()

const PORT = process.env.PORT || 3002

// Middlewares
app.use(express.json())
app.use(cors())
app.use(cookieParser())

// Router
app.use('/api', router)

// Error handler (must be last)
app.use(errorHandler)

// Start
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})