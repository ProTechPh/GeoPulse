import mongoose from 'mongoose'

const incidentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a title'],
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: [true, 'Please provide a description'],
    trim: true,
    maxlength: 1000
  },
  category: {
    type: String,
    required: true,
    enum: ['fire', 'flood', 'crime', 'accident', 'infrastructure', 'other']
  },
  severity: {
    type: String,
    required: true,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    },
    address: {
      type: String,
      trim: true
    }
  },
  images: [{
    url: {
      type: String,
      required: true
    },
    publicId: String
  }],
  status: {
    type: String,
    enum: ['pending', 'acknowledged', 'in-progress', 'resolved', 'closed'],
    default: 'pending'
  },
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  notes: [{
    text: String,
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  resolvedAt: Date
}, {
  timestamps: true
})

// Geospatial index for location queries
incidentSchema.index({ location: '2dsphere' })

// Indexes for filtering
incidentSchema.index({ status: 1, createdAt: -1 })
incidentSchema.index({ category: 1 })
incidentSchema.index({ severity: 1 })
incidentSchema.index({ reportedBy: 1 })

export default mongoose.model('Incident', incidentSchema)
