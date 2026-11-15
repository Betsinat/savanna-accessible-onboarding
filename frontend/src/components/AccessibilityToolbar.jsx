import React, { useEffect, useState } from 'react';
import { useI18n } from '../i18n/I18nContext';
import { usePersistentState } from '../hooks/userPersistentState';

const textSizes = ['normal', 'medium', 'large', 'extraLarge'];
const contrastLevels = ['standard', 'high'];

export default function AccessibilityToolbar() {
  const { lang, setLang, t, languages } = useI18n();
  const [savedTextSize, setTextSize] = usePersistentState(
    'savanna_accessibility_text_size',
    'normal'
  );
  const [savedContrast, setContrast] = usePersistentState(
    'savanna_accessibility_contrast',
    'standard'
  );
  const [showScreenReaderHelp, setShowScreenReaderHelp] = useState(false);

  const textSize = textSizes.includes(savedTextSize) ? savedTextSize : 'normal';
  const contrast = contrastLevels.includes(savedContrast)
    ? savedContrast
    : 'standard';

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove(
      'a11y-text-medium',
      'a11y-text-large',
      'a11y-text-extra-large'
    );
    if (textSize !== 'normal') {
      root.classList.add(
        `a11y-text-${textSize === 'extraLarge' ? 'extra-large' : textSize}`
      );
    }
    if (savedTextSize !== textSize) setTextSize(textSize);
  }, [savedTextSize, setTextSize, textSize]);

  useEffect(() => {
    document.documentElement.classList.toggle(
      'a11y-high-contrast',
      contrast === 'high'
    );
    if (savedContrast !== contrast) setContrast(contrast);
  }, [contrast, savedContrast, setContrast]);

  return (
    <aside
      aria-label={t('toolbar.label')}
      className="accessibility-toolbar fixed inset-x-0 bottom-0 z-50 border-t border-gray-600 bg-gray-900 text-white shadow-2xl"
    >
      <div className="mx-auto flex max-w-7xl flex-wrap items-end gap-4 p-4">
        <div className="flex min-w-32 flex-1 flex-col gap-1">
          <label htmlFor="accessibility-text-size" className="text-sm font-medium">
            {t('toolbar.textSize')}
          </label>
          <select
            id="accessibility-text-size"
            value={textSize}
            onChange={(event) => setTextSize(event.target.value)}
            className="min-h-11 w-full rounded-lg border border-gray-500 bg-gray-800 px-3 text-sm text-white"
          >
            {textSizes.map((size) => (
              <option key={size} value={size}>
                {t(`toolbar.textSizeOptions.${size}`)}
              </option>
            ))}
          </select>
        </div>

        <div className="flex min-w-32 flex-1 flex-col gap-1">
          <label htmlFor="accessibility-language" className="text-sm font-medium">
            {t('toolbar.language')}
          </label>
          <select
            id="accessibility-language"
            value={lang}
            onChange={(event) => setLang(event.target.value)}
            className="min-h-11 w-full rounded-lg border border-gray-500 bg-gray-800 px-3 text-sm text-white"
          >
            {languages.map((language) => (
              <option key={language.code} value={language.code} lang={language.code}>
                {language.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex min-w-36 flex-1 flex-col gap-1">
          <label htmlFor="accessibility-contrast" className="text-sm font-medium">
            {t('toolbar.contrast')}
          </label>
          <select
            id="accessibility-contrast"
            value={contrast}
            onChange={(event) => setContrast(event.target.value)}
            className="min-h-11 w-full rounded-lg border border-gray-500 bg-gray-800 px-3 text-sm text-white"
          >
            {contrastLevels.map((level) => (
              <option key={level} value={level}>
                {t(`toolbar.contrastOptions.${level}`)}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={() => setShowScreenReaderHelp((value) => !value)}
          className="min-h-11 rounded-lg border border-gray-500 bg-gray-800 px-3 py-2 text-sm font-medium text-gray-100 hover:bg-gray-700"
          aria-expanded={showScreenReaderHelp}
          aria-controls="screen-reader-help"
        >
          {showScreenReaderHelp ? t('toolbar.hideHelp') : t('toolbar.screenHelp')}
        </button>

        {showScreenReaderHelp && (
          <section
            id="screen-reader-help"
            role="region"
            aria-labelledby="screen-reader-help-title"
            className="w-full border-t border-gray-700 pt-3 text-sm text-gray-200"
          >
            <h3
              id="screen-reader-help-title"
              className="mb-2 font-semibold text-white"
            >
              {t('toolbar.keyboardGuide')}
            </h3>
            <ul className="space-y-2">
              <li><strong>Tab:</strong> {t('toolbar.tab')}</li>
              <li><strong>Shift + Tab:</strong> {t('toolbar.shiftTab')}</li>
              <li><strong>Arrow keys:</strong> {t('toolbar.arrows')}</li>
              <li><strong>Space:</strong> {t('toolbar.space')}</li>
              <li><strong>Enter or Space:</strong> {t('toolbar.enterSpace')}</li>
              <li><strong>{t('wizard.listen')}:</strong> {t('toolbar.listenHelp')}</li>
            </ul>
            <p className="mt-3 text-xs text-gray-300">
              {t('toolbar.screenReaderNote')}
            </p>
          </section>
        )}
      </div>
    </aside>
  );
}
