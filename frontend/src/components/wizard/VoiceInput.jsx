import { useEffect, useRef, useState } from 'react';
import TranscriptionReview from './TranscriptionReview';
import { useI18n } from '../../i18n/I18nContext';

export default function VoiceInput({
  value,
  onChange,
  label,
  id,
  placeholder,
  type,
  error = '',
  inputRef,
  onReviewStateChange,
  audioSrc,
  required = false,
}) {
  const [isListening, setIsListening] = useState(false);
  const [status, setStatus] = useState('');
  const [voiceError, setVoiceError] = useState('');
  const [isReviewing, setIsReviewing] = useState(false);
  const [pendingTranscript, setPendingTranscript] = useState('');
  const recognitionRef = useRef(null);
  const valueRef = useRef(value || '');
  const fieldRef = useRef(null);
  const voiceButtonRef = useRef(null);
  const focusAfterReviewRef = useRef(null);
  const { t, bcp47 } = useI18n();
  const isTextArea = type === 'textarea';
  const SpeechRecognition =
    typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition);
  const isSpeechRecognitionSupported = typeof SpeechRecognition === 'function';
  const errorId = `${id}-error`;
  const voiceErrorId = `${id}-voice-error`;
  const statusId = `${id}-voice-status`;
  const describedBy = [
    error ? errorId : null,
    voiceError ? voiceErrorId : null,
    status ? statusId : null,
    isSpeechRecognitionSupported ? null : voiceErrorId,
  ].filter(Boolean).join(' ') || undefined;

  useEffect(() => {
    valueRef.current = value || '';
  }, [value]);

  useEffect(() => {
    if (isReviewing || !focusAfterReviewRef.current) return;

    const target = focusAfterReviewRef.current === 'voice'
      ? voiceButtonRef.current
      : fieldRef.current;
    target?.focus();
    focusAfterReviewRef.current = null;
  }, [isReviewing]);

  useEffect(() => {
    return () => {
      const recognition = recognitionRef.current;
      recognitionRef.current = null;
      recognition?.abort?.();
    };
  }, []);

  const getRecognitionErrorMessage = (error) => {
    switch (error) {
      case 'not-allowed':
        return t('voice.permission');
      case 'service-not-allowed':
        return t('voice.service');
      case 'network':
        return t('voice.network');
      case 'no-speech':
        return t('voice.noSpeech');
      case 'audio-capture':
        return t('voice.audioCapture');
      case 'aborted':
        return t('voice.aborted');
      default:
        return t('voice.failed');
    }
  };

  const handleValueChange = (nextValue) => {
    valueRef.current = nextValue;
    onChange(nextValue);
  };

  const assignFieldRef = (element) => {
    fieldRef.current = element;
    if (typeof inputRef === 'function') {
      inputRef(element);
    } else if (inputRef) {
      inputRef.current = element;
    }
  };

  const closeReview = (focusTarget = 'field') => {
    focusAfterReviewRef.current = focusTarget;
    setIsReviewing(false);
    onReviewStateChange?.(false);
  };

  const startSpeechRecognition = () => {
    setVoiceError('');
    setStatus('');
    setPendingTranscript('');

    if (!isSpeechRecognitionSupported) {
      setVoiceError(t('voice.notSupported'));
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = bcp47;
      recognition.interimResults = false;
      recognition.continuous = false;
      let receivedResult = false;
      let receivedResultEvent = false;

      recognition.onresult = (event) => {
        if (recognitionRef.current !== recognition) return;

        receivedResultEvent = true;
        const transcript = Array.from(event.results || [])
          .map((result) => result[0]?.transcript?.trim() || '')
          .filter(Boolean)
          .join(' ');
        if (!transcript) {
          setVoiceError(t('voice.noSpeech'));
          setStatus('');
          return;
        }

        receivedResult = true;
        setVoiceError('');
        setStatus('');
        setPendingTranscript(transcript);
        setIsReviewing(true);
        onReviewStateChange?.(true);
      };
      recognition.onerror = (event) => {
        if (recognitionRef.current !== recognition) return;
        recognitionRef.current = null;
        setIsListening(false);
        setStatus('');
        if (receivedResult) return;
        setVoiceError(getRecognitionErrorMessage(event.error));
      };
      recognition.onend = () => {
        if (recognitionRef.current === recognition) {
          recognitionRef.current = null;
          setIsListening(false);
          if (receivedResult) {
            setStatus(t('voice.recognized'));
          } else if (!receivedResultEvent) {
            setStatus('');
            setVoiceError(t('voice.noSpeech'));
          }
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
      setIsListening(true);
      setStatus(t('voice.listening'));
    } catch (error) {
      recognitionRef.current = null;
      setIsListening(false);
      setStatus('');
      setVoiceError(t('voice.couldNotStart'));
      console.error('Unable to start speech recognition:', error);
    }
  };

  const stopCapture = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setStatus(t('voice.stopping'));
    }
  };

  const handleCapture = () => {
    if (isListening) {
      stopCapture();
      return;
    }
    startSpeechRecognition();
  };

  const handleConfirmTranscript = () => {
    const transcript = pendingTranscript.trim();
    if (!transcript) return;

    const currentValue = valueRef.current.trim();
    handleValueChange(currentValue ? `${currentValue} ${transcript}` : transcript);
    setPendingTranscript('');
    setStatus(t('voice.confirmed'));
    closeReview();
  };

  const handleContinueManually = () => {
    setPendingTranscript('');
    setStatus(t('voice.continuingTyped'));
    closeReview();
  };

  const handleRetryRecognition = () => {
    setPendingTranscript('');
    focusAfterReviewRef.current = 'voice';
    setIsReviewing(false);
    onReviewStateChange?.(false);
    startSpeechRecognition();
  };

  const sharedProps = {
    id,
    name: id,
    placeholder,
    value: value || '',
    ref: assignFieldRef,
    required,
    'aria-invalid': Boolean(error),
    'aria-describedby': describedBy,
    onChange: (event) => handleValueChange(event.target.value),
    className: `w-full bg-gray-950 border ${
      error ? 'border-red-400' : 'border-gray-500'
    } rounded-xl px-4 py-3 text-white focus:border-blue-500`,
  };

  return (
    <div>
      {isReviewing ? (
        <TranscriptionReview
          id={id}
          transcript={pendingTranscript}
          onTranscriptChange={setPendingTranscript}
          onRetry={handleRetryRecognition}
          onContinueManually={handleContinueManually}
          onConfirm={handleConfirmTranscript}
          existingText={valueRef.current}
          audioSrc={audioSrc}
        />
      ) : (
        <>
          <label htmlFor={id} className="block text-sm font-medium mb-2">
            {label}
            {required && <span aria-hidden="true"> {t('common.required')}</span>}
          </label>
          {isTextArea ? <textarea {...sharedProps} rows={3} /> : <input {...sharedProps} type={type} />}
          {error && (
            <p id={errorId} className="mt-2 text-sm text-red-400">
              {error}
            </p>
          )}

          {isSpeechRecognitionSupported ? (
            <div className="mt-3 flex flex-wrap items-end gap-3">
              <button
                ref={voiceButtonRef}
                type="button"
                onClick={handleCapture}
                aria-pressed={isListening}
                className="px-3 py-2 rounded-lg border border-gray-500 bg-gray-800 text-gray-200 hover:bg-gray-700"
              >
                {isListening ? t('voice.stop') : t('voice.speak')}
              </button>
            </div>
          ) : (
            <p id={voiceErrorId} className="mt-2 text-sm text-gray-300" role="status" aria-live="polite">
              {t('voice.notSupported')}
            </p>
          )}

          {status && (
            <p id={statusId} className="mt-2 text-sm text-gray-300" role="status" aria-live="polite">
              {status}
            </p>
          )}
          {voiceError && (
            <p id={voiceErrorId} className="mt-2 text-sm text-red-400" role="alert">
              {voiceError}
            </p>
          )}
        </>
      )}
    </div>
  );
}
