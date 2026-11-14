
const mongoose = require('mongoose');

const SupportRequestSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    trim: true
  },
  supportType: {
    type: String,
    required: true,
    trim: true
  },
  preferredContactMethod: {
    type: String,
    enum: ['phone', 'sms', 'email'],
    required: true
  },
  additionalNotes: {
    type: String,
    trim: true,
    maxlength: 2000
  },
  status: {
    type: String,
    enum: ['pending', 'reviewing', 'resolved'],
    default: 'pending'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model(
  'SupportRequest',
  SupportRequestSchema
);
