
const sendResumeLink = async ({ phoneNumber, resumeUrl }) => {
  // Development mock: no real SMS is sent.
  console.log('\n========== MOCK SMS ==========');
  console.log(`To: ${phoneNumber}`);
  console.log(`Message: Continue your onboarding here: ${resumeUrl}`);
  console.log('==============================\n');

  return {
    success: true,
    provider: 'mock'
  };
};

module.exports = { sendResumeLink };
