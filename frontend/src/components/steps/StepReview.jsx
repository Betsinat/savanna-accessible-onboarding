export default function StepReview({ formData }) {
  const accommodations = Array.isArray(formData.accommodationPreferences)
    ? formData.accommodationPreferences
    : [];

  return (
    <section
      aria-label="Registration summary"
      className="bg-gray-950 border border-gray-800 rounded-xl p-4 space-y-3 text-sm"
    >
      <div className="flex justify-between border-b border-gray-800 pb-2">
        <span className="text-gray-400">Full name:</span>
        <span className="font-semibold text-white">{formData.fullName || 'Not provided'}</span>
      </div>

      <div className="flex justify-between border-b border-gray-800 pb-2">
        <span className="text-gray-400">Contact:</span>
        <span className="font-semibold text-white">{formData.phoneOrEmail || 'Not provided'}</span>
      </div>

      <div className="flex justify-between border-b border-gray-800 pb-2">
        <span className="text-gray-400">ID route:</span>
        <span className="font-semibold text-white capitalize">
          {formData.idRoute || 'Not provided'}
        </span>
      </div>

      <div className="flex justify-between border-b border-gray-800 pb-2">
        <span className="text-gray-400">Support type:</span>
        <span className="font-semibold text-white capitalize">
          {formData.supportType || 'Not provided'}
        </span>
      </div>

      <div className="flex justify-between border-b border-gray-800 pb-2">
        <span className="text-gray-400">Accommodations:</span>
        <span className="font-semibold text-white">
          {accommodations.length > 0 ? accommodations.join(', ') : 'None selected'}
        </span>
      </div>

      <div className="flex justify-between">
        <span className="text-gray-400">Consent:</span>
        <span className="font-semibold text-white">
          {formData.consentGiven ? 'Provided' : 'Not provided'}
        </span>
      </div>
    </section>
  );
}
