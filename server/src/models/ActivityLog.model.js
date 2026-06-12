import mongoose from 'mongoose'

const activityLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  action: { type: String, required: true },   // e.g. 'RFQ Created', 'Quotation Approved'
  module: {
    type: String,
    enum: ['Auth', 'Vendor', 'RFQ', 'Quotation', 'Approval', 'PurchaseOrder', 'Invoice', 'Report'],
    required: true,
  },
  refId: { type: mongoose.Schema.Types.ObjectId },   // ID of the affected document
  description: { type: String },
  ip: { type: String },
}, { timestamps: true })

export default mongoose.model('ActivityLog', activityLogSchema)
