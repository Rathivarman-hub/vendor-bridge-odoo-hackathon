import { Router } from 'express'
import { getMyNotifications, markAsRead, markAllAsRead } from '../controllers/notification.controller.js'
import { verifyToken } from '../middleware/auth.middleware.js'

const router = Router()
router.use(verifyToken)

router.get('/', getMyNotifications)
router.put('/read-all', markAllAsRead)
router.put('/:id/read', markAsRead)

export default router
