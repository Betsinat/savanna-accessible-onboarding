import React, { useEffect, useRef, useState } from 'react';
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
    Component: StepPersonal,
    props: { field: 'fullName' },
  },
  {
    id: 'phoneOrEmail',
    title: 'How can we reach you?',
    Component: StepPersonal,
    props: { field: 'phoneOrEmail' },
  },
  {
    id: 'idRoute',
    title: 'How would you like to verify your identity?',
    Component: StepIdentity,
    props: { mode: 'route' },
  },
  {
    id: 'identityDetails',
    title: 'What is your ID number or document reference?',
    Component: StepIdentity,
    props: { mode: 'details' },
  },
  {
    id: 'supportType',
    title: 'What kind of support would help you?',
    Component: StepSupport,
    props: { field: 'supportType' },
  },
  {
    id: 'preferredContactMethod',
    title: 'What is your preferred contact method?',
    Component: StepSupport,
    props: { field: 'preferredContactMethod' },
  },
  {
    id: 'additionalNotes',
    title: 'Would you like to add any notes?',
    Component: StepSupport,
    props: { field: 'additionalNotes' },
  },
  {
    id: 'accommodations',
    title: 'Which workplace accommodations would help you?',
    description: 'Optional. Select any that apply.',
    Component: StepAccommodations,
  },
  {
    id: 'consent',
    title: 'Do you consent to saving your information?',
    description: 'Consent is required to complete registration.',
    Component: StepConsent,
  },
  {
    id: 'review',
    title: 'Review your information.',
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

export default function Wizard({
  formData,
  updateFormData,
  onSuccess,
  sessionId,
  isAccessibilityTestMode = false
}) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const [validationError, setValidationError] = useState(null);
  const [submissionError, setSubmissionError] = useState('');
  const [isVoiceReviewOpen, setIsVoiceReviewOpen] = useState(false);
  const [testCompletionStatus, setTestCompletionStatus] = useState('');
  const [speechStatus, setSpeechStatus] = useState('');
  const headingRef = useRef(null);
  const invalidControlRef = useRef(null);
  const question = QUESTIONS[currentQuestionIndex];
  const QuestionComponent = question.Component;

  useEffect(() => {
    headingRef.current?.focus();
  }, [currentQuestionIndex]);

  useEffect(() => {
    if (validationError) {
      invalidControlRef.current?.focus();
    }
  }, [validationError]);

  useEffect(() => {
    if (isAccessibilityTestMode) {
      setIsSaving(false);
      setSaveStatus('');
      return undefined;
    }

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
  }, [currentQuestionIndex, formData, isAccessibilityTestMode, sessionId]);

  const handleBack = () => {
    setIsVoiceReviewOpen(false);
    setValidationError(null);
    setSubmissionError('');
    setTestCompletionStatus('');
    setCurrentQuestionIndex((index) => Math.max(index - 1, 0));
  };

  const handleContinue = async () => {
    if (isVoiceReviewOpen) return;

    const error = getValidationError(question.id, formData);
    if (error) {
      setSubmissionError('');
      setValidationError(error);
      if (question.id === 'review' && error.control === 'consentGiven') {
        setCurrentQuestionIndex(8);
      }
      return;
    }

    setValidationError(null);
    setTestCompletionStatus('');
    if (question.id !== 'review') {
      setCurrentQuestionIndex((index) => Math.min(index + 1, QUESTIONS.length - 1));
      return;
    }

    if (isAccessibilityTestMode) {
      setTestCompletionStatus('Accessibility test complete. No application was saved or submitted.');
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
    setTestCompletionStatus('');
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
  const questionTitle = question.id === 'identityDetails' && formData.idRoute === 'alternative_route'
    ? 'What is your trusted representative’s name?'
    : question.title;

  const handleReadQuestion = () => {
    setSpeechStatus('');
    speakText([questionTitle, question.description].filter(Boolean).join(' '), {
      onStart: () => setSpeechStatus('Reading question.'),
      onEnd: () => setSpeechStatus('Read-aloud finished.'),
      onError: () => setSpeechStatus('Unable to read this question aloud. Please try again.'),
      onUnavailable: () => setSpeechStatus('Read-aloud is not supported in this browser.'),
    });
  };

  const handleStopSpeech = () => {
    const stopped = stopSpeech();
    setSpeechStatus(
      stopped ? 'Read-aloud stopped.' : 'Speech synthesis is not available in this browser.'
    );
  };

  return (
    <div className="min-h-screen bg-[#0b0e14] text-white flex flex-col justify-between selection:bg-blue-500 selection:text-white">
      {isAccessibilityTestMode && (
        <div
          className="mx-auto mt-4 w-full max-w-3xl px-6"
          role="status"
          aria-label="Accessibility testing mode"
        >
          <div className="rounded-lg border border-amber-500 bg-amber-950/60 p-4 text-amber-100">
            <p className="font-bold">Development accessibility test mode</p>
            <p className="mt-1 text-sm">
              Answers are temporary. Progress is not saved and completing this wizard will not submit an application.
            </p>
          </div>
        </div>
      )}
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
          <p className="text-xs text-gray-400 font-mono mt-0.5">Session ID: {sessionId}</p>
        </div>
        <div className="text-right">
          <div className="flex justify-end gap-2 mb-2">
            <button
              type="button"
              onClick={handleReadQuestion}
              className="text-xs font-medium px-2 py-1 rounded-lg border border-gray-500 bg-gray-800 text-gray-300 hover:bg-gray-700"
            >
              Read this question
            </button>
            <button
              type="button"
              onClick={handleStopSpeech}
              className="text-xs font-medium px-2 py-1 rounded-lg border border-gray-500 bg-gray-800 text-gray-300 hover:bg-gray-700"
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
          {speechStatus && (
            <p className="text-xs text-gray-300 mt-1.5" role="status" aria-live="polite">
              {speechStatus}
            </p>
          )}
        </div>
      </header>

      <section
        aria-labelledby="wizard-question-heading"
        className="w-full max-w-3xl mx-auto px-6 my-auto py-6"
      >
        <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-800/80 rounded-3xl p-8 md:p-10 shadow-2xl shadow-black/50 ring-1 ring-white/5">
          <h1 id="wizard-question-heading" ref={headingRef} tabIndex={-1} className="text-2xl font-bold mb-2">
            {questionTitle}
          </h1>
          {question.description && (
            <p className="text-gray-400 mb-6">{question.description}</p>
          )}
          <QuestionComponent
            {...question.props}
            formData={formData}
            updateFormData={handleFormDataChange}
            error={activeError}
            inputRef={invalidControlRef}
            onVoiceReviewStateChange={setIsVoiceReviewOpen}
          />

          {submissionError && (
            <p className="text-red-400 text-sm font-medium mt-4" role="alert">
              {submissionError}
            </p>
          )}
          {testCompletionStatus && (
            <p className="text-amber-200 text-sm font-medium mt-4" role="status">
              {testCompletionStatus}
            </p>
          )}

          <div className="flex justify-between gap-4 mt-8">
            <button
              type="button"
              onClick={handleBack}
              disabled={currentQuestionIndex === 0 || isSubmitting}
              className="px-6 py-3 rounded-xl border border-gray-500 font-semibold bg-gray-800 text-white hover:bg-gray-700 disabled:cursor-not-allowed disabled:text-gray-400"
            >
              Back
            </button>
            <button
              type="button"
              onClick={handleContinue}
              disabled={isSubmitting || isVoiceReviewOpen}
              className="px-8 py-3 rounded-xl font-bold bg-blue-600 text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-gray-700 disabled:text-gray-300"
            >
              {isSubmitting
                ? 'Submitting...'
                : question.id === 'review'
                  ? isAccessibilityTestMode
                    ? 'Finish test (no submission)'
                    : 'Complete Registration'
                  : 'Continue'}
            </button>
          </div>
        </div>
      </section>

      <footer className="w-full max-w-3xl mx-auto px-6 py-6 flex flex-col md:flex-row justify-between items-center gap-2 border-t border-gray-800/60 text-xs text-gray-400">
        <div className="flex items-center gap-1.5 text-emerald-400/90">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" aria-hidden="true" />
          Zero-Timeout Offline-First Sync Active
        </div>
      </footer>
    </div>
  );
}
