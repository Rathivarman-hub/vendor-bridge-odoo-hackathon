import { Router } from 'express'
import { getApprovals, createApproval, approveRequest, rejectRequest } from '../controllers/approval.controller.js'
import { verifyToken, authorizeRoles } from '../middleware/auth.middleware.js'

const router = Router()
router.use(verifyToken)

router.get('/', authorizeRoles('admin', 'manager'), getApprovals)
router.post('/', authorizeRoles('admin', 'procurement_officer'), createApproval)
router.put('/:id/approve', authorizeRoles('admin', 'manager'), approveRequest)
router.put('/:id/reject', authorizeRoles('admin', 'manager'), rejectRequest)

export default router
