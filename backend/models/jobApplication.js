const mongoose = require('mongoose');

const JobApplicationSchema = new mongoose.Schema({
  sessionId: { type: String, required: true },
  jobId: { type: String, required: true },
  candidateName: { type: String, required: true },
  voiceAnswers: [{
    questionId: { type: String },
    audioTranscript: { type: String } // Text transcribed from voice input
  }],
  requestedAccommodations: [{ type: String }], // e.g., ['flexible_hours', 'remote_work', 'screen_reader_compatible']
  submittedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('JobApplication', JobApplicationSchema);