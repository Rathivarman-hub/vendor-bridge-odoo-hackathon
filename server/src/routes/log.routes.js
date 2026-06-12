import { Router } from 'express'
import { getLogs } from '../controllers/log.controller.js'
import { verifyToken, authorizeRoles } from '../middleware/auth.middleware.js'

const router = Router()
router.use(verifyToken)
router.get('/', authorizeRoles('admin', 'manager'), getLogs)
export default router
