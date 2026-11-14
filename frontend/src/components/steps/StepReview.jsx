import React, { useState } from 'react';
import { registerCandidate } from '../../services/api';

export default function StepReview({ formData, updateFormData, sessionId, onBack, onSuccess }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [consentGiven, setConsentGiven] = useState(formData.consentGiven || false);

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
      setError('Failed to complete registration. Please check your connection and try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <section>
      <h2 className="text-2xl font-bold mb-2">Review & Complete</h2>
      <p className="text-gray-400 mb-6">
        Review your details, select any workplace accommodations you prefer, and finalize your registration.
      </p>

      <div className="space-y-6 mb-6">
        {/* Summary Card */}
        <div className="bg-gray-950 border border-gray-800 rounded-xl p-4 space-y-3 text-sm">
          <div className="flex justify-between border-b border-gray-800 pb-2">
            <span className="text-gray-400">Full Name:</span>
            <span className="font-semibold text-white">{formData.fullName || 'Not provided'}</span>
          </div>
          <div className="flex justify-between border-b border-gray-800 pb-2">
            <span className="text-gray-400">Contact:</span>
            <span className="font-semibold text-white">{formData.phoneOrEmail || 'Not provided'}</span>
          </div>
          <div className="flex justify-between border-b border-gray-800 pb-2">
            <span className="text-gray-400">ID Route:</span>
            <span className="font-semibold text-white capitalize">{formData.idRoute || 'standard_id'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Support Type:</span>
            <span className="font-semibold text-white capitalize">{formData.supportType || 'None selected'}</span>
          </div>
        </div>

        {/* Accommodation Preferences */}
        <div>
          <label className="block text-sm font-medium mb-3">
            Select Your Workplace Accommodations (Optional)
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { id: 'screen_reader_compatible', label: 'Screen Reader Compatible' },
              { id: 'flexible_hours', label: 'Flexible Working Hours' },
              { id: 'remote_work', label: 'Remote Work Enabled' },
              { id: 'captioned_meetings', label: 'Captioned Meetings' },
            ].map((acc) => {
              const isSelected = accommodations.includes(acc.id);
              return (
                <button
                  key={acc.id}
                  type="button"
                  onClick={() => toggleAccommodation(acc.id)}
                  className={`p-3 rounded-xl border text-left text-sm font-medium transition-all ${
                    isSelected
                      ? 'bg-blue-600/20 border-blue-500 text-white'
                      : 'bg-gray-950 border-gray-800 text-gray-400 hover:border-gray-700'
                  }`}
                >
                  {acc.label} {isSelected && '✓'}
                </button>
              );
            })}
          </div>
        </div>

        {/* Consent Checkbox */}
        <div className="flex items-start gap-3 bg-gray-950 border border-gray-800 p-4 rounded-xl">
          <input
            type="checkbox"
            id="consentGiven"
            checked={consentGiven}
            onChange={(e) => {
              setConsentGiven(e.target.checked);
              updateFormData('consentGiven', e.target.checked);
              if (error) setError('');
            }}
            className="mt-1 accent-blue-600 h-4 w-4 cursor-pointer"
          />
          <label htmlFor="consentGiven" className="text-xs text-gray-300 cursor-pointer">
            I consent to saving my onboarding draft and candidate profile securely to access accessible employment opportunities.
          </label>
        </div>
      </div>

      {error && (
        <p className="text-red-400 text-sm font-medium mb-4" role="alert">
          ⚠️ {error}
        </p>
      )}

      <div className="flex gap-4">
        <button
          type="button"
          onClick={onBack}
          disabled={isSubmitting}
          className="px-6 py-3 rounded-xl font-semibold bg-gray-800 text-white hover:bg-gray-700 disabled:opacity-50"
        >
          Back
        </button>
        <button
          type="button"
          onClick={handleFinalSubmit}
          disabled={isSubmitting}
          className="flex-1 py-3 rounded-xl font-bold bg-emerald-600 text-white hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-900/40 disabled:opacity-50"
        >
          {isSubmitting ? 'Registering...' : 'Complete Registration & Enter Career Gateway'}
        </button>
      </div>
    </section>
  );
}