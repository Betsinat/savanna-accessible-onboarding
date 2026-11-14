export default function StepPersonal({ formData, updateFormData, onNext }) {
  return (
    <section>
      <h2 className="text-2xl font-bold mb-2">Personal details</h2>
      <p className="text-gray-400 mb-6">Tell us your name and how we can reach you.</p>

      <div className="space-y-4">
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium mb-2">
            Full name
          </label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            autoComplete="name"
            value={formData.fullName || ''}
            onChange={(event) => updateFormData('fullName', event.target.value)}
            className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label htmlFor="phoneOrEmail" className="block text-sm font-medium mb-2">
            Phone number or email
          </label>
          <input
            id="phoneOrEmail"
            name="phoneOrEmail"
            type="text"
            autoComplete="email"
            value={formData.phoneOrEmail || ''}
            onChange={(event) => updateFormData('phoneOrEmail', event.target.value)}
            className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
          />
        </div>

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
