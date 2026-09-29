import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { openai } from "@/lib/openai";
import { TailoredResumeSchema } from "@/lib/resume-schema";
import { zodTextFormat } from "openai/helpers/zod";

export async function POST(request: Request) {
  try {
    // --------------------------------------------------
    // 1. Require authenticated user
    // --------------------------------------------------

    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // --------------------------------------------------
    // 2. Get job and match from request
    // --------------------------------------------------

    const body = await request.json();

    const { job, match } = body;

    if (!job || !match) {
      return NextResponse.json(
        {
          error:
            "Job and match data are required",
        },
        { status: 400 }
      );
    }

    // --------------------------------------------------
    // 3. Get candidate profile from authenticated user
    // --------------------------------------------------

    const candidateProfile =
      await prisma.candidateProfile.findUnique({
        where: {
          userId,
        },
      });

    if (!candidateProfile) {
      return NextResponse.json(
        {
          error: "Candidate profile not found",
        },
        { status: 404 }
      );
    }

    // --------------------------------------------------
    // 4. Reconstruct the master profile
    //    from the authenticated user's database record
    // --------------------------------------------------

    const profile = {
      personal: {
        name: candidateProfile.name,
        email: candidateProfile.email,
        phone: candidateProfile.phone,
        location: candidateProfile.location,
        linkedin: candidateProfile.linkedin,
        github: candidateProfile.github,
        portfolio: candidateProfile.portfolio,
      },

      summary: candidateProfile.summary,

      education: candidateProfile.education,

      skills: candidateProfile.skills,

      skillProfile: candidateProfile.skillProfile,

      experience: candidateProfile.experience,

      projects: candidateProfile.projects,

      certifications:
        candidateProfile.certifications,

      achievements:
        candidateProfile.achievements,
    };

    // --------------------------------------------------
    // 5. Generate tailored resume
    // --------------------------------------------------

    const response = await openai.responses.parse({
      model: "gpt-5.6-luna",

      instructions: `
You are Aviora, an AI resume tailoring engine.

Your task is to create a tailored resume from the candidate's
master profile and the target job.

IMPORTANT RULES:

1. Never invent information.
2. Never change companies, roles, dates, education,
   technologies, project names, achievements, or certifications.
3. Only use information present in the candidate profile.
4. Tailor the resume to the target job.
5. Remove irrelevant information when appropriate.
6. Prioritize experience, projects, and skills relevant to the job.
7. Do not add skills merely because they appear in the job description.
8. A skill may only be included if it already exists in the candidate profile.
9. Do not invent URLs.
10. Do not modify URLs.
11. Do not convert URLs into different URLs.
12. Preserve factual information exactly.

PROJECT URL RULE:

Project URLs are provided in the candidate profile.

You MUST preserve the URL associated with a project whenever
that project is included in the tailored resume.

The URL must be copied exactly from the candidate profile.

Do NOT:
- remove a project URL
- replace a project URL
- generate a new URL
- guess a URL
- change a GitHub repository URL
- use a project URL as the candidate's personal GitHub URL

PERSONAL LINK RULE:

If the candidate profile contains LinkedIn, GitHub, portfolio,
email, phone, or other personal contact information, preserve
the exact values.

Do not invent or modify them.

The final resume should be a tailored subset of the candidate's
real information, not newly invented information.

SKILLS:

Return exactly two skill categories:

Technical Skills
Analytical Skills

Only include skills that:
- exist in the candidate profile
- are relevant to the target job

Do not add missing job skills.

SUMMARY:

Rewrite the summary for the target job using only facts from
the candidate profile.

EXPERIENCE:

Select relevant experience and rewrite descriptions for
relevance, but do not change factual information.

PROJECTS:

Select relevant projects and rewrite descriptions for relevance,
but do not change factual information.

Preserve project names and technologies.

CERTIFICATIONS:

Only include certifications from the candidate profile.

EXTRACURRICULAR:

Preserve extracurricular information when available.

ACHIEVEMENTS:

Only include achievements from the candidate profile.
`,

      input: `
=== CANDIDATE MASTER PROFILE ===

${JSON.stringify(profile, null, 2)}

=== TARGET JOB ===

${JSON.stringify(job, null, 2)}

=== MATCH ANALYSIS ===

${JSON.stringify(match, null, 2)}

Create the tailored resume now.
`,

      text: {
        format: zodTextFormat(
          TailoredResumeSchema,
          "tailored_resume"
        ),
      },
    });

    const resume = response.output_parsed;

    if (!resume) {
      return NextResponse.json(
        {
          error:
            "AI did not return a tailored resume",
        },
        { status: 500 }
      );
    }

    // --------------------------------------------------
    // 6. Deterministic personal link restoration
    // --------------------------------------------------

    resume.personal.email =
      profile.personal?.email ||
      resume.personal.email;

    resume.personal.phone =
      profile.personal?.phone ||
      resume.personal.phone;

    resume.personal.location =
      profile.personal?.location ||
      resume.personal.location;

    resume.personal.linkedin =
      profile.personal?.linkedin ||
      resume.personal.linkedin;

    resume.personal.github =
      profile.personal?.github ||
      resume.personal.github;

    resume.personal.portfolio =
      profile.personal?.portfolio ||
      resume.personal.portfolio;

    // --------------------------------------------------
    // 7. Deterministic project link restoration
    // --------------------------------------------------

    const masterProjects: any[] = Array.isArray(
  profile.projects
)
  ? profile.projects
  : [];

    for (const tailoredProject of resume.projects) {
      const tailoredName = String(
        tailoredProject.name || ""
      )
        .toLowerCase()
        .replace(/[-_]+/g, " ")
        .replace(/\s+/g, " ")
        .trim();

      if (!tailoredName) {
        continue;
      }

      const matchingProject =
        masterProjects.find((project: any) => {
          const masterName = String(
            project.name || ""
          )
            .toLowerCase()
            .replace(/[-_]+/g, " ")
            .replace(/\s+/g, " ")
            .trim();

          if (!masterName) {
            return false;
          }

          return (
            masterName === tailoredName ||
            masterName.includes(tailoredName) ||
            tailoredName.includes(masterName)
          );
        });

      if (
        matchingProject &&
        matchingProject.url
      ) {
        tailoredProject.url =
          matchingProject.url;
      }
    }

    // --------------------------------------------------
    // 8. Log final links
    // --------------------------------------------------

    console.log(
      "Aviora Final Resume Links:",
      {
        linkedin:
          resume.personal.linkedin,

        github:
          resume.personal.github,

        portfolio:
          resume.personal.portfolio,

        projects:
          resume.projects.map(
            (project) => ({
              name: project.name,
              url: project.url,
            })
          ),
      }
    );

    // --------------------------------------------------
    // 9. Return tailored resume
    // --------------------------------------------------

    return NextResponse.json({
      success: true,
      resume,
    });
  } catch (error) {
    console.error(
      "Resume generation error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to generate tailored resume",
      },
      { status: 500 }
    );
  }
}