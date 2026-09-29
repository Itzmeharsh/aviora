<div align="center">

# ✦ AVIORA

### AI-Powered Career Intelligence Platform

**Understand your career. Discover relevant opportunities. Find jobs made for you.**

<br />

<a href="https://aviora-silk.vercel.app/">
<img src="https://img.shields.io/badge/🚀%20LIVE%20APP-AVIORA-000000?style=for-the-badge" />
</a>

<a href="https://github.com/Itzmeharsh/aviora">
<img src="https://img.shields.io/badge/GITHUB-REPOSITORY-181717?style=for-the-badge&logo=github" />
</a>

<br />
<br />

<img src="https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js" />
<img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react" />
<img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript" />
<img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=flat-square&logo=tailwindcss" />
<img src="https://img.shields.io/badge/PostgreSQL-Database-4169E1?style=flat-square&logo=postgresql" />
<img src="https://img.shields.io/badge/Prisma-ORM-2D3748?style=flat-square&logo=prisma" />
<img src="https://img.shields.io/badge/OpenAI-AI-412991?style=flat-square&logo=openai" />
<img src="https://img.shields.io/badge/Vercel-Production-000000?style=flat-square&logo=vercel" />

<br />
<br />

### 🍽️ WE SERVE JOBS IN YOUR THALI

**Your resume goes in. Your career opportunities come out.**

</div>

---

# 🌟 What is Aviora?

**Aviora** is an AI-powered career intelligence platform designed to transform a candidate's resume into actionable career opportunities.

Instead of treating a resume as a simple collection of keywords, Aviora understands the candidate's:

- Skills
- Experience
- Education
- Projects
- Certifications
- Professional capabilities
- Career background

It then uses this information to discover jobs and analyze how those jobs relate to the candidate's documented profile.

---

# 🍽️ Meet Thali

## **Thali — Jobs served for you.**

Thali is Aviora's job discovery and matching engine.

The idea behind Thali is simple:

> **You shouldn't have to search endlessly for jobs.  
> Your jobs should come to your Thali.**

```text
                         🍽️ THALI
                            │
                            │
                   "WE SERVE JOBS"
                            │
                            ▼
                 ┌──────────────────┐
                 │ Candidate Profile │
                 └─────────┬────────┘
                           │
                           ▼
                 ┌──────────────────┐
                 │ AI Skill Profile │
                 └─────────┬────────┘
                           │
                           ▼
                 ┌──────────────────┐
                 │ Search Optimizer │
                 └─────────┬────────┘
                           │
                           ▼
                 ┌──────────────────┐
                 │  Job Discovery   │
                 └─────────┬────────┘
                           │
                           ▼
                 ┌──────────────────┐
                 │   AI Matching    │
                 └─────────┬────────┘
                           │
                           ▼
                  ┌─────────────────┐
                  │  🍽️ YOUR THALI │
                  │                 │
                  │  Relevant Jobs  │
                  │  Match Details  │
                  │  Missing Skills │
                  └─────────────────┘
Thali currently uses Naukri for job discovery.
           The workflow is:
Resume
  ↓
Candidate Understanding
  ↓
AI Skill Profile
  ↓
AI Search Query Generation
  ↓
Naukri Job Discovery
  ↓
Job Deduplication
  ↓
Freshness Filtering
  ↓
AI Job Matching
  ↓
🍽️ Jobs in Your Thali


🧵 Meet Tailor
Tailor — Your career profile, fitted to you.
Tailor is the profile intelligence side of Aviora.
It takes the candidate's resume and converts it into a structured professional profile that can be used throughout the platform.
Think of it as:

             YOUR RESUME
                  │
                  ▼
             🧵 TAILOR
                  │
       ┌──────────┼──────────┐
       │          │          │
       ▼          ▼          ▼
     Skills   Experience  Education
       │          │          │
       └──────────┼──────────┘
                  │
                  ▼
        Professional Profile
                  │
                  ▼
          AI Skill Profile


🧠 Aviora's Complete Intelligence Pipeline
<img src="../aviora/public/mermaid-diagram.png" />

🛠️ Technology Stack
<div align="center">

Layer	Technology
Frontend	Next.js 16
UI	React 19
Language	TypeScript 5
Styling	Tailwind CSS 4
Backend	Next.js API Routes
Database	PostgreSQL
ORM	Prisma 7
Authentication	Auth.js / NextAuth
OAuth	Google
AI	OpenAI API
Validation	Zod
PDF Processing	pdf-parse
PDF Rendering	pdfjs-dist
Browser Automation	Puppeteer
Chromium	@sparticuz/chromium
Deployment	Vercel
Source Control	GitHub


</div>

📥 1. Clone the Repository
git clone https://github.com/Itzmeharsh/aviora.git

Enter the project:
cd aviora

📦 2. Install Dependencies
npm install

🔐 3. Configure Environment Variables
Create a .env file in the root directory:
.env

Add:
DATABASE_URL="your_postgresql_database_url"

AUTH_SECRET="your_auth_secret"

AUTH_GOOGLE_ID="your_google_client_id"

AUTH_GOOGLE_SECRET="your_google_client_secret"

OPENAI_API_KEY="your_openai_api_key"

🗄️ Database Configuration
Aviora uses PostgreSQL through Prisma.
After configuring DATABASE_URL, run the required Prisma commands for your database setup.
For development environments where migrations already exist:
npx prisma migrate dev

Generate Prisma Client:
npx prisma generate

🔑 Google OAuth Configuration
Aviora uses Google authentication.
Local callback URL
http://localhost:3000/api/auth/callback/google

Production callback URL
https://aviora-silk.vercel.app/api/auth/callback/google

Configure these URLs in your Google OAuth application.
🤖 OpenAI Configuration
Aviora uses OpenAI for several AI-powered workflows.
The API key is configured through:
OPENAI_API_KEY="your_openai_api_key"

AI functionality includes:
Resume Extraction
       ↓
Skill Profile Generation
       ↓
Naukri Search Query Generation
       ↓
Job Requirement Analysis
       ↓
Candidate-Job Matching