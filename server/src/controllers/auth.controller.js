import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import User from '../models/User.model.js'
import { logActivity } from '../utils/logger.js'
import { sendEmail } from '../config/mailer.js'

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' })

// POST /api/auth/register
export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body
    if (!name || !email || !password) return res.status(400).json({ message: 'All fields required' })
    const exists = await User.findOne({ email })
    if (exists) return res.status(409).json({ message: 'Email already registered' })
    const user = await User.create({ name, email, password, role: role || 'admin' })
    const token = signToken(user._id)
    await logActivity({ user: user._id, action: 'User Registered', module: 'Auth', description: `${name} registered` })
    res.status(201).json({ token, user: { _id: user._id, name, email, role: user.role, vendorProfile: user.vendorProfile || null } })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// POST /api/auth/login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' })
    const user = await User.findOne({ email })
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ message: 'Invalid credentials' })
    if (!user.isActive) return res.status(403).json({ message: 'Account is inactive' })
    const token = signToken(user._id)
    await logActivity({ user: user._id, action: 'User Logged In', module: 'Auth' })
    res.json({ token, user: { _id: user._id, name: user.name, email: user.email, role: user.role, vendorProfile: user.vendorProfile || null } })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// POST /api/auth/forgot-password
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body
    if (!email) return res.status(400).json({ message: 'Email is required' })

    const user = await User.findOne({ email })
    if (!user) return res.status(404).json({ message: 'No account with that email' })

    // Generate reset token
    const token = crypto.randomBytes(32).toString('hex')
    user.resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex')
    user.resetPasswordExpires = Date.now() + 3600000 // 1 hour
    await user.save({ validateBeforeSave: false })

    const resetURL = `${process.env.CLIENT_URL}/reset-password/${token}`

    try {
      await sendEmail({
        to: user.email,
        subject: 'VendorBridge — Password Reset',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Password Reset Request</h2>
            <p>Hi <strong>${user.name}</strong>,</p>
            <p>We received a request to reset your password. Click the button below to proceed:</p>
            <a href="${resetURL}"
              style="display: inline-block; padding: 12px 24px; background-color: #4F46E5;
                     color: white; text-decoration: none; border-radius: 6px; margin: 16px 0;">
              Reset Password
            </a>
            <p style="color: #666; font-size: 14px;">This link expires in <strong>1 hour</strong>.</p>
            <p style="color: #666; font-size: 14px;">If you did not request this, please ignore this email.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
            <p style="color: #999; font-size: 12px;">VendorBridge · ReimburseFlow</p>
          </div>
        `,
      })
      res.json({ message: 'Password reset email sent' })
    } catch (mailErr) {
      // Roll back token so user can retry
      user.resetPasswordToken = undefined
      user.resetPasswordExpires = undefined
      await user.save({ validateBeforeSave: false })
      console.error('SMTP error:', mailErr.message)
      res.status(500).json({ message: `Email could not be sent: ${mailErr.message}` })
    }
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// POST /api/auth/reset-password/:token
export const resetPassword = async (req, res) => {
  try {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex')
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    })
    if (!user) return res.status(400).json({ message: 'Token is invalid or has expired' })

    user.password = req.body.password
    user.resetPasswordToken = undefined
    user.resetPasswordExpires = undefined
    await user.save()

    await logActivity({ user: user._id, action: 'Password Reset', module: 'Auth' })
    res.json({ message: 'Password reset successful' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// GET /api/auth/me
export const getMe = async (req, res) => {
  res.json(req.user)
}