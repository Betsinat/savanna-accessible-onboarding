import React, { useState, useEffect } from 'react';
import { usePersistentState } from '../hooks/userPersistentState';
import { saveOnboardingDraft } from '../services/api';
import StepPersonal from './steps/StepPersonal';

export default function Wizard() {
  const [sessionId] = usePersistentState('savanna_session_id', `session-${Date.now()}`);
  const [currentStep, setCurrentStep] = usePersistentState('savanna_current_step', 1);
  const [formData, setFormData] = usePersistentState('savanna_form_data', {});
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');

  // Background auto-save simulation
  useEffect(() => {
    const autoSave = async () => {
      setIsSaving(true);
      try {
        await saveOnboardingDraft({
          sessionId,
          currentStep,
          formData,
          requestSmsLink: false,
        });
        setSaveStatus('Progress saved');
      } catch (err) {
        setSaveStatus('Working offline (saved locally)');
      } finally {
        setIsSaving(false);
      }
    };

    const timer = setTimeout(autoSave, 1000);
    return () => clearTimeout(timer);
  }, [sessionId, currentStep, formData]);

  const updateFormData = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleNext = () => {
    setCurrentStep((prev) => Math.min(prev + 1, 4));
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  return (
    <div className="min-h-screen bg-[#0f1117] text-white flex flex-col justify-between p-6 md:p-12">
      {/* Top Header */}
      <header className="w-full max-w-3xl mx-auto flex justify-between items-center border-b border-gray-800 pb-4">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-blue-400">Savanna Onboarding</h1>
          <p className="text-xs text-gray-500 font-mono">Session: {sessionId}</p>
        </div>
        <div className="text-right">
          <span className="text-sm font-medium text-gray-400">Step {currentStep} of 4</span>
          <p className="text-xs text-emerald-400">{isSaving ? 'Saving...' : saveStatus}</p>
        </div>
      </header>

      {/* Main Dynamic Step Container */}
      <main className="w-full max-w-3xl mx-auto my-auto bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-2xl">
        {currentStep === 1 && (
          <StepPersonal
            formData={formData}
            updateFormData={updateFormData}
            onNext={handleNext}
          />
        )}
        {currentStep === 2 && (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-2">Step 2: Alternative Identity Route</h2>
            <p className="text-gray-400">Coming up next!</p>
            <button
              onClick={handleBack}
              className="mt-6 px-6 py-2 bg-gray-800 rounded-xl hover:bg-gray-700"
            >
              Back
            </button>
          </div>
        )}
        {currentStep === 3 && (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-2">Step 3: Confidential Support</h2>
            <p className="text-gray-400">Coming up next!</p>
            <button
              onClick={handleBack}
              className="mt-6 px-6 py-2 bg-gray-800 rounded-xl hover:bg-gray-700"
            >
              Back
            </button>
          </div>
        )}
        {currentStep === 4 && (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-2">Step 4: Review & Submit</h2>
            <p className="text-gray-400">Coming up next!</p>
            <button
              onClick={handleBack}
              className="mt-6 px-6 py-2 bg-gray-800 rounded-xl hover:bg-gray-700"
            >
              Back
            </button>
          </div>
        )}
      </main>

      {/* Footer Info */}
      <footer className="w-full max-w-3xl mx-auto flex justify-between items-center pt-4 border-t border-gray-800">
        <div className="text-xs text-gray-500 font-mono">
          Form Data State: {JSON.stringify(formData)}
        </div>
        <div className="text-xs text-gray-500">
          Zero-Timeout Offline-First Sync Active
        </div>
      </footer>
    </div>
  );
}``