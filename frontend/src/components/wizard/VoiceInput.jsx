import { useEffect, useRef, useState } from 'react';

export default function VoiceInput({
  value,
  onChange,
  label,
  id,
  placeholder,
  type,
  error = '',
  inputRef,
  required = false,
  onVoiceNote,
}) {
  const [selectedLang, setSelectedLang] = useState('en-US');
  const [isListening, setIsListening] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [status, setStatus] = useState('');
  const [voiceError, setVoiceError] = useState('');
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState('');
  const recognitionRef = useRef(null);
  const recorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);
  const isTextArea = type === 'textarea';
  const SpeechRecognition =
    typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition);
  const supportsAudioRecorder =
    typeof navigator !== 'undefined' &&
    Boolean(navigator.mediaDevices?.getUserMedia) &&
    typeof MediaRecorder !== 'undefined';
  const errorId = `${id}-error`;
  const voiceErrorId = `${id}-voice-error`;
  const statusId = `${id}-voice-status`;
  const describedBy = [
    error ? errorId : null,
    voiceError ? voiceErrorId : null,
    status ? statusId : null,
  ].filter(Boolean).join(' ') || undefined;

  const stopMediaStream = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  };

  useEffect(() => {
    if (!SpeechRecognition && !supportsAudioRecorder) {
      setStatus('Voice capture is not supported in this browser. You can type your answer instead.');
    }

    return () => {
      recognitionRef.current?.abort?.();
      if (recorderRef.current?.state !== 'inactive') {
        recorderRef.current?.stop();
      }
      stopMediaStream();
    };
  }, []);

  useEffect(() => {
    if (!audioBlob) {
      setAudioUrl('');
      return undefined;
    }

    const url = URL.createObjectURL(audioBlob);
    setAudioUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [audioBlob]);

  const startAudioRecording = async (fallbackMessage = '') => {
    setStatus(fallbackMessage);
    setVoiceError('');

    if (!supportsAudioRecorder) {
      setVoiceError(
        `${fallbackMessage || 'Voice recording is unavailable.'} You can type your answer instead.`
      );
      setStatus('');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];

      const recorder = new MediaRecorder(stream);
      recorderRef.current = recorder;
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };
      recorder.onerror = () => {
        setIsRecording(false);
        setVoiceError('Audio recording failed. You can type your answer instead.');
        setStatus('');
        stopMediaStream();
      };
      recorder.onstop = () => {
        setIsRecording(false);
        recorderRef.current = null;
        stopMediaStream();

        const recording = new Blob(chunksRef.current, {
          type: recorder.mimeType || chunksRef.current[0]?.type || 'audio/webm',
        });
        chunksRef.current = [];

        if (recording.size === 0) {
          setVoiceError('No audio was captured. Please try again or type your answer.');
          setStatus('');
          return;
        }

        setAudioBlob(recording);
        onVoiceNote?.(recording);
        setStatus('Voice note recorded. You can play it back or download it.');
      };

      setAudioBlob(null);
      recorder.start();
      setIsRecording(true);
      setStatus('Recording voice note...');
    } catch (recordingError) {
      stopMediaStream();
      setIsRecording(false);
      setVoiceError('Unable to access the microphone or record audio. You can type your answer instead.');
      setStatus('');
      console.error('Unable to start audio recording:', recordingError);
    }
  };

  const startSpeechRecognition = () => {
    setVoiceError('');
    setStatus('');
    setAudioBlob(null);

    if (!SpeechRecognition) {
      void startAudioRecording('Speech recognition not supported, switched to audio recorder.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = selectedLang;
      recognition.interimResults = false;
      recognition.continuous = false;
      let receivedResult = false;

      recognition.onresult = (event) => {
        const transcript = event.results[0]?.[0]?.transcript;
        if (transcript) {
          receivedResult = true;
          onChange(value ? `${value} ${transcript}` : transcript);
          setStatus('Speech recognized.');
        }
      };
      recognition.onerror = (event) => {
        recognitionRef.current = null;
        setIsListening(false);
        void startAudioRecording(
          `Speech recognition failed${event.error ? ` (${event.error})` : ''}, switched to audio recorder.`
        );
      };
      recognition.onend = () => {
        if (recognitionRef.current === recognition) {
          recognitionRef.current = null;
          setIsListening(false);
          setStatus(receivedResult ? 'Speech recognized.' : 'Listening stopped.');
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
      setIsListening(true);
      setStatus('Listening...');
    } catch (recognitionError) {
      recognitionRef.current = null;
      setIsListening(false);
      void startAudioRecording('Speech recognition unavailable, switched to audio recorder.');
      console.error('Unable to start speech recognition:', recognitionError);
    }
  };

  const stopCapture = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setStatus('Stopping speech recognition...');
    } else if (isRecording && recorderRef.current?.state === 'recording') {
      recorderRef.current.stop();
    }
  };

  const handleCapture = () => {
    if (isListening || isRecording) {
      stopCapture();
      return;
    }
    startSpeechRecognition();
  };

  const sharedProps = {
    id,
    name: id,
    placeholder,
    value: value || '',
    ref: inputRef,
    required,
    'aria-required': required,
    'aria-invalid': Boolean(error),
    'aria-describedby': describedBy,
    onChange: (event) => onChange(event.target.value),
    className:
      'w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500',
  };

  const audioExtension = audioBlob?.type.split('/')[1]?.split(';')[0] || 'webm';

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium mb-2">
        {label}
      </label>
      {isTextArea ? <textarea {...sharedProps} rows={3} /> : <input {...sharedProps} type={type} />}
      {error && (
        <p id={errorId} className="mt-2 text-sm text-red-400" role="alert">
          {error}
        </p>
      )}

      <div className="mt-3 flex flex-wrap items-end gap-3">
        <div>
          <label htmlFor={`${id}-voice-language`} className="block text-sm font-medium mb-1">
            Voice input language
          </label>
          <select
            id={`${id}-voice-language`}
            value={selectedLang}
            onChange={(event) => setSelectedLang(event.target.value)}
            disabled={isListening || isRecording}
            className="bg-gray-950 border border-gray-700 rounded-lg px-3 py-2 text-white"
          >
            <option value="en-US">English</option>
            <option value="am-ET">Amharic</option>
          </select>
        </div>
        {(SpeechRecognition || supportsAudioRecorder) && (
          <button
            type="button"
            onClick={handleCapture}
            aria-pressed={isListening || isRecording}
            className="px-3 py-2 rounded-lg bg-gray-800 text-gray-200 hover:bg-gray-700"
          >
            {isListening
              ? 'Stop listening'
              : isRecording
                ? 'Stop recording'
                : SpeechRecognition
                  ? 'Use voice input'
                  : 'Record voice note'}
          </button>
        )}
      </div>

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
      {audioUrl && (
        <div className="mt-3 space-y-2">
          <audio controls src={audioUrl} aria-label={`${label} voice note preview`} />
          <a
            href={audioUrl}
            download={`${id}-voice-note.${audioExtension}`}
            className="block text-sm text-blue-300 underline"
          >
            Download voice note
          </a>
        </div>
      )}
    </div>
  );
}
