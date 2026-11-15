let currentUtterance = null;
let currentAudio = null;

const getSpeechSynthesis = () => {
  if (typeof window === 'undefined' || !window.speechSynthesis) return null;

  return {
    synthesis: window.speechSynthesis,
    Utterance: typeof window.SpeechSynthesisUtterance === 'function'
      ? window.SpeechSynthesisUtterance
      : null,
  };
};

const findVoice = (voices, bcp47) => {
  const requested = bcp47.toLowerCase();
  const fallback = requested === 'so-et' ? 'so-so' : null;
  return voices.find((voice) => voice.lang.toLowerCase() === requested) ||
    voices.find((voice) => voice.lang.toLowerCase().startsWith(`${requested}-`)) ||
    (fallback
      ? voices.find((voice) => voice.lang.toLowerCase() === fallback)
      : undefined);
};

const playRecordedQuestion = (lang, stepId, callbacks) => {
  if (typeof Audio !== 'function') {
    callbacks.onUnavailable?.();
    return false;
  }

  const audio = new Audio(`/audio/${lang}/question-${stepId}.mp3`);
  currentAudio = audio;
  audio.onplay = () => {
    if (currentAudio === audio) callbacks.onStart?.();
  };
  audio.onended = () => {
    if (currentAudio === audio) {
      currentAudio = null;
      callbacks.onEnd?.();
    }
  };
  audio.onerror = (error) => {
    if (currentAudio === audio) {
      currentAudio = null;
      callbacks.onError?.(error);
    }
  };

  audio.play().catch((error) => {
    if (currentAudio === audio) {
      currentAudio = null;
      callbacks.onError?.(error);
    }
  });
  return true;
};

export const speakText = (text, options = {}) => {
  const {
    lang = 'en',
    bcp47 = 'en-US',
    stepId = 'question',
    ...callbacks
  } = options;
  const speech = getSpeechSynthesis();
  if (!speech || !speech.Utterance) {
    if (['am', 'om', 'ti', 'so', 'aa'].includes(lang)) {
      return playRecordedQuestion(lang, stepId, callbacks);
    }
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
  const voices = speech.synthesis.getVoices?.() || [];
  const voice = findVoice(voices, bcp47);
  if (!voice && ['am', 'om', 'ti', 'so', 'aa'].includes(lang)) {
    return playRecordedQuestion(lang, stepId, callbacks);
  }

  try {
    const utterance = new speech.Utterance(text.trim());
    utterance.lang = bcp47;
    if (voice) utterance.voice = voice;
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

  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }

  if (!speech) return true;

  try {
    speech.synthesis.cancel();
    return true;
  } catch (error) {
    console.error('Unable to stop text-to-speech:', error);
    return false;
  }
};
