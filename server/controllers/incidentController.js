import Incident from '../models/Incident.js'
import User from '../models/User.js'
import Notification from '../models/Notification.js'
import { sendIncidentAlert, sendStatusUpdate } from '../utils/emailService.js'
import imagekit from '../utils/imagekitConfig.js'
import { calculateDistance } from '../utils/geoUtils.js'

// @desc    Get all incidents
// @route   GET /api/incidents
// @access  Public
export const getIncidents = async (req, res, next) => {
  try {
    const {
      status,
      category,
      severity,
      minDate,
      maxDate,
      page = 1,
      limit = 20,
      search
    } = req.query

    // Build query
    const query = {}

    if (status) query.status = status
    if (category) query.category = category
    if (severity) query.severity = severity

    if (minDate || maxDate) {
      query.createdAt = {}
      if (minDate) query.createdAt.$gte = new Date(minDate)
      if (maxDate) query.createdAt.$lte = new Date(maxDate)
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ]
    }

    // Execute query with pagination
    const incidents = await Incident.find(query)
      .populate('reportedBy', 'firstName lastName email')
      .populate('assignedTo', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const total = await Incident.countDocuments(query)

    res.json({
      success: true,
      data: incidents,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Get single incident
// @route   GET /api/incidents/:id
// @access  Public
export const getIncident = async (req, res, next) => {
  try {
    const incident = await Incident.findById(req.params.id)
      .populate('reportedBy', 'firstName lastName email')
      .populate('assignedTo', 'firstName lastName')
      .populate('notes.addedBy', 'firstName lastName')

    if (!incident) {
      return res.status(404).json({ message: 'Incident not found' })
    }

    res.json({
      success: true,
      data: incident
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Create incident
// @route   POST /api/incidents
// @access  Private
export const createIncident = async (req, res, next) => {
  try {
    const {
      title,
      description,
      category,
      severity,
      location,
      images
    } = req.body

    // Create incident
    const incident = await Incident.create({
      title,
      description,
      category,
      severity,
      location: {
        type: 'Point',
        coordinates: [location.longitude, location.latitude],
        address: location.address
      },
      images: images || [],
      reportedBy: req.user.id
    })

    // Populate reporter info
    await incident.populate('reportedBy', 'firstName lastName email')

    // Send proximity-based notifications asynchronously
    sendProximityNotifications(incident).catch(err => 
      console.error('Error sending notifications:', err)
    )

    res.status(201).json({
      success: true,
      data: incident
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Update incident
// @route   PUT /api/incidents/:id
// @access  Private
export const updateIncident = async (req, res, next) => {
  try {
    let incident = await Incident.findById(req.params.id)

    if (!incident) {
      return res.status(404).json({ message: 'Incident not found' })
    }

    // Check permissions: only admin, responder, or reporter can update
    const isAdmin = req.user.role === 'admin'
    const isResponder = req.user.role === 'responder' || req.user.role === 'admin'
    const isReporter = incident.reportedBy.toString() === req.user.id

    if (!isAdmin && !isResponder && !isReporter) {
      return res.status(403).json({ message: 'Not authorized to update this incident' })
    }

    const oldStatus = incident.status

    // Update incident
    incident = await Incident.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    )
      .populate('reportedBy', 'firstName lastName email')
      .populate('assignedTo', 'firstName lastName')

    // Send status update notification if status changed
    if (req.body.status && req.body.status !== oldStatus) {
      sendStatusUpdateNotification(incident, oldStatus).catch(err =>
        console.error('Error sending status update:', err)
      )
    }

    res.json({
      success: true,
      data: incident
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Delete incident
// @route   DELETE /api/incidents/:id
// @access  Private (Admin only)
export const deleteIncident = async (req, res, next) => {
  try {
    const incident = await Incident.findById(req.params.id)

    if (!incident) {
      return res.status(404).json({ message: 'Incident not found' })
    }

    // Delete images from ImageKit
    for (const image of incident.images) {
      if (image.publicId) {
        try {
          await imagekit.deleteFile(image.publicId)
        } catch (error) {
          console.error('Error deleting image from ImageKit:', error)
        }
      }
    }

    await incident.deleteOne()

    res.json({
      success: true,
      message: 'Incident deleted successfully'
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Get nearby incidents
// @route   GET /api/incidents/nearby
// @access  Public
export const getNearbyIncidents = async (req, res, next) => {
  try {
    const { lat, lng, radius = 5000 } = req.query

    if (!lat || !lng) {
      return res.status(400).json({ message: 'Please provide latitude and longitude' })
    }

    const incident = await Incident.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: parseInt(radius)
        }
      }
    })
      .populate('reportedBy', 'firstName lastName')
      .sort({ createdAt: -1 })

    res.json({
      success: true,
      data: incident
    })
  } catch (error) {
    next(error)
  }
}

// Helper function to send proximity-based notifications
async function sendProximityNotifications(incident) {
  try {
    const users = await User.find({
      'notificationPreferences.enabled': true,
      'location.coordinates': {
        $ne: [0, 0]
      }
    })

    const notificationsToSend = []

    for (const user of users) {
      // Check if user wants notifications for this incident type
      const userPrefs = user.notificationPreferences
      if (userPrefs.incidentTypes && userPrefs.incidentTypes.length > 0) {
        if (!userPrefs.incidentTypes.includes(incident.category)) {
          continue
        }
      }

      // Calculate distance
      const [userLng, userLat] = user.location.coordinates
      const [incidentLng, incidentLat] = incident.location.coordinates
      const distance = calculateDistance(userLat, userLng, incidentLat, incidentLng)

      // Check if within notification radius
      if (distance <= userPrefs.radius) {
        notificationsToSend.push({
          user,
          distance
        })
      }
    }

    // Send emails asynchronously
    const notificationPromises = notificationsToSend.map(async ({ user, distance }) => {
      const mapUrl = `${process.env.CLIENT_URL}/incidents/${incident._id}`
      
      const result = await sendIncidentAlert({
        to: user.email,
        incidentTitle: incident.title,
        incidentCategory: incident.category,
        incidentSeverity: incident.severity,
        distance,
        mapUrl
      })

      // Log notification
      await Notification.create({
        incidentId: incident._id,
        userId: user._id,
        type: 'email',
        status: result.success ? 'sent' : 'failed',
        sentAt: result.success ? new Date() : undefined,
        errorMessage: result.error
      })
    })

    await Promise.allSettled(notificationPromises)
  } catch (error) {
    console.error('Error in proximity notifications:', error)
  }
}

// Helper function to send status update notifications
async function sendStatusUpdateNotification(incident, oldStatus) {
  try {
    // Get the reporter
    const reporter = await User.findById(incident.reportedBy)
    if (!reporter || !reporter.notificationPreferences.enabled) {
      return
    }

    const mapUrl = `${process.env.CLIENT_URL}/incidents/${incident._id}`

    const result = await sendStatusUpdate({
      to: reporter.email,
      incidentTitle: incident.title,
      oldStatus,
      newStatus: incident.status,
      mapUrl
    })

    // Log notification
    await Notification.create({
      incidentId: incident._id,
      userId: reporter._id,
      type: 'email',
      status: result.success ? 'sent' : 'failed',
      sentAt: result.success ? new Date() : undefined,
      errorMessage: result.error
    })
  } catch (error) {
    console.error('Error in status update notification:', error)
  }
}
