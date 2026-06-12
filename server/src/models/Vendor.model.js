import mongoose from 'mongoose'

const vendorSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  category: {
    type: String,
    enum: ['IT', 'Office Supplies', 'Raw Materials', 'Services', 'Logistics', 'Other'],
    default: 'Other',
  },
  gstNumber: { type: String, trim: true },
  contactPerson: { type: String, trim: true },
  website: { type: String, trim: true },
  status: { type: String, enum: ['active', 'inactive', 'blacklisted'], default: 'active' },
  notes: { type: String },
  rating: { type: Number, min: 0, max: 5, default: 0 },
  totalOrders: { type: Number, default: 0 },
}, { timestamps: true })

export default mongoose.model('Vendor', vendorSchema)
