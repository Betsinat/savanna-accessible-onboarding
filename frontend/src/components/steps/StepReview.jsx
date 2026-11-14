export default function StepReview({ formData }) {
  return (
    <section className="bg-gray-950 border border-gray-800 rounded-xl p-4 space-y-3 text-sm">
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
      <div className="flex justify-between border-t border-gray-800 pt-2">
        <span className="text-gray-400">Consent:</span>
        <span className="font-semibold text-white">
          {formData.consentGiven ? 'Provided' : 'Not provided'}
        </span>
      </div>
    </section>
  );
}
