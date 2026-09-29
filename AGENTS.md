# Aviora --- Complete Codex Project Handoff

## Purpose

This is the persistent technical memory for the Aviora project. Give
this file to Codex at the repository root as `AGENTS.md` or as a project
handoff.

Before changing code: 1. Read this file. 2. Inspect the actual current
repository file. 3. Do not assume historical snippets are current. 4.
Make the smallest targeted change. 5. Do not rewrite unrelated files. 6.
If the required file is missing, ask for that exact file. 7. Never claim
a change was made unless it was actually made.

The developer prefers concise, exact, copy-paste-ready instructions and
gets frustrated by speculative explanations or unrelated changes.

------------------------------------------------------------------------

# 1. Product

**Aviora** is an AI-powered career assistant intended to become a real
production web application and eventually an Android/Google Play app.

Main modes: - **Tailor**: resume/profile analysis, job analysis, job
matching, tailored resume generation. - **Thali**: personalized job
discovery using the candidate profile, currently using Naukri
scraping/search plus AI matching.

Product style: - High-end - Simple - Professional - Luxurious - Not
over-designed - Production-ready - Privacy-conscious

------------------------------------------------------------------------

# 2. Stack

-   Next.js 16.3.6
-   React 19.2.8
-   Tailwind CSS 4
-   TypeScript 5.9.3
-   Node.js 24.18.0
-   Prisma 7.10.0
-   @prisma/client 7.10.0
-   PostgreSQL / Prisma Postgres
-   OpenAI API
-   zod
-   pdf-parse 2.4.5
-   pdfjs-dist 5.4.296
-   @prisma/adapter-pg
-   pg
-   dotenv
-   puppeteer
-   next-auth@beta / Auth.js v5 beta
-   @auth/prisma-adapter

------------------------------------------------------------------------

# 3. Important files

Known structure:

``` text
app/
  page.tsx
  HomeClient.tsx
  layout.tsx
  onboarding/page.tsx
  thali/page.tsx
  thali/ThaliClient.tsx
  api/auth/[...nextauth]/route.ts
  api/profile/extract/route.ts
  api/resume/upload/route.ts
  api/thali/jobs/route.ts

components/
  AuthSessionProvider.tsx
  AvioraModeNav.tsx
  OnboardingResumeUpload.tsx

lib/
  openai.ts
  profile-schema.ts
  thali/search.ts
  thali/naukri.ts
  thali/types.ts

prisma/
  schema.prisma
  migrations/

auth.ts
next.config.ts
```

Inspect the actual repository because this list may not be exhaustive.

------------------------------------------------------------------------

# 4. Config

`next.config.ts`:

``` ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pdf-parse"],
};

export default nextConfig;
```

`lib/openai.ts`:

``` ts
import OpenAI from "openai";

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
```

Never expose `OPENAI_API_KEY` to client code.

------------------------------------------------------------------------

# 5. Candidate profile schema

`lib/profile-schema.ts` defines:

``` text
personal:
  name
  email
  phone
  location
  linkedin
  github
  portfolio

summary
education[]
skills[]
experience[]
projects[]
certifications[]
achievements[]
```

Experience items contain: - company - role - location - startDate -
endDate - description\[\] - technologies\[\]

Skill profile:

``` ts
export const SkillProfileSchema = z.object({
  primarySkills: z.array(z.string()),
  secondarySkills: z.array(z.string()),
  skillEvidence: z.array(
    z.object({
      skill: z.string(),
      evidence: z.array(z.string()),
    })
  ),
  aliases: z.array(
    z.object({
      skill: z.string(),
      aliases: z.array(z.string()),
    })
  ),
});
```

`skillProfile` is important for personalized Thali matching.

------------------------------------------------------------------------

# 6. Prisma database

Current schema:

