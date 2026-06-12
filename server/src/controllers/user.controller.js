import User from '../models/User.model.js'
import { logActivity } from '../utils/logger.js'

// GET /api/users
export const getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password -resetPasswordToken -resetPasswordExpires').sort({ createdAt: -1 })
    res.json({ users, total: users.length })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// POST /api/users  (admin creates a user with any role)
export const createUser = async (req, res) => {
  try {
    const { name, email, password, role, vendorProfile } = req.body
    if (!name || !email || !password) return res.status(400).json({ message: 'Name, email and password are required' })
    const exists = await User.findOne({ email })
    if (exists) return res.status(409).json({ message: 'Email already registered' })
    const userData = { name, email, password, role: role || 'procurement_officer' }
    if (vendorProfile) userData.vendorProfile = vendorProfile
    const user = await User.create(userData)
    await logActivity({ user: req.user._id, action: 'User Created', module: 'Auth', description: `${name} (${role})` })
    res.status(201).json({ _id: user._id, name: user.name, email: user.email, role: user.role, isActive: user.isActive, createdAt: user.createdAt })
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

// PUT /api/users/:id
export const updateUser = async (req, res) => {
  try {
    const { name, role, isActive } = req.body
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, role, isActive },
      { new: true, runValidators: true }
    ).select('-password')
    if (!user) return res.status(404).json({ message: 'User not found' })
    await logActivity({ user: req.user._id, action: 'User Updated', module: 'Auth', description: user.name })
    res.json(user)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

// DELETE /api/users/:id
export const deleteUser = async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString())
      return res.status(400).json({ message: 'Cannot delete your own account' })
    const user = await User.findByIdAndDelete(req.params.id)
    if (!user) return res.status(404).json({ message: 'User not found' })
    await logActivity({ user: req.user._id, action: 'User Deleted', module: 'Auth', description: user.name })
    res.json({ message: 'User deleted' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}
