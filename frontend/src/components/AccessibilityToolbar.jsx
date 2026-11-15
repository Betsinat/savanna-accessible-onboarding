
import React, { useState, useEffect } from 'react';
import { useI18n } from '../i18n/I18nContext';

export default function AccessibilityToolbar() {
  const { lang, setLang, t, languages, simpleWords, setSimpleWords } = useI18n();
  const [highContrast, setHighContrast] = useState(false);
  const [largeText, setLargeText] = useState(false);
  const [showScreenReaderHelp, setShowScreenReaderHelp] = useState(false);

  useEffect(() => {
    if (highContrast) {
      document.documentElement.classList.add(
        'contrast-more',
        'invert',
        'hue-rotate-180'
      );
    } else {
      document.documentElement.classList.remove(
        'contrast-more',
        'invert',
        'hue-rotate-180'
      );
    }
  }, [highContrast]);

  useEffect(() => {
    if (largeText) {
      document.documentElement.classList.add('text-lg');
    } else {
      document.documentElement.classList.remove('text-lg');
    }
  }, [largeText]);

  return (
    <aside
      aria-label="Accessibility tools"
      className="fixed bottom-6 right-6 z-50 bg-gray-900/95 backdrop-blur-md border border-gray-700 p-3 rounded-2xl shadow-2xl flex flex-col gap-3 text-white"
    >
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs font-semibold px-2 text-blue-400 uppercase tracking-wider">
          A11y Tools
        </span>

        <button
          type="button"
          onClick={() => setHighContrast((value) => !value)}
          className={`border border-gray-500 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
            highContrast
              ? 'bg-blue-600 text-white'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
          aria-pressed={highContrast}
        >
          {highContrast ? 'High Contrast ON' : 'Contrast'}
        </button>

        <button
          type="button"
          onClick={() => setLargeText((value) => !value)}
          className={`border border-gray-500 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
            largeText
              ? 'bg-blue-600 text-white'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
          aria-pressed={largeText}
        >
          Larger text
        </button>

        <button
          type="button"
          onClick={() => setShowScreenReaderHelp((value) => !value)}
          className={`border border-gray-500 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
            showScreenReaderHelp
              ? 'bg-emerald-600 text-white'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
          aria-expanded={showScreenReaderHelp}
          aria-controls="screen-reader-help"
        >
          {showScreenReaderHelp ? 'Hide help' : 'Screen reader help'}
        </button>
      </div>

      {showScreenReaderHelp && (
        <section
          id="screen-reader-help"
          role="region"
          aria-labelledby="screen-reader-help-title"
          className="max-w-sm border-t border-gray-700 pt-3 text-sm text-gray-200"
        >
          <h2
            id="screen-reader-help-title"
            className="font-semibold text-white mb-2"
          >
            Keyboard & Screen Reader Quick Guide
          </h2>

          <ul className="space-y-2">
            <li>
              <strong>Tab:</strong> Move to the next interactive control.
            </li>
            <li>
              <strong>Shift + Tab:</strong> Move to the previous control.
            </li>
            <li>
              <strong>Arrow keys:</strong> Move between options in a radio group.
            </li>
            <li>
              <strong>Space:</strong> Select a checkbox or radio option.
            </li>
            <li>
              <strong>Enter or Space:</strong> Activate a button.
            </li>
            <li>
              <strong>Read this question:</strong> Select the read-aloud button to hear the current question.
            </li>
          </ul>

          <p className="mt-3 text-xs text-gray-400">
            You can also use an installed screen reader such as NVDA or
            TalkBack. Screen reader navigation shortcuts may vary.
          </p>
        </section>
      )}
    </aside>
  );
}
