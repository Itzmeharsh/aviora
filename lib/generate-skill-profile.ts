import { zodTextFormat } from "openai/helpers/zod";
import { openai } from "@/lib/openai";
import {
  SkillProfileSchema,
  type SkillProfile,
} from "./skill-profile-schema";

export async function generateSkillProfile(
  candidate: {
    skills: {
      category: string;
      skills: string[];
    }[];

    experience: {
      company: string;
      role: string;
      description: string[];
      technologies: string[];
    }[];

    projects: unknown[];
  }
): Promise<SkillProfile> {
  const response =
    await openai.responses.parse({
      model: "gpt-5.6-luna",

      input: [
        {
          role: "system",

          content: `
You are a candidate skill-profile analyzer.

Build a factual skill profile from the candidate's
provided resume data.

Rules:

1. Only include skills explicitly supported by the
   provided resume data.

2. Never invent skills or technologies.

3. Do not add uncertainty markers such as "?",
   "maybe", "possibly", or "unknown" to skill names.

4. Normalize skill names into clean canonical names.
   Examples:
   "Next.Js" → "Next.js"
   "Javascript" → "JavaScript"
   "Rest API" → "REST API"
   "Fast API" → "FastAPI"

5. Primary skills are technologies or technical abilities
   strongly supported by the candidate's experience,
   projects, or explicit skills section.

6. Secondary skills are valid technical skills that are
   explicitly present but have weaker evidence.

7. Do NOT put human languages such as English or Hindi
   into primarySkills or secondarySkills.

8. skillEvidence must explain where the resume supports
   each technical skill.

9. aliases should contain genuine equivalent technical
   names only.

10. Do not treat related technologies as equivalent.

Examples:

Next.js is not WordPress.
Python is not PHP.
React is not Angular.
Flutter is not React Native.
JavaScript is not Java.
PostgreSQL is not MySQL.

11. A framework/library should not automatically imply
    knowledge of another framework/library.

12. Do not promote a technology to primarySkills merely
    because it is related to another primary skill.

13. Only return technical skills and technologies.
    Do not include:
    - English
    - Hindi
    - communication
    - teamwork
    - leadership
    - hobbies
    - generic soft skills

Return only structured data.
`.trim(),
        },

        {
          role: "user",

          content: JSON.stringify({
            skills: candidate.skills,
            experience: candidate.experience,
            projects: candidate.projects,
          }),
        },
      ],

      text: {
        format: zodTextFormat(
          SkillProfileSchema,
          "candidate_skill_profile"
        ),
      },
    });

  if (!response.output_parsed) {
    throw new Error(
      "AI skill profile generation returned no result"
    );
  }

  return response.output_parsed;
}