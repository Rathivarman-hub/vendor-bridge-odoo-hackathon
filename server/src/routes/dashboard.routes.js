import { Router } from 'express'
import { getDashboard } from '../controllers/dashboard.controller.js'
import { verifyToken } from '../middleware/auth.middleware.js'

const router = Router()
router.get('/', verifyToken, getDashboard)
export default router
