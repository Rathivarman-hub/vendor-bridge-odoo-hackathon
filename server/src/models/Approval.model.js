import mongoose from 'mongoose'

const approvalStepSchema = new mongoose.Schema({
  approver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  remarks: { type: String },
  actionAt: { type: Date },
}, { _id: false })

const approvalSchema = new mongoose.Schema({
  quotation: { type: mongoose.Schema.Types.ObjectId, ref: 'Quotation', required: true },
  rfq: { type: mongoose.Schema.Types.ObjectId, ref: 'RFQ' },
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' },
  requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  remarks: { type: String },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  steps: [approvalStepSchema],
  actionAt: { type: Date },
}, { timestamps: true })

export default mongoose.model('Approval', approvalSchema)
