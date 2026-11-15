import React, { useEffect, useRef, useState } from 'react';
import { registerCandidate, saveOnboardingDraft } from '../services/api';
import StepPersonal from './steps/StepPersonal';
import StepIdentity from './steps/StepIdentity';
import StepSupport from './steps/StepSupport';
import StepAccommodations from './steps/StepAccommodations';
import StepConsent from './steps/StepConsent';
import StepReview from './steps/StepReview';
import { speakText, stopSpeech } from '../utils/tts';
import { useI18n } from '../i18n/I18nContext';
import { normalizeEthiopianPhone } from '../utils/ethiopia';

const QUESTIONS = [
  {
    id: 'fullName',
    key: 'fullName',
    Component: StepPersonal,
    props: { field: 'fullName' },
  },
  {
    id: 'phoneOrEmail',
    key: 'contact',
    Component: StepPersonal,
    props: { field: 'phoneOrEmail' },
  },
  {
    id: 'idRoute',
    key: 'identityRoute',
    Component: StepIdentity,
    props: { mode: 'route' },
  },
  {
    id: 'identityDetails',
    key: 'identityDetails',
    Component: StepIdentity,
    props: { mode: 'details' },
  },
  {
    id: 'supportType',
    key: 'supportType',
    Component: StepSupport,
    props: { field: 'supportType' },
  },
  {
    id: 'preferredContactMethod',
    key: 'contactMethod',
    Component: StepSupport,
    props: { field: 'preferredContactMethod' },
  },
  {
    id: 'additionalNotes',
    key: 'notes',
    Component: StepSupport,
    props: { field: 'additionalNotes' },
  },
  {
    id: 'accommodations',
    key: 'accommodations',
    descriptionKey: 'wizard.questions.accommodations.description',
    Component: StepAccommodations,
  },
  {
    id: 'consent',
    key: 'consent',
    descriptionKey: 'wizard.questions.consent.description',
    Component: StepConsent,
  },
  {
    id: 'review',
    key: 'review',
    Component: StepReview,
  },
];

function isValidPhoneOrEmail(value) {
  if (typeof value !== 'string') return false;

  const normalized = value.trim();
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  return emailPattern.test(normalized) || normalizeEthiopianPhone(normalized) !== null;
}

