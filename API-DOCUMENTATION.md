# Savanna Accessible Onboarding — Backend API Documentation

**Version:** 1.0.0  
**Base URL:** `http://localhost:5000/api`  
**Stack:** Node.js, Express.js, MongoDB, Mongoose

## 1. Overview

The Savanna Accessible Onboarding backend provides REST APIs for accessible candidate registration, onboarding progress recovery, confidential support requests, job discovery, job applications, and employer job publishing.

The system supports alternative identification routes, accessibility accommodation preferences, incremental onboarding progress saving, and voice-assisted job applications through transcript submission.

## 2. Health Check

### GET `/api/health`

Checks whether the backend server is running and whether MongoDB is connected.

**Success response — 200 OK**

```json
{
  "status": "active",
  "message": "Savanna Onboarding API is running",
  "database": "connected"
}
```

The database field can return `disconnected` if MongoDB is not connected.

## 3. Onboarding

### POST `/api/onboarding/save`

Saves or updates a candidate's onboarding progress.

**Request body**

```json
{
  "sessionId": "session-123",
  "currentStep": 2,
  "formData": {
    "fullName": "Example Candidate",
    "phoneOrEmail": "candidate@example.com",
    "idRoute": "standard_id"
  },
  "requestSmsLink": true,
  "phoneNumber": "+251900000000"
}
```

**Required fields:**
- `sessionId` — candidate session identifier.
- `currentStep` — current onboarding step (integer).
- `formData` — object containing the saved form information.

**Optional fields:**
- `requestSmsLink` — requests a resume link when set to `true`.
- `phoneNumber` — required when requesting an SMS link.

**Success response — 200 OK**

```json
{
  "success": true,
  "message": "Onboarding progress saved successfully",
  "smsRequested": true,
  "draft": {
    "sessionId": "session-123",
    "currentStep": 2,
    "formData": {
      "fullName": "Example Candidate",
      "phoneOrEmail": "candidate@example.com",
      "idRoute": "standard_id"
    }
  }
}
```

The backend generates a cryptographically secure resume token when an SMS link is requested. Only its SHA-256 hash and expiration date are stored in the database.

**Note:** The current SMS provider is a development mock. It logs the resume link in the backend terminal rather than sending a real SMS.

Resume tokens expire after 30 days.

### GET `/api/onboarding/resume/:token`

Retrieves a saved onboarding draft using its resume token.

**Example request**

`GET /api/onboarding/resume/64-character-resume-token`

**Success response — 200 OK**

```json
{
  "success": true,
  "message": "Onboarding progress retrieved successfully",
  "draft": {
    "sessionId": "session-123",
    "currentStep": 2,
    "formData": {
      "fullName": "Example Candidate",
      "phoneOrEmail": "candidate@example.com"
    }
  }
}
```

**Possible errors:**
- `400 Bad Request` — invalid token format.
- `404 Not Found` — token is invalid or expired.

The raw resume token and its stored hash are not included in the retrieval response.

## 4. Candidate Registration

### POST `/api/candidates`

Creates a candidate onboarding profile.

**Request body**

```json
{
  "sessionId": "session-123",
  "fullName": "Example Candidate",
  "phoneOrEmail": "candidate@example.com",
  "idRoute": "standard_id",
  "idDetails": {
    "documentNumber": "ID-12345"
  },
  "consentGiven": true,
  "accommodationPreferences": [
    "screen_reader",
    "flexible_hours"
  ]
}
```

**Required fields:**
- `sessionId`
- `fullName`
- `phoneOrEmail`
- `idRoute`
- `consentGiven` — must be `true`.
- `accommodationPreferences` — array.

**Supported identification routes:**
- `standard_id`
- `refugee_id`
- `alternative_doc`
- `partner_referral`

**Identification details:**
- `documentNumber` is required for `refugee_id` and `alternative_doc`.
- `partnerCode` is required for `partner_referral`.

**Success response — 201 Created**

```json
{
  "success": true,
  "message": "Candidate registered successfully",
  "candidateId": "6af81cb6a7d5569d9af0b88f"
}
```

