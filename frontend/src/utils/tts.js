let currentUtterance = null;

const getSpeechSynthesis = () => {
  if (typeof window === 'undefined' || !window.speechSynthesis) return null;

  return {
    synthesis: window.speechSynthesis,
    Utterance: typeof window.SpeechSynthesisUtterance === 'function'
      ? window.SpeechSynthesisUtterance
      : null,
  };
};

export const speakText = (text, callbacks = {}) => {
  const speech = getSpeechSynthesis();
  if (!speech || !speech.Utterance) {
    console.warn('Text-to-speech is not supported in this browser.');
    callbacks.onUnavailable?.();
    return false;
  }

  if (typeof text !== 'string' || !text.trim()) {
    const error = new TypeError('Text-to-speech requires non-empty text.');
    callbacks.onError?.(error);
    return false;
  }

  stopSpeech();

  try {
    const utterance = new speech.Utterance(text.trim());
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.onstart = () => {
      if (currentUtterance === utterance) callbacks.onStart?.();
    };
    utterance.onend = () => {
      if (currentUtterance === utterance) {
        currentUtterance = null;
        callbacks.onEnd?.();
      }
    };
    utterance.onerror = (event) => {
      if (currentUtterance === utterance) {
        currentUtterance = null;
        console.error('Text-to-speech failed:', event);
        callbacks.onError?.(event);
      }
    };

    currentUtterance = utterance;
    speech.synthesis.speak(utterance);
    return true;
  } catch (error) {
    currentUtterance = null;
    console.error('Unable to start text-to-speech:', error);
    callbacks.onError?.(error);
    return false;
  }
};

export const stopSpeech = () => {
  const speech = getSpeechSynthesis();
  currentUtterance = null;

  if (!speech) return false;

  try {
    speech.synthesis.cancel();
    return true;
  } catch (error) {
    console.error('Unable to stop text-to-speech:', error);
    return false;
  }
};
