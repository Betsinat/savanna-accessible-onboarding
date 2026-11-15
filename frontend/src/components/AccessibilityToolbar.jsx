import React, { useState, useEffect } from 'react';

export default function AccessibilityToolbar() {
  const [highContrast, setHighContrast] = useState(false);
  const [largeText, setLargeText] = useState(false);
  const [showScreenReaderHelp, setShowScreenReaderHelp] = useState(false);

  // Apply high contrast class to root document element
  useEffect(() => {
    if (highContrast) {
      document.documentElement.classList.add('contrast-more', 'invert', 'hue-rotate-180');
    } else {
      document.documentElement.classList.remove('contrast-more', 'invert', 'hue-rotate-180');
    }
  }, [highContrast]);

  // Apply large text class to root
  useEffect(() => {
    if (largeText) {
      document.documentElement.classList.add('text-lg');
    } else {
      document.documentElement.classList.remove('text-lg');
    }
  }, [largeText]);

  return (
    <aside 
      aria-label="Accessibility Toolbar" 
      className="fixed bottom-6 right-6 z-50 bg-gray-900/95 backdrop-blur-md border border-gray-700 p-3 rounded-2xl shadow-2xl flex items-center gap-2 text-white"
    >
      <span className="text-xs font-semibold px-2 text-blue-400 uppercase tracking-wider">A11y Tools</span>

      {/* High Contrast Toggle */}
      <button
        type="button"
        onClick={() => setHighContrast(!highContrast)}
        className={`border border-gray-500 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
          highContrast ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
        }`}
        aria-pressed={highContrast}
      >
        {highContrast ? 'High Contrast ON' : 'Contrast'}
      </button>

      {/* Font Size Toggle */}
      <button
        type="button"
        onClick={() => setLargeText(!largeText)}
        className={`border border-gray-500 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
          largeText ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
        }`}
        aria-pressed={largeText}
      >
        Larger text
      </button>

      {/* Screen Reader Helper Status */}
      <button
        type="button"
        onClick={() => setShowScreenReaderHelp((shown) => !shown)}
        className={`border border-gray-500 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
          showScreenReaderHelp ? 'bg-emerald-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
        }`}
        aria-expanded={showScreenReaderHelp}
        aria-controls="screen-reader-help"
      >
        Screen reader help
      </button>
      <p id="screen-reader-help" className="sr-only" role="status" aria-live="polite">
        {showScreenReaderHelp
          ? 'Form errors, voice input status, and question changes are announced as you use the application.'
          : ''}
      </p>
    </aside>
  );
}