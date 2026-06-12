import { Server } from 'socket.io'
import jwt from 'jsonwebtoken'

// Store active user connections: { userId -> Set of socketIds }
const activeUsers = new Map()

export function setupSocketIO(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: [
        process.env.CLIENT_URL, 
        'http://localhost:5173', 
        'http://localhost:5174',
        'https://vendor-bridge-odoo-hackathon.vercel.app'
      ],
      credentials: true,
    },
  })

  // Middleware: Authenticate socket connection
  io.use((socket, next) => {
    const token = socket.handshake.auth.token
    if (!token) return next(new Error('Unauthorized'))

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_secret_key')
      socket.userId = decoded.id
      socket.userRole = decoded.role
      socket.userName = decoded.name
      next()
    } catch (err) {
      next(new Error('Invalid token'))
    }
  })

  // Connection handlers
  io.on('connection', (socket) => {
    console.log(`[Socket] User ${socket.userId} connected (${socket.id})`)

    // Track active user
    if (!activeUsers.has(socket.userId)) {
      activeUsers.set(socket.userId, new Set())
    }
    activeUsers.get(socket.userId).add(socket.id)

    // Join user-specific room for targeted notifications
    socket.join(`user:${socket.userId}`)

    // Notify user is online
    socket.emit('connected', { userId: socket.userId, message: 'Connected to notifications' })

    // Handle disconnect
    socket.on('disconnect', () => {
      const userSockets = activeUsers.get(socket.userId)
      if (userSockets) {
        userSockets.delete(socket.id)
        if (userSockets.size === 0) {
          activeUsers.delete(socket.userId)
        }
      }
      console.log(`[Socket] User ${socket.userId} disconnected (${socket.id})`)
    })
  })

  return io
}

export function getIO() {
  return global.io
}

export function emitToUser(userId, eventName, data) {
  const io = global.io
  if (io) {
    io.to(`user:${userId}`).emit(eventName, data)
    console.log(`[Notification] Emitted "${eventName}" to user ${userId}`)
  }
}

export function emitToRole(roles, eventName, data) {
  // This will be called via the notifier.js service with user data
  const io = global.io
  if (io && Array.isArray(roles)) {
    // For now, we'll emit to all connected users and let them filter by role
    io.emit(eventName, { ...data, targetRoles: roles })
    console.log(`[Notification] Emitted "${eventName}" to roles: ${roles.join(', ')}`)
  }
}

export function isUserOnline(userId) {
  return activeUsers.has(userId) && activeUsers.get(userId).size > 0
}
