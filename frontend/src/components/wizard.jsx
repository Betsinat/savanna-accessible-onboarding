import React, { useState, useEffect } from 'react';
import { usePersistentState } from '../hooks/usePersistentState';
import { saveOnboardingDraft } from '../services/api';

export default function Wizard() {
  // Initialize or retrieve a persistent sessionId for this user
  const [sessionId] = usePersistentState('savanna_session_id', `session-${Date.now()}`);
  const [currentStep, setCurrentStep] = usePersistentState('savanna_current_step', 1);
  const [formData, setFormData] = usePersistentState('savanna_form_data', {});
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');

  // Background auto-save whenever step or form data changes
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
        console.error('Auto-save error:', err);
        setSaveStatus('Working offline (saved locally)');
      } finally {
        setIsSaving(false);
      }
    };

    const timer = setTimeout(autoSave, 1000); // Debounce save by 1 second
    return () => clearTimeout(timer);
  }, [sessionId, currentStep, formData]);

  const updateFormData = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="min-h-screen bg-[#0f1117] text-white flex flex-col justify-between p-6 md:p-12">
      {/* Top Header & Session Status */}
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

      {/* Main Wizard Dynamic Container */}
      <main className="w-full max-w-3xl mx-auto my-auto bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-2xl">
        <p className="text-gray-400 text-sm">
          Core wizard container initialized. Ready to load step components.
        </p>
        <p className="text-xs text-gray-500 mt-2">Current Form Data State: {JSON.stringify(formData)}</p>
      </main>

      {/* Navigation Footer */}
      <footer className="w-full max-w-3xl mx-auto flex justify-between items-center pt-4 border-t border-gray-800">
        <button
          onClick={() => setCurrentStep((prev) => Math.max(prev - 1, 1))}
          disabled={currentStep === 1}
          className="px-6 py-3 rounded-xl font-semibold bg-gray-800 text-white hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          Back
        </button>
        <button
          onClick={() => setCurrentStep((prev) => Math.min(prev + 1, 4))}
          className="px-8 py-3 rounded-xl font-bold bg-blue-600 text-white hover:bg-blue-500 transition-all shadow-lg shadow-blue-900/40"
        >
          Next Question
        </button>
      </footer>
    </div>
  );
}