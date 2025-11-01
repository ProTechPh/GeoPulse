import express from 'express'
import {
  getIncidents,
  getIncident,
  createIncident,
  updateIncident,
  deleteIncident,
  getNearbyIncidents
} from '../controllers/incidentController.js'
import { uploadImage, deleteImage } from '../controllers/uploadController.js'
import { protect, authorize } from '../middleware/auth.js'
import upload from '../middleware/upload.js'

const router = express.Router()

router.get('/', getIncidents)
router.get('/nearby', getNearbyIncidents)
router.get('/:id', getIncident)
router.post('/', protect, createIncident)
router.put('/:id', protect, updateIncident)
router.delete('/:id', protect, authorize('admin'), deleteIncident)

// Upload routes
router.post('/upload', protect, upload.single('image'), uploadImage)
router.delete('/upload/:publicId', protect, authorize('admin'), deleteImage)

export default router
