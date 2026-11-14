\# Savanna — Accessible Onboarding \& Career Gateway



Savanna is an accessibility-focused onboarding and employment platform prototype. It helps candidates communicate their workplace accommodation preferences and discover job opportunities that better match their needs. Employers can publish opportunities and specify the accommodations they offer.



This project was developed as part of an accessibility hackathon.



\## Features



\### Learner onboarding

\- Guided candidate onboarding.

\- Collection of candidate information and accommodation preferences.

\- Persistent onboarding progress in the browser.

\- Accessibility toolbar for a more adaptable experience.



\### Job board

\- Browse active job opportunities.

\- View job descriptions, companies, locations, requirements, and offered accommodations.

\- Filter opportunities by accommodation preferences.

\- Choose between matching \*\*any\*\* selected preference or \*\*all\*\* selected preferences.

\- View all active opportunities when browsing without a completed candidate profile.



\### Employer demo

\- Open employer interface with no login required for hackathon evaluation.

\- Publish a job with its title, company, description, location, requirements, and offered accommodations.

\- Newly published opportunities become available in the Job Board.



> In production, the Employer Accommodation Form embeds inside authenticated host portals (like Savanna); for hackathon evaluation, it is exposed directly via the top navigation bar for immediate testing.



\## Technology Stack



| Layer | Technology |

|---|---|

| Frontend | React, Vite |

| Styling | Tailwind CSS |

| Backend | Node.js, Express |

| Database | MongoDB, Mongoose |

| API requests | Axios |



\## Project Structure



```text

savanna-accessible-onboarding/

├── backend/

│   ├── models/

│   ├── routes/

│   ├── server.js

│   └── package.json

│

├── frontend/

│   ├── src/

│   │   ├── components/

│   │   │   ├── career/

│   │   │   ├── employer/

│   │   │   └── ...

│   │   ├── services/

│   │   ├── hooks/

│   │   └── App.jsx

│   └── package.json

│

└── README.md

```



\## Getting Started



\### Prerequisites



\- Node.js and npm

\- MongoDB database (local MongoDB or MongoDB Atlas)

\- Git



\### 1. Clone the repository



```bash

git clone <repository-url>

cd savanna-accessible-onboarding

```



\### 2. Configure the backend



Navigate to the backend directory:



```bash

cd backend

npm install

```



Create or configure your `backend/.env` file with the environment variables required by the backend.



At minimum, configure your MongoDB connection string and backend port:



```env

MONGO\_URI=your\_mongodb\_connection\_string

PORT=5000

```



Keep credentials and other secrets in `.env`. Never commit real credentials to Git.



Start the backend:



```bash

npm run dev

```



The backend runs on the configured port, which is `5000` by default.



\### 3. Configure the frontend



Open a second terminal and navigate to the frontend directory:



```bash

cd frontend

npm install

npm run dev

```



Open the local URL printed by Vite in your terminal.



\### 4. Build the frontend



From the frontend directory, run:



```bash

npm run build

```



Vite generates the production build in the `frontend/dist` directory.



\## Main Navigation



The application provides three main sections:



1\. \*\*Learner Onboarding\*\* — candidates complete their onboarding and share accommodation preferences.

2\. \*\*Job Board \& Apply\*\* — candidates explore available opportunities and filter them by accommodation compatibility.

3\. \*\*Employer View (Demo)\*\* — employers publish job opportunities and identify the accommodations they offer.



\## API Endpoints



The following career-related endpoints are exposed by the backend:



| Method | Endpoint | Purpose |

|---|---|---|

| GET | `/api/jobs` | Retrieve active jobs, with optional accommodation matching |

| POST | `/api/jobs/apply` | Submit a candidate job application |

| POST | `/api/employer/jobs` | Publish a job through the employer demo |



\### Job matching



The job listing endpoint accepts optional query parameters:



\- `sessionId` — identifies a completed candidate profile.

\- `match` — selects the accommodation matching mode: `any` or `all`.



Example:



```text

GET /api/jobs?sessionId=YOUR\_SESSION\_ID\&match=any

```



\- `any` returns jobs offering at least one of the candidate's selected accommodations.

\- `all` returns jobs offering every selected accommodation.

\- Without a candidate session, the endpoint returns all active jobs.



\### Employer job publishing



The employer demo submits job information to:



```text

POST /api/employer/jobs

```



The request includes the job title, company, description, requirements, location, and offered accommodations.



Published jobs are stored in MongoDB and can then be retrieved through the Job Board.



\## Accessibility \& Accommodation Options



The current accommodation options include:



\- Screen Reader Compatible

\- Flexible Working Hours

\- Remote Work Enabled

\- Captioned Meetings



These options are used consistently by the candidate matching and employer job-posting flows.



\## Demo Testing Flow



To test the main experience:



1\. Open the application.

2\. Select \*\*Employer View (Demo)\*\*.

3\. Publish a job and choose its offered accommodations.

4\. Switch to \*\*Job Board \& Apply\*\* and confirm that the new job appears.

5\. Complete learner onboarding and select accommodation preferences.

6\. Return to the Job Board.

7\. Test both `any` and `all` accommodation matching modes.



\## Security \& Production Considerations



The employer job-posting endpoint is intentionally open for hackathon demonstration so evaluators can publish jobs without an account.



This is a demo configuration, not a production security model. Before production deployment, employer access should be provided through the authenticated host platform or a properly secured integration. The public demo endpoint should be protected or disabled, with appropriate authorization, validation, rate limiting, and abuse prevention.



Database credentials, API keys, and other secrets must remain server-side and must never be committed to the repository.



\## Project Status



This project is a hackathon prototype. The current implementation demonstrates the learner onboarding experience, employer job publishing, job discovery, and accommodation-based job matching.

