import { Router } from 'express'
import { getPurchaseOrders, getPurchaseOrderById, createPurchaseOrder } from '../controllers/purchaseOrder.controller.js'
import { verifyToken, authorizeRoles } from '../middleware/auth.middleware.js'

const router = Router()
router.use(verifyToken)

router.get('/', authorizeRoles('admin', 'procurement_officer', 'manager', 'vendor'), getPurchaseOrders)
router.get('/:id', authorizeRoles('admin', 'procurement_officer', 'manager', 'vendor'), getPurchaseOrderById)
router.post('/', authorizeRoles('admin', 'procurement_officer'), createPurchaseOrder)

export default router
