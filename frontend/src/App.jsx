import React from 'react';
import { usePersistentState } from './hooks/userPersistentState';
import AccessibilityToolbar from './components/AccessibilityToolbar';
import JobsView from './components/JobsView';
import Wizard from './components/Wizard';

function createSessionId() {
  const cryptoApi = globalThis.crypto;
  if (!cryptoApi?.getRandomValues) {
    throw new Error('Secure session ID generation is unavailable in this browser.');
  }

  if (cryptoApi.randomUUID) {
    return `session-${cryptoApi.randomUUID()}`;
  }

  const bytes = cryptoApi.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');

  return `session-${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

export default function App() {
  const [isRegistered, setIsRegistered] = usePersistentState('savanna_completed', false);
  const [formData, setFormData] = usePersistentState('savanna_form_data', {});
  const [sessionId, setSessionId] = usePersistentState('savanna_session_id', createSessionId);

  const updateFormData = (key, value) => {
    setFormData((previous) => ({ ...previous, [key]: value }));
  };

  const handleWizardSuccess = ({ formData: completedFormData, sessionId: completedSessionId }) => {
    setFormData(completedFormData);
    setSessionId(completedSessionId);
    setIsRegistered(true);
  };

  return (
    <div className="relative min-h-screen bg-[#111318] text-white">
      <AccessibilityToolbar />
      {isRegistered ? (
        <JobsView formData={formData} sessionId={sessionId} />
      ) : (
        <Wizard
          formData={formData}
          updateFormData={updateFormData}
          onSuccess={handleWizardSuccess}
          sessionId={sessionId}
        />
      )}
    </div>
  );
}
