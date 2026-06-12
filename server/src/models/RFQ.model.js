import mongoose from 'mongoose'

const rfqItemSchema = new mongoose.Schema({
  description: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  unit: { type: String, default: 'pcs' },
}, { _id: false })

const rfqSchema = new mongoose.Schema({
  rfqNumber: { type: String, unique: true },
  title: { type: String, required: true, trim: true },
  description: { type: String },
  items: [rfqItemSchema],
  vendors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' }],
  deadline: { type: Date, required: true },
  status: {
    type: String,
    enum: ['draft', 'open', 'closed', 'cancelled'],
    default: 'open',
  },
  notes: { type: String },
  attachments: [{ filename: String, path: String, url: String, publicId: String }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true })

// Auto-generate RFQ number
rfqSchema.pre('save', async function (next) {
  if (!this.rfqNumber) {
    const count = await mongoose.model('RFQ').countDocuments()
    this.rfqNumber = `RFQ-${String(count + 1).padStart(4, '0')}`
  }
  next()
})

export default mongoose.model('RFQ', rfqSchema)
