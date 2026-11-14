import React from 'react';
import { usePersistentState } from './hooks/userPersistentState';
import AccessibilityToolbar from './components/AccessibilityToolbar';
import JobsView from './components/JobsView';
import Wizard from './components/Wizard';

export default function App() {
  const [isRegistered, setIsRegistered] = usePersistentState('savanna_completed', false);
  const [formData, setFormData] = usePersistentState('savanna_form_data', {});
  const [sessionId] = usePersistentState('savanna_session_id', `session-${Date.now()}`);

  const updateFormData = (key, value) => {
    setFormData((previous) => ({ ...previous, [key]: value }));
  };

  const handleWizardSuccess = () => {
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