``` prisma
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String?   @unique
  emailVerified DateTime?
  image         String?

  accounts Account[]
  sessions Session[]

  candidateProfile CandidateProfile?
  jobApplications JobApplication[]
  jobPlatformConnections JobPlatformConnection[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token String? @db.Text
  access_token String?
  expires_at Int?
  token_type String?
  scope String?
  id_token String? @db.Text
  session_state String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
  @@index([userId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
}

model VerificationToken {
  identifier String
  token String @unique
  expires DateTime
  @@unique([identifier, token])
}

model CandidateProfile {
  id        String   @id @default(cuid())
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  userId String? @unique
  user User? @relation(fields: [userId], references: [id], onDelete: Cascade)

  name String
  email String?
  phone String?
  location String?
  linkedin String?
  github String?
  portfolio String?
  summary String?

  education Json
  skills Json
  skillProfile Json?
  experience Json
  projects Json
  certifications Json
  achievements Json
}

model Job {
  id String @id @default(cuid())
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  title String
  company String
  location String?
  employmentType String?
  url String
  source String
  postedAt DateTime
  description String?
  skills Json
  technologies Json
  matchScore Float?
  matchingSkills Json?
  missingSkills Json?
  matchReasons Json?
  applied Boolean @default(false)
  appliedAt DateTime?
  applications JobApplication[]

  @@unique([url])
}

model JobApplication {
  id String @id @default(cuid())
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  userId String
  jobId String

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  job Job @relation(fields: [jobId], references: [id], onDelete: Cascade)

  matchScore Float?
  matchingSkills Json?
  missingSkills Json?
  matchReasons Json?

  applied Boolean @default(false)
  appliedAt DateTime?

  @@unique([userId, jobId])
  @@index([userId])
  @@index([jobId])
}

model JobPlatformConnection {
  id String @id @default(cuid())
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  userId String?
  user User? @relation(fields: [userId], references: [id], onDelete: Cascade)

  platform String
  accountId String?
  accessToken String?
  refreshToken String?
  expiresAt DateTime?
  connected Boolean @default(true)

  @@unique([platform, accountId])
  @@index([userId])
}
```

Migrations known: - `20260927180656_create_candidate_profile` -
`20260928074416_add_thali_jobs` -
`20260928075847_add_job_platform_connections` -
`20260928153514_add_candidate_skill_profile` -
`20260928191241_add_auth_and_user_data`

------------------------------------------------------------------------

# 7. Critical ownership rule

`CandidateProfile.userId` is nullable temporarily because an old
pre-auth profile row existed.

Never:

``` ts
prisma.candidateProfile.findFirst(...)
```

to determine the current user's profile.

Always:

``` ts
const session = await auth();

if (!session?.user?.id) {
  // unauthorized
}

const userId = session.user.id;

const profile = await prisma.candidateProfile.findUnique({
  where: { userId },
});
```

Never automatically attach an orphan profile to the first Google user.

User deletion cascades through Account, Session, CandidateProfile,
JobApplication, and JobPlatformConnection. External file storage must be
handled separately if added.

------------------------------------------------------------------------

# 8. Google Auth

`auth.ts`:

``` ts
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
  ],
  session: { strategy: "database" },
  pages: { signIn: "/signin" },
});
```

Auth route:

``` ts
import { handlers } from "@/auth";

export const { GET, POST } = handlers;
```

Google project: - Project: Aviora - Project ID: `aviora-510018` - Local
origin: `http://localhost:3000` - Local callback:
`http://localhost:3000/api/auth/callback/google`

Future Android app should use a separate Android OAuth client (package +
SHA-1) while using the same backend/account system.

------------------------------------------------------------------------

# 9. Session provider

`components/AuthSessionProvider.tsx`:

``` tsx
"use client";

import { SessionProvider } from "next-auth/react";

export default function AuthSessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SessionProvider>{children}</SessionProvider>;
}
```

------------------------------------------------------------------------

# 10. Route protection

Middleware was removed because Next.js 16.3.6 warned about the
middleware convention/deprecation and importing auth through middleware
caused runtime issues.

Current approach: protect server pages directly.

