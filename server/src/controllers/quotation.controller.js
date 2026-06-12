import Quotation from '../models/Quotation.model.js'
import { logActivity } from '../utils/logger.js'

// GET /api/quotations
export const getQuotations = async (req, res) => {
  try {
    const { rfq, vendor, status, page = 1, limit = 20 } = req.query
    const query = {}
    if (rfq) query.rfq = rfq
    if (vendor) query.vendor = vendor
    if (status) query.status = status
    if (req.user.role === 'vendor') {
      if (!req.user.vendorProfile) return res.json({ quotations: [], total: 0, page: 1, pages: 0 })
      query.vendor = req.user.vendorProfile
    }

    const skip = (Number(page) - 1) * Number(limit)
    const [quotations, total] = await Promise.all([
      Quotation.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit))
        .populate('rfq', 'rfqNumber title')
        .populate('vendor', 'name email rating'),
      Quotation.countDocuments(query),
    ])
    res.json({ quotations, total, page: Number(page), pages: Math.ceil(total / limit) })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// GET /api/quotations/compare/:rfqId
export const compareQuotations = async (req, res) => {
  try {
    const quotations = await Quotation.find({ rfq: req.params.rfqId })
      .populate('vendor', 'name email rating category')
      .populate('rfq', 'rfqNumber title items')
      .lean()

    if (!quotations.length) return res.status(404).json({ message: 'No quotations found for this RFQ' })

    // Mark lowest price
    const minAmount = Math.min(...quotations.map(q => q.totalAmount))
    const compared = quotations.map(q => ({ ...q, isLowest: q.totalAmount === minAmount }))

    res.json(compared)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// GET /api/quotations/:id
export const getQuotationById = async (req, res) => {
  try {
    const q = await Quotation.findById(req.params.id)
      .populate('rfq', 'rfqNumber title deadline items')
      .populate('vendor', 'name email phone gstNumber address rating')
      .populate('submittedBy', 'name')
    if (!q) return res.status(404).json({ message: 'Quotation not found' })

    if (req.user.role === 'vendor') {
      if (!req.user.vendorProfile || q.vendor._id.toString() !== req.user.vendorProfile.toString()) {
        return res.status(403).json({ message: 'Access denied' })
      }
    }

    res.json(q)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// POST /api/quotations
export const createQuotation = async (req, res) => {
  try {
    const q = await Quotation.create({ ...req.body, submittedBy: req.user._id })
    await logActivity({ user: req.user._id, action: 'Quotation Submitted', module: 'Quotation', refId: q._id })
    res.status(201).json(q)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

// PUT /api/quotations/:id
export const updateQuotation = async (req, res) => {
  try {
    const q = await Quotation.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    if (!q) return res.status(404).json({ message: 'Quotation not found' })
    await logActivity({ user: req.user._id, action: 'Quotation Updated', module: 'Quotation', refId: q._id })
    res.json(q)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}
