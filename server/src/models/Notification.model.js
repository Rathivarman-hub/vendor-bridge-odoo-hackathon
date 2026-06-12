import mongoose from 'mongoose'

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['rfq', 'approval', 'invoice', 'system', 'purchase_order'], default: 'system' },
  isRead: { type: Boolean, default: false },
  link: { type: String }, // optional link to redirect
}, { timestamps: true })

export default mongoose.model('Notification', notificationSchema)
