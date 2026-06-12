import mongoose from 'mongoose'

const poItemSchema = new mongoose.Schema({
  description: { type: String, required: true },
  quantity: { type: Number, required: true },
  unitPrice: { type: Number, required: true },
  total: { type: Number },
}, { _id: false })

const purchaseOrderSchema = new mongoose.Schema({
  poNumber: { type: String, unique: true },
  rfq: { type: mongoose.Schema.Types.ObjectId, ref: 'RFQ' },
  quotation: { type: mongoose.Schema.Types.ObjectId, ref: 'Quotation' },
  approval: { type: mongoose.Schema.Types.ObjectId, ref: 'Approval' },
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
  items: [poItemSchema],
  subTotal: { type: Number, required: true },
  taxPercent: { type: Number, default: 18 },     // GST %
  taxAmount: { type: Number },
  totalAmount: { type: Number, required: true },
  deliveryDate: { type: Date },
  status: {
    type: String,
    enum: ['issued', 'acknowledged', 'delivered', 'cancelled'],
    default: 'issued',
  },
  notes: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true })

purchaseOrderSchema.pre('validate', async function (next) {
  if (!this.poNumber) {
    const count = await mongoose.model('PurchaseOrder').countDocuments()
    this.poNumber = `PO-${String(count + 1).padStart(4, '0')}`
  }
  if (this.subTotal !== undefined) {
    this.taxAmount = parseFloat(((this.subTotal * (this.taxPercent || 18)) / 100).toFixed(2))
    this.totalAmount = parseFloat((this.subTotal + this.taxAmount).toFixed(2))
  }
  next()
})

export default mongoose.model('PurchaseOrder', purchaseOrderSchema)
