import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { openai } from "@/lib/openai";

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
    // 2. Get job from request
    // --------------------------------------------------

    const body = await request.json();

    const { job } = body;

    if (!job) {
      return NextResponse.json(
        {
          error: "Job information is required",
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
    // 4. Build profile object for AI
    // --------------------------------------------------

    const profile = {
      name: candidateProfile.name,
      email: candidateProfile.email,
      phone: candidateProfile.phone,
      location: candidateProfile.location,

      linkedin: candidateProfile.linkedin,
      github: candidateProfile.github,
      portfolio: candidateProfile.portfolio,

      summary: candidateProfile.summary,

      education: candidateProfile.education,
      skills: candidateProfile.skills,
      skillProfile: candidateProfile.skillProfile,

      experience: candidateProfile.experience,
      projects: candidateProfile.projects,
      certifications: candidateProfile.certifications,
      achievements: candidateProfile.achievements,
    };

    // --------------------------------------------------
    // 5. Analyze candidate-job match with OpenAI
    // --------------------------------------------------

    const response = await openai.responses.parse({
      model: "gpt-5.6-luna",

      instructions: `
You are Aviora, an AI job-to-candidate matching engine.

Your job is to compare a candidate's professional profile
with a specific job posting.

IMPORTANT RULES:

1. Only use information explicitly present in the candidate
   profile and job posting.

2. NEVER invent skills, technologies, experience, projects,
   qualifications, certifications, or achievements.

3. A skill should only be considered a matching skill if the
   candidate profile explicitly contains that skill or a very
   clear equivalent.

4. Identify job requirements that are not present in the
   candidate profile as missing skills.

5. Do not treat a missing skill as something the candidate has.

6. Identify the candidate's experience that is genuinely
   relevant to the job.

7. Identify projects that are genuinely relevant to the job.

8. Identify education information relevant to the job.

9. Extract important keywords from the job that should be
   considered when tailoring a resume.

10. Tailoring suggestions must only recommend emphasizing
    information that already exists in the candidate profile.

11. NEVER recommend adding fabricated experience or skills.

12. If the job requires a technology that the candidate does
    not have, include it in missingSkills.

13. Warnings should mention important gaps, conflicts, or
    limitations that Aviora should be aware of.

14. Keep all conclusions factual and grounded in the provided
    information.

The purpose of this analysis is to help Aviora create a
truthful, job-specific resume from the candidate's existing
experience.
`,

      input: `
CANDIDATE PROFILE:

--- PROFILE START ---

${JSON.stringify(profile, null, 2)}

--- PROFILE END ---


JOB POSTING:

--- JOB START ---

${JSON.stringify(job, null, 2)}

--- JOB END ---


Compare the candidate profile with the job posting and
produce the structured matching analysis.
`,

      text: {
        format: {
          type: "json_schema",
          name: "match_result",
          strict: true,
          schema: {
            type: "object",
            properties: {
              matchingSkills: {
                type: "array",
                items: {
                  type: "string",
                },
              },

              missingSkills: {
                type: "array",
                items: {
                  type: "string",
                },
              },

              matchingTechnologies: {
                type: "array",
                items: {
                  type: "string",
                },
              },

              relevantExperience: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    company: {
                      type: "string",
                    },
                    role: {
                      type: "string",
                    },
                    reason: {
                      type: "string",
                    },
                  },
                  required: [
                    "company",
                    "role",
                    "reason",
                  ],
                  additionalProperties: false,
                },
              },

              relevantProjects: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    name: {
                      type: "string",
                    },
                    reason: {
                      type: "string",
                    },
                  },
                  required: [
                    "name",
                    "reason",
                  ],
                  additionalProperties: false,
                },
              },

              educationMatch: {
                type: "array",
                items: {
                  type: "string",
                },
              },

              importantKeywords: {
                type: "array",
                items: {
                  type: "string",
                },
              },

              tailoringSuggestions: {
                type: "array",
                items: {
                  type: "string",
                },
              },

              warnings: {
                type: "array",
                items: {
                  type: "string",
                },
              },
            },

            required: [
              "matchingSkills",
              "missingSkills",
              "matchingTechnologies",
              "relevantExperience",
              "relevantProjects",
              "educationMatch",
              "importantKeywords",
              "tailoringSuggestions",
              "warnings",
            ],

            additionalProperties: false,
          },
        },
      },
    });

    // --------------------------------------------------
    // 6. Validate AI response
    // --------------------------------------------------

    const match = response.output_parsed;

    if (!match) {
      return NextResponse.json(
        {
          error: "AI did not return a matching analysis",
        },
        { status: 500 }
      );
    }

    // --------------------------------------------------
    // 7. Return result
    // --------------------------------------------------

    return NextResponse.json({
      success: true,
      match,
    });
  } catch (error) {
    console.error("Matching error:", error);

    return NextResponse.json(
      {
        error: "Failed to analyze candidate-job match",
      },
      { status: 500 }
    );
  }
}