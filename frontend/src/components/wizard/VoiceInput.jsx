import { useEffect, useRef, useState } from 'react';
import TranscriptionReview from './TranscriptionReview';

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
  const [selectedLang, setSelectedLang] = useState('en-US');
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
        return 'Microphone permission was denied or blocked. Check your browser permissions and try again, or type your answer.';
      case 'service-not-allowed':
        return 'The speech recognition service is blocked or unavailable. Please try again later, or type your answer.';
      case 'network':
        return 'A network error interrupted speech recognition. Check your connection and try again, or type your answer.';
      case 'no-speech':
        return 'No speech was recognized. Please try again, or type your answer.';
      case 'audio-capture':
        return 'A microphone could not be accessed. Check your microphone and browser permissions, or type your answer.';
      case 'aborted':
        return 'Speech recognition was stopped. You can try again or type your answer.';
      default:
        return 'Speech recognition failed. Please try again, or type your answer.';
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
      setVoiceError('Speech-to-text is not supported in this browser. You can type your answer.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = selectedLang;
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
          setVoiceError('No speech was recognized. Please try again, or type your answer.');
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
            setStatus('Speech recognized.');
          } else if (!receivedResultEvent) {
            setStatus('');
            setVoiceError('No speech was recognized. Please try again, or type your answer.');
          }
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
      setIsListening(true);
      setStatus('Listening...');
    } catch (error) {
      recognitionRef.current = null;
      setIsListening(false);
      setStatus('');
      setVoiceError('Could not start speech recognition. Check your microphone permissions and try again, or type your answer.');
      console.error('Unable to start speech recognition:', error);
    }
  };

  const stopCapture = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setStatus('Stopping speech recognition...');
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
    setStatus('Transcription confirmed. You can continue when ready.');
    closeReview();
  };

  const handleContinueManually = () => {
    setPendingTranscript('');
    setStatus('Continuing with your typed answer. The transcription was not added.');
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
            {required && <span aria-hidden="true"> (required)</span>}
          </label>
          {isTextArea ? <textarea {...sharedProps} rows={3} /> : <input {...sharedProps} type={type} />}
          {error && (
            <p id={errorId} className="mt-2 text-sm text-red-400">
              {error}
            </p>
          )}

          {isSpeechRecognitionSupported ? (
            <div className="mt-3 flex flex-wrap items-end gap-3">
              <div>
                <label htmlFor={`${id}-voice-language`} className="block text-sm font-medium mb-1">
                  Voice input language
                </label>
                <select
                  id={`${id}-voice-language`}
                  value={selectedLang}
                  onChange={(event) => setSelectedLang(event.target.value)}
                  disabled={isListening}
                  className="bg-gray-950 border border-gray-500 rounded-lg px-3 py-2 text-white"
                >
                  <option value="en-US">English</option>
                  <option value="am-ET">Amharic</option>
                </select>
              </div>
              <button
                ref={voiceButtonRef}
                type="button"
                onClick={handleCapture}
                aria-pressed={isListening}
                className="px-3 py-2 rounded-lg border border-gray-500 bg-gray-800 text-gray-200 hover:bg-gray-700"
              >
                {isListening ? 'Stop listening' : voiceError ? 'Try voice input again' : 'Use voice input'}
              </button>
            </div>
          ) : (
            <p id={voiceErrorId} className="mt-2 text-sm text-gray-300" role="status" aria-live="polite">
              Speech-to-text is not supported in this browser. You can type your answer.
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