function getValidationError(questionId, formData, t) {
  switch (questionId) {
    case 'fullName':
      return typeof formData.fullName === 'string' && formData.fullName.trim()
        ? null
        : { control: 'fullName', message: t('wizard.validation.name') };
    case 'phoneOrEmail': {
      const value = typeof formData.phoneOrEmail === 'string' ? formData.phoneOrEmail : '';
      if (!value.trim()) {
        return { control: 'phoneOrEmail', message: t('wizard.validation.contact') };
      }
      return isValidPhoneOrEmail(value)
        ? null
        : { control: 'phoneOrEmail', message: t('wizard.validation.contact') };
    }
    case 'idRoute':
      return ['national_id', 'refugee_id', 'other_document', 'partner_referral'].includes(formData.idRoute)
        ? null
        : { control: 'idRoute', message: t('wizard.validation.identity') };
    case 'identityDetails': {
      const identityDetails = formData.idDetails || {};
      const control = 'idNumber';
      const value = identityDetails.documentNumber;
      return value?.trim()
        ? null
        : { control, message: t('wizard.validation.identityDetails') };
    }
    case 'supportType':
      return formData.supportType?.trim()
        ? null
        : { control: 'supportType', message: t('wizard.validation.support') };
    case 'preferredContactMethod':
      return formData.preferredContactMethod
        ? null
        : { control: 'preferredContactMethod', message: t('wizard.validation.contactMethod') };
    case 'consent':
      return formData.consentGiven
        ? null
        : { control: 'consentGiven', message: t('wizard.validation.consent') };
    case 'review':
      return formData.consentGiven
        ? null
        : { control: 'consentGiven', message: t('wizard.validation.consent') };
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
  const { t, lang, bcp47, simpleWords } = useI18n();
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
  const questions = formData.idRoute === 'partner_referral'
    ? QUESTIONS.filter((item) => item.id !== 'identityDetails')
    : QUESTIONS;
  const question = questions[currentQuestionIndex];
  const QuestionComponent = question.Component;
  const questionTitleKey = question.id === 'identityDetails' && formData.idRoute === 'partner_referral'
    ? 'wizard.questions.proxyName'
    : `wizard.questions.${question.key}`;
  const questionTitle = t(`${questionTitleKey}.${simpleWords ? 'simpleLabel' : 'label'}`);
  const questionDescription = question.descriptionKey ? t(question.descriptionKey) : '';

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
        setSaveStatus(t('wizard.saveComplete'));
      } catch (err) {
        setSaveStatus(t('wizard.saveOffline'));
      } finally {
        setIsSaving(false);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [currentQuestionIndex, formData, isAccessibilityTestMode, sessionId, t]);

  const handleBack = () => {
    setIsVoiceReviewOpen(false);
    setValidationError(null);
    setSubmissionError('');
    setTestCompletionStatus('');
    setCurrentQuestionIndex((index) => Math.max(index - 1, 0));
  };

  const handleContinue = async () => {
    if (isVoiceReviewOpen) return;

    const error = getValidationError(question.id, formData, t);
    if (error) {
      setSubmissionError('');
      setValidationError(error);
      if (question.id === 'review' && error.control === 'consentGiven') {
        setCurrentQuestionIndex(questions.findIndex((item) => item.id === 'consent'));
      }
      return;
    }

    setValidationError(null);
    setTestCompletionStatus('');
    if (question.id === 'phoneOrEmail' && !formData.phoneOrEmail.includes('@')) {
      updateFormData('phoneOrEmail', normalizeEthiopianPhone(formData.phoneOrEmail));
    }
    if (question.id !== 'review') {
      setCurrentQuestionIndex((index) => Math.min(index + 1, questions.length - 1));
      return;
    }

    if (isAccessibilityTestMode) {
      setTestCompletionStatus(t('wizard.testComplete'));
      return;
    }

    setIsSubmitting(true);
    try {
      await registerCandidate({
        sessionId,
        fullName: formData.fullName,
        phoneOrEmail: formData.phoneOrEmail,
        idRoute: formData.idRoute || 'national_id',
        idDetails: {
          documentNumber: formData.idDetails?.documentNumber || '',
        },
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
      setSubmissionError(t('wizard.submitError'));
      setIsSubmitting(false);
    }
  };

  const handleFormDataChange = (key, value) => {
    updateFormData(key, value);
    setValidationError(null);
    setSubmissionError('');
    setTestCompletionStatus('');
  };

  const progressPercentage = ((currentQuestionIndex + 1) / questions.length) * 100;
  const activeErrorControl = question.id === 'identityDetails'
    ? 'idNumber'
    : question.id === 'consent'
      ? 'consentGiven'
      : question.id;
  const activeError = validationError?.control === activeErrorControl
    ? validationError.message
    : '';
  const handleReadQuestion = () => {
    setSpeechStatus('');
    speakText([questionTitle, questionDescription].filter(Boolean).join(' '), {
      lang,
      bcp47,
      stepId: question.id,
      onStart: () => setSpeechStatus(t('wizard.speechReading')),
      onEnd: () => setSpeechStatus(t('wizard.speechDone')),
      onError: () => setSpeechStatus(t('wizard.speechError')),
      onUnavailable: () => setSpeechStatus(t('wizard.speechUnavailable')),
    });
  };

  const handleStopSpeech = () => {
    const stopped = stopSpeech();
    setSpeechStatus(
      stopped ? t('wizard.speechStopped') : t('wizard.speechStopUnavailable')
    );
  };

  return (
    <div className="min-h-screen bg-[#0b0e14] text-white flex flex-col justify-between selection:bg-blue-500 selection:text-white">
      {isAccessibilityTestMode && (
        <div
          className="mx-auto mt-4 w-full max-w-3xl px-6"
          role="status"
          aria-label={t('app.testMode')}
        >
          <div className="rounded-lg border border-amber-500 bg-amber-950/60 p-4 text-amber-100">
            <p className="font-bold">{t('app.testModeTitle')}</p>
            <p className="mt-1 text-sm">
              {t('app.testModeMessage')}
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
              {t('wizard.title')}
            </p>
          </div>
          <p className="text-xs text-gray-400 font-mono mt-0.5">
            {t('wizard.session', { id: sessionId })}
          </p>
        </div>
        <div className="text-end">
          <div className="flex justify-end gap-2 mb-2">
            <button
              type="button"
              onClick={handleReadQuestion}
              className="text-xs font-medium px-2 py-1 rounded-lg border border-gray-500 bg-gray-800 text-gray-300 hover:bg-gray-700"
            >
              {t('wizard.listen')}
            </button>
            <button
              type="button"
              onClick={handleStopSpeech}
              className="text-xs font-medium px-2 py-1 rounded-lg border border-gray-500 bg-gray-800 text-gray-300 hover:bg-gray-700"
            >
              {t('wizard.stopSpeaking')}
            </button>
          </div>
          <p aria-live="polite" aria-atomic="true" className="text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full bg-gray-900 border border-gray-800 text-gray-300">
            {t('wizard.progress', { step: currentQuestionIndex + 1, total: questions.length })}
          </p>
          <p className="text-xs text-emerald-400 mt-1.5 font-medium" role="status">
            {isSaving ? t('wizard.saveSyncing') : saveStatus}
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
          {questionDescription && (
            <p className="text-gray-400 mb-6">{questionDescription}</p>
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
              {t('wizard.back')}
            </button>
            <button
              type="button"
              onClick={handleContinue}
              disabled={isSubmitting || isVoiceReviewOpen}
              className="px-8 py-3 rounded-xl font-bold bg-blue-600 text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-gray-700 disabled:text-gray-300"
            >
              {isSubmitting
                ? t('wizard.submitting')
                : question.id === 'review'
                  ? isAccessibilityTestMode
                    ? t('wizard.finishTest')
                    : t('wizard.submit')
                  : t('wizard.continue')}
            </button>
          </div>
        </div>
      </section>

      <footer className="w-full max-w-3xl mx-auto px-6 py-6 flex flex-col md:flex-row justify-between items-center gap-2 border-t border-gray-800/60 text-xs text-gray-400">
        <div className="flex items-center gap-1.5 text-emerald-400/90">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" aria-hidden="true" />
          {t('wizard.footer')}
        </div>
      </footer>
    </div>
  );
}
