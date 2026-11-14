import React, { useState } from 'react';

export default function StepIdentity({ formData, updateFormData, onNext, onBack }) {
  const [error, setError] = useState('');
  
  const idRoute = formData.idRoute || 'standard_id';
  const idNumber = formData.idDetails?.idNumber || '';
  const proxyName = formData.idDetails?.proxyName || '';

  const handleNextClick = () => {
    if (idRoute === 'standard_id' && !idNumber.trim()) {
      setError('Please provide your ID number or document reference.');
      return;
    }
    if (idRoute === 'alternative_route' && !proxyName.trim()) {
      setError('Please provide the proxy or representative name.');
      return;
    }
    setError('');
    onNext();
  };

  return (
    <section>
      <h2 className="text-2xl font-bold mb-2">Alternative Identity Route</h2>
      <p className="text-gray-400 mb-6">
        Choose how you would like to complete your verification. We provide alternative routes to guarantee full accessibility.
      </p>

      <div className="space-y-6 mb-6">
        {/* Route Selection Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => {
              updateFormData('idRoute', 'standard_id');
              if (error) setError('');
            }}
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
            onClick={() => {
              updateFormData('idRoute', 'alternative_route');
              if (error) setError('');
            }}
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

        {/* Conditional Field Input */}
        {idRoute === 'standard_id' ? (
          <div>
            <label htmlFor="idNumber" className="block text-sm font-medium mb-2">
              ID Number / Reference <span className="text-blue-400">*</span>
            </label>
            <input
              id="idNumber"
              type="text"
              placeholder="e.g. AAU/1234/20"
              value={idNumber}
              onChange={(e) => {
                updateFormData('idDetails', { ...formData.idDetails, idNumber: e.target.value });
                if (error) setError('');
              }}
              className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
            />
          </div>
        ) : (
          <div>
            <label htmlFor="proxyName" className="block text-sm font-medium mb-2">
              Trusted Proxy / Representative Name <span className="text-blue-400">*</span>
            </label>
            <input
              id="proxyName"
              type="text"
              placeholder="Enter proxy or contact name"
              value={proxyName}
              onChange={(e) => {
                updateFormData('idDetails', { ...formData.idDetails, proxyName: e.target.value });
                if (error) setError('');
              }}
              className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
            />
          </div>
        )}
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