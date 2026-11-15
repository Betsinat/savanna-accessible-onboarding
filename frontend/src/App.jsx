
import React, { useState } from 'react';
import { useI18n } from './i18n/I18nContext';
import { usePersistentState } from './hooks/userPersistentState';
import AccessibilityToolbar from './components/AccessibilityToolbar';
import Track1Module from './components/Track1Module';
function createSessionId() {
  const cryptoApi = globalThis.crypto;

  if (!cryptoApi?.getRandomValues) {
    throw new Error(
      'Secure session ID generation is unavailable in this browser.'
    );
  }

  if (cryptoApi.randomUUID) {
    return `session-${cryptoApi.randomUUID()}`;
  }

  const bytes = cryptoApi.getRandomValues(new Uint8Array(16));

  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  const hex = Array.from(bytes, (byte) =>
    byte.toString(16).padStart(2, '0')
  ).join('');

  return `session-${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

const navigationItems = [
  { id: 'learner', label: 'app.learner' },
  { id: 'jobs', label: 'app.jobs' },
  { id: 'employer', label: 'app.employer' }
];

function getAccessibilityTestModeFromUrl() {
  if (!import.meta.env.DEV || typeof window === 'undefined') return false;
  return new URLSearchParams(window.location.search).get('a11yTest') === '1';
}

export default function App() {
  const { t } = useI18n();
  const [activeView, setActiveView] = useState('learner');
  const [isAccessibilityTestMode, setIsAccessibilityTestMode] = useState(
    getAccessibilityTestModeFromUrl
  );
  const [testFormData, setTestFormData] = useState({});
  const [testSessionId, setTestSessionId] = useState(() =>
    isAccessibilityTestMode ? createSessionId() : null
  );

  const [isRegistered, setIsRegistered] = usePersistentState(
    'savanna_completed',
    false,
    !isAccessibilityTestMode
  );

  const [formData, setFormData] = usePersistentState(
    'savanna_form_data',
    {},
    !isAccessibilityTestMode
  );

  const [sessionId, setSessionId] = usePersistentState(
    'savanna_session_id',
    createSessionId,
    !isAccessibilityTestMode
  );

  const updateFormData = (key, value) => {
    setFormData((previous) => ({
      ...previous,
      [key]: value
    }));
  };

  const updateTestFormData = (key, value) => {
    setTestFormData((previous) => ({
      ...previous,
      [key]: value
    }));
  };

  const toggleAccessibilityTestMode = () => {
    const nextMode = !isAccessibilityTestMode;
    const nextUrl = new URL(window.location.href);

    if (nextMode) {
      nextUrl.searchParams.set('a11yTest', '1');
      setTestFormData({});
      setTestSessionId(createSessionId());
    } else {
      nextUrl.searchParams.delete('a11yTest');
      setTestSessionId(null);
    }

    window.history.replaceState(
      window.history.state,
      '',
      `${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`
    );
    setActiveView('learner');
    setIsAccessibilityTestMode(nextMode);
  };

  const handleWizardSuccess = ({
    formData: completedFormData,
    sessionId: completedSessionId
  }) => {
    setFormData(completedFormData);
    setSessionId(completedSessionId);
    setIsRegistered(true);
    setActiveView('jobs');
  };

  return (
    <div className="min-h-screen bg-[#111318] text-white">
      <AccessibilityToolbar />

      <header className="sticky top-0 z-40 bg-[#111318]/95 backdrop-blur border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-xl font-extrabold tracking-wide">
                SAVANNA
              </p>
              <p className="text-xs text-gray-400">
                {t('app.tagline')}
              </p>
            </div>

            <nav
              aria-label={t('app.mainNavigation')}
              className="flex flex-wrap gap-2"
            >
              {navigationItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveView(item.id)}
                  aria-current={
                    activeView === item.id ? 'page' : undefined
                  }
                  className={`px-4 py-2.5 rounded-lg text-sm font-medium transition ${
                    activeView === item.id
                      ? 'bg-blue-600 text-white'
                      : 'border border-gray-500 bg-gray-900 text-gray-300 hover:bg-gray-800'
                  }`}
                >
                  {t(item.label)}
                </button>
              ))}
              {import.meta.env.DEV && (
                <button
                  type="button"
                  onClick={toggleAccessibilityTestMode}
                  aria-pressed={isAccessibilityTestMode}
                  className={`px-4 py-2.5 rounded-lg text-sm font-medium border ${
                    isAccessibilityTestMode
                      ? 'bg-amber-700 border-amber-500 text-white'
                      : 'bg-gray-900 border-gray-500 text-amber-200 hover:bg-gray-800'
                  }`}
                >
                  {isAccessibilityTestMode
                    ? t('app.exitTestMode')
                    : t('app.testMode')}
                </button>
              )}
            </nav>
          </div>
        </div>
      </header>

      <Track1Module
  activeView={activeView}
  isAccessibilityTestMode={isAccessibilityTestMode}
  testFormData={testFormData}
  updateTestFormData={updateTestFormData}
  testSessionId={testSessionId}
  isRegistered={isRegistered}
  formData={formData}
  updateFormData={updateFormData}
  sessionId={sessionId}
  onWizardSuccess={handleWizardSuccess}
  onNavigate={setActiveView}
/>
    </div>
  );
}
