import VoiceInput from '../wizard/VoiceInput';

export default function StepIdentity({ mode, formData, updateFormData, error, inputRef }) {
  const idRoute = formData.idRoute || '';

  return (
    <section>
      {mode === 'route' ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              ref={inputRef}
              type="button"
              onClick={() => updateFormData('idRoute', 'standard_id')}
              aria-pressed={idRoute === 'standard_id'}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? 'idRoute-error' : undefined}
              className={`p-4 rounded-xl border text-left transition-all ${
                idRoute === 'standard_id'
                  ? 'bg-blue-600/20 border-blue-500 text-white'
                  : 'bg-gray-950 border-gray-800 text-gray-400 hover:border-gray-700'
              }`}
            >
              <div className="font-semibold text-white">Standard ID Document</div>
              <div className="text-xs text-gray-400 mt-1">Enter your student ID, national ID, or passport reference.</div>
            </button>

            <button
              type="button"
              onClick={() => updateFormData('idRoute', 'alternative_route')}
              aria-pressed={idRoute === 'alternative_route'}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? 'idRoute-error' : undefined}
              className={`p-4 rounded-xl border text-left transition-all ${
                idRoute === 'alternative_route'
                  ? 'bg-blue-600/20 border-blue-500 text-white'
                  : 'bg-gray-950 border-gray-800 text-gray-400 hover:border-gray-700'
              }`}
            >
              <div className="font-semibold text-white">Alternative Vouched Route</div>
              <div className="text-xs text-gray-400 mt-1">Verify via a trusted proxy or alternative representative credential.</div>
            </button>
          </div>
          {error && (
            <p id="idRoute-error" className="mt-3 text-sm text-red-400" role="alert">
              {error}
            </p>
          )}
        </>
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
          placeholder="Enter proxy or contact name"
          value={formData.idDetails?.proxyName || ''}
          error={error}
          inputRef={inputRef}
          onChange={(value) =>
            updateFormData('idDetails', { ...formData.idDetails, proxyName: value })
          }
        />
      )}
    </section>
  );
}