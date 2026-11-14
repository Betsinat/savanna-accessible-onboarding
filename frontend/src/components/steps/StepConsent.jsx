export default function StepConsent({ formData, updateFormData }) {
  return (
    <label className="flex items-start gap-3 bg-gray-950 border border-gray-800 p-4 rounded-xl">
      <input
        type="checkbox"
        checked={Boolean(formData.consentGiven)}
        onChange={(event) => updateFormData('consentGiven', event.target.checked)}
        className="mt-1 accent-blue-600 h-4 w-4 cursor-pointer"
      />
      <span className="text-sm text-gray-300">
        I consent to saving my onboarding draft and candidate profile securely to access accessible employment opportunities.
      </span>
    </label>
  );
}
