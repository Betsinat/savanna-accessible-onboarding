const mongoose = require('mongoose');

const SupportRequestSchema = new mongoose.Schema({
  sessionId: { type: String, required: true },
  supportType: { type: String, required: true }, // e.g., 'screen_reader_assistance', 'physical_accessibility', 'low_literacy_guidance'
  preferredContactMethod: { type: String, enum: ['phone', 'sms', 'email'], required: true },
  additionalNotes: { type: String }, // Optional text or voice transcription
  status: { type: String, default: 'pending' }, // pending, reviewing, resolved
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SupportRequest', SupportRequestSchema);