Example:

``` ts
const session = await auth();

if (!session?.user?.id) {
  redirect("/signin");
}
```

Then query the user's profile by `userId`.

Do not reintroduce middleware casually.

------------------------------------------------------------------------

# 11. Home route

Current `app/page.tsx` behavior:

``` tsx
const session = await auth();

if (!session?.user?.id) {
  redirect("/signin");
}

const profile = await prisma.candidateProfile.findUnique({
  where: {
    userId: session.user.id,
  },
});

if (!profile) {
  redirect("/onboarding");
}

return <HomeClient />;
```

------------------------------------------------------------------------

# 12. Onboarding

`app/onboarding/page.tsx`: - server component - requires
authentication - finds profile by `session.user.id` - if profile exists
→ `/` - otherwise shows mandatory resume upload

Intended flow:

``` text
Google sign-in
→ no CandidateProfile
→ /onboarding
→ mandatory resume upload
→ PDF extraction
→ AI profile extraction
→ CandidateProfile created for current user
→ Tailor/Home
```

------------------------------------------------------------------------

# 13. Resume processing

Pipeline:

``` text
PDF
 ↓
POST /api/resume/upload
 ↓
Extract text + embedded PDF links
 ↓
POST /api/profile/extract
 ↓
OpenAI structured profile extraction
 ↓
Skill profile generation
 ↓
CandidateProfile create/update
```

Client upload code uses:

``` ts
const formData = new FormData();
formData.append("file", file);

const response = await fetch("/api/resume/upload", {
  method: "POST",
  body: formData,
});

const data = await response.json();

const profileResponse = await fetch("/api/profile/extract", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    text: data.text,
    links: data.links || [],
  }),
});
```

Do not discard PDF links because LinkedIn/GitHub/portfolio URLs can be
embedded as PDF annotations.

------------------------------------------------------------------------

# 14. Critical bug already fixed in /api/profile/extract

The old implementation incorrectly did:

``` ts
const existingProfile =
  await prisma.candidateProfile.findFirst({
    orderBy: {
      createdAt: "asc",
    },
  });
```

and did not set `userId` when creating the profile.

This was a major ownership bug.

It has already been fixed in the current actual file.

Correct behavior must remain:

``` ts
const session = await auth();

if (!session?.user?.id) {
  ...
}

const userId = session.user.id;

const existingProfile =
  await prisma.candidateProfile.findUnique({
    where: { userId },
  });
```

Create branch must contain:

``` ts
userId,
```

The generated `skillProfile` must be saved.

Do not revert this fix.

------------------------------------------------------------------------

# 15. Main unresolved bug

Observed behavior:

``` text
Delete account
↓
Sign up again with same Google account
↓
Mandatory onboarding resume upload
↓
Profile extraction succeeds
↓
Go to Thali
↓
Thali hangs/fails

BUT

Go back to Tailor
↓
Upload same resume again
↓
Resume is analyzed
↓
Go to Thali
↓
Thali works and results appear
```

This is the main unresolved issue.

### Most important conclusion

Do NOT currently assume Naukri URL/location is the root cause.

The behavioral clue strongly suggests that the first/onboarding profile
initialization differs from the second/Tailor upload.

The next debugging target is:

``` text
OnboardingResumeUpload
→ /api/resume/upload
→ /api/profile/extract
→ CandidateProfile
→ /api/thali/jobs
→ searchJobs/searchNaukriJobs
```

Compare the CandidateProfile immediately after onboarding with the
CandidateProfile immediately after Tailor re-upload.

Compare: - `userId` - `location` - `skills` - `experience` -
`projects` - `skillProfile` - `updatedAt` - any other fields used by
Thali

If they differ, fix profile initialization.

If they are identical, continue downstream to Thali/Naukri.

Do not start by changing Naukri URL syntax.

------------------------------------------------------------------------

# 16. Tailor upload

