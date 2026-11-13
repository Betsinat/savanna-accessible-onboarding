const mongoose = require('mongoose');

const OnboardingProfileSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, unique: true },
  fullName: { type: String, required: true },
  phoneOrEmail: { type: String, required: true },
  idRoute: { 
    type: String, 
    enum: ['standard_id', 'refugee_id', 'alternative_doc', 'partner_referral'], 
    required: true 
  },
  idDetails: {
    documentNumber: { type: String }, // For refugee ID or alternative docs
    partnerCode: { type: String }     // For partner "refer me" flow (e.g., AAAPD)
  },
  consentGiven: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('OnboardingProfile', OnboardingProfileSchema);