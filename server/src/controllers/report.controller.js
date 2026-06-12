import Invoice from '../models/Invoice.model.js'
import PurchaseOrder from '../models/PurchaseOrder.model.js'
import Vendor from '../models/Vendor.model.js'
import RFQ from '../models/RFQ.model.js'
import Quotation from '../models/Quotation.model.js'

// GET /api/reports
export const getReports = async (req, res) => {
  try {
    // Monthly procurement spend (last 6 months)
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const [monthlySpend, vendorPerformance, procurementStats, topVendors, categorySpend] = await Promise.all([
      Invoice.aggregate([
        { $match: { createdAt: { $gte: sixMonthsAgo } } },
        {
          $group: {
            _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
            total: { $sum: '$totalAmount' },
            count: { $sum: 1 },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ]),

      Vendor.aggregate([
        { $match: { status: 'active' } },
        { $sort: { totalOrders: -1 } },
        { $limit: 10 },
        { $project: { name: 1, totalOrders: 1, rating: 1, category: 1 } },
      ]),

      Promise.all([
        RFQ.countDocuments(),
        Quotation.countDocuments(),
        PurchaseOrder.countDocuments(),
        Invoice.countDocuments(),
        Invoice.aggregate([{ $group: { _id: null, total: { $sum: '$totalAmount' } } }]),
      ]).then(([rfqs, quotations, orders, invoices, spend]) => ({
        rfqs,
        quotations,
        orders,
        invoices,
        totalSpend: spend[0]?.total || 0,
      })),

      PurchaseOrder.aggregate([
        { $group: { _id: '$vendor', orders: { $sum: 1 }, spend: { $sum: '$totalAmount' } } },
        { $sort: { spend: -1 } },
        { $limit: 5 },
        { $lookup: { from: 'vendors', localField: '_id', foreignField: '_id', as: 'vendor' } },
        { $unwind: '$vendor' },
        { $project: { 'vendor.name': 1, 'vendor.category': 1, orders: 1, spend: 1 } },
      ]),

      PurchaseOrder.aggregate([
        { $lookup: { from: 'vendors', localField: 'vendor', foreignField: '_id', as: 'vendorData' } },
        { $unwind: '$vendorData' },
        { $group: { _id: '$vendorData.category', totalSpend: { $sum: '$totalAmount' } } },
        { $sort: { totalSpend: -1 } },
      ])
    ])

    res.json({ monthlySpend, vendorPerformance, procurementStats, topVendors, categorySpend })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}
