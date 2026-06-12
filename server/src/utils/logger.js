import ActivityLog from '../models/ActivityLog.model.js'

/**
 * Log a procurement activity
 * @param {{ user, action, module, refId?, description?, ip? }} params
 */
export const logActivity = async ({ user, action, module, refId, description, ip }) => {
  try {
    await ActivityLog.create({ user, action, module, refId, description, ip })
  } catch (err) {
    console.error('Activity log error:', err.message)
  }
}
