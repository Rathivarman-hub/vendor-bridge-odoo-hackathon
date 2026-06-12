import Notification from '../models/Notification.model.js'
import { emitToUser, emitToRole } from '../config/socket.js'

export const notifyUser = async (userId, title, message, type, link) => {
  try {
    const notification = await Notification.create({ user: userId, title, message, type, link })
    // Emit real-time notification via Socket.io
    emitToUser(userId, 'notification', { 
      _id: notification._id,
      title, 
      message, 
      type, 
      link,
      isRead: false,
      createdAt: notification.createdAt
    })
  } catch (err) {
    console.error('Notification error:', err.message)
  }
}

export const notifyRoles = async (roles, title, message, type, link) => {
  try {
    const mongoose = (await import('mongoose')).default
    const User = mongoose.model('User')
    const users = await User.find({ role: { $in: roles } })
    const notifs = users.map(u => ({ user: u._id, title, message, type, link }))
    if (notifs.length > 0) {
      await Notification.insertMany(notifs)
      // Emit real-time notifications to each user
      users.forEach(user => {
        emitToUser(user._id, 'notification', { 
          title, 
          message, 
          type, 
          link,
          isRead: false,
          createdAt: new Date()
        })
      })
    }
  } catch (err) {
    console.error('Group notification error:', err.message)
  }
}
