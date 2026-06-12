import mongoose from 'mongoose'

const invoiceItemSchema = new mongoose.Schema({
  description: { type: String, required: true },
  quantity: { type: Number, required: true },
  unitPrice: { type: Number, required: true },
  total: { type: Number },
}, { _id: false })

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: { type: String, unique: true },
  purchaseOrder: { type: mongoose.Schema.Types.ObjectId, ref: 'PurchaseOrder', required: true },
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
  items: [invoiceItemSchema],
  subTotal: { type: Number, required: true },
  taxPercent: { type: Number, default: 18 },
  taxAmount: { type: Number },
  totalAmount: { type: Number },
  status: {
    type: String,
    enum: ['draft', 'sent', 'paid', 'overdue', 'cancelled'],
    default: 'draft',
  },
  dueDate: { type: Date },
  notes: { type: String },
  emailSentAt: { type: Date },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true })

invoiceSchema.pre('validate', async function (next) {
  if (!this.invoiceNumber) {
    const count = await mongoose.model('Invoice').countDocuments()
    this.invoiceNumber = `INV-${String(count + 1).padStart(4, '0')}`
  }
  if (this.subTotal !== undefined) {
    this.taxAmount = parseFloat(((this.subTotal * (this.taxPercent || 18)) / 100).toFixed(2))
    this.totalAmount = parseFloat((this.subTotal + this.taxAmount).toFixed(2))
  }
  next()
})

export default mongoose.model('Invoice', invoiceSchema)
