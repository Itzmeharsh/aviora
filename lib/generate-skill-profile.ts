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
      skills?: string[];
      tools?: string[];
    }[];

    projects: unknown[];
  }
): Promise<SkillProfile> {
  const response = await openai.responses.parse({
    model: "gpt-5.6-luna",

    input: [
      {
        role: "system",

        content: `
You are Aviora's universal professional skill-profile analyzer.

Your job is to identify the candidate's professionally relevant skills
from the provided resume data.

Aviora is NOT limited to software or technology careers.

The candidate may belong to any profession, including but not limited to:

- Software / IT
- Mechanical Engineering
- Civil Engineering
- Electrical Engineering
- Electronics
- Manufacturing
- Finance
- Accounting
- Sales
- Marketing
- Human Resources
- Operations
- Healthcare
- Education
- Design
- Legal
- Hospitality
- Customer Support
- Administration
- Logistics
- Other professional fields

RULES:

1. Only include skills explicitly supported by the provided resume data.

2. Never invent skills, technologies, tools, qualifications, or experience.

3. Do not infer a skill merely because it is commonly associated with
   the candidate's degree, job title, industry, or another skill.

4. Normalize skill names into clean canonical names when the meaning
   is unambiguous.

Examples:

"Next.Js" → "Next.js"
"Javascript" → "JavaScript"
"Rest API" → "REST API"
"Fast API" → "FastAPI"
"Solid Works" → "SolidWorks"

5. Primary skills are professionally important skills that have strong
   evidence in the candidate's explicit skills, experience, projects,
   responsibilities, or tools.

6. Secondary skills are valid professionally relevant skills that are
   explicitly present but have weaker evidence.

7. Skills are NOT restricted to technical/software skills.

They may include:

- Engineering skills
- Design skills
- Manufacturing skills
- Accounting skills
- Sales skills
- Marketing skills
- Financial skills
- HR skills
- Operations skills
- Healthcare skills
- Teaching skills
- Administrative skills
- Customer-service skills
- Industry-specific skills
- Professional tools
- Software/tools
- Methods and processes

8. Do not automatically treat a degree as evidence of every skill
   associated with that degree.

For example:

A Mechanical Engineering degree does NOT automatically prove:
- SolidWorks
- AutoCAD
- CNC
- ANSYS

unless those are explicitly supported by the resume.

9. Do not automatically treat a job title as proof of every skill
   associated with that profession.

10. Do not automatically treat one skill as proof of another skill.

Examples:

React is not Angular.
Python is not PHP.
Java is not JavaScript.
SolidWorks is not AutoCAD.
AutoCAD is not CATIA.
Accounting is not Financial Analysis.
Sales is not Marketing.
Photoshop is not Figma.

11. Human languages such as English, Hindi, Arabic, etc. should not be
placed into primarySkills or secondarySkills.

12. Generic personality traits should not be included unless they are
clearly presented as a professional skill in the supplied resume.

Avoid generic traits such as:

- hardworking
- punctual
- motivated
- honest
- friendly

13. Communication, leadership, teamwork, negotiation, presentation,
customer service, and similar professional capabilities MAY be included
when they are explicitly supported by the resume and are relevant to
the candidate's professional experience.

14. skillEvidence must explain where the resume supports each skill.

15. aliases should contain only genuine equivalent names.

16. Do not use aliases to connect related but different skills.

17. A technology, tool, method, certification, or professional skill
should not automatically imply another skill.

18. Do not rank a skill as primary merely because it appears first in
the resume.

Use strength of documented evidence and professional relevance.

19. Return only structured data matching the supplied schema.

Do not return a match score.
Do not evaluate job compatibility.
Do not invent information.
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