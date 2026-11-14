
const mongoose = require('mongoose');

const OnboardingProfileSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  phoneOrEmail: {
    type: String,
    required: true,
    trim: true
  },
  idRoute: {
    type: String,
    enum: [
      'standard_id',
      'refugee_id',
      'alternative_doc',
      'partner_referral'
    ],
    required: true
  },
  idDetails: {
    documentNumber: {
      type: String,
      trim: true
    },
    partnerCode: {
      type: String,
      trim: true
    }
  },
  accommodationPreferences: {
    type: [String],
    default: []
  },
  consentGiven: {
    type: Boolean,
    default: false,
    required: true,
    validate: {
      validator: value => value === true,
      message: 'Candidate consent is required.'
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

OnboardingProfileSchema.pre('validate', function(next) {
  if (
    ['refugee_id', 'alternative_doc'].includes(this.idRoute) &&
    !this.idDetails?.documentNumber
  ) {
    this.invalidate(
      'idDetails.documentNumber',
      'Document details are required for this identification route.'
    );
  }

  if (
    this.idRoute === 'partner_referral' &&
    !this.idDetails?.partnerCode
  ) {
    this.invalidate(
      'idDetails.partnerCode',
      'Partner referral code is required.'
    );
  }

  next();
});

module.exports = mongoose.model(
  'OnboardingProfile',
  OnboardingProfileSchema
);
