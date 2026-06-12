import { Router } from 'express'
import { getVendors, getVendorById, createVendor, updateVendor, deleteVendor } from '../controllers/vendor.controller.js'
import { verifyToken, authorizeRoles } from '../middleware/auth.middleware.js'

const router = Router()
router.use(verifyToken)

router.get('/', authorizeRoles('admin', 'procurement_officer', 'manager', 'vendor'), getVendors)
router.get('/:id', authorizeRoles('admin', 'procurement_officer', 'manager', 'vendor'), getVendorById)
router.post('/', authorizeRoles('admin', 'procurement_officer'), createVendor)
router.put('/:id', authorizeRoles('admin', 'procurement_officer'), updateVendor)
router.delete('/:id', authorizeRoles('admin'), deleteVendor)

export default router
