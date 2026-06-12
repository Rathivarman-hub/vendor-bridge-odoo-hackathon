import ActivityLog from '../models/ActivityLog.model.js'

// GET /api/logs
export const getLogs = async (req, res) => {
  try {
    const { module, page = 1, limit = 30 } = req.query
    const query = {}
    if (module) query.module = module

    const skip = (Number(page) - 1) * Number(limit)
    const [logs, total] = await Promise.all([
      ActivityLog.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).populate('user', 'name email role'),
      ActivityLog.countDocuments(query),
    ])
    res.json({ logs, total, page: Number(page), pages: Math.ceil(total / limit) })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}
