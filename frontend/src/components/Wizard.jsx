import React, { useEffect, useRef, useState } from 'react';
import { usePersistentState } from '../hooks/userPersistentState';
import { registerCandidate, saveOnboardingDraft } from '../services/api';
import StepPersonal from './steps/StepPersonal';
import StepIdentity from './steps/StepIdentity';
import StepSupport from './steps/StepSupport';
import StepAccommodations from './steps/StepAccommodations';
import StepConsent from './steps/StepConsent';
import StepReview from './steps/StepReview';
import { speakText, stopSpeech } from '../utils/tts';

const QUESTIONS = [
  {
    id: 'fullName',
    title: 'What is your full name?',
    description: 'Enter the name you would like us to use.',
    Component: StepPersonal,
    props: { field: 'fullName' },
  },
  {
    id: 'phoneOrEmail',
    title: 'How can we reach you?',
    description: 'Provide a phone number or email address.',
    Component: StepPersonal,
    props: { field: 'phoneOrEmail' },
  },
  {
    id: 'idRoute',
    title: 'How would you like to verify your identity?',
    description: 'Choose one identity route.',
    Component: StepIdentity,
    props: { mode: 'route' },
  },
  {
    id: 'identityDetails',
    title: 'What is your identity document or representative detail?',
    description: 'Enter the detail for the identity route you selected.',
    Component: StepIdentity,
    props: { mode: 'details' },
  },
  {
    id: 'supportType',
    title: 'What kind of support would help you?',
    description: 'Choose the type of onboarding support you prefer.',
    Component: StepSupport,
    props: { field: 'supportType' },
  },
  {
    id: 'preferredContactMethod',
    title: 'How should we contact you?',
    description: 'Choose your preferred contact method.',
    Component: StepSupport,
    props: { field: 'preferredContactMethod' },
  },
  {
    id: 'additionalNotes',
    title: 'Would you like to share any additional notes?',
    description: 'This question is optional.',
    Component: StepSupport,
    props: { field: 'additionalNotes' },
  },
  {
    id: 'accommodations',
    title: 'Which workplace accommodations would help you?',
    description: 'Select any options that may be useful. This question is optional.',
    Component: StepAccommodations,
  },
  {
    id: 'consent',
    title: 'Do you consent to saving your onboarding information?',
    description: 'Consent is required to complete registration.',
    Component: StepConsent,
  },
  {
    id: 'review',
    title: 'Review your information before continuing.',
    description: 'Check the summary, then continue to complete registration.',
    Component: StepReview,
  },
];

function isValidPhoneOrEmail(value) {
  if (typeof value !== 'string') return false;

  const normalized = value.trim();
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const phonePattern = /^\+?[\d\s().-]+$/;
  const digitCount = normalized.replace(/\D/g, '').length;

  return emailPattern.test(normalized) ||
    (phonePattern.test(normalized) && digitCount >= 7 && digitCount <= 15);
}

function getInitialQuestionIndex(formData) {
  if (typeof formData.fullName !== 'string' || !formData.fullName.trim()) return 0;
  if (!formData.phoneOrEmail || !isValidPhoneOrEmail(formData.phoneOrEmail)) return 1;
  if (!['standard_id', 'alternative_route'].includes(formData.idRoute)) return 2;

  const identityDetails = formData.idDetails || {};
  const hasIdentityDetails = formData.idRoute === 'alternative_route'
    ? identityDetails.proxyName?.trim()
    : identityDetails.idNumber?.trim();
  if (!hasIdentityDetails) return 3;
  if (!formData.supportType?.trim()) return 4;
  if (!formData.preferredContactMethod) return 5;
  if (!formData.consentGiven) return 8;
  return 9;
}

