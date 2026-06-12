import PDFDocument from 'pdfkit'
import Invoice from '../models/Invoice.model.js'
import PurchaseOrder from '../models/PurchaseOrder.model.js'
import { logActivity } from '../utils/logger.js'
import { sendEmail } from '../config/mailer.js'

// GET /api/invoices
export const getInvoices = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query
    const query = {}
    if (status) query.status = status

    const skip = (Number(page) - 1) * Number(limit)
    const [invoices, total] = await Promise.all([
      Invoice.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit))
        .populate('vendor', 'name email')
        .populate('purchaseOrder', 'poNumber')
        .populate('createdBy', 'name'),
      Invoice.countDocuments(query),
    ])
    res.json({ invoices, total, page: Number(page), pages: Math.ceil(total / limit) })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// GET /api/invoices/:id
export const getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('vendor', 'name email phone address gstNumber')
      .populate('purchaseOrder', 'poNumber deliveryDate')
      .populate('createdBy', 'name')
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' })
    res.json(invoice)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// POST /api/invoices  — generate invoice from a purchase order
export const createInvoice = async (req, res) => {
  try {
    const { purchaseOrderId, taxPercent, dueDate, notes } = req.body
    const po = await PurchaseOrder.findById(purchaseOrderId).populate('vendor')
    if (!po) return res.status(404).json({ message: 'Purchase order not found' })

    const invoice = await Invoice.create({
      purchaseOrder: po._id,
      vendor: po.vendor._id,
      items: po.items,
      subTotal: po.subTotal,
      taxPercent: taxPercent || po.taxPercent || 18,
      dueDate,
      notes,
      createdBy: req.user._id,
    })

    await logActivity({ user: req.user._id, action: 'Invoice Generated', module: 'Invoice', refId: invoice._id, description: invoice.invoiceNumber })
    res.status(201).json(invoice)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

// GET /api/invoices/:id/pdf  — stream PDF
export const downloadInvoicePDF = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('vendor', 'name email phone address gstNumber')
      .populate('purchaseOrder', 'poNumber')
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' })

    const doc = new PDFDocument({ margin: 50 })
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename=${invoice.invoiceNumber}.pdf`)
    doc.pipe(res)

    // Header
    doc.fontSize(20).fillColor('#2563eb').text('VendorBridge ERP', { align: 'left' })
    doc.fontSize(10).fillColor('#6b7280').text('Procurement & Vendor Management', { align: 'left' })
    doc.moveDown()
    doc.fontSize(16).fillColor('#111827').text('INVOICE', { align: 'right' })
    doc.fontSize(10).fillColor('#374151')
      .text(`Invoice No: ${invoice.invoiceNumber}`, { align: 'right' })
      .text(`Date: ${invoice.createdAt.toLocaleDateString()}`, { align: 'right' })
      .text(`PO No: ${invoice.purchaseOrder?.poNumber || '—'}`, { align: 'right' })
    doc.moveDown()

    // Vendor
    doc.fontSize(11).fillColor('#111827').text('Bill To:')
    doc.fontSize(10).fillColor('#374151')
      .text(invoice.vendor?.name)
      .text(invoice.vendor?.email)
      .text(invoice.vendor?.phone)
      .text(invoice.vendor?.address)
    if (invoice.vendor?.gstNumber) doc.text(`GST: ${invoice.vendor.gstNumber}`)
    doc.moveDown()

    // Items table header
    const tableTop = doc.y
    doc.fontSize(10).fillColor('#fff')
    doc.rect(50, tableTop, 510, 20).fill('#2563eb')
    doc.fillColor('#fff')
      .text('#', 55, tableTop + 5)
      .text('Description', 80, tableTop + 5)
      .text('Qty', 310, tableTop + 5)
      .text('Unit Price', 360, tableTop + 5)
      .text('Total', 470, tableTop + 5)

    let y = tableTop + 25
    invoice.items.forEach((item, i) => {
      doc.fillColor('#374151').fontSize(10)
        .text(String(i + 1), 55, y)
        .text(item.description, 80, y, { width: 220 })
        .text(String(item.quantity), 310, y)
        .text(`₹${item.unitPrice.toLocaleString()}`, 360, y)
        .text(`₹${(item.total || item.quantity * item.unitPrice).toLocaleString()}`, 470, y)
      y += 20
    })

    doc.moveDown(2)
    doc.fontSize(10)
      .text(`Sub Total: ₹${invoice.subTotal.toLocaleString()}`, { align: 'right' })
      .text(`GST (${invoice.taxPercent}%): ₹${invoice.taxAmount?.toLocaleString()}`, { align: 'right' })
    doc.fontSize(13).fillColor('#2563eb')
      .text(`Total: ₹${invoice.totalAmount?.toLocaleString()}`, { align: 'right' })

    doc.end()
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// POST /api/invoices/:id/send-email
export const sendInvoiceEmail = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('vendor', 'name email')
      .populate('purchaseOrder', 'poNumber')
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' })

    await sendEmail({
      to: invoice.vendor.email,
      subject: `Invoice ${invoice.invoiceNumber} from VendorBridge ERP`,
      html: `
        <h2>VendorBridge ERP</h2>
        <p>Dear <strong>${invoice.vendor.name}</strong>,</p>
        <p>Please find your invoice details below:</p>
        <table border="1" cellpadding="8" cellspacing="0" style="border-collapse:collapse">
          <tr><th>Invoice No</th><td>${invoice.invoiceNumber}</td></tr>
          <tr><th>PO Number</th><td>${invoice.purchaseOrder?.poNumber || '—'}</td></tr>
          <tr><th>Sub Total</th><td>₹${invoice.subTotal.toLocaleString()}</td></tr>
          <tr><th>GST (${invoice.taxPercent}%)</th><td>₹${invoice.taxAmount?.toLocaleString()}</td></tr>
          <tr><th>Total Amount</th><td><strong>₹${invoice.totalAmount?.toLocaleString()}</strong></td></tr>
          <tr><th>Status</th><td>${invoice.status}</td></tr>
        </table>
        <p>Thank you for doing business with us.</p>
        <p><em>VendorBridge ERP Team</em></p>
      `,
    })

    invoice.status = 'sent'
    invoice.emailSentAt = new Date()
    await invoice.save()

    await logActivity({ user: req.user._id, action: 'Invoice Emailed', module: 'Invoice', refId: invoice._id, description: invoice.invoiceNumber })
    res.json({ message: 'Invoice sent via email', invoice })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}