**Possible errors:**
- `400 Bad Request` — missing or invalid candidate information, or consent not provided.
- `409 Conflict` — a candidate with the same session ID already exists.
- `500 Internal Server Error` — unexpected server error.

## 5. Confidential Support Requests

### POST `/api/support-requests`

Submits a candidate support request independently of candidate registration.

**Request body**

```json
{
  "sessionId": "session-123",
  "supportType": "Accessibility assistance",
  "preferredContactMethod": "email",
  "additionalNotes": "I would appreciate assistance during onboarding."
}
```

**Required fields:**
- `sessionId`
- `supportType`
- `preferredContactMethod`

**Optional field:**
- `additionalNotes` — maximum 2,000 characters.

**Supported contact methods:**
- `phone`
- `sms`
- `email`

**Success response — 201 Created**

```json
{
  "success": true,
  "message": "Support request submitted successfully",
  "supportRequest": {
    "sessionId": "session-123",
    "supportType": "Accessibility assistance",
    "preferredContactMethod": "email",
    "additionalNotes": "I would appreciate assistance during onboarding.",
    "status": "pending"
  }
}
```

**Support request statuses:**
- `pending`
- `reviewing`
- `resolved`

The default status is `pending`.

**Possible errors:**
- `400 Bad Request` — missing or invalid support request information.
- `500 Internal Server Error` — unexpected server error.

Support requests are stored separately from candidate profiles and job listings.

## 6. Job Discovery

### GET `/api/jobs`

Retrieves active job listings, with optional filtering based on a candidate's saved accommodation preferences.

**Query parameters:**

| Parameter | Required | Description |
|---|---|---|
| `sessionId` | No | Candidate session ID used to retrieve saved accommodation preferences. |
| `match` | No | Matching method: `any` or `all`. Defaults to `any`. |

**Examples:**

Retrieve all active jobs:

`GET /api/jobs`

Retrieve jobs matching at least one of the candidate's accommodation preferences:

`GET /api/jobs?sessionId=session-123&match=any`

Retrieve jobs matching all of the candidate's accommodation preferences:

`GET /api/jobs?sessionId=session-123&match=all`

**Matching behavior:**
- `any` — returns jobs offering at least one of the candidate's preferences.
- `all` — returns jobs offering all of the candidate's preferences.

**Success response — 200 OK**

```json
{
  "success": true,
  "count": 1,
  "jobs": [
    {
      "_id": "6af821a2a7d5569d9af0b893",
      "title": "Junior Software Developer",
      "description": "An entry-level software development opportunity.",
      "requirements": [
        "JavaScript",
        "Problem solving",
        "Communication"
      ],
      "offeredAccommodations": [
        "screen_reader",
        "flexible_hours"
      ],
      "location": "Addis Ababa",
      "status": "active"
    }
  ]
}
```

**Possible errors:**
- `400 Bad Request` — invalid `match` value.
- `404 Not Found` — candidate profile not found when a session ID is supplied.
- `500 Internal Server Error` — unexpected server error.

Only active jobs are returned.

**Current implementation note:** Pagination and direct accommodation-tag query parameters are not currently implemented. Candidate preferences are retrieved internally by the backend when a `sessionId` is supplied.

## 7. Job Applications

### POST `/api/jobs/apply`

Submits a candidate's application for an active job. Applications can include answers captured through voice input and converted into text transcripts.

**Request body**

```json
{
  "sessionId": "session-123",
  "jobId": "6af821a2a7d5569d9af0b893",
  "candidateName": "Example Candidate",
  "voiceAnswers": [
    {
      "questionId": "q1",
      "audioTranscript": "I am interested in this position because I enjoy solving problems."
    }
  ],
  "requestedAccommodations": [
    "flexible_hours"
  ]
}
```

**Required fields:**
- `sessionId`
- `jobId` — valid MongoDB ObjectId of an active job.
- `candidateName`
- `voiceAnswers` — array containing `questionId` and `audioTranscript`.
- `requestedAccommodations` — array of strings.

**Success response — 201 Created**

```json
{
  "success": true,
  "message": "Job application submitted successfully",
  "applicationId": "APPLICATION_ID"
}
```

