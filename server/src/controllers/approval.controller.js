import Approval from '../models/Approval.model.js'
import Quotation from '../models/Quotation.model.js'
import { logActivity } from '../utils/logger.js'
import { notifyRoles, notifyUser } from '../utils/notifier.js'

// GET /api/approvals
export const getApprovals = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query
    const query = {}
    if (status) query.status = status

    const skip = (Number(page) - 1) * Number(limit)
    const [approvals, total] = await Promise.all([
      Approval.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit))
        .populate('quotation', 'totalAmount deliveryDays')
        .populate('rfq', 'rfqNumber title')
        .populate('vendor', 'name email')
        .populate('requestedBy', 'name')
        .populate('approvedBy', 'name'),
      Approval.countDocuments(query),
    ])
    res.json({ approvals, total, page: Number(page), pages: Math.ceil(total / limit) })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// POST /api/approvals  — initiate approval for a quotation
export const createApproval = async (req, res) => {
  try {
    const { quotationId } = req.body
    const quotation = await Quotation.findById(quotationId).populate('rfq vendor')
    if (!quotation) return res.status(404).json({ message: 'Quotation not found' })
    const approval = await Approval.create({
      quotation: quotationId,
      rfq: quotation.rfq._id,
      vendor: quotation.vendor._id,
      requestedBy: req.user._id,
      status: 'pending',
    })
    await logActivity({ user: req.user._id, action: 'Approval Initiated', module: 'Approval', refId: approval._id })
    await notifyRoles(['manager', 'admin'], 'Approval Requested', `New approval request for ${quotation.rfq?.title}`, 'approval', '/approvals')
    res.status(201).json(approval)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

// PUT /api/approvals/:id/approve
export const approveRequest = async (req, res) => {
  try {
    const { remarks } = req.body
    const approval = await Approval.findById(req.params.id)
    if (!approval) return res.status(404).json({ message: 'Approval not found' })
    if (approval.status !== 'pending') return res.status(400).json({ message: 'Approval already actioned' })

    approval.status = 'approved'
    approval.approvedBy = req.user._id
    approval.remarks = remarks
    approval.actionAt = new Date()
    await approval.save()

    // Mark quotation as accepted
    await Quotation.findByIdAndUpdate(approval.quotation, { status: 'accepted' })

    await logActivity({ user: req.user._id, action: 'Approval Approved', module: 'Approval', refId: approval._id, description: remarks })
    await notifyUser(approval.requestedBy, 'Approval Granted', `Your approval request has been granted.`, 'approval', '/approvals')
    
    res.json(approval)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// PUT /api/approvals/:id/reject
export const rejectRequest = async (req, res) => {
  try {
    const { remarks } = req.body
    const approval = await Approval.findById(req.params.id)
    if (!approval) return res.status(404).json({ message: 'Approval not found' })
    if (approval.status !== 'pending') return res.status(400).json({ message: 'Approval already actioned' })

    approval.status = 'rejected'
    approval.approvedBy = req.user._id
    approval.remarks = remarks
    approval.actionAt = new Date()
    await approval.save()

    await Quotation.findByIdAndUpdate(approval.quotation, { status: 'rejected' })

    await logActivity({ user: req.user._id, action: 'Approval Rejected', module: 'Approval', refId: approval._id, description: remarks })
    await notifyUser(approval.requestedBy, 'Approval Rejected', `Your approval request was rejected.`, 'approval', '/approvals')

    res.json(approval)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}
