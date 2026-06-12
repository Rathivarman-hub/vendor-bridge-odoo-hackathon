import RFQ from '../models/RFQ.model.js'
import Approval from '../models/Approval.model.js'
import PurchaseOrder from '../models/PurchaseOrder.model.js'
import Invoice from '../models/Invoice.model.js'
import Vendor from '../models/Vendor.model.js'
import Quotation from '../models/Quotation.model.js'

const MONTH_NAMES = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

// GET /api/dashboard
export const getDashboard = async (req, res) => {
  try {
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const role = req.user.role

    // Vendor gets a simplified dashboard scoped to their profile
    if (role === 'vendor') {
      const vendorId = req.user.vendorProfile
      if (!vendorId) {
        return res.json({
          analytics: { pendingApprovals: 0, activeRFQs: 0, totalVendors: 0, totalQuotations: 0, totalSpend: 0 },
          recentOrders: [], recentInvoices: [], pendingApprovals: [], monthlySpend: [],
        })
      }
      const [activeRFQs, totalQuotations, recentOrders, recentInvoices, totalSpendRaw, monthlySpendRaw] = await Promise.all([
        RFQ.countDocuments({ vendors: vendorId, status: 'open' }),
        Quotation.countDocuments({ vendor: vendorId }),
        PurchaseOrder.find({ vendor: vendorId }).sort({ createdAt: -1 }).limit(5).populate('vendor', 'name').lean(),
        Invoice.find({ vendor: vendorId }).sort({ createdAt: -1 }).limit(5).populate('vendor', 'name').lean(),
        Invoice.aggregate([{ $match: { vendor: vendorId } }, { $group: { _id: null, total: { $sum: '$totalAmount' } } }]),
        Invoice.aggregate([
          { $match: { vendor: vendorId, createdAt: { $gte: sixMonthsAgo } } },
          { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, amount: { $sum: '$totalAmount' }, count: { $sum: 1 } } },
          { $sort: { '_id.year': 1, '_id.month': 1 } },
        ]),
      ])
      return res.json({
        analytics: { pendingApprovals: 0, activeRFQs, totalVendors: 0, totalQuotations, totalSpend: totalSpendRaw[0]?.total || 0 },
        recentOrders, recentInvoices, pendingApprovals: [],
        monthlySpend: monthlySpendRaw.map(m => ({
          month: `${MONTH_NAMES[m._id?.month] || '?'} '${String(m._id?.year || '').slice(-2)}`,
          amount: m.amount || 0, orders: m.count || 0,
        })),
      })
    }

    // Only fetch restricted data for admin/manager users
    const isAdminOrManager = ['admin', 'manager'].includes(role)

    const queries = [
      RFQ.countDocuments({ status: 'open' }),
      PurchaseOrder.find().sort({ createdAt: -1 }).limit(5).populate('vendor', 'name').lean(),
      Invoice.find().sort({ createdAt: -1 }).limit(5).populate('vendor', 'name').lean(),
      Vendor.countDocuments({ status: 'active' }),
      Quotation.countDocuments(),
      Invoice.aggregate([{ $group: { _id: null, total: { $sum: '$totalAmount' } } }]),
      Invoice.aggregate([
        { $match: { createdAt: { $gte: sixMonthsAgo } } },
        { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, amount: { $sum: '$totalAmount' }, count: { $sum: 1 } } },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ]),
    ]

    // Add admin/manager only queries
    if (isAdminOrManager) {
      queries.unshift(Approval.countDocuments({ status: 'pending' }))
      queries.push(Approval.find({ status: 'pending' }).sort({ createdAt: -1 }).limit(5).populate('rfq', 'title').lean())
    }

    const results = await Promise.all(queries)
    
    let idx = 0
    const pendingApprovalsCount = isAdminOrManager ? results[idx++] : 0
    const activeRFQs = results[idx++]
    const recentOrders = results[idx++]
    const recentInvoices = results[idx++]
    const totalVendors = results[idx++]
    const totalQuotations = results[idx++]
    const totalSpend = results[idx++]
    const monthlySpendRaw = results[idx++]
    const pendingApprovalsList = isAdminOrManager ? results[idx++] : []

    const monthlySpend = monthlySpendRaw.map(m => ({
      month: `${MONTH_NAMES[m._id?.month] || '?'} '${String(m._id?.year || '').slice(-2)}`,
      amount: m.amount || 0,
      orders: m.count || 0,
    }))

    res.json({
      analytics: {
        pendingApprovals: pendingApprovalsCount,
        activeRFQs,
        totalVendors,
        totalQuotations,
        totalSpend: totalSpend[0]?.total || 0,
      },
      recentOrders,
      recentInvoices,
      pendingApprovals: pendingApprovalsList,
      monthlySpend,
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}
