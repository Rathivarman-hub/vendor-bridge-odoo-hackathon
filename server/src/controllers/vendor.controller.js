import Vendor from '../models/Vendor.model.js'
import { logActivity } from '../utils/logger.js'

// GET /api/vendors
export const getVendors = async (req, res) => {
  try {
    const { search, category, status, page = 1, limit = 20 } = req.query
    const query = {}
    if (search) query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { contactPerson: { $regex: search, $options: 'i' } },
    ]
    if (category) query.category = category
    if (status) query.status = status

    const skip = (Number(page) - 1) * Number(limit)
    const [vendors, total] = await Promise.all([
      Vendor.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Vendor.countDocuments(query),
    ])
    res.json({ vendors, total, page: Number(page), pages: Math.ceil(total / limit) })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// GET /api/vendors/:id
export const getVendorById = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id)
    if (!vendor) return res.status(404).json({ message: 'Vendor not found' })
    res.json(vendor)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// POST /api/vendors
export const createVendor = async (req, res) => {
  try {
    const vendor = await Vendor.create(req.body)
    await logActivity({ user: req.user._id, action: 'Vendor Created', module: 'Vendor', refId: vendor._id, description: vendor.name })
    res.status(201).json(vendor)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

// PUT /api/vendors/:id
export const updateVendor = async (req, res) => {
  try {
    const vendor = await Vendor.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    if (!vendor) return res.status(404).json({ message: 'Vendor not found' })
    await logActivity({ user: req.user._id, action: 'Vendor Updated', module: 'Vendor', refId: vendor._id, description: vendor.name })
    res.json(vendor)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

// DELETE /api/vendors/:id
export const deleteVendor = async (req, res) => {
  try {
    const vendor = await Vendor.findByIdAndDelete(req.params.id)
    if (!vendor) return res.status(404).json({ message: 'Vendor not found' })
    await logActivity({ user: req.user._id, action: 'Vendor Deleted', module: 'Vendor', description: vendor.name })
    res.json({ message: 'Vendor deleted' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}
