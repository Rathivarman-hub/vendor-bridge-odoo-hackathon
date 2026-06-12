import mongoose from 'mongoose'

const quotationItemSchema = new mongoose.Schema({
  description: { type: String, required: true },
  quantity: { type: Number, required: true },
  unitPrice: { type: Number, required: true },
  total: { type: Number },
}, { _id: false })

const quotationSchema = new mongoose.Schema({
  rfq: { type: mongoose.Schema.Types.ObjectId, ref: 'RFQ', required: true },
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
  items: [quotationItemSchema],
  totalAmount: { type: Number, required: true },
  deliveryDays: { type: Number, default: 7 },      // number of days
  deliveryDate: { type: Date },
  notes: { type: String },
  status: {
    type: String,
    enum: ['submitted', 'under_review', 'accepted', 'rejected'],
    default: 'submitted',
  },
  submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true })

// Auto-calc item totals
quotationSchema.pre('save', function (next) {
  this.items = this.items.map(item => ({
    ...item,
    total: item.quantity * item.unitPrice,
  }))
  next()
})

export default mongoose.model('Quotation', quotationSchema)
