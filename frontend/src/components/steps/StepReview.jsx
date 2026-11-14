
import React, { useState } from 'react';
import { registerCandidate } from '../../services/api';

export default function StepReview({
  formData,
  updateFormData,
  sessionId,
  onBack,
  onSuccess
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [consentGiven, setConsentGiven] = useState(
    formData.consentGiven || false
  );

  const accommodations = formData.accommodationPreferences || [];

  const toggleAccommodation = (accId) => {
    const updated = accommodations.includes(accId)
      ? accommodations.filter((item) => item !== accId)
      : [...accommodations, accId];

    updateFormData('accommodationPreferences', updated);
  };

  const handleFinalSubmit = async () => {
    if (!consentGiven) {
      setError('Please check the consent box to complete registration.');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      const payload = {
        sessionId,
        fullName: formData.fullName,
        phoneOrEmail: formData.phoneOrEmail,
        idRoute: formData.idRoute || 'standard_id',
        idDetails: formData.idDetails || {},
        supportType: formData.supportType || 'general_guidance',
        preferredContactMethod: formData.preferredContactMethod || 'phone',
        additionalNotes: formData.additionalNotes || '',
        consentGiven: true,
        accommodationPreferences: accommodations,
      };

      await registerCandidate(payload);

      onSuccess({
        formData: {
          ...formData,
          consentGiven: true,
          accommodationPreferences: accommodations,
        },
        sessionId,
      });
    } catch (err) {
      console.error('Registration failed:', err);
      setError(
        'Failed to complete registration. Please check your connection and try again.'
      );
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="bg-gray-950 border border-gray-800 rounded-xl p-4 space-y-3 text-sm">
        <div className="flex justify-between border-b border-gray-800 pb-2">
          <span className="text-gray-400">Full Name:</span>
          <span className="font-semibold text-white">
            {formData.fullName || 'Not provided'}
          </span>
        </div>

        <div className="flex justify-between border-b border-gray-800 pb-2">
          <span className="text-gray-400">Contact:</span>
          <span className="font-semibold text-white">
            {formData.phoneOrEmail || 'Not provided'}
          </span>
        </div>

        <div className="flex justify-between border-b border-gray-800 pb-2">
          <span className="text-gray-400">ID Route:</span>
          <span className="font-semibold text-white capitalize">
            {formData.idRoute || 'standard_id'}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-400">Support Type:</span>
          <span className="font-semibold text-white capitalize">
            {formData.supportType || 'None selected'}
          </span>
        </div>

        <div className="flex justify-between border-t border-gray-800 pt-2">
          <span className="text-gray-400">Consent:</span>
          <span className="font-semibold text-white">
            {consentGiven ? 'Provided' : 'Not provided'}
          </span>
        </div>
      </section>

      <div className="space-y-3">
        <label className="flex items-start gap-3 text-sm text-gray-300">
          <input
            type="checkbox"
            checked={consentGiven}
            onChange={(e) => {
              setConsentGiven(e.target.checked);
              updateFormData('consentGiven', e.target.checked);
              setError('');
            }}
            disabled={isSubmitting}
            className="mt-1"
          />

          <span>
            I confirm that the information provided is accurate and consent
            to the collection and processing of my information for the
            purposes of this platform.
          </span>
        </label>
      </div>

      {error && (
        <p role="alert" className="text-sm text-red-400">
          {error}
        </p>
      )}

      <div className="flex justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          disabled={isSubmitting}
          className="px-5 py-2 rounded-lg border border-gray-700 text-gray-300 hover:bg-gray-800 disabled:opacity-50"
        >
          Back
        </button>

        <button
          type="button"
          onClick={handleFinalSubmit}
          disabled={isSubmitting}
          className="px-5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-50"
        >
          {isSubmitting ? 'Submitting...' : 'Complete Registration'}
        </button>
      </div>
    </div>
  );
}