**Possible errors:**
- `400 Bad Request` — missing or invalid application information, including an invalid job ID.
- `404 Not Found` — active job not found.
- `409 Conflict` — candidate has already applied for the same job.
- `500 Internal Server Error` — unexpected server error.

A unique compound database index on `sessionId` and `jobId` prevents duplicate applications.

**Current implementation note:** The application model stores voice transcripts, not raw audio files. Audio recording, upload, and storage require separate implementation.

## 8. Employer Job Publishing

### POST `/api/employer/jobs`

Allows an authorized employer or partner to publish a job listing.

**Authentication**

Requires the following HTTP header:

`x-partner-key: YOUR_PARTNER_API_KEY`

The API key is stored in the backend environment variables and must not be committed to Git.

**Request body**

```json
{
  "title": "Junior Software Developer",
  "description": "An entry-level software development opportunity.",
  "requirements": [
    "Basic programming knowledge",
    "Problem solving"
  ],
  "offeredAccommodations": [
    "screen_reader",
    "flexible_hours"
  ],
  "location": "Addis Ababa",
  "status": "active"
}
```

**Required fields:**
- `title`
- `description`

**Optional fields:**
- `requirements` — array of strings.
- `offeredAccommodations` — array of strings.
- `location`
- `status` — `active`, `inactive`, or `closed`. Defaults to `active`.

**Success response — 201 Created**

```json
{
  "success": true,
  "message": "Job published successfully",
  "job": {
    "_id": "JOB_ID",
    "title": "Junior Software Developer",
    "description": "An entry-level software development opportunity.",
    "requirements": [
      "Basic programming knowledge",
      "Problem solving"
    ],
    "offeredAccommodations": [
      "screen_reader",
      "flexible_hours"
    ],
    "location": "Addis Ababa",
    "status": "active"
  }
}
```

**Possible errors:**
- `400 Bad Request` — missing or invalid job information.
- `401 Unauthorized` — missing or incorrect partner API key.
- `503 Service Unavailable` — employer API authentication is not configured.
- `500 Internal Server Error` — unexpected server error.

## 9. HTTP Status Codes

| Code | Meaning |
|---|---|
| 200 | Request successful |
| 201 | Resource created successfully |
| 400 | Invalid or missing request information |
| 401 | Missing or invalid authentication |
| 404 | Resource not found |
| 409 | Conflict or duplicate resource |
| 500 | Internal server error |
| 503 | Required service configuration unavailable |

The response structure varies by endpoint. Each endpoint documents its own success and error response format.

## 10. Security and Privacy

The current backend implementation includes:

- Cryptographically secure resume token generation.
- SHA-256 hashing of resume tokens before database storage.
- Resume token expiration after 30 days.
- Employer authentication using a partner API key.
- Timing-safe comparison of employer API keys.
- Input validation and Mongoose schema validation.
- Unique candidate session IDs.
- Database-level duplicate application protection.
- Separation of support request records from candidate and job listing records.

**Production security recommendations:**

- Use HTTPS in production.
- Restrict CORS to approved frontend origins.
- Apply rate limiting to sensitive endpoints.
- Use stronger candidate authentication and session management.
- Avoid logging sensitive personal information.
- Review authorization rules before exposing candidate or support information.
- Consider secure access controls for employer and administrative operations.

## 11. Environment Configuration

The backend uses environment variables stored in `backend/.env`.

Example configuration:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
FRONTEND_URL=http://localhost:5173
PARTNER_API_KEY=your_secure_partner_api_key
```

**Important:**
- Never commit `.env` to Git.
- Keep production credentials separate from development credentials.
- Configure production URLs and secrets before deployment.

## 12. Implementation Notes and Future Improvements

The following capabilities are not currently part of the implemented API:

- Real SMS delivery through an external SMS provider.
- Pagination for job listings.
- Raw audio file upload and storage.
- Candidate authentication beyond the current session ID approach.
- Employer account management and role-based authentication.
- Dedicated administrative endpoints for reviewing and resolving support requests.
- Automated API documentation generation and interactive Swagger UI.

These features can be added in future development phases as required by the project.

---

**Document:** Savanna Accessible Onboarding — Backend API Documentation  
**Version:** 1.0.0  
**Status:** Core API endpoints implemented and tested.
