import VoiceInput from '../wizard/VoiceInput';

export default function StepSupport({ field, formData, updateFormData, error, inputRef }) {
  const supportType = formData.supportType || '';
  const preferredContactMethod = formData.preferredContactMethod || '';

  if (field === 'supportType') {
    return (
      <section>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { id: 'screen_reader_assistance', label: 'Screen Reader Assistance', desc: 'Help navigating with accessibility tools' },
            { id: 'alternative_communication', label: 'Alternative Communication', desc: 'SMS or voice-preferred contact' },
            { id: 'interview_accommodation', label: 'Interview Accommodations', desc: 'Flexible scheduling or environment' },
            { id: 'general_guidance', label: 'General Onboarding Help', desc: 'Step-by-step guidance through the form' },
          ].map((type) => (
            <button
              key={type.id}
              ref={type.id === 'screen_reader_assistance' ? inputRef : undefined}
              type="button"
              onClick={() => updateFormData('supportType', type.id)}
              aria-pressed={supportType === type.id}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? 'supportType-error' : undefined}
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
        {error && (
          <p id="supportType-error" className="mt-3 text-sm text-red-400" role="alert">
            {error}
          </p>
        )}
      </section>
    );
  }

  if (field === 'preferredContactMethod') {
    return (
      <fieldset>
        <legend className="sr-only">Preferred contact method</legend>
        <div className="flex gap-4">
          {['phone', 'sms', 'email'].map((method) => (
            <label key={method} className="flex items-center gap-2 cursor-pointer bg-gray-950 border border-gray-800 px-4 py-3 rounded-xl flex-1 justify-center">
              <input
                type="radio"
                name="preferredContactMethod"
                value={method}
                checked={preferredContactMethod === method}
                ref={method === 'phone' ? inputRef : undefined}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? 'preferredContactMethod-error' : undefined}
                onChange={(event) => updateFormData('preferredContactMethod', event.target.value)}
                className="accent-blue-600"
              />
              <span className="capitalize font-medium text-white">{method}</span>
            </label>
          ))}
        </div>
        {error && (
          <p id="preferredContactMethod-error" className="mt-3 text-sm text-red-400" role="alert">
            {error}
          </p>
        )}
      </fieldset>
    );
  }

  return (
    <section>
      <VoiceInput
        id="additionalNotes"
        label="Additional Notes (Optional)"
        type="textarea"
        placeholder="Share any specific details or preferences..."
        value={formData.additionalNotes || ''}
        error={error}
        inputRef={inputRef}
        onChange={(value) => updateFormData('additionalNotes', value)}
      />
    </section>
  );
}
