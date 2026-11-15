
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
      aria-label={t('toolbar.label')}
      className="fixed bottom-6 end-6 z-50 bg-gray-900/95 backdrop-blur-md border border-gray-700 p-3 rounded-2xl shadow-2xl flex flex-col gap-3 text-white"
    >
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs font-semibold px-2 text-blue-400 uppercase tracking-wider">
          {t('toolbar.title')}
        </span>
        <label htmlFor="lang-select" className="sr-only">
          {t('toolbar.language')}
        </label>
        <select
          id="lang-select"
          value={lang}
          onChange={(event) => setLang(event.target.value)}
          className="min-h-11 rounded-lg border border-gray-500 bg-gray-800 px-3 text-sm text-white"
        >
          {languages.map((language) => (
            <option key={language.code} value={language.code} lang={language.code}>
              {language.label}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={() => setSimpleWords(!simpleWords)}
          className={`border border-gray-500 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
            simpleWords
              ? 'bg-blue-600 text-white'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
          aria-pressed={simpleWords}
        >
          {simpleWords ? t('toolbar.simpleWordsOn') : t('toolbar.simpleWords')}
        </button>
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
          {highContrast ? t('toolbar.contrastOn') : t('toolbar.contrast')}
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
          {t('toolbar.largerText')}
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
          {showScreenReaderHelp ? t('toolbar.hideHelp') : t('toolbar.screenHelp')}
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
            {t('toolbar.keyboardGuide')}
          </h2>

          <ul className="space-y-2">
            <li>
              <strong>Tab:</strong> {t('toolbar.tab')}
            </li>
            <li>
              <strong>Shift + Tab:</strong> {t('toolbar.shiftTab')}
            </li>
            <li>
              <strong>Arrow keys:</strong> {t('toolbar.arrows')}
            </li>
            <li>
              <strong>Space:</strong> {t('toolbar.space')}
            </li>
            <li>
              <strong>Enter or Space:</strong> {t('toolbar.enterSpace')}
            </li>
            <li>
              <strong>{t('wizard.listen')}:</strong> {t('toolbar.listenHelp')}
            </li>
          </ul>

          <p className="mt-3 text-xs text-gray-400">
            {t('toolbar.screenReaderNote')}
          </p>
        </section>
      )}
    </aside>
  );
}
