import VoiceInput from '../wizard/VoiceInput';

export default function StepIdentity({
  mode,
  formData,
  updateFormData,
  error,
  inputRef,
  onVoiceReviewStateChange
}) {
  const idRoute = formData.idRoute || '';

  return (
    <section>
      {mode === 'route' ? (
        <fieldset>
          <legend className="sr-only">Identity verification method (required)</legend>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label
              className={`flex items-start gap-3 p-4 rounded-xl border text-left transition-all ${
                idRoute === 'standard_id'
                  ? 'bg-blue-600/20 border-blue-500 text-white'
                  : 'bg-gray-950 border-gray-800 text-gray-400 hover:border-gray-700'
              }`}
            >
              <input
                ref={inputRef}
                type="radio"
                name="idRoute"
                value="standard_id"
                required
                checked={idRoute === 'standard_id'}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? 'idRoute-error' : undefined}
                onChange={() => updateFormData('idRoute', 'standard_id')}
                className="mt-1 h-4 w-4 accent-blue-600"
              />
              <span>
                <span className="block font-semibold text-white">Standard ID Document</span>
                <span className="mt-1 block text-xs text-gray-300">Enter your student ID, national ID, or passport reference.</span>
              </span>
            </label>

            <label
              className={`flex items-start gap-3 p-4 rounded-xl border text-left transition-all ${
                idRoute === 'alternative_route'
                  ? 'bg-blue-600/20 border-blue-500 text-white'
                  : 'bg-gray-950 border-gray-800 text-gray-400 hover:border-gray-700'
              }`}
            >
              <input
                type="radio"
                name="idRoute"
                value="alternative_route"
                required
                checked={idRoute === 'alternative_route'}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? 'idRoute-error' : undefined}
                onChange={() => updateFormData('idRoute', 'alternative_route')}
                className="mt-1 h-4 w-4 accent-blue-600"
              />
              <span>
                <span className="block font-semibold text-white">Alternative Vouched Route</span>
                <span className="mt-1 block text-xs text-gray-300">Verify via a trusted proxy or alternative representative credential.</span>
              </span>
            </label>
          </div>
          {error && (
            <p id="idRoute-error" className="mt-3 text-sm text-red-400">
              {error}
            </p>
          )}
        </fieldset>
      ) : idRoute === 'standard_id' ? (
        <VoiceInput
          id="idNumber"
          label="ID Number / Reference"
          type="text"
          required
          placeholder="e.g. AAU/1234/20"
          value={formData.idDetails?.idNumber || ''}
          error={error}
          inputRef={inputRef}
          onReviewStateChange={onVoiceReviewStateChange}
          onChange={(value) =>
            updateFormData('idDetails', { ...formData.idDetails, idNumber: value })
          }
        />
      ) : (
        <VoiceInput
          id="proxyName"
          label="Trusted Proxy / Representative Name"
          type="text"
          required
          value={formData.idDetails?.proxyName || ''}
          error={error}
          inputRef={inputRef}
          onReviewStateChange={onVoiceReviewStateChange}
          onChange={(value) =>
            updateFormData('idDetails', { ...formData.idDetails, proxyName: value })
          }
        />
      )}
    </section>
  );
}