`HomeClient.tsx` currently has a resume upload flow that: - resets local
resume/profile/job/match state - POSTs PDF to `/api/resume/upload` -
receives text and links - POSTs to `/api/profile/extract` - receives
structured profile - stores it in client state

The user reports that repeating this upload after onboarding makes Thali
work.

This is the most important clue in the current bug.

------------------------------------------------------------------------

# 17. Thali server page

`app/thali/page.tsx` currently:

``` tsx
const session = await auth();

if (!session?.user?.id) {
  redirect("/signin");
}

const profile =
  await prisma.candidateProfile.findUnique({
    where: {
      userId: session.user.id,
    },
    select: {
      id: true,
    },
  });

if (!profile) {
  redirect("/onboarding");
}

return <ThaliClient />;
```

This is correct for user ownership.

------------------------------------------------------------------------

# 18. /api/thali/jobs

Current route: 1. authenticates 2. gets `session.user.id` 3. finds
CandidateProfile by `userId` 4. constructs candidate profile 5. calls
`searchJobs(candidateProfile, page, request.signal)` 6. upserts jobs 7.
upserts user-specific JobApplication 8. returns jobs

Candidate profile passed to search:

``` ts
const candidateProfile = {
  personal: {
    name: profile.name,
    email: profile.email,
    phone: profile.phone,
    location: profile.location,
    linkedin: profile.linkedin,
    github: profile.github,
    portfolio: profile.portfolio,
  },
  summary: profile.summary,
  education: profile.education,
  skills: profile.skills,
  skillProfile: profile.skillProfile,
  experience: profile.experience,
  projects: profile.projects,
  certifications: profile.certifications,
  achievements: profile.achievements,
};
```

This route already correctly uses the authenticated user's profile.

------------------------------------------------------------------------

# 19. Thali client

`app/thali/ThaliClient.tsx`: - 9 jobs per page - fetches
`/api/thali/jobs?page=N` - uses `cache: "no-store"` - loading UI -
`/thali.png` - PATCH apply behavior - AbortController cancellation -
leaving Thali cancels an in-progress request

Do not remove AbortController support.

------------------------------------------------------------------------

# 20. Thali / Naukri architecture

`lib/thali/naukri.ts` uses Puppeteer.

Known constants in the main version:

``` ts
const JOBS_PER_AVIORA_PAGE = 9;
const MAX_NAUKRI_PAGES = 20;
const FRESHNESS_DAYS = 7;
const AI_CONCURRENCY = 10;
const MIN_MATCH_SCORE = 40;
```

The scraper: - launches Puppeteer headless - uses no-sandbox flags -
sets viewport around 1440x1000 - uses a Chrome-like user agent - uses
`en-IN,en;q=0.9` - navigates Naukri - waits for job cards - scrapes job
cards - filters actual Naukri job URLs - filters freshness - runs AI
matching - returns matched jobs

Do not change scraping limits/timeouts just to solve a profile ownership
problem.

------------------------------------------------------------------------

# 21. Naukri skill query

The system builds a combined query from resume skills.

Known priority skills include:

``` text
flutter
dart
react
next.js
nextjs
javascript
typescript
node.js
nodejs
python
java
postgresql
mongodb
firebase
supabase
```

Manual Naukri testing proved that combined keyword search works:

``` text
flutter, python
Location = India
Experience = 0
```

Therefore: - Do not claim multi-keyword search itself is invalid. - Do
not replace combined search with one skill without evidence.

------------------------------------------------------------------------

# 22. Naukri location

The candidate location is available as:

``` ts
profile.location
```

and passed into Thali search as:

``` ts
candidateProfile.personal.location
```

If implementing location filtering, use the resume/profile location
rather than hard-coding `"India"`.

However, do not assume the Naukri URL parameter is exactly
`location=<value>`. Inspect an actual working manual Naukri request
before changing it.

Browser geolocation and Naukri's job-search location filter are
different: - Browser geolocation supplies coordinates. - Search location
is the job filter selected in the Naukri UI.

The user previously enabled Naukri browser location permission. A
request contained:

``` text
latLong=27.892877700627643_78.11401858612766
```

That does not prove the search location filter is correct.

------------------------------------------------------------------------

# 23. Naukri 400 observation

A failing Naukri API request previously contained parameters like:

``` text
noOfResults=20
urlType=search_by_keyword
searchType=adv
keyword=flutter, python, next.js, java
pageNo=1
experience=0
k=flutter, python, next.js, java
experience=0
seoKey=flutter-python-next-dot-js-java-jobs
src=directSearch
latLong=...
```

Response:

``` json
{
  "message": "400 Bad Request",
  "statusCode": 400,
  "validationErrors": []
}
```

There was duplicate `experience=0`.

But duplicate experience was NOT proven to be the cause.

Do not make a definitive diagnosis from that alone.

------------------------------------------------------------------------

# 24. Naukri debugging rule

If Naukri returns 400: 1. Reproduce the same search manually. 2. Compare
the working browser request with Aviora's request. 3. Compare exact
query parameters. 4. Compare URL/slug. 5. Compare location filter. 6.
Compare experience filter. 7. Compare freshness. 8. Only then change
`buildSearchUrl()`.

Do not guess a replacement Naukri URL.

------------------------------------------------------------------------

# 25. Successful Thali log

A successful run previously showed:

``` text
[Thali/Score] Fullstack Developer => 85
[Thali/Score] Software Engineer => 0
[Thali/Score] Multiple Openings - Java => 85
[Thali/Score] Walk-in || React Developer => 85
[Thali/AI] Completed 19/19
[Thali/AI] Jobs passing 40% threshold: 16/19
[Thali] Total matched pool: 16
[Thali] Returning 9 jobs for Aviora page 1
GET /api/thali/jobs?page=1 200
GET /thali 200
```

This proves the downstream pipeline can work.

------------------------------------------------------------------------

# 26. Performance

Thali has historically taken: - 10 minutes - 20 minutes - sometimes
longer

because it can perform:

``` text
Puppeteer scraping
+
multiple Naukri pages
+
job parsing
+
AI matching
+
database upserts
```

Performance optimization is a separate task.

Suggested historical optimizations included: - fewer Naukri pages -
smaller candidate pool - shorter navigation timeout - shorter selector
timeout - remove artificial delay - limit candidates before AI

These changes were proposed at different times and must NOT be assumed
to exist.

------------------------------------------------------------------------

# 27. Cancellation

The Thali route supports `AbortSignal`.

It catches:

``` ts
if (
  error instanceof DOMException &&
  error.name === "AbortError"
) {
  return new Response(null, {
    status: 499,
  });
}
```

Preserve this behavior.

------------------------------------------------------------------------

# 28. Job persistence

`Job.url` is globally unique.

`JobApplication` is unique per:

``` text
userId + jobId
```

Therefore: - one job record can be shared by users - match/application
state is user-specific

Never expose another user's application state.

------------------------------------------------------------------------

# 29. Navbar

`components/AvioraModeNav.tsx`: - client component - uses
pathname/router/session - switches Tailor `/` and Thali `/thali` -
avatar dropdown - profile/about/privacy/terms/contact/sign out

Currently the nav exists separately in HomeClient and ThaliClient.

Possible future improvement: - authenticated shared layout - persistent
nav - avoid nav remount between Tailor and Thali

This is separate from the current onboarding bug.

------------------------------------------------------------------------

# 30. Security / production requirements

For production: - Authenticate all private APIs. - Use `session.user.id`
for ownership. - Never trust client `userId`. - Do not expose secrets. -
Do not log OAuth access/refresh tokens. - Avoid logging raw resume
contents. - Validate upload type and size. - Rate-limit expensive
AI/scraping endpoints. - Delete external resume files on account
deletion if applicable. - Keep privacy/terms truthful. - Treat resume
data as sensitive personal data.

------------------------------------------------------------------------

# 31. Account deletion / re-signup

Expected behavior:

``` text
Delete account
→ User/owned data removed
→ Sign in again with Google
→ New authenticated user
→ no CandidateProfile
→ mandatory onboarding
→ new resume
→ new CandidateProfile
```

Do not attach an orphan old profile to the new account.

When debugging deletion: - verify User deletion - Account cascade -
Session cascade - CandidateProfile cascade - JobApplication cascade -
JobPlatformConnection cascade - external resume storage if present

------------------------------------------------------------------------

# 32. Android future architecture

Future:

``` text
Android app
→ same auth/account system
→ same backend APIs
→ same PostgreSQL database
```

Use a separate Android Google OAuth client: - package name - SHA-1

Do not create a separate Android-only user system.

------------------------------------------------------------------------

# 33. Known historical unrelated issues

Earlier development involved: - Git not recognized - Python/venv
issues - PowerShell execution policy - Uvicorn import errors -
FFmpeg/audioread issues - Basic Pitch warnings - Drizzle/Turso issues -
Supabase configuration - Render bcrypt invalid ELF header - database
pooler URL issues - ENETUNREACH

These are historical and not automatically relevant to current Aviora
debugging.

------------------------------------------------------------------------

# 34. Current debugging priority

The immediate unresolved problem is:

``` text
Fresh account
→ onboarding resume upload
→ profile apparently exists
→ Thali fails/hangs

versus

Same account
→ Tailor resume re-upload
→ profile analyzed/updated
→ Thali works
```

Next files to inspect:

``` text
components/OnboardingResumeUpload.tsx
app/HomeClient.tsx
app/api/resume/upload/route.ts
app/api/profile/extract/route.ts
app/api/thali/jobs/route.ts
lib/thali/search.ts
lib/thali/naukri.ts
```

First compare the saved CandidateProfile after onboarding and after
Tailor re-upload.

Do not begin with Naukri URL changes.

------------------------------------------------------------------------

# 35. What is already proven

### Proven

-   Google authentication works.
-   `/api/auth/providers` works.
-   Mandatory onboarding works.
-   Resume PDF extraction works.
-   Profile extraction works.
-   User ownership bug in `/api/profile/extract` was fixed.
-   `/api/thali/jobs` uses current authenticated user ID.
-   Thali can return 9 jobs successfully.
-   Manual Naukri multi-keyword search works.
-   Browser geolocation permission was previously fixed.
-   Tailor re-upload makes Thali work.

### Not proven

-   Exact difference between onboarding and Tailor profile state.
-   Whether onboarding's `skillProfile` differs.
-   Whether onboarding's skills/experience/projects differ.
-   Whether onboarding redirects before some required state is
    persisted.
-   Whether Naukri location parameter is wrong.
-   Whether duplicate `experience=0` causes 400.
-   Whether Naukri blocked the server IP.

------------------------------------------------------------------------

# 36. Coding rules for Codex

When fixing a bug: 1. Identify exact symptom. 2. Trace data/request
flow. 3. Inspect actual current source. 4. Find first point where
expected state differs. 5. Change only that point. 6. Test. 7. Only then
move downstream.

Never: - guess Naukri URL formats - hard-code India when resume location
exists - reintroduce `findFirst()` for user profiles - attach orphan
profiles to new users - change unrelated files - assume proposed changes
were applied - use historical code instead of inspecting current files -
claim a fix without verification

------------------------------------------------------------------------

# 37. Core architectural principle

Aviora should maintain one consistent user-scoped profile:

``` text
ONE GOOGLE USER
      ↓
ONE USER-SCOPED CANDIDATE PROFILE
      ↓
      ├── Tailor
      ├── Thali
      ├── Job Matching
      └── Resume Generation
```

A user should NOT need to upload the same resume twice just to make
Thali work.

If onboarding says the profile is complete, Thali must receive the same
fully initialized profile immediately.

This consistency is the current architectural priority.
