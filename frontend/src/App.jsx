
import React, { useState } from 'react';
import { usePersistentState } from './hooks/userPersistentState';
import AccessibilityToolbar from './components/AccessibilityToolbar';
import CareerGateway from './components/career/candidates/CareerGateway';
import EmployerDashboard from './components/employer/EmployerDashboard';
import Wizard from './components/Wizard';

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
  { id: 'learner', label: 'Learner Onboarding' },
  { id: 'jobs', label: 'Job Board & Apply' },
  { id: 'employer', label: 'Employer View (Demo)' }
];

function getAccessibilityTestModeFromUrl() {
  if (!import.meta.env.DEV || typeof window === 'undefined') return false;
  return new URLSearchParams(window.location.search).get('a11yTest') === '1';
}

export default function App() {
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
                Accessible Opportunities for Everyone
              </p>
            </div>

            <nav
              aria-label="Main navigation"
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
                  {item.label}
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
                    ? 'Exit accessibility test mode'
                    : 'Accessibility test mode'}
                </button>
              )}
            </nav>
          </div>
        </div>
      </header>

      <main>
        {activeView === 'learner' && (
          isAccessibilityTestMode ? (
            <Wizard
              key="accessibility-test"
              formData={testFormData}
              updateFormData={updateTestFormData}
              onSuccess={handleWizardSuccess}
              sessionId={testSessionId}
              isAccessibilityTestMode
            />
          ) : isRegistered ? (
            <section className="min-h-[60vh] flex items-center justify-center px-6 py-16">
              <div className="max-w-xl text-center">
                <div className="text-4xl mb-5" aria-hidden="true">
                  ✓
                </div>

                <h1 className="text-3xl font-bold">
                  Your onboarding is complete!
                </h1>

                <p className="text-gray-400 mt-4 leading-relaxed">
                  Your profile has been saved. You can explore
                  opportunities that match your accommodation
                  preferences in the Job Board.
                </p>

                <button
                  type="button"
                  onClick={() => setActiveView('jobs')}
                  className="mt-7 px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 font-semibold transition"
                >
                  Explore opportunities
                </button>
              </div>
            </section>
          ) : (
            <Wizard
              key="normal"
              formData={formData}
              updateFormData={updateFormData}
              onSuccess={handleWizardSuccess}
              sessionId={sessionId}
            />
          )
        )}

        {activeView === 'jobs' && (
          <CareerGateway
            formData={formData}
            sessionId={isRegistered ? sessionId : undefined}
          />
        )}

        {activeView === 'employer' && (
          <EmployerDashboard />
        )}
      </main>
    </div>
  );
}
