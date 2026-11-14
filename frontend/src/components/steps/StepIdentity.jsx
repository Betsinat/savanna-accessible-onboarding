import VoiceInput from '../wizard/VoiceInput';

export default function StepIdentity({ mode, formData, updateFormData }) {
  const idRoute = formData.idRoute || '';
  return (
    <section>
      {mode === 'route' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => updateFormData('idRoute', 'standard_id')}
            aria-pressed={idRoute === 'standard_id'}
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
      ) : idRoute === 'standard_id' ? (
        <VoiceInput
          id="idNumber"
          label="ID Number / Reference"
          type="text"
          placeholder="e.g. AAU/1234/20"
          value={formData.idDetails?.idNumber || ''}
          onChange={(value) =>
            updateFormData('idDetails', { ...formData.idDetails, idNumber: value })
          }
        />
      ) : (
        <VoiceInput
          id="proxyName"
          label="Trusted Proxy / Representative Name"
          type="text"
          placeholder="Enter proxy or contact name"
          value={formData.idDetails?.proxyName || ''}
          onChange={(value) =>
            updateFormData('idDetails', { ...formData.idDetails, proxyName: value })
          }
        />
      )}
    </section>
  );
}