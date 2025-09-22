// server.js
import compression from 'compression'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import { errorMiddleware } from './Middleware/Error.js'
import routes from './Router/index.js'

const app = express()

// Trust proxy (needed for secure cookies behind proxy like Vercel/Render)
app.set('trust proxy', 1)

// --------------------
// Allowed Origins
// --------------------
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://zayka-nu.vercel.app',
  'https://zayka-admin-kappa.vercel.app',
]

// --------------------
// CORS Middleware
// --------------------
// This will handle both preflight OPTIONS requests and actual requests
app.use(
  cors({
    origin: function (origin, callback) {
      console.log('🔍 Incoming request from origin:', origin)

      // Allow requests with no origin (Postman/curl)
      if (!origin) return callback(null, true)

      if (allowedOrigins.includes(origin)) {
        console.log('✅ Allowed origin:', origin)
        return callback(null, true)
      }

      console.warn('❌ Blocked origin:', origin)
      return callback(new Error('Not allowed by CORS'))
    },
    credentials: true, 
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 200,
  })
)

// Optional: handle OPTIONS preflight globally (redundant but safe)
app.options(
  '*',
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true)
      if (allowedOrigins.includes(origin)) return callback(null, true)
      callback(new Error('Not allowed by CORS'))
    },
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
)

// --------------------
// Body parsers
// --------------------
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// --------------------
//  Other Middlewares
// --------------------
app.use(cookieParser())
app.use(helmet()) // Security headers
app.use(compression()) // Gzip responses for speed

// --------------------
// Test / Home Route
// --------------------
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to Food Delivery API 🚀',
  })
})

// --------------------
// API Routes
// --------------------
app.use('/api/v1', routes)

// --------------------
//  Error Middleware (must be last)
// --------------------
app.use(errorMiddleware)

export default app
