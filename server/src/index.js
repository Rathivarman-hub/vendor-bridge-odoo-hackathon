import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import http from 'http'
import { connectDB } from './config/db.js'
import { setupSocketIO } from './config/socket.js'

import authRoutes from './routes/auth.routes.js'
import dashboardRoutes from './routes/dashboard.routes.js'
import vendorRoutes from './routes/vendor.routes.js'
import rfqRoutes from './routes/rfq.routes.js'
import quotationRoutes from './routes/quotation.routes.js'
import approvalRoutes from './routes/approval.routes.js'
import purchaseOrderRoutes from './routes/purchaseOrder.routes.js'
import invoiceRoutes from './routes/invoice.routes.js'
import logRoutes from './routes/log.routes.js'
import reportRoutes from './routes/report.routes.js'
import userRoutes from './routes/user.routes.js'
import notificationRoutes from './routes/notification.routes.js'

connectDB()

const app = express()
const httpServer = http.createServer(app)

// Setup Socket.io
const io = setupSocketIO(httpServer)
global.io = io

const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  'https://vendor-bridge-odoo-hackathon.vercel.app'
].filter(Boolean)

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (curl, mobile apps, etc.)
    if (!origin) return callback(null, true)
    // Allow localhost and 127.0.0.1
    if (allowedOrigins.includes(origin) || /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin)) {
      return callback(null, true)
    }
    callback(new Error(`CORS: origin ${origin} not allowed`))
  },
  credentials: true,
}))
app.use(express.json())
app.use('/uploads', express.static('uploads'))

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/dashboard', dashboardRoutes)
app.use('/api/vendors', vendorRoutes)
app.use('/api/rfqs', rfqRoutes)
app.use('/api/quotations', quotationRoutes)
app.use('/api/approvals', approvalRoutes)
app.use('/api/purchase-orders', purchaseOrderRoutes)
app.use('/api/invoices', invoiceRoutes)
app.use('/api/logs', logRoutes)
app.use('/api/reports', reportRoutes)
app.use('/api/users', userRoutes)
app.use('/api/notifications', notificationRoutes)

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', app: 'VendorBridge ERP' }))

// 404
app.use((req, res) => res.status(404).json({ message: 'Route not found' }))

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' })
})

const PORT = process.env.PORT || 5000
httpServer.listen(PORT, () => {
  console.log(`VendorBridge server running on port ${PORT}`)
  console.log(`Socket.io listening for real-time notifications`)
})
