import React, { useState, useEffect } from 'react';
import { usePersistentState } from '../hooks/userPersistentState';
import { saveOnboardingDraft } from '../services/api';
import StepPersonal from './steps/StepPersonal';
import StepIdentity from './steps/StepIdentity';
import StepSupport from './steps/StepSupport';
import StepReview from './steps/StepReview';

export default function Wizard({ onSuccess }) {
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

  // Calculate progress percentage for the top progress bar
  const progressPercentage = (currentStep / 4) * 100;

  return (
    <div className="min-h-screen bg-[#0b0e14] text-white flex flex-col justify-between selection:bg-blue-500 selection:text-white">
      {/* Top Progress Bar */}
      <div className="w-full bg-gray-900 h-1.5">
        <div 
          className="bg-gradient-to-r from-blue-500 to-emerald-400 h-1.5 transition-all duration-500 ease-out"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      {/* Header Container */}
      <header className="w-full max-w-3xl mx-auto px-6 pt-8 pb-4 flex justify-between items-center border-b border-gray-800/60">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></span>
            <h1 className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
              Savanna Onboarding
            </h1>
          </div>
          <p className="text-xs text-gray-500 font-mono mt-0.5">Session ID: {sessionId}</p>
        </div>
        <div className="text-right">
          <span className="text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full bg-gray-900 border border-gray-800 text-gray-300">
            Step {currentStep} of 4
          </span>
          <p className="text-xs text-emerald-400 mt-1.5 font-medium">{isSaving ? 'Syncing...' : saveStatus}</p>
        </div>
      </header>

      {/* Main Glass/Card Container */}
      <main className="w-full max-w-3xl mx-auto px-6 my-auto py-6">
        <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-800/80 rounded-3xl p-8 md:p-10 shadow-2xl shadow-black/50 ring-1 ring-white/5">
          {currentStep === 1 && (
            <StepPersonal
              formData={formData}
              updateFormData={updateFormData}
              onNext={handleNext}
            />
          )}
          
          {currentStep === 2 && (
            <StepIdentity
              formData={formData}
              updateFormData={updateFormData}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}

          {currentStep === 3 && (
            <StepSupport
              formData={formData}
              updateFormData={updateFormData}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}

          {currentStep === 4 && (
            <StepReview
              formData={formData}
              updateFormData={updateFormData}
              sessionId={sessionId}
              onBack={handleBack}
              onSuccess={onSuccess}
            />
          )}
        </div>
      </main>

      {/* Footer Info */}
      <footer className="w-full max-w-3xl mx-auto px-6 py-6 flex flex-col md:flex-row justify-between items-center gap-2 border-t border-gray-800/60 text-xs text-gray-500">
        <div className="font-mono truncate max-w-xs md:max-w-md">
          State: <span className="text-gray-400">{JSON.stringify(formData)}</span>
        </div>
        <div className="flex items-center gap-1.5 text-emerald-400/90">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          Zero-Timeout Offline-First Sync Active
        </div>
      </footer>
    </div>
  );
}