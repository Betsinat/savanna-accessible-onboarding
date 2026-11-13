const mongoose = require('mongoose');

const OnboardingDraftSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, unique: true },
  currentStep: { type: Number, default: 1 },
  formData: { type: Object, default: {} },
  lastUpdated: { type: Date, default: Date.now }
});

module.exports = mongoose.model('OnboardingDraft', OnboardingDraftSchema);