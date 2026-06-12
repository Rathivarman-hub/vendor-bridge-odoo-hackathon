import { v2 as cloudinary } from 'cloudinary'
import CloudinaryStorage from 'multer-storage-cloudinary'
import multer from 'multer'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const isPdf = file.mimetype === 'application/pdf'
    return {
      folder: 'vendorbridge/rfq-attachments',
      resource_type: isPdf ? 'raw' : 'image',
      allowed_formats: ['pdf', 'doc', 'docx', 'png', 'jpg', 'jpeg', 'xlsx', 'csv'],
      public_id: `${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`,
    }
  },
})

const fileFilter = (req, file, cb) => {
  const allowed = /pdf|doc|docx|png|jpg|jpeg|xlsx|csv/i
  const ext = file.originalname.split('.').pop()
  if (allowed.test(ext)) cb(null, true)
  else cb(new Error('File type not allowed'), false)
}

export const upload = multer({ storage, fileFilter, limits: { fileSize: 10 * 1024 * 1024 } })

// Helper to delete from Cloudinary
export const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType })
  } catch (err) {
    console.error('Cloudinary delete error:', err.message)
  }
}

export { cloudinary }
