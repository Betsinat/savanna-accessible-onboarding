import { useEffect, useRef, useState } from 'react';

export default function VoiceInput({ value, onChange, label, id, placeholder, type }) {
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState('');
  const recognitionRef = useRef(null);
  const isTextArea = type === 'textarea';
  const SpeechRecognition =
    typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition);

  useEffect(() => () => recognitionRef.current?.stop(), []);

  const startListening = () => {
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = navigator.language || 'en-US';
    recognition.interimResults = false;
    recognition.continuous = false;
    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript;
      if (transcript) onChange(value ? `${value} ${transcript}` : transcript);
    };
    recognition.onerror = (event) => {
      setError(`Voice input unavailable: ${event.error}.`);
    };
    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };

    setError('');
    recognitionRef.current = recognition;
    setIsListening(true);
    recognition.start();
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
  };

  const sharedProps = {
    id,
    name: id,
    placeholder,
    value: value || '',
    onChange: (event) => onChange(event.target.value),
    className:
      'w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500',
  };

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium mb-2">
        {label}
      </label>
      {isTextArea ? <textarea {...sharedProps} rows={3} /> : <input {...sharedProps} type={type} />}
      {SpeechRecognition && (
        <button
          type="button"
          onClick={isListening ? stopListening : startListening}
          aria-pressed={isListening}
          className="mt-2 text-sm font-medium text-blue-300 hover:text-blue-200"
        >
          {isListening ? 'Stop voice input' : 'Use voice input'}
        </button>
      )}
      {error && (
        <p className="mt-2 text-sm text-red-400" role="status">
          {error}
        </p>
      )}
    </div>
  );
}
