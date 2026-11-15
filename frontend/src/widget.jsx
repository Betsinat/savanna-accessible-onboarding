import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import Track1Module from './components/Track1Module';
import { configureApi } from './services/api';
import widgetStyles from './widget.css?inline';

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

function SavannaWidget() {
  const [activeView, setActiveView] = useState('learner');
  const [formData, setFormData] = useState({});
  const [sessionId] = useState(createSessionId);
  const [isRegistered, setIsRegistered] = useState(false);

  const updateFormData = (key, value) => {
    setFormData((previous) => ({
      ...previous,
      [key]: value,
    }));
  };

  const handleWizardSuccess = ({
    formData: completedFormData,
  }) => {
    setFormData(completedFormData);
    setIsRegistered(true);
    setActiveView('jobs');
  };

  return (
    <div className="savanna-widget-root">
      <nav aria-label="Savanna onboarding navigation" className="widget-nav">
        <button
          type="button"
          onClick={() => setActiveView('learner')}
          aria-current={activeView === 'learner' ? 'page' : undefined}
        >
          Learner Onboarding
        </button>

        <button
          type="button"
          onClick={() => setActiveView('jobs')}
          aria-current={activeView === 'jobs' ? 'page' : undefined}
        >
          Job Board
        </button>
      </nav>

      <Track1Module
        activeView={activeView}
        isAccessibilityTestMode={false}
        testFormData={{}}
        updateTestFormData={() => {}}
        testSessionId={null}
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

function mountSavannaWidget() {
  const scriptElement = document.currentScript;

  if (!scriptElement) {
    throw new Error(
      'Savanna widget could not identify its script element.'
    );
  }

  const targetId = scriptElement.dataset.target || 'savanna-onboarding';
  const apiBaseUrl = scriptElement.dataset.apiUrl;

  if (!apiBaseUrl) {
    throw new Error(
      'Please provide data-api-url on the Savanna widget script tag.'
    );
  }

  const hostElement = document.getElementById(targetId);

  if (!hostElement) {
    throw new Error(
      `Savanna widget target element #${targetId} was not found.`
    );
  }

  if (hostElement.shadowRoot) {
    throw new Error(
      'A Savanna widget is already mounted in this element.'
    );
  }

  configureApi(apiBaseUrl);

  const shadowRoot = hostElement.attachShadow({ mode: 'open' });

  const styleElement = document.createElement('style');
  styleElement.textContent = widgetStyles;
  shadowRoot.appendChild(styleElement);

  const mountPoint = document.createElement('div');
  mountPoint.className = 'savanna-widget-container';
  shadowRoot.appendChild(mountPoint);

  createRoot(mountPoint).render(
    <React.StrictMode>
      <SavannaWidget />
    </React.StrictMode>
  );
}

mountSavannaWidget();
