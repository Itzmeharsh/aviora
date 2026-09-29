import { NextResponse } from "next/server";
import { openai } from "@/lib/openai";
import { CandidateProfileSchema } from "@/lib/profile-schema";
import { zodTextFormat } from "openai/helpers/zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { generateSkillProfile } from "@/lib/generate-skill-profile";

export async function POST(request: Request) {
  try {
        const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    const body = await request.json();

    const resumeText = body.text;

    const embeddedLinks = Array.isArray(body.links)
      ? body.links
      : [];

    console.log(
      "Aviora Embedded Links:",
      embeddedLinks
    );

    if (
      !resumeText ||
      typeof resumeText !== "string"
    ) {
      return NextResponse.json(
        {
          error: "Resume text is required",
        },
        { status: 400 }
      );
    }

    // --------------------------------
    // AI PROFILE EXTRACTION
    // --------------------------------

    const response = await openai.responses.parse({
      model: "gpt-5.6-luna",

      instructions: `
You are Aviora, an AI career profile extraction engine.

Analyze the candidate's resume and convert it into a
structured professional profile.

IMPORTANT RULES:

1. Only use information explicitly present in the resume.
2. Never invent experience, skills, education, projects,
   companies, dates, achievements, or qualifications.
3. If information is missing, return an empty string.
4. If a section does not exist, return an empty array.
5. Preserve the candidate's actual information.
6. Extract projects separately from work experience.
7. Preserve technologies mentioned for each project.
8. Preserve project names exactly as represented in the resume.
9. Keep descriptions factual.
10. Do not exaggerate the candidate's experience.
11. Do not add skills that are not present in the resume.
12. Do not invent URLs.

IMPORTANT URL RULE:

Project URLs are supplied separately as embedded PDF
hyperlinks.

Do NOT try to guess project URLs from the resume text.

The system will attach the correct project URLs after
profile extraction.

Therefore:

- Leave project "url" empty if the URL is not directly
  available in the structured information.
- Never invent a URL.
- Never use a project's GitHub URL as the candidate's
  personal GitHub profile.
- Never put a project URL into personal.github.

The resulting profile will be stored by Aviora and used
later to tailor resumes for specific job descriptions.
`,

      input: `
Analyze this resume.

--- RESUME START ---

${resumeText}

--- RESUME END ---
`,

      text: {
        format: zodTextFormat(
          CandidateProfileSchema,
          "candidate_profile"
        ),
      },
    });

    const profile = response.output_parsed;

    if (!profile) {
      return NextResponse.json(
        {
          error: "AI did not return a profile",
        },
        { status: 500 }
      );
    }

// --------------------------------
// AI SKILL PROFILE
// --------------------------------

const skillProfile =
  await generateSkillProfile({
    skills: profile.skills,

    experience:
      profile.experience,

    projects:
      profile.projects,
  });

console.log(
  "Aviora Skill Profile:",
  skillProfile
);

    // --------------------------------
    // PRESERVE EMBEDDED PDF LINKS
    // --------------------------------

    for (const link of embeddedLinks) {
      const linkText = String(
        link.text || ""
      )
        .toLowerCase()
        .trim();

      const linkUrl = String(
        link.url || ""
      ).trim();

      if (!linkUrl) {
        continue;
      }

      // --------------------------------
      // LINKEDIN
      // --------------------------------

      if (
        linkUrl
          .toLowerCase()
          .includes("linkedin.com/in/")
      ) {
        profile.personal.linkedin =
          linkUrl;

        continue;
      }

      // --------------------------------
      // GITHUB PROJECT LINKS
      // --------------------------------

      if (
        linkUrl
          .toLowerCase()
          .includes("github.com/")
      ) {
        const githubMatch =
          linkUrl.match(
            /github\.com\/([^/]+)\/([^/?#]+)/i
          );

        if (!githubMatch) {
          continue;
        }

        const repositoryName =
          githubMatch[2]
            .toLowerCase()
            .replace(/[-_]+/g, " ")
            .trim();

        // Try matching the repository name
        // against the AI-extracted project names.
        const matchingProject =
          profile.projects.find(
            (project) => {
              const projectName =
                String(
                  project.name || ""
                )
                  .toLowerCase()
                  .replace(/[-_]+/g, " ")
                  .trim();

              if (!projectName) {
                return false;
              }

              return (
                projectName ===
                  repositoryName ||
                projectName.includes(
                  repositoryName
                ) ||
                repositoryName.includes(
                  projectName
                )
              );
            }
          );

        if (matchingProject) {
          matchingProject.url =
            linkUrl;

          continue;
        }

        // --------------------------------
        // FALLBACK:
        // MATCH USING LINK TEXT
        // --------------------------------

        const textMatchedProject =
          profile.projects.find(
            (project) => {
              const projectName =
                String(
                  project.name || ""
                )
                  .toLowerCase()
                  .trim();

              return (
                projectName &&
                linkText.includes(
                  projectName
                )
              );
            }
          );

        if (textMatchedProject) {
          textMatchedProject.url =
            linkUrl;
        }
      }
    }

    // --------------------------------
    // DEBUG PROFILE LINKS
    // --------------------------------

    console.log(
      "Aviora Profile Links:",
      {
        linkedin:
          profile.personal.linkedin,

        github:
          profile.personal.github,

        portfolio:
          profile.personal.portfolio,

        projects:
          profile.projects.map(
            (project) => ({
              name: project.name,
              url: project.url,
            })
          ),
      }
    );

        // --------------------------------
    // SAVE PROFILE FOR AUTHENTICATED USER
    // --------------------------------

    const existingProfile =
      await prisma.candidateProfile.findUnique({
        where: {
          userId,
        },
      });

    let savedProfile;

    // --------------------------------
    // UPDATE USER'S EXISTING PROFILE
    // --------------------------------

    if (existingProfile) {
      savedProfile =
        await prisma.candidateProfile.update({
          where: {
            id: existingProfile.id,
          },

          data: {
            name:
              profile.personal.name,

            email:
              profile.personal.email ||
              null,

            phone:
              profile.personal.phone ||
              null,

            location:
              profile.personal.location ||
              null,

            linkedin:
              profile.personal.linkedin ||
              null,

            github:
              profile.personal.github ||
              null,

            portfolio:
              profile.personal.portfolio ||
              null,

            summary:
              profile.summary ||
              null,

            education:
              profile.education,

            skills:
              profile.skills,

            experience:
              profile.experience,

            projects:
              profile.projects,

            certifications:
              profile.certifications,

            achievements:
              profile.achievements,

            skillProfile:
              skillProfile,
          },
        });
    }

    // --------------------------------
    // CREATE USER'S FIRST PROFILE
    // --------------------------------

    else {
      savedProfile =
        await prisma.candidateProfile.create({
          data: {
            userId,

            name:
              profile.personal.name,

            email:
              profile.personal.email ||
              null,

            phone:
              profile.personal.phone ||
              null,

            location:
              profile.personal.location ||
              null,

            linkedin:
              profile.personal.linkedin ||
              null,

            github:
              profile.personal.github ||
              null,

            portfolio:
              profile.personal.portfolio ||
              null,

            summary:
              profile.summary ||
              null,

            education:
              profile.education,

            skills:
              profile.skills,

            experience:
              profile.experience,

            projects:
              profile.projects,

            certifications:
              profile.certifications,

            achievements:
              profile.achievements,

            skillProfile:
              skillProfile,
          },
        });
    }

    return NextResponse.json({
      success: true,
      profile,
      profileId: savedProfile.id,
    });
  } catch (error) {
    console.error(
      "Profile extraction error:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to analyze resume",
      },
      { status: 500 }
    );
  }
}