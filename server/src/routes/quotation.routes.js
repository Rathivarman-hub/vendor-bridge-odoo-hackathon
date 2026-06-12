import { Router } from 'express'
import { getQuotations, getQuotationById, createQuotation, updateQuotation, compareQuotations } from '../controllers/quotation.controller.js'
import { verifyToken, authorizeRoles } from '../middleware/auth.middleware.js'

const router = Router()
router.use(verifyToken)

router.get('/', authorizeRoles('admin', 'procurement_officer', 'manager', 'vendor'), getQuotations)
router.get('/compare/:rfqId', authorizeRoles('admin', 'procurement_officer', 'manager'), compareQuotations)
router.get('/:id', authorizeRoles('admin', 'procurement_officer', 'manager', 'vendor'), getQuotationById)
router.post('/', authorizeRoles('admin', 'procurement_officer', 'vendor'), createQuotation)
router.put('/:id', authorizeRoles('admin', 'procurement_officer', 'vendor'), updateQuotation)

export default router
