import imagekit from '../utils/imagekitConfig.js'

// @desc    Upload image to ImageKit
// @route   POST /api/upload
// @access  Private
export const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' })
    }

    // Upload to ImageKit
    const result = await imagekit.upload({
      file: req.file.buffer,
      fileName: req.file.originalname,
      folder: '/geopulse/incidents'
    })

    res.json({
      success: true,
      data: {
        url: result.url,
        publicId: result.fileId
      }
    })
  } catch (error) {
    console.error('ImageKit upload error:', error)
    res.status(500).json({ message: 'Image upload failed', error: error.message })
  }
}

// @desc    Delete image from ImageKit
// @route   DELETE /api/upload/:publicId
// @access  Private (Admin)
export const deleteImage = async (req, res) => {
  try {
    const { publicId } = req.params

    await imagekit.deleteFile(publicId)

    res.json({
      success: true,
      message: 'Image deleted successfully'
    })
  } catch (error) {
    console.error('ImageKit delete error:', error)
    res.status(500).json({ message: 'Image deletion failed', error: error.message })
  }
}
