import PurchaseOrder from '../models/PurchaseOrder.model.js'
import Approval from '../models/Approval.model.js'
import Vendor from '../models/Vendor.model.js'
import { logActivity } from '../utils/logger.js'

// GET /api/purchase-orders
export const getPurchaseOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query
    const query = {}
    if (status) query.status = status
    if (req.user.role === 'vendor') {
      if (!req.user.vendorProfile) return res.json({ orders: [], total: 0, page: 1, pages: 0 })
      query.vendor = req.user.vendorProfile
    }

    const skip = (Number(page) - 1) * Number(limit)
    const [orders, total] = await Promise.all([
      PurchaseOrder.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit))
        .populate('vendor', 'name email')
        .populate('rfq', 'rfqNumber title')
        .populate('createdBy', 'name'),
      PurchaseOrder.countDocuments(query),
    ])
    res.json({ orders, total, page: Number(page), pages: Math.ceil(total / limit) })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// GET /api/purchase-orders/:id
export const getPurchaseOrderById = async (req, res) => {
  try {
    const order = await PurchaseOrder.findById(req.params.id)
      .populate('vendor', 'name email phone address gstNumber')
      .populate('rfq', 'rfqNumber title')
      .populate('quotation')
      .populate('approval')
      .populate('createdBy', 'name')
    if (!order) return res.status(404).json({ message: 'Purchase order not found' })
    
    if (req.user.role === 'vendor') {
      if (!req.user.vendorProfile || order.vendor._id.toString() !== req.user.vendorProfile.toString()) {
        return res.status(403).json({ message: 'Access denied' })
      }
    }

    res.json(order)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// POST /api/purchase-orders  — create from approved approval/quotation
export const createPurchaseOrder = async (req, res) => {
  try {
    const { approvalId, taxPercent } = req.body
    const approval = await Approval.findById(approvalId).populate({ path: 'quotation', populate: { path: 'rfq vendor' } })
    if (!approval) return res.status(404).json({ message: 'Approval not found' })
    if (approval.status !== 'approved') return res.status(400).json({ message: 'Approval not approved yet' })

    const { quotation } = approval
    const subTotal = quotation.totalAmount
    const tax = taxPercent || 18

    const order = await PurchaseOrder.create({
      rfq: quotation.rfq._id,
      quotation: quotation._id,
      approval: approval._id,
      vendor: quotation.vendor._id,
      items: quotation.items,
      subTotal,
      taxPercent: tax,
      createdBy: req.user._id,
    })

    // Bump vendor order count
    await Vendor.findByIdAndUpdate(quotation.vendor._id, { $inc: { totalOrders: 1 } })

    await logActivity({ user: req.user._id, action: 'Purchase Order Created', module: 'PurchaseOrder', refId: order._id, description: order.poNumber })
    res.status(201).json(order)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}
