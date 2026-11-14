import React, { useState } from 'react';
import VoiceInput from '../wizard/VoiceInput';

export default function StepSupport({ formData, updateFormData, onNext, onBack }) {
  const [error, setError] = useState('');

  const supportType = formData.supportType || '';
  const preferredContactMethod = formData.preferredContactMethod || 'phone';
  const additionalNotes = formData.additionalNotes || '';

  const handleNextClick = () => {
    if (!supportType.trim()) {
      setError('Please select or specify the type of support you need.');
      return;
    }
    setError('');
    onNext();
  };

  return (
    <section>
      <h2 className="text-2xl font-bold mb-2">Confidential Support Request</h2>
      <p className="text-gray-400 mb-6">
        Request assistance during your onboarding. This is entirely optional, confidential, and requires zero medical proof or diagnosis.
      </p>

      <div className="space-y-6 mb-6">
        {/* Support Type Selection */}
        <div>
          <label className="block text-sm font-medium mb-3">
            What kind of support would help you? <span className="text-blue-400">*</span>
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { id: 'screen_reader_assistance', label: 'Screen Reader Assistance', desc: 'Help navigating with accessibility tools' },
              { id: 'alternative_communication', label: 'Alternative Communication', desc: 'SMS or voice-preferred contact' },
              { id: 'interview_accommodation', label: 'Interview Accommodations', desc: 'Flexible scheduling or environment' },
              { id: 'general_guidance', label: 'General Onboarding Help', desc: 'Step-by-step guidance through the form' },
            ].map((type) => (
              <button
                key={type.id}
                type="button"
                onClick={() => {
                  updateFormData('supportType', type.id);
                  if (error) setError('');
                }}
                className={`p-4 rounded-xl border text-left transition-all ${
                  supportType === type.id
                    ? 'bg-blue-600/20 border-blue-500 text-white'
                    : 'bg-gray-950 border-gray-800 text-gray-400 hover:border-gray-700'
                }`}
              >
                <div className="font-semibold text-white">{type.label}</div>
                <div className="text-xs text-gray-400 mt-1">{type.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Preferred Contact Method */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Preferred Contact Method
          </label>
          <div className="flex gap-4">
            {['phone', 'sms', 'email'].map((method) => (
              <label key={method} className="flex items-center gap-2 cursor-pointer bg-gray-950 border border-gray-800 px-4 py-3 rounded-xl flex-1 justify-center">
                <input
                  type="radio"
                  name="preferredContactMethod"
                  value={method}
                  checked={preferredContactMethod === method}
                  onChange={(e) => updateFormData('preferredContactMethod', e.target.value)}
                  className="accent-blue-600"
                />
                <span className="capitalize font-medium text-white">{method}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Additional Notes */}
        <div>
          <VoiceInput
            id="additionalNotes"
            label="Additional Notes (Optional)"
            type="textarea"
            placeholder="Share any specific details or preferences..."
            value={additionalNotes}
            onChange={(value) => updateFormData('additionalNotes', value)}
          />
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
          className="px-6 py-3 rounded-xl font-semibold bg-gray-800 text-white hover:bg-gray-700"
        >
          Back
        </button>
        <button
          type="button"
          onClick={handleNextClick}
          className="flex-1 py-3 rounded-xl font-bold bg-blue-600 text-white hover:bg-blue-500"
        >
          Next
        </button>
      </div>
    </section>
  );
}