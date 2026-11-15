# Savanna Accessible Onboarding
## Backend API Reference

**Document version:** 1.0.0  
**API version:** 1.0.0  
**Base URL:** `http://localhost:5000/api`  
**Backend:** Node.js · Express.js · MongoDB · Mongoose  
**Status:** Core API endpoints implemented and tested

---

## 1. Introduction

The Savanna Accessible Onboarding API provides the backend services required to support accessible candidate registration, onboarding, job discovery, job applications, and employer interactions.

It enables candidates to save and recover onboarding progress, submit support requests, communicate their accommodation preferences, discover suitable job opportunities, and apply for positions using voice-assisted responses converted into text transcripts.

The API also supports employer job publishing and applicant management through the project's demonstration interface.

## 2. API Configuration

### Base URL

All endpoints use the following base URL during local development:

`http://localhost:5000/api`

### Request format

- Request bodies should use JSON.
- Set `Content-Type: application/json` for requests with JSON bodies.
- Route parameters and query parameters are documented with their respective endpoints.

### Health Check

**GET `/health`**

Checks whether the backend server is running and reports the database connection status.

**Success response — 200 OK**

```json
{
  "status": "active",
  "message": "Savanna Onboarding API is running",
  "database": "connected"
}
```

The database field may return `disconnected` if MongoDB is unavailable.

---

## 3. Onboarding Services

### 3.1 Save onboarding progress

**POST `/onboarding/save`**

Saves or updates a candidate's onboarding progress. It also supports requesting a link to resume an unfinished application.

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

**Required fields**

| Field | Description |
|---|---|
| `sessionId` | Candidate session identifier |
| `currentStep` | Current onboarding step; integer |
| `formData` | Object containing saved form information |

**Optional fields**

| Field | Description |
|---|---|
| `requestSmsLink` | Requests a resume link when set to `true` |
| `phoneNumber` | Phone number used when requesting an SMS link |

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

**Implementation details**

When an SMS resume link is requested, the backend generates a cryptographically secure resume token. Only its SHA-256 hash and expiration date are stored in the database.

Resume tokens expire after 30 days.

**Development limitation:** SMS delivery currently uses a mock provider. The resume link is logged in the backend terminal rather than sent through a real SMS service.

### 3.2 Resume onboarding

**GET `/onboarding/resume/:token`**

Retrieves a saved onboarding draft using its resume token.

**Example request**

`GET /onboarding/resume/64-character-resume-token`

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

**Possible errors**

| Status | Description |
|---|---|
| `400` | Invalid token format |
| `404` | Token is invalid or expired |

The raw resume token and its stored hash are not included in the retrieval response.

---

## 4. Candidate Services

### 4.1 Register a candidate

**POST `/candidates`**

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

**Required fields**

| Field | Description |
|---|---|
| `sessionId` | Candidate session identifier |
| `fullName` | Candidate's full name |
| `phoneOrEmail` | Candidate contact information |
| `idRoute` | Selected identification route |
| `consentGiven` | Must be `true` |
| `accommodationPreferences` | Array of accommodation preferences |

**Supported identification routes**

- `standard_id`
- `refugee_id`
- `alternative_doc`
- `partner_referral`

**Identification details**

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

**Possible errors**

| Status | Description |
|---|---|
| `400` | Missing or invalid candidate information, or consent not provided |
| `409` | A candidate with the same session ID already exists |
| `500` | Unexpected server error |

---

## 5. Support Services

### 5.1 Submit a support request

**POST `/support-requests`**

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

**Required fields**

- `sessionId`
- `supportType`
- `preferredContactMethod`

**Optional field**

- `additionalNotes` — maximum 2,000 characters.

**Supported contact methods**

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

**Support request statuses**

- `pending`
- `reviewing`
- `resolved`

The default status is `pending`.

**Possible errors**

| Status | Description |
|---|---|
| `400` | Missing or invalid support request information |
| `500` | Unexpected server error |

Support requests are stored separately from candidate profiles and job listings.

---

## 6. Career Gateway — Job Discovery

### 6.1 Retrieve active jobs

**GET `/jobs`**

Retrieves active job listings. The endpoint can optionally filter jobs using a candidate's saved accommodation preferences.

**Query parameters**

| Parameter | Required | Description |
|---|---|---|
| `sessionId` | No | Candidate session ID used to retrieve saved accommodation preferences |
| `match` | No | Matching method: `any` or `all`. Defaults to `any` |

**Example requests**

Retrieve all active jobs:

`GET /jobs`

Retrieve jobs matching at least one of the candidate's accommodation preferences:

`GET /jobs?sessionId=session-123&match=any`

Retrieve jobs matching all of the candidate's accommodation preferences:

`GET /jobs?sessionId=session-123&match=all`

**Accommodation matching behavior**

| Matching method | Behavior |
|---|---|
| `any` | Returns jobs offering at least one of the candidate's preferences |
| `all` | Returns jobs offering all of the candidate's preferences |

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

**Possible errors**

| Status | Description |
|---|---|
| `400` | Invalid `match` value |
| `404` | Candidate profile not found when a session ID is supplied |
| `500` | Unexpected server error |

**Implementation notes**

- Only active jobs are returned.
- Pagination is not currently implemented.
- Direct accommodation-tag query parameters are not currently supported.
- When `sessionId` is supplied, the backend retrieves the candidate's saved accommodation preferences internally.

---

## 7. Career Gateway — Job Applications

### 7.1 Submit a job application

**POST `/jobs/apply`**

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

**Required fields**

| Field | Description |
|---|---|
| `sessionId` | Candidate session identifier |
| `jobId` | Valid MongoDB ObjectId of an active job |
| `candidateName` | Candidate's name |
| `voiceAnswers` | Array containing `questionId` and `audioTranscript` |
| `requestedAccommodations` | Array of requested accommodations |

**Success response — 201 Created**

```json
{
  "success": true,
  "message": "Job application submitted successfully",
  "applicationId": "APPLICATION_ID"
}
```

**Possible errors**

| Status | Description |
|---|---|
| `400` | Missing or invalid application information, including an invalid job ID |
| `404` | Active job not found |
| `409` | Candidate has already applied for the same job |
| `500` | Unexpected server error |

A unique compound database index on `sessionId` and `jobId` prevents duplicate applications.

**Implementation note:** The application model stores voice transcripts, not raw audio files. Audio recording, upload, and storage require separate implementation.

### 7.2 Retrieve applicants for a job

**GET `/employer/jobs/:jobId/applications`**

Retrieves applications submitted for a specific job. The employer dashboard uses this endpoint to display candidate information and application details.

**Path parameter**

| Parameter | Description |
|---|---|
| `jobId` | MongoDB ObjectId of the job |

**Example request**

`GET /employer/jobs/6af821a2a7d5569d9af0b893/applications`

Applications are returned with the newest submissions first.

The applicant information includes:

- Candidate name
- Submission date
- Requested accommodations
- Voice-answer transcripts
- Application status

The endpoint excludes the candidate's `sessionId` from the returned application records.

**Possible errors**

| Status | Description |
|---|---|
| `400` | Invalid job ID |
| `404` | Job not found |
| `500` | Unexpected server error |

### 7.3 Update application status

**PATCH `/employer/applications/:applicationId/status`**

Updates the review status of a submitted application.

**Path parameter**

| Parameter | Description |
|---|---|
| `applicationId` | MongoDB ObjectId of the application |

**Request body**

```json
{
  "status": "shortlisted"
}
```

**Supported statuses**

- `pending`
- `reviewed`
- `shortlisted`
- `rejected`

**Success response**

The endpoint returns the updated application record.

**Possible errors**

| Status | Description |
|---|---|
| `400` | Invalid application ID or unsupported status |
| `404` | Application not found |
| `500` | Unexpected server error |

Application status changes are persisted in MongoDB and remain after a page refresh.

---

## 8. Employer Services — Job Publishing

### 8.1 Publish a job

**POST `/employer/jobs`**

Creates a new employer job listing.

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

**Required fields**

- `title`
- `description`

**Optional fields**

| Field | Description |
|---|---|
| `requirements` | Array of strings |
| `offeredAccommodations` | Array of strings |
| `location` | Job location |
| `status` | `active`, `inactive`, or `closed`; defaults to `active` |

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

**Possible errors**

| Status | Description |
|---|---|
| `400` | Missing or invalid job information |
| `500` | Unexpected server error |

**Demo access note:** The current hackathon demonstration allows users to access the employer interface and publish jobs without employer authentication. This is intentional for demonstration and evaluation purposes. It must not be treated as a production-ready employer access model.

---

## 9. HTTP Status Codes

| Code | Meaning |
|---|---|
| `200` | Request successful |
| `201` | Resource created successfully |
| `400` | Invalid or missing request information |
| `404` | Resource not found |
| `409` | Conflict or duplicate resource |
| `500` | Internal server error |

The response structure varies by endpoint. Each endpoint documents its own success and error response format.

---

## 10. Security and Privacy Considerations

The current implementation includes several protective measures:

- Cryptographically secure resume token generation.
- SHA-256 hashing of resume tokens before database storage.
- Resume token expiration after 30 days.
- Input validation and Mongoose schema validation.
- Unique candidate session IDs.
- Database-level duplicate application protection.
- Separation of support request records from candidate and job listing records.
- Exclusion of candidate session IDs from employer applicant-list responses.

### Hackathon demonstration limitations

The employer interface and employer endpoints for publishing jobs, viewing applicants, and updating application statuses are publicly accessible in the current demonstration.

This means the current implementation does not provide employer authentication, job ownership checks, or role-based authorization for these operations. Applicant information, including accommodation requests and voice transcripts, is sensitive and should only use test data in the public demonstration.

### Production recommendations

Before deployment in a real environment:

- Require authenticated employer accounts.
- Enforce employer authorization and job ownership checks.
- Restrict access to applicant and support-request information.
- Use HTTPS.
- Restrict CORS to approved frontend origins.
- Apply rate limiting to sensitive endpoints.
- Implement stronger candidate authentication and session management.
- Avoid logging sensitive personal information.
- Keep production credentials separate from development credentials.

---

## 11. Environment Configuration

The backend uses environment variables stored in `backend/.env`.

**Example configuration**

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
FRONTEND_URL=http://localhost:5173
```

**Important configuration practices**

- Never commit `.env` files to Git.
- Keep production credentials separate from development credentials.
- Configure production URLs and secrets before deployment.

---

## 12. Current Implementation Scope

The following capabilities are not currently included in the implemented API:

- Real SMS delivery through an external SMS provider.
- Pagination for job listings.
- Raw audio file upload and storage.
- Candidate authentication beyond the current session ID approach.
- Employer account management and role-based authentication.
- Dedicated administrative endpoints for reviewing and resolving support requests.
- Automated API documentation generation and interactive Swagger UI.

These capabilities may be introduced in future development phases as project requirements evolve.

---

**Document:** Savanna Accessible Onboarding — Backend API Reference  
**Version:** 1.0.0  
**Status:** Core API endpoints implemented and tested