function getValidationError(questionId, formData) {
  switch (questionId) {
    case 'fullName':
      return typeof formData.fullName === 'string' && formData.fullName.trim()
        ? null
        : { control: 'fullName', message: 'Please enter your full name.' };
    case 'phoneOrEmail': {
      const value = typeof formData.phoneOrEmail === 'string' ? formData.phoneOrEmail : '';
      if (!value.trim()) {
        return { control: 'phoneOrEmail', message: 'Please enter a phone number or email address.' };
      }
      return isValidPhoneOrEmail(value)
        ? null
        : { control: 'phoneOrEmail', message: 'Enter a valid email address or phone number.' };
    }
    case 'idRoute':
      return ['standard_id', 'alternative_route'].includes(formData.idRoute)
        ? null
        : { control: 'idRoute', message: 'Please choose an identity route.' };
    case 'identityDetails': {
      const identityDetails = formData.idDetails || {};
      const control = formData.idRoute === 'alternative_route' ? 'proxyName' : 'idNumber';
      const value = control === 'proxyName' ? identityDetails.proxyName : identityDetails.idNumber;
      return value?.trim()
        ? null
        : { control, message: 'Please provide the requested identity detail.' };
    }
    case 'supportType':
      return formData.supportType?.trim()
        ? null
        : { control: 'supportType', message: 'Please choose a support option.' };
    case 'preferredContactMethod':
      return formData.preferredContactMethod
        ? null
        : { control: 'preferredContactMethod', message: 'Please choose a preferred contact method.' };
    case 'consent':
      return formData.consentGiven
        ? null
        : { control: 'consentGiven', message: 'Please provide consent to continue.' };
    case 'review':
      return formData.consentGiven
        ? null
        : { control: 'consentGiven', message: 'Please provide consent to complete registration.' };
    default:
      return null;
  }
}

export default function Wizard({ formData, updateFormData, onSuccess, sessionId }) {
  const [storedQuestionIndex, setStoredQuestionIndex] = usePersistentState(
    'savanna_current_question',
    () => getInitialQuestionIndex(formData)
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const [validationError, setValidationError] = useState(null);
  const [submissionError, setSubmissionError] = useState('');
  const headingRef = useRef(null);
  const invalidControlRef = useRef(null);
  const currentQuestionIndex = Number.isInteger(storedQuestionIndex)
    ? Math.min(Math.max(storedQuestionIndex, 0), QUESTIONS.length - 1)
    : 0;
  const question = QUESTIONS[currentQuestionIndex];
  const QuestionComponent = question.Component;

  useEffect(() => {
    if (storedQuestionIndex !== currentQuestionIndex) {
      setStoredQuestionIndex(currentQuestionIndex);
    }
  }, [currentQuestionIndex, setStoredQuestionIndex, storedQuestionIndex]);

  useEffect(() => {
    headingRef.current?.focus();
  }, [currentQuestionIndex]);

  useEffect(() => {
    if (validationError) {
      invalidControlRef.current?.focus();
    }
  }, [validationError]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      setIsSaving(true);
      try {
        await saveOnboardingDraft({
          sessionId,
          currentStep: currentQuestionIndex + 1,
          formData,
          requestSmsLink: false,
        });
        setSaveStatus('Progress saved');
      } catch (err) {
        setSaveStatus('Working offline (saved locally)');
      } finally {
        setIsSaving(false);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [currentQuestionIndex, formData, sessionId]);

  const handleBack = () => {
    setValidationError(null);
    setSubmissionError('');
    setStoredQuestionIndex((index) => Math.max(index - 1, 0));
  };

  const handleContinue = async () => {
    const error = getValidationError(question.id, formData);
    if (error) {
      setSubmissionError('');
      setValidationError(error);
      if (question.id === 'review' && error.control === 'consentGiven') {
        setStoredQuestionIndex(8);
      }
      return;
    }

    setValidationError(null);
    if (question.id !== 'review') {
      setStoredQuestionIndex((index) => Math.min(index + 1, QUESTIONS.length - 1));
      return;
    }

    setIsSubmitting(true);
    try {
      await registerCandidate({
        sessionId,
        fullName: formData.fullName,
        phoneOrEmail: formData.phoneOrEmail,
        idRoute: formData.idRoute || 'standard_id',
        idDetails: formData.idDetails || {},
        supportType: formData.supportType || 'general_guidance',
        preferredContactMethod: formData.preferredContactMethod || 'phone',
        additionalNotes: formData.additionalNotes || '',
        consentGiven: Boolean(formData.consentGiven),
        accommodationPreferences: Array.isArray(formData.accommodationPreferences)
          ? formData.accommodationPreferences
          : [],
      });
      setIsSubmitting(false);
      onSuccess({ formData, sessionId });
    } catch (err) {
      console.error('Registration failed:', err);
      setSubmissionError('Failed to complete registration. Please check your connection and try again.');
      setIsSubmitting(false);
    }
  };

  const handleFormDataChange = (key, value) => {
    updateFormData(key, value);
    setValidationError(null);
    setSubmissionError('');
  };

  const progressPercentage = ((currentQuestionIndex + 1) / QUESTIONS.length) * 100;
  const activeErrorControl = question.id === 'identityDetails'
    ? (formData.idRoute === 'alternative_route' ? 'proxyName' : 'idNumber')
    : question.id === 'consent'
      ? 'consentGiven'
      : question.id;
  const activeError = validationError?.control === activeErrorControl
    ? validationError.message
    : '';

  return (
    <div className="min-h-screen bg-[#0b0e14] text-white flex flex-col justify-between selection:bg-blue-500 selection:text-white">
      <div className="w-full bg-gray-900 h-1.5" aria-hidden="true">
        <div
          className="bg-gradient-to-r from-blue-500 to-emerald-400 h-1.5 transition-all duration-500 ease-out"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      <header className="w-full max-w-3xl mx-auto px-6 pt-8 pb-4 flex justify-between items-center border-b border-gray-800/60">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" aria-hidden="true" />
            <p className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
              Savanna Onboarding
            </p>
          </div>
          <p className="text-xs text-gray-500 font-mono mt-0.5">Session ID: {sessionId}</p>
        </div>
        <div className="text-right">
          <div className="flex justify-end gap-2 mb-2">
            <button
              type="button"
              onClick={() => speakText(document.querySelector('main')?.innerText || '')}
              className="text-xs font-medium px-2 py-1 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700"
            >
              Read this question
            </button>
            <button
              type="button"
              onClick={stopSpeech}
              className="text-xs font-medium px-2 py-1 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700"
            >
              Stop speaking
            </button>
          </div>
          <p aria-live="polite" aria-atomic="true" className="text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full bg-gray-900 border border-gray-800 text-gray-300">
            Question {currentQuestionIndex + 1} of {QUESTIONS.length}
          </p>
          <p className="text-xs text-emerald-400 mt-1.5 font-medium" role="status">
            {isSaving ? 'Syncing...' : saveStatus}
          </p>
        </div>
      </header>

      <main className="w-full max-w-3xl mx-auto px-6 my-auto py-6">
        <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-800/80 rounded-3xl p-8 md:p-10 shadow-2xl shadow-black/50 ring-1 ring-white/5">
          <h1 ref={headingRef} tabIndex={-1} className="text-2xl font-bold mb-2">
            {question.id === 'identityDetails' && formData.idRoute === 'alternative_route'
              ? 'What is your trusted representative’s name?'
              : question.title}
          </h1>
          <p className="text-gray-400 mb-6">{question.description}</p>
          <QuestionComponent
            {...question.props}
            formData={formData}
            updateFormData={handleFormDataChange}
            error={activeError}
            inputRef={invalidControlRef}
          />

          {submissionError && (
            <p className="text-red-400 text-sm font-medium mt-4" role="alert">
              {submissionError}
            </p>
          )}

          <div className="flex justify-between gap-4 mt-8">
            <button
              type="button"
              onClick={handleBack}
              disabled={currentQuestionIndex === 0 || isSubmitting}
              className="px-6 py-3 rounded-xl font-semibold bg-gray-800 text-white hover:bg-gray-700 disabled:opacity-40"
            >
              Back
            </button>
            <button
              type="button"
              onClick={handleContinue}
              disabled={isSubmitting}
              className="px-8 py-3 rounded-xl font-bold bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting...' : 'Continue'}
            </button>
          </div>
        </div>
      </main>

      <footer className="w-full max-w-3xl mx-auto px-6 py-6 flex flex-col md:flex-row justify-between items-center gap-2 border-t border-gray-800/60 text-xs text-gray-500">
        <div className="font-mono truncate max-w-xs md:max-w-md">
          State: <span className="text-gray-400">{JSON.stringify(formData)}</span>
        </div>
        <div className="flex items-center gap-1.5 text-emerald-400/90">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" aria-hidden="true" />
          Zero-Timeout Offline-First Sync Active
        </div>
      </footer>
    </div>
  );
}
