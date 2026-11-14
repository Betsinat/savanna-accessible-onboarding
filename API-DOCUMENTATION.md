# Savanna Accessible Onboarding — Backend API Specification

**Version:** 1.0.0  
**Base URL:** `/api`  
**Stack:** Node.js, Express, MongoDB, Mongoose

## 1. Overview

The backend provides REST APIs for accessible onboarding, draft recovery, candidate registration, confidential support requests, job discovery, and voice-assisted job applications.

The API is designed around incremental saving, alternative identification routes, privacy, and accessible employment opportunities.

## 2. Onboarding

### POST `/api/onboarding/save`

Saves or updates an onboarding draft.

**Request body**
```json
{
  "sessionId": "session-123",
  "currentStep": 2,
  "formData": {
    "fullName": "Example Candidate",
    "preferredLanguage": "English"
  },
  "requestSmsLink": true
}
```

`requestSmsLink` is optional. When requested, the backend generates a secure resume token and sends a resume link through the SMS provider.

**Success response**
```json
{
  "success": true,
  "message": "Draft saved successfully",
  "data": {
    "sessionId": "session-123",
    "currentStep": 2,
    "lastUpdated": "2026-11-13T18:00:00.000Z",
    "resumeLinkSent": true
  }
}
```

The raw resume token must never be returned in an ordinary API response or stored in the database.

### GET `/api/onboarding/resume/:token`

Restores an onboarding draft using its resume token.

**Success response**
```json
{
  "success": true,
  "data": {
    "sessionId": "session-123",
    "currentStep": 2,
    "formData": {
      "fullName": "Example Candidate"
    },
    "lastUpdated": "2026-11-13T18:00:00.000Z"
  }
}
```

Invalid or expired tokens return `401 Unauthorized`.

## 3. Candidate Registration

### POST `/api/candidates`

Creates a candidate profile.

**Request body**
```json
{
  "sessionId": "session-123",
  "fullName": "Example Candidate",
  "phoneOrEmail": "candidate@example.com",
  "idRoute": "partner_referral",
  "idDetails": {
    "partnerCode": "AAAPD-123"
  },
  "consentGiven": true,
  "accommodationPreferences": [
    "screen_reader_compatible",
    "flexible_hours"
  ]
}
```

**Supported ID routes**
- `standard_id`
- `refugee_id`
- `alternative_doc`
- `partner_referral`

**Success response**
```json
{
  "success": true,
  "message": "Candidate registered successfully",
  "data": {
    "sessionId": "session-123"
  }
}
```

Candidate registration and support requests are separate operations.

## 4. Confidential Support Requests

### POST `/api/support-requests`

Submits an independent support request.

**Request body**
```json
{
  "sessionId": "session-123",
  "supportType": "screen_reader_assistance",
  "preferredContactMethod": "phone",
  "additionalNotes": "I would appreciate assistance during onboarding."
}
```

Supported contact methods: `phone`, `sms`, `email`.

No medical diagnosis or medical proof is required.

**Success response**
```json
{
  "success": true,
  "message": "Support request submitted successfully",
  "data": {
    "status": "pending"
  }
}
```

Support request information must not be exposed through public job listings or candidate responses.

## 5. Job Discovery

### GET `/api/jobs`

Retrieves available job listings.

**Query parameters**
- `accommodations`: comma-separated accommodation tags.
- `sessionId`: optional candidate session for private preference matching.
- `match`: `any` or `all` when filtering by multiple accommodations.
- `page`: pagination page.
- `limit`: results per page.

Example:

`GET /api/jobs?accommodations=remote_work,flexible_hours&match=any`

Candidate-specific preferences must be retrieved privately by the backend. Employers must not receive candidates' private accommodation preferences through this endpoint.

**Success response**
```json
{
  "success": true,
  "data": [
    {
      "jobId": "job-123",
      "title": "Junior Software Developer",
      "description": "Entry-level software development role.",
      "offeredAccommodations": [
        "remote_work",
        "flexible_hours"
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10
  }
}
```

## 6. Job Applications

### POST `/api/jobs/apply`

Submits an application, including answers captured through voice input.

**Request body**
```json
{
  "sessionId": "session-123",
  "jobId": "job-123",
  "candidateName": "Example Candidate",
  "voiceAnswers": [
    {
      "questionId": "q1",
      "audioTranscript": "I am interested in this position because..."
    }
  ],
  "requestedAccommodations": [
    "flexible_hours"
  ]
}
```

**Success response**
```json
{
  "success": true,
  "message": "Application submitted successfully",
  "data": {
    "applicationId": "application-123"
  }
}
```

The current application model stores transcripts, not raw audio files. Audio storage or upload support would require a separate implementation.

## 7. Employer Job Publishing

### POST `/api/employer/jobs`

Allows an authorized employer or partner to publish a job listing.

**Authentication:** `X-Partner-Key` header.

**Request body**
```json
{
  "title": "Junior Software Developer",
  "description": "Entry-level software development role.",
  "requirements": [
    "Basic programming knowledge"
  ],
  "offeredAccommodations": [
    "remote_work",
    "screen_reader_compatible"
  ],
  "location": "Addis Ababa",
  "status": "active"
}
```

**Success response**
```json
{
  "success": true,
  "message": "Job published successfully",
  "data": {
    "jobId": "job-123"
  }
}
```

The partner key must be stored in environment variables, never committed to Git.

## 8. Standard Error Format

All endpoints should use a consistent error structure.

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "phoneOrEmail",
      "message": "A valid contact detail is required."
    }
  ]
}
```

**HTTP status codes**

| Code | Meaning |
|---|---|
| 200 | Request successful |
| 201 | Resource created |
| 400 | Invalid request |
| 401 | Missing or invalid authentication/token |
| 403 | Access forbidden |
| 404 | Resource not found |
| 409 | Conflict |
| 422 | Validation error |
| 429 | Too many requests |
| 500 | Internal server error |

## 9. Security and Privacy Requirements

- Generate resume tokens using cryptographically secure randomness.
- Store only hashed resume tokens and enforce expiration.
- Do not log passwords, tokens, private support notes, or sensitive identification details.
- Validate and sanitize incoming request data.
- Protect employer endpoints with partner-key authentication.
- Keep support requests separate from candidate and job data responses.
- Do not require medical proof for accessibility support.
- Use HTTPS in production.
- Restrict CORS to approved frontend origins in production.
- Never expose private candidate accommodation preferences to employers through public job discovery.
- Apply appropriate rate limits to sensitive endpoints.

## 10. Implementation Dependencies

The existing Mongoose models cover the core registration, draft, support, and application data.

The following additions are required:

- `OnboardingDraft`: `resumeTokenHash`, `resumeTokenExpiresAt`.
- `OnboardingProfile`: `accommodationPreferences`.
- New `Job` model: employer listings and offered accommodation tags.
- SMS service interface and development mock provider.
- Employer partner-key authentication middleware.

**Note:** This specification is the API contract. Request validation, authentication, token lifecycle, and database implementation must be completed and tested before the endpoints are considered production-ready.