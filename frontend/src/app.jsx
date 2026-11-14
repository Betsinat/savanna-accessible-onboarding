import React, { useState } from 'react';
import { usePersistentState } from './hooks/userPersistentState';

const QUESTIONS = [
  {
    id: 'fullName',
    title: 'What is your full name?',
    subtitle: 'Please enter your name as it appears on any document or your preferred name.',
    type: 'text',
    placeholder: 'e.g., Abebe Kebede',
  },
  {
    id: 'phoneOrEmail',
    title: 'How can we reach you?',
    subtitle: 'We will send your resume link and updates here.',
    type: 'text',
    placeholder: 'Phone number or email address',
  },
  {
    id: 'idRoute',
    title: 'How would you like to verify your identity?',
    subtitle: 'We support standard IDs, refugee IDs, alternative documents, or partner referrals.',
    type: 'select',
    options: [
      { label: 'Standard National ID / Passport', value: 'standard_id' },
      { label: 'Refugee ID Document', value: 'refugee_id' },
      { label: 'Alternative Supporting Document', value: 'alternative_doc' },
      { label: 'Refer me through a Partner (e.g., AAAPD)', value: 'partner_referral' },
    ],
  },
];

export default function App() {
  const [currentStep, setCurrentStep] = usePersistentState('savanna_step', 0);
  const [formData, setFormData] = usePersistentState('savanna_form_data', {});
  const [error, setError] = useState('');

  const currentQuestion = QUESTIONS[currentStep];

  const handleInputChange = (value) => {
    setFormData((prev) => ({ ...prev, [currentQuestion.id]: value }));
    if (error) setError('');
  };

  const handleNext = () => {
    const value = formData[currentQuestion.id];
    if (!value || value.trim() === '') {
      setError('Please provide an answer before continuing to the next step.');
      return;
    }
    if (currentStep < QUESTIONS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      alert('Onboarding section complete! Ready for voice and support integration.');
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
      setError('');
    }
  };

  return (
    <main className="min-h-screen bg-[#111318] text-white flex flex-col justify-between p-6 md:p-12">
      {/* Header / Progress */}
      <header className="w-full max-w-2xl mx-auto flex justify-between items-center border-b border-gray-800 pb-4">
        <h1 className="text-xl font-bold tracking-wide text-blue-400">Savanna Accessible Onboarding</h1>
        <span className="text-sm text-gray-400">
          Step {currentStep + 1} of {QUESTIONS.length}
        </span>
      </header>

      {/* Wizard Card (One Question Per Screen) */}
      <section className="w-full max-w-2xl mx-auto my-auto bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-2xl">
        <h2 className="text-2xl md:text-3xl font-extrabold mb-3">{currentQuestion.title}</h2>
        <p className="text-gray-400 text-sm md:text-base mb-6">{currentQuestion.subtitle}</p>

        {/* Input Field Rendering */}
        {currentQuestion.type === 'text' && (
          <input
            type="text"
            className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-3 text-white text-lg focus:outline-none focus:border-blue-500 transition-all"
            placeholder={currentQuestion.placeholder}
            value={formData[currentQuestion.id] || ''}
            onChange={(e) => handleInputChange(e.target.value)}
            autoFocus
          />
        )}

        {currentQuestion.type === 'select' && (
          <div className="flex flex-col gap-3">
            {currentQuestion.options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleInputChange(opt.value)}
                className={`w-full text-left px-5 py-4 rounded-xl border transition-all text-base font-medium ${
                  formData[currentQuestion.id] === opt.value
                    ? 'border-blue-500 bg-blue-950/40 text-blue-300'
                    : 'border-gray-800 bg-gray-950 text-gray-300 hover:border-gray-600'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}

        {/* Plain-Language Error Message */}
        {error && (
          <p className="mt-4 text-red-400 text-sm font-medium flex items-center gap-2" role="alert">
            ⚠️ {error}
          </p>
        )}
      </section>

      {/* Navigation Controls */}
      <footer className="w-full max-w-2xl mx-auto flex justify-between items-center pt-4 border-t border-gray-800">
        <button
          onClick={handleBack}
          disabled={currentStep === 0}
          className={`px-6 py-3 rounded-xl font-semibold transition-all ${
            currentStep === 0
              ? 'opacity-40 cursor-not-allowed bg-gray-800 text-gray-500'
              : 'bg-gray-800 text-white hover:bg-gray-700'
          }`}
        >
          Back
        </button>

        <button
          onClick={handleNext}
          className="px-8 py-3 rounded-xl font-bold bg-blue-600 text-white hover:bg-blue-500 transition-all shadow-lg shadow-blue-900/40"
        >
          {currentStep === QUESTIONS.length - 1 ? 'Review & Submit' : 'Next Question'}
        </button>
      </footer>
    </main>
  );
}