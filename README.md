<div align="center"> <picture> <source media="(prefers-color-scheme: dark)" srcset="IT-Product-Build/Frontend/src/assets/Herbaceous-Dark-Text.svg"> <source media="(prefers-color-scheme: light)" srcset="IT-Product-Build/Frontend/src/assets/Herbaceous-Light-Text.svg"> <img src="IT-Product-Build/Frontend/src/assets/Herbaceous-Light-Text.svg" alt="Herbaceous" width="420"> </picture>

Mentorship is advice. Herbaceous builds the advocacy.

A full-stack mentorship platform for women in STEM that turns career advice into real opportunities: referrals, introductions, nominations and endorsements.

Live site

React Vite Tailwind Express Prisma PostgreSQL AWS Flask

Features · Screenshots · Architecture · Engineering highlights · Run it locally

<img src="IT-Product-Build/Frontend/src/assets/Landing_Image.png" alt="Two women helping each other climb a branching STEM plant" width="420"> </div>

🌱 The problem

Only 17.4% of Australians with a STEM qualification are women, and women hold just 16.3% of STEM CEO roles. The gap isn't only about getting women into STEM. It's about keeping them there and helping them move up.

Most mentoring stops at advice: "find a mentor", "network more". Herbaceous goes further. Mentees are matched with experienced mentors, build momentum with one small check-in a week, and can ask their mentor for concrete advocacy that is tracked until it's done.

✨ Features

For mentees For mentors

Guided onboarding: field, career stage, goals, mentoring style and availability Mentor onboarding: experience, specialisms, style and availability

Explainable matching: 0 to 100 compatibility score with a per-factor breakdown Request inbox: accept or decline incoming mentorship requests

Smart filters: top matches, open availability, verified only, experience, field Resume verification: consent-based check that confirms 2+ years of experience

Instant start: begin straight away with mentors who have open availability Mentee management: timelines, pause approvals, concerns, and ending a mentorship

Weekly planner: one small check-in a week, plus pause and resume requests Advocacy inbox: accept, decline and mark requests done across all mentees

Advocacy requests: referrals, introductions, nominations and endorsements Public track record: mentees mentored and advocacy delivered

Shared workspace: external chat and meeting links with a shared calendar Help and safety: emergency contacts and in-app problem reports

Also included: a public site with sourced STEM statistics and interactive visualisations, privacy policy and terms pages, light and dark themes, and responsive layouts.

About the AI: matching uses weighted, explainable scoring across five factors (field, goals, experience, availability, style). Google Gemini is used only to read employment dates from a consented resume. It never powers the match score.

📸 Screenshots

Home STEM insights

Herbaceous homepage STEM evidence and visualisations

<details open> <summary><strong>Dashboard: mentorship progress at a glance</strong></summary>

Weeks logged, match quality, advocacy progress, the journey timeline and the next meeting.

Mentee dashboard

</details> <details> <summary><strong>Mentor matching: compatibility and discovery</strong></summary>

Filter mentors, review compatibility scores and track records, and send requests.

Mentor matching

</details> <details> <summary><strong>Weekly planner: a record of the journey</strong></summary>

Check-in history, weekly notes and journey controls.

Weekly planner

</details> <details> <summary><strong>Chat and shared calendar</strong></summary>

External chat and meeting links alongside shared meetings, reminders and notes.

Chat and calendar

</details> <details> <summary><strong>Advocacy: guidance turned into action</strong></summary>

Request a referral, introduction, nomination or endorsement and follow it to done.

Advocacy requests

</details>

🧩 Architecture

flowchart LR
U["Mentors & mentees"] --> UI["React + Vite frontend<br/>(S3 + CloudFront)"]
UI -->|"Sign in"| AUTH["AWS Cognito"]
UI -->|"REST + access token"| API["Express API"]
API -->|"Verify tokens / provision accounts"| AUTH
API -->|"Prisma ORM"| DB[("PostgreSQL (Neon)")]
API -->|"Scoring + verification<br/>(internal API key)"| AI["Flask service"]
AI -->|"Resume date extraction"| GEMINI["Google Gemini"]
UI -->|"Contact form"| MAIL["EmailJS"]

Layer Stack and responsibilities

Frontend React 19, Vite 8, Tailwind CSS 4, Radix UI, React Router, Framer Motion, GSAP, Recharts, D3

API Express 5, Prisma 7, PostgreSQL, Cognito JWT verification, role and ownership checks, rate limiting

Matching and verification Python and Flask service with a local fallback scorer in the API, Google Gen AI SDK for resume extraction

Delivery GitHub Actions builds the frontend, syncs to Amazon S3 and invalidates CloudFront

🛠️ Engineering highlights

• Privacy by design. Accounts use generated sign-in details and display names. No real name or email is ever collected.

• Data minimisation in AI calls. Resumes stay in memory, Gemini returns employment dates only, and the database stores only the derived result and a consent timestamp.

• Explainable, resilient matching. Every score shows its reasons, scores are clamped and saved when a mentorship starts, and a local scorer takes over if the AI service is down.

• Integrity at the data layer. Serializable transactions enforce one active mentorship per mentee, conditional updates prevent race conditions, and counts like weeks logged are computed, never stored.

• No hard deletes. Ended mentorships and closed requests keep a full audit trail.

• Defence in depth. Per-user rate limits, file signature checks on uploads, a CORS allowlist, constant-time key comparison between services, and a consistent { message } error shape with no stack traces leaked.

• Safe change control. Reviewed migrations, small focused commits, and a protected main branch.

Repository map

Herbaceous/
├── IT-Product-Build/
│ ├── Frontend/ # React app: public site, dashboards, onboarding
│ └── Backend/
│ ├── src/ # Routes, controllers, services, middleware
│ └── prisma/ # Schema, migrations, seed scripts
├── AI-Build/ # Flask matching and resume verification service
├── readme/ # Screenshots
│ ├── .github/workflows/ # Demo frontend deployment
└── LICENSE # MIT

🚀 Run it locally

Prerequisites: Node 24+, npm, Python 3.11+, a PostgreSQL database, and an AWS Cognito user pool.

# 1. API

cd IT-Product-Build/Backend
npm ci
npx prisma generate
npx prisma migrate deploy
node prisma/seed.js
npm run dev

# 2. Frontend (new terminal)

cd IT-Product-Build/Frontend
npm ci
npm run dev

# 3. Optional: matching and verification service (new terminal)

cd AI-Build
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python app.py

<details> <summary><strong>Environment variables</strong></summary>

Backend (IT-Product-Build/Backend/.env)

Variable Purpose

DATABASE_URL PostgreSQL connection string

COGNITO_REGION, COGNITO_USER_POOL_ID, COGNITO_CLIENT_ID
Token verification and account provisioning

AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY
Cognito admin credentials (or use the default AWS provider chain)

MATCHING_SERVICE_URL, MATCHING_SERVICE_API_KEY
Flask service location and shared internal key

CREDENTIAL_VERIFICATION_ENABLED Set to true to enable resume verification

FRONTEND_ORIGIN, NODE_ENV
CORS allowlist and environment

Frontend (IT-Product-Build/Frontend/.env.local)

Variable Purpose

VITE_BACKEND_URL API origin (without /api)

VITE_COGNITO_USER_POOL_ID, VITE_COGNITO_CLIENT_ID
Browser sign-in

VITE*EMAILJS*\* Optional contact form email

AI service (AI-Build/.env)

Variable Purpose

MATCHING_SERVICE_API_KEY Must match the backend value

GEMINI_API_KEY, GEMINI_MODEL
Resume date extraction

</details>

Useful commands

Directory Command Purpose

Frontend npm run build / npm run preview
Production build and local preview

Frontend npm run lint ESLint

Backend npm start Start the API without the watcher

Backend npx prisma migrate dev --create-only --name your_change Create a migration to review before applying

🗺️ Roadmap

• Automated tests with a CI gate, starting with auth and mentorship APIs

• Secret and personal-data scanning before merge

• Admin dashboard for help tickets and moderation

• URL-based dashboard routes and a staging environment

👤 Author

Palash Rambhia · Full-stack software engineer, Melbourne

LinkedIn GitHub

<div align="center">

Rooted in connection. Growing through advocacy.

Back to top

</div>
