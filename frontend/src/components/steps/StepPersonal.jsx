import VoiceInput from '../wizard/VoiceInput';

export default function StepPersonal({ formData, updateFormData, onNext }) {
  return (
    <section>
      <h2 className="text-2xl font-bold mb-2">Personal details</h2>
      <p className="text-gray-400 mb-6">Tell us your name and how we can reach you.</p>

      <div className="space-y-4">
        <VoiceInput
          id="fullName"
          label="Full name"
          type="text"
          placeholder="Enter your full name"
          value={formData.fullName || ''}
          onChange={(value) => updateFormData('fullName', value)}
        />

        <VoiceInput
          id="phoneOrEmail"
          label="Phone number or email"
          type="text"
          placeholder="Enter your phone number or email"
          value={formData.phoneOrEmail || ''}
          onChange={(value) => updateFormData('phoneOrEmail', value)}
        />

        <button
          type="button"
          onClick={onNext}
          className="mt-4 px-8 py-3 rounded-xl font-bold bg-blue-600 text-white hover:bg-blue-500"
        >
          Next
        </button>
      </div>
    </section>
  );
}
