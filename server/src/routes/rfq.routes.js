import { Router } from 'express'
import { getRFQs, getRFQById, createRFQ, updateRFQ, deleteRFQ } from '../controllers/rfq.controller.js'
import { verifyToken, authorizeRoles } from '../middleware/auth.middleware.js'
import { upload } from '../middleware/upload.middleware.js'

const router = Router()
router.use(verifyToken)

router.get('/', authorizeRoles('admin', 'procurement_officer', 'manager', 'vendor'), getRFQs)
router.get('/:id', authorizeRoles('admin', 'procurement_officer', 'manager', 'vendor'), getRFQById)
router.post('/', authorizeRoles('admin', 'procurement_officer'), upload.array('attachments', 5), createRFQ)
router.put('/:id', authorizeRoles('admin', 'procurement_officer'), upload.array('attachments', 5), updateRFQ)
router.delete('/:id', authorizeRoles('admin', 'procurement_officer'), deleteRFQ)

export default router
