import RFQ from '../models/RFQ.model.js'
import { logActivity } from '../utils/logger.js'
import { notifyUser } from '../utils/notifier.js'

// GET /api/rfqs
export const getRFQs = async (req, res) => {
  try {
    const { search, status, page = 1, limit = 20 } = req.query
    const query = {}
    if (search) query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { rfqNumber: { $regex: search, $options: 'i' } },
    ]
    if (status) query.status = status
    if (req.user.role === 'vendor') {
      if (req.user.vendorProfile) {
        query.vendors = req.user.vendorProfile
      } else {
        // No profile linked yet — show all open RFQs so vendor can still submit quotations
        query.status = 'open'
      }
    }

    const skip = (Number(page) - 1) * Number(limit)
    const [rfqs, total] = await Promise.all([
      RFQ.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).populate('vendors', 'name email').populate('createdBy', 'name'),
      RFQ.countDocuments(query),
    ])
    res.json({ rfqs, total, page: Number(page), pages: Math.ceil(total / limit) })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// GET /api/rfqs/:id
export const getRFQById = async (req, res) => {
  try {
    const rfq = await RFQ.findById(req.params.id).populate('vendors', 'name email phone').populate('createdBy', 'name')
    if (!rfq) return res.status(404).json({ message: 'RFQ not found' })

    if (req.user.role === 'vendor') {
      if (!req.user.vendorProfile || !rfq.vendors.some(v => v._id.toString() === req.user.vendorProfile.toString())) {
        return res.status(403).json({ message: 'Access denied' })
      }
    }

    res.json(rfq)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// POST /api/rfqs
export const createRFQ = async (req, res) => {
  try {
    const rfqData = { ...req.body, createdBy: req.user._id }
    if (typeof rfqData.items === 'string') rfqData.items = JSON.parse(rfqData.items)
    if (typeof rfqData.vendors === 'string') rfqData.vendors = JSON.parse(rfqData.vendors)
    
    let attachments = []
    if (req.body.existingAttachments) attachments = JSON.parse(req.body.existingAttachments)
    if (req.files && req.files.length > 0) {
      attachments = [...attachments, ...req.files.map(f => ({
        filename: f.originalname,
        path: f.path,           // Cloudinary secure_url
        publicId: f.filename,   // Cloudinary public_id
        url: f.path,
      }))]
    }
    rfqData.attachments = attachments

    const rfq = await RFQ.create(rfqData)

    // Notify assigned vendors
    if (rfq.vendors && rfq.vendors.length > 0) {
      const mongoose = (await import('mongoose')).default
      const User = mongoose.model('User')
      const vendorUsers = await User.find({ vendorProfile: { $in: rfq.vendors } })
      vendorUsers.forEach(vu => {
        notifyUser(vu._id, 'New RFQ Assigned', `You have been assigned to RFQ: ${rfq.title}`, 'rfq', `/rfqs`)
      })
    }

    await logActivity({ user: req.user._id, action: 'RFQ Created', module: 'RFQ', refId: rfq._id, description: rfq.title })
    res.status(201).json(rfq)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

// PUT /api/rfqs/:id
export const updateRFQ = async (req, res) => {
  try {
    const rfqData = { ...req.body }
    if (typeof rfqData.items === 'string') rfqData.items = JSON.parse(rfqData.items)
    if (typeof rfqData.vendors === 'string') rfqData.vendors = JSON.parse(rfqData.vendors)

    let attachments = []
    if (req.body.existingAttachments) attachments = JSON.parse(req.body.existingAttachments)
    if (req.files && req.files.length > 0) {
      attachments = [...attachments, ...req.files.map(f => ({
        filename: f.originalname,
        path: f.path,
        publicId: f.filename,
        url: f.path,
      }))]
    }
    rfqData.attachments = attachments

    const rfq = await RFQ.findByIdAndUpdate(req.params.id, rfqData, { new: true, runValidators: true })
    if (!rfq) return res.status(404).json({ message: 'RFQ not found' })
    await logActivity({ user: req.user._id, action: 'RFQ Updated', module: 'RFQ', refId: rfq._id, description: rfq.title })
    res.json(rfq)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

// DELETE /api/rfqs/:id
export const deleteRFQ = async (req, res) => {
  try {
    const rfq = await RFQ.findByIdAndDelete(req.params.id)
    if (!rfq) return res.status(404).json({ message: 'RFQ not found' })
    await logActivity({ user: req.user._id, action: 'RFQ Deleted', module: 'RFQ', description: rfq.title })
    res.json({ message: 'RFQ deleted' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}
