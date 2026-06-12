import { Router } from 'express'
import { getInvoices, getInvoiceById, createInvoice, downloadInvoicePDF, sendInvoiceEmail } from '../controllers/invoice.controller.js'
import { verifyToken, authorizeRoles } from '../middleware/auth.middleware.js'

const router = Router()
router.use(verifyToken)

router.get('/', authorizeRoles('admin', 'procurement_officer', 'manager'), getInvoices)
router.get('/:id', authorizeRoles('admin', 'procurement_officer', 'manager'), getInvoiceById)
router.get('/:id/pdf', authorizeRoles('admin', 'procurement_officer', 'manager'), downloadInvoicePDF)
router.post('/', authorizeRoles('admin', 'procurement_officer'), createInvoice)
router.post('/:id/send-email', authorizeRoles('admin', 'procurement_officer'), sendInvoiceEmail)

export default router
