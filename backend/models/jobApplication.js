
const mongoose = require('mongoose');

const JobApplicationSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    trim: true
  },
  jobId: {
    type: String,
    required: true,
    trim: true
  },
  candidateName: {
    type: String,
    required: true,
    trim: true
  },
  voiceAnswers: [{
    questionId: {
      type: String,
      trim: true
    },
    audioTranscript: {
      type: String,
      trim: true,
      maxlength: 10000
    }
  }],
  requestedAccommodations: {
    type: [String],
    default: []
  },
  submittedAt: {
    type: Date,
    default: Date.now
  }
});

JobApplicationSchema.index({ sessionId: 1, jobId: 1 });

module.exports = mongoose.model(
  'JobApplication',
  JobApplicationSchema
);
