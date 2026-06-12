import { Router } from 'express'
import { getReports } from '../controllers/report.controller.js'
import { verifyToken, authorizeRoles } from '../middleware/auth.middleware.js'

const router = Router()
router.use(verifyToken)
router.get('/', authorizeRoles('admin', 'manager'), getReports)
export default router
