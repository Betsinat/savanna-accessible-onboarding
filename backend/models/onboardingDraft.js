
const mongoose = require('mongoose');

const OnboardingDraftSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  currentStep: {
    type: Number,
    default: 1,
    min: 1
  },
  formData: {
    type: mongoose.Schema.Types.Mixed,
    default: () => ({})
  },
  resumeTokenHash: {
    type: String,
    select: false
  },
  resumeTokenExpiresAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

OnboardingDraftSchema.index(
  { resumeTokenHash: 1 },
  { unique: true, sparse: true }
);

module.exports = mongoose.model(
  'OnboardingDraft',
  OnboardingDraftSchema
);
