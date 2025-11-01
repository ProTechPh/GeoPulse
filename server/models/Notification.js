import mongoose from 'mongoose'

const notificationSchema = new mongoose.Schema({
  incidentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Incident',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['email', 'sms'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'sent', 'failed'],
    default: 'pending'
  },
  sentAt: Date,
  errorMessage: String,
  retryCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
})

// Indexes for queries
notificationSchema.index({ incidentId: 1 })
notificationSchema.index({ userId: 1 })
notificationSchema.index({ status: 1 })

export default mongoose.model('Notification', notificationSchema)
