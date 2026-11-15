
import React from 'react';
import CareerGateway from './career/candidates/CareerGateway';
import EmployerDashboard from './employer/EmployerDashboard';
import Wizard from './Wizard';

export default function Track1Module({
  activeView,
  isAccessibilityTestMode,
  testFormData,
  updateTestFormData,
  testSessionId,
  isRegistered,
  formData,
  updateFormData,
  sessionId,
  onWizardSuccess,
  onNavigate
}) {
  return (
    <main>
      {activeView === 'learner' && (
        isAccessibilityTestMode ? (
          <Wizard
            key="accessibility-test"
            formData={testFormData}
            updateFormData={updateTestFormData}
            onSuccess={onWizardSuccess}
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
                onClick={() => onNavigate('jobs')}
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
            onSuccess={onWizardSuccess}
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
  );